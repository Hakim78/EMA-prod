"""
EdRCF 6.0 — bronze_pipeline.py
Pipeline Bronze / Silver avec DuckDB + MotherDuck.

Architecture :
  Bronze  → DuckDB (MotherDuck) — 16M entités SIRENE brutes (tous secteurs)
  Silver  → DuckDB (MotherDuck) — ~50-80K PME/ETI M&A-éligibles filtrées + scorées
  Gold    → Supabase             — ~5-10K cibles enrichies (existant)

Prérequis :
  pip install duckdb
  Env : MOTHERDUCK_TOKEN=<token>  (depuis app.motherduck.com → Settings → Tokens)

Usage CLI :
  python bronze_pipeline.py setup           → crée les tables sur MotherDuck
  python bronze_pipeline.py load-bronze     → charge les 16M depuis SIRENE CSV.gz
  python bronze_pipeline.py build-silver    → filtre Bronze → Silver (~50-80K)
  python bronze_pipeline.py stats           → stats Bronze + Silver
  python bronze_pipeline.py sync-supabase   → pousse Silver top-N vers sirene_index
  python bronze_pipeline.py full            → setup + load-bronze + build-silver
"""

import asyncio
import os
import sys
import time
import urllib.request
from datetime import datetime

import httpx
from dotenv import load_dotenv

load_dotenv()

# ── Optionnel : duckdb peut ne pas être installé sur certains envs ──────────
try:
    import duckdb
    _DUCKDB_OK = True
except ImportError:
    _DUCKDB_OK = False

# =============================================================================
# Configuration
# =============================================================================

MOTHERDUCK_TOKEN = os.getenv("MOTHERDUCK_TOKEN", "")

# Tracker de progression (accessible via /api/admin/bronze-stats)
_PIPELINE_STATUS: dict = {
    "running": False,
    "step": "idle",
    "rows_loaded": 0,
    "error": None,
    "started_at": None,
    "finished_at": None,
}
DB_NAME          = "edrcf"          # base MotherDuck
BRONZE_TABLE     = "bronze_sirene"  # 16M entités brutes
SILVER_TABLE     = "silver_ma"      # ~50-80K PME/ETI éligibles

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

DATAGOUV_API            = "https://www.data.gouv.fr/api/1/datasets/5b7ffc618b4c4169d30727e0/"
SIRENE_PARQUET_FALLBACK = "https://object.files.data.gouv.fr/data-pipeline-open/siren/stock/StockUniteLegale_utf8.parquet"
SIRENE_ZIP_FALLBACK     = "https://object.files.data.gouv.fr/data-pipeline-open/siren/stock/StockUniteLegale_utf8.zip"


def get_sirene_url(prefer: str = "parquet") -> str:
    """Interroge l'API data.gouv.fr pour obtenir l'URL courante du fichier SIRENE.
    prefer='parquet' → fichier Parquet (DuckDB natif, recommandé)
    prefer='zip'     → fichier ZIP CSV (fallback)
    """
    try:
        req = urllib.request.Request(DATAGOUV_API, headers={"User-Agent": "EdRCF/6.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            import json as _json
            data = _json.loads(resp.read())
            ext = ".parquet" if prefer == "parquet" else ".zip"
            for res in data.get("resources", []):
                url   = res.get("url", "")
                title = res.get("title", "").lower()
                if "stockuniteleg" in title and "historique" not in title and url.endswith(ext):
                    print(f"[BRONZE] URL SIRENE ({prefer}) : {url}")
                    return url
    except Exception as e:
        print(f"[BRONZE] data.gouv.fr API error: {e} — fallback URL")
    return SIRENE_PARQUET_FALLBACK if prefer == "parquet" else SIRENE_ZIP_FALLBACK

UPSERT_BATCH = 500   # lignes par appel Supabase

# =============================================================================
# Codes NAF et filtres (répliqués de sirene_bulk.py)
# =============================================================================

SIRENE_NAF_CODES: set[str] = {
    "6622Z","6629Z","6430Z","6630Z","6420Z","6419Z",
    "4941A","4941B","5210B","5229A",
    "4120A","4321A","4322A","4399C","4110A",
    "7022Z","6920Z","6910Z","7810Z","8010Z","8121Z","8110Z",
    "3250A","8610Z","4773Z","2120Z","8690B",
    "2899B","2611Z","2932Z","2452Z","2512Z","2591Z",
    "6201Z","6202A","5829C","6312Z",
    "1089Z","1102A","1071A","1011Z",
    "3511Z","7112B","3831Z","3700Z",
    "4669Z","4663Z","4639B","4646Z",
    "5530Z","5510Z","5610A",
    "4110B","6832A",
    "8559B","8542Z",
    "4511Z","4520A",
    "7311Z","5814Z",
    "3030Z","3040Z",
}

ELIGIBLE_EFFECTIF: set[str] = {"11","12","21","22","31","32","41","42","51","52","53"}

ELIGIBLE_CJ: set[str] = {
    "5498","5499","5710","5720",
    "5410","5422",
    "5599","5505","5510","5699",
    "5307",
}

# =============================================================================
# Connexion DuckDB / MotherDuck
# =============================================================================

def _ensure_database() -> None:
    """Crée la base MotherDuck 'edrcf' si elle n'existe pas encore."""
    if not _DUCKDB_OK or not MOTHERDUCK_TOKEN:
        return
    try:
        con = duckdb.connect(f"md:?motherduck_token={MOTHERDUCK_TOKEN}")
        con.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        con.close()
        print(f"[DuckDB] Base '{DB_NAME}' prête sur MotherDuck.")
    except Exception as e:
        print(f"[DuckDB] _ensure_database warning: {e}")


def _get_connection(local_fallback: bool = False):
    """Retourne une connexion DuckDB.
    - Si MOTHERDUCK_TOKEN défini → connexion MotherDuck cloud
    - Sinon → fichier local edrcf.duckdb (développement)
    Crée automatiquement la base si elle n'existe pas.
    """
    if not _DUCKDB_OK:
        raise RuntimeError("duckdb non installé. Exécuter : pip install duckdb")

    if MOTHERDUCK_TOKEN and not local_fallback:
        _ensure_database()
        conn_str = f"md:{DB_NAME}?motherduck_token={MOTHERDUCK_TOKEN}"
        print(f"[DuckDB] Connexion MotherDuck : md:{DB_NAME}")
    else:
        conn_str = "edrcf.duckdb"
        print(f"[DuckDB] Connexion locale : edrcf.duckdb")

    return duckdb.connect(conn_str)


# =============================================================================
# SETUP — création des tables
# =============================================================================

BRONZE_DDL = f"""
CREATE TABLE IF NOT EXISTS {BRONZE_TABLE} (
    siren                  VARCHAR(9)  NOT NULL,
    denomination           TEXT,
    naf                    VARCHAR(6),
    dept                   VARCHAR(3),
    effectif_tranche       VARCHAR(4),
    date_creation          DATE,
    categorie_juridique    VARCHAR(6),
    categorie_entreprise   VARCHAR(10),
    etat_administratif     VARCHAR(1),   -- A = active, F = fermée, C = cessée
    loaded_at              TIMESTAMP DEFAULT current_timestamp
);
"""

SILVER_DDL = f"""
CREATE TABLE IF NOT EXISTS {SILVER_TABLE} (
    siren                  VARCHAR(9)  PRIMARY KEY,
    denomination           TEXT,
    naf                    VARCHAR(6),
    dept                   VARCHAR(3),
    effectif_tranche       VARCHAR(4),
    date_creation          DATE,
    categorie_juridique    VARCHAR(6),
    categorie_entreprise   VARCHAR(10),
    ma_score               SMALLINT    DEFAULT 0,
    bodacc_recent          BOOLEAN     DEFAULT false,
    enriched               BOOLEAN     DEFAULT false,
    enriched_at            TIMESTAMP,
    silver_at              TIMESTAMP   DEFAULT current_timestamp
);
"""


def setup_tables() -> None:
    """Crée les tables Bronze et Silver sur MotherDuck (idempotent)."""
    con = _get_connection()
    print("[DuckDB] Création des tables Bronze + Silver…")
    con.execute(BRONZE_DDL)
    con.execute(SILVER_DDL)
    # Index Silver pour les requêtes fréquentes
    con.execute(f"CREATE INDEX IF NOT EXISTS idx_silver_score ON {SILVER_TABLE} (ma_score DESC)")
    con.execute(f"CREATE INDEX IF NOT EXISTS idx_silver_naf   ON {SILVER_TABLE} (naf)")
    con.execute(f"CREATE INDEX IF NOT EXISTS idx_silver_dept  ON {SILVER_TABLE} (dept)")
    con.close()
    print("[DuckDB] ✅ Tables prêtes.")


# =============================================================================
# BRONZE — chargement des 16M entités SIRENE
# =============================================================================

def load_bronze(source: str | None = None) -> int:
    """
    Charge toutes les entités SIRENE dans Bronze via streaming Python + batch INSERT.
    Streame le CSV.gz depuis data.gouv.fr sans écrire de fichier temporaire.
    Met à jour _PIPELINE_STATUS toutes les 500K lignes.
    Retourne le nombre de lignes insérées.
    """
    global _PIPELINE_STATUS
    url = source or get_sirene_url(prefer="parquet")
    con = _get_connection()

    _PIPELINE_STATUS.update({"step": "bronze_load", "rows_loaded": 0, "error": None})

    print(f"[BRONZE] Vidage table existante…")
    con.execute(f"DELETE FROM {BRONZE_TABLE}")

    print(f"[BRONZE] Chargement Parquet depuis {url} via DuckDB httpfs…")
    t0 = time.time()

    # httpfs + read_parquet : MotherDuck streame directement depuis object storage
    # Pas de fichier temporaire, pas de Python CSV parsing
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute(f"""
        INSERT INTO {BRONZE_TABLE}
            (siren, denomination, naf, dept, effectif_tranche,
             date_creation, categorie_juridique, categorie_entreprise,
             etat_administratif)
        SELECT
            siren                                                   AS siren,
            denominationUniteLegale                                 AS denomination,
            REPLACE(COALESCE(activitePrincipaleUniteLegale,''),'.',''
                                                                    ) AS naf,
            LEFT(COALESCE(codeCommuneEtablissementSiege,''), 2)     AS dept,
            trancheEffectifsUniteLegale                             AS effectif_tranche,
            TRY_CAST(dateCreationUniteLegale AS DATE)               AS date_creation,
            categorieJuridiqueUniteLegale                           AS categorie_juridique,
            categorieEntreprise                                     AS categorie_entreprise,
            etatAdministratifUniteLegale                            AS etat_administratif
        FROM read_parquet('{url}')
    """)

    count = con.execute(f"SELECT COUNT(*) FROM {BRONZE_TABLE}").fetchone()[0]
    elapsed = time.time() - t0
    _PIPELINE_STATUS["rows_loaded"] = count
    con.close()
    print(f"[BRONZE] ✅ {count:,} entités en {elapsed/60:.1f} min.")
    return count


# =============================================================================
# SILVER — filtrage M&A + scoring
# =============================================================================

def _naf_list_sql() -> str:
    """Génère la liste SQL des codes NAF cibles."""
    return ", ".join(f"'{c}'" for c in sorted(SIRENE_NAF_CODES))


def _effectif_list_sql() -> str:
    return ", ".join(f"'{e}'" for e in sorted(ELIGIBLE_EFFECTIF))


def _cj_list_sql() -> str:
    return ", ".join(f"'{c}'" for c in sorted(ELIGIBLE_CJ))


def _high_ma_naf_sql() -> str:
    HIGH = {"6622Z","6629Z","6420Z","6430Z","7022Z","6920Z","4941A","4941B","4120A","6201Z","6202A"}
    return ", ".join(f"'{c}'" for c in sorted(HIGH))


def build_silver() -> int:
    """
    Filtre la table Bronze → Silver avec les critères M&A et calcule le score.
    Retourne le nombre de lignes dans Silver.
    """
    con = _get_connection()

    print("[SILVER] Construction de la couche Silver…")
    t0 = time.time()

    con.execute(f"DELETE FROM {SILVER_TABLE}")

    con.execute(f"""
        INSERT INTO {SILVER_TABLE}
            (siren, denomination, naf, dept, effectif_tranche,
             date_creation, categorie_juridique, categorie_entreprise, ma_score)
        SELECT
            siren,
            denomination,
            naf,
            dept,
            effectif_tranche,
            date_creation,
            categorie_juridique,
            categorie_entreprise,
            -- Score M&A 0-100 (sans appel API)
            LEAST(100,
                -- Effectif (0-25 pts)
                CASE effectif_tranche
                    WHEN '11' THEN 15  WHEN '12' THEN 20
                    WHEN '21' THEN 25  WHEN '22' THEN 25
                    WHEN '31' THEN 20  WHEN '32' THEN 18
                    WHEN '41' THEN 12  WHEN '42' THEN 8
                    WHEN '51' THEN 5   WHEN '52' THEN 3  WHEN '53' THEN 2
                    ELSE 0
                END
                +
                -- Ancienneté (0-20 pts)
                CASE
                    WHEN date_creation IS NULL                           THEN 0
                    WHEN YEAR(CURRENT_DATE) - YEAR(date_creation) BETWEEN 3  AND 4  THEN 8
                    WHEN YEAR(CURRENT_DATE) - YEAR(date_creation) BETWEEN 5  AND 9  THEN 15
                    WHEN YEAR(CURRENT_DATE) - YEAR(date_creation) BETWEEN 10 AND 25 THEN 20
                    WHEN YEAR(CURRENT_DATE) - YEAR(date_creation) > 25              THEN 12
                    ELSE 0
                END
                +
                -- Forme juridique (0-15 pts)
                CASE categorie_juridique
                    WHEN '5498' THEN 15  WHEN '5499' THEN 15
                    WHEN '5710' THEN 15  WHEN '5720' THEN 15
                    WHEN '5410' THEN 14  WHEN '5422' THEN 14
                    WHEN '5599' THEN 12  WHEN '5505' THEN 12
                    WHEN '5510' THEN 12  WHEN '5699' THEN 12
                    WHEN '5307' THEN 8
                    ELSE 0
                END
                +
                -- Catégorie entreprise (0-15 pts)
                CASE categorie_entreprise
                    WHEN 'ETI' THEN 15
                    WHEN 'PME' THEN 10
                    ELSE 0
                END
                +
                -- NAF à forte activité M&A (0-5 pts)
                CASE WHEN naf IN ({_high_ma_naf_sql()}) THEN 5 ELSE 0 END
            ) AS ma_score
        FROM {BRONZE_TABLE}
        WHERE etat_administratif = 'A'
          AND categorie_entreprise IN ('PME', 'ETI')
          AND naf IN ({_naf_list_sql()})
          AND effectif_tranche IN ({_effectif_list_sql()})
    """)

    count = con.execute(f"SELECT COUNT(*) FROM {SILVER_TABLE}").fetchone()[0]
    elapsed = time.time() - t0
    con.close()
    print(f"[SILVER] ✅ {count:,} PME/ETI M&A-éligibles en {elapsed:.1f}s.")
    return count


# =============================================================================
# SYNC → Supabase (sirene_index)
# =============================================================================

async def sync_silver_to_supabase(top_n: int = 5000, priority: str = "score") -> int:
    """
    Pousse les top_n entreprises Silver vers Supabase sirene_index.
    priority = 'score'   → tri par ma_score DESC
    priority = 'bodacc'  → bodacc_recent DESC, ma_score DESC
    Retourne le nombre de lignes upsertées.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[SYNC] Supabase non configuré — sync ignorée.")
        return 0

    con = _get_connection()

    order = "bodacc_recent DESC, ma_score DESC" if priority == "bodacc" else "ma_score DESC"
    rows_df = con.execute(f"""
        SELECT siren, denomination, naf, dept, effectif_tranche,
               date_creation::TEXT AS date_creation,
               categorie_juridique, categorie_entreprise,
               ma_score AS ma_score_estimate,
               bodacc_recent, enriched
        FROM {SILVER_TABLE}
        ORDER BY {order}
        LIMIT {top_n}
    """).fetchall()
    cols = ["siren","denomination","naf","dept","effectif_tranche","date_creation",
            "categorie_juridique","categorie_entreprise","ma_score_estimate",
            "bodacc_recent","enriched"]
    records = [dict(zip(cols, r)) for r in rows_df]
    con.close()

    print(f"[SYNC] Envoi de {len(records)} lignes vers Supabase sirene_index…")
    headers = {
        "apikey":        SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "resolution=merge-duplicates",
    }
    total = 0
    async with httpx.AsyncClient(timeout=30) as client:
        for i in range(0, len(records), UPSERT_BATCH):
            batch = records[i : i + UPSERT_BATCH]
            r = await client.post(
                f"{SUPABASE_URL}/rest/v1/sirene_index",
                json=batch,
                headers=headers,
            )
            if r.status_code in (200, 201):
                total += len(batch)
            else:
                print(f"  [SYNC] Erreur batch {i//UPSERT_BATCH}: HTTP {r.status_code} — {r.text[:200]}")

    print(f"[SYNC] ✅ {total} lignes synchronisées vers Supabase.")
    return total


# =============================================================================
# STATS
# =============================================================================

def print_stats() -> None:
    """Affiche les statistiques Bronze + Silver."""
    con = _get_connection()

    try:
        bronze_count = con.execute(f"SELECT COUNT(*) FROM {BRONZE_TABLE}").fetchone()[0]
        bronze_active = con.execute(
            f"SELECT COUNT(*) FROM {BRONZE_TABLE} WHERE etat_administratif = 'A'"
        ).fetchone()[0]
        print(f"\n{'='*50}")
        print(f"  BRONZE — {BRONZE_TABLE}")
        print(f"  Total entités     : {bronze_count:>10,}")
        print(f"  Entités actives   : {bronze_active:>10,}")
    except Exception:
        print("[STATS] Table Bronze vide ou inexistante.")

    try:
        silver_count = con.execute(f"SELECT COUNT(*) FROM {SILVER_TABLE}").fetchone()[0]
        enriched = con.execute(
            f"SELECT COUNT(*) FROM {SILVER_TABLE} WHERE enriched = true"
        ).fetchone()[0]
        avg_score = con.execute(
            f"SELECT ROUND(AVG(ma_score)) FROM {SILVER_TABLE}"
        ).fetchone()[0]
        top_nafs = con.execute(f"""
            SELECT naf, COUNT(*) AS n
            FROM {SILVER_TABLE}
            GROUP BY naf ORDER BY n DESC LIMIT 5
        """).fetchall()
        print(f"\n  SILVER — {SILVER_TABLE}")
        print(f"  PME/ETI éligibles : {silver_count:>10,}")
        print(f"  Enrichies (Gold)  : {enriched:>10,}")
        print(f"  Score moyen       : {avg_score:>10}")
        print(f"  Top 5 NAF         :")
        for naf, n in top_nafs:
            print(f"    {naf} : {n:,}")
        print(f"{'='*50}\n")
    except Exception:
        print("[STATS] Table Silver vide ou inexistante.")

    con.close()


# =============================================================================
# Endpoints FastAPI (importés dans main.py)
# =============================================================================

async def api_bronze_stats() -> dict:
    """Utilisé par GET /api/admin/bronze-stats."""
    if not _DUCKDB_OK:
        return {"error": "duckdb non installé"}
    try:
        con = _get_connection()
        bronze = con.execute(f"SELECT COUNT(*) FROM {BRONZE_TABLE}").fetchone()[0]
        silver = con.execute(f"SELECT COUNT(*) FROM {SILVER_TABLE}").fetchone()[0]
        enriched = con.execute(
            f"SELECT COUNT(*) FROM {SILVER_TABLE} WHERE enriched = true"
        ).fetchone()[0]
        avg_score = con.execute(
            f"SELECT ROUND(AVG(ma_score)) FROM {SILVER_TABLE}"
        ).fetchone()[0]
        con.close()
        return {
            "bronze_total": bronze,
            "silver_eligible": silver,
            "silver_enriched": enriched,
            "silver_avg_score": avg_score,
            "pipeline": _PIPELINE_STATUS,
        }
    except Exception as e:
        return {
            "error": str(e),
            "pipeline": _PIPELINE_STATUS,
        }


# =============================================================================
# CLI
# =============================================================================

async def _run_async(cmd: str, args: list[str]) -> None:
    if cmd == "setup":
        setup_tables()

    elif cmd == "load-bronze":
        load_bronze()

    elif cmd == "build-silver":
        build_silver()

    elif cmd == "stats":
        print_stats()

    elif cmd == "sync-supabase":
        top_n = int(args[0]) if args else 5000
        prio  = args[1] if len(args) > 1 else "score"
        await sync_silver_to_supabase(top_n=top_n, priority=prio)

    elif cmd == "full":
        setup_tables()
        load_bronze()
        build_silver()
        await sync_silver_to_supabase(top_n=5000)

    else:
        print(__doc__)


if __name__ == "__main__":
    cmd  = sys.argv[1] if len(sys.argv) > 1 else "help"
    args = sys.argv[2:]
    asyncio.run(_run_async(cmd, args))
