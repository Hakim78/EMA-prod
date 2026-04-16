"""
EdRCF 6.0 — Papperclip: Free Government Data Sources
Replaces paid Pappers MCP with free French government APIs.

Sources:
  - API Recherche Entreprises (gouv.fr) — no auth, 7 req/s
  - BODACC (OpenDataSoft) — no auth, legal announcements
"""

import httpx
from datetime import datetime

# ==========================================================================
# Constants
# ==========================================================================

RECHERCHE_API = "https://recherche-entreprises.api.gouv.fr/search"
BODACC_API = "https://bodacc-datadila.opendatasoft.com/api/records/1.0/search/"

_current_year = datetime.now().year


# ==========================================================================
# API Recherche Entreprises (Primary Source)
# ==========================================================================

async def fetch_company_from_gouv(siren: str) -> dict | None:
    """Fetch a single company by SIREN from API Recherche Entreprises.
    Returns data in Pappers-compatible format for build_target()."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(RECHERCHE_API, params={"q": siren})
            if resp.status_code != 200:
                print(f"[Papperclip] Recherche API error: HTTP {resp.status_code}")
                return None
            data = resp.json()
            results = data.get("results", [])
            if not results:
                print(f"[Papperclip] No results for SIREN {siren}")
                return None
            # Find exact SIREN match
            company = None
            for r in results:
                if r.get("siren") == siren:
                    company = r
                    break
            if not company:
                company = results[0]
            return _map_gouv_to_pappers(company)
    except Exception as e:
        print(f"[Papperclip] Recherche API exception: {e}")
        return None


async def search_companies_gouv(
    query: str = "",
    code_naf: str = "",
    departement: str = "",
    tranche_effectif: str = "",
    page: int = 1,
    per_page: int = 10,
) -> list[dict]:
    """Search companies from API Recherche Entreprises.
    Returns list of Pappers-compatible company dicts."""
    params: dict = {"page": page, "per_page": per_page}
    if query:
        params["q"] = query
    if code_naf:
        params["activite_principale"] = code_naf
    if departement:
        params["departement"] = departement
    if tranche_effectif:
        params["tranche_effectif_salarie"] = tranche_effectif

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(RECHERCHE_API, params=params)
            if resp.status_code != 200:
                print(f"[Papperclip] Search error: HTTP {resp.status_code}")
                return []
            data = resp.json()
            results = data.get("results", [])
            return [_map_gouv_to_pappers(r) for r in results]
    except Exception as e:
        print(f"[Papperclip] Search exception: {e}")
        return []


def _map_gouv_to_pappers(company: dict) -> dict:
    """Map API Recherche Entreprises response to Pappers-compatible format.
    This is the critical mapping that makes detect_signals() and
    build_target() work without modification."""
    siege = company.get("siege", {}) or {}
    dirigeants_raw = company.get("dirigeants", []) or []
    finances_raw = company.get("finances", {}) or {}

    # --- Map dirigeants to Pappers 'representants' format ---
    representants = []
    for d in dirigeants_raw:
        rep = {
            "prenom": d.get("prenoms", "") or d.get("prenom", ""),
            "nom": d.get("nom", "") or d.get("denomination", ""),
            "qualite": d.get("qualite", ""),
            "age": 0,
            "date_de_naissance": "",
        }
        # Calculate age from annee_de_naissance or date_de_naissance
        annee = d.get("annee_de_naissance")
        date_naissance = d.get("date_de_naissance", "")
        if annee:
            rep["age"] = _current_year - int(annee)
            rep["date_de_naissance"] = f"{annee}-01-01"
        elif date_naissance:
            rep["date_de_naissance"] = date_naissance
            try:
                birth_year = int(str(date_naissance)[:4])
                rep["age"] = _current_year - birth_year
            except (ValueError, IndexError):
                pass
        representants.append(rep)

    # --- Map finances to Pappers format ---
    # API returns: {"2024": {"ca": 123456, "resultat_net": 789}, "2023": {...}}
    finances = []
    for year_str in sorted(finances_raw.keys(), reverse=True):
        year_data = finances_raw[year_str]
        if isinstance(year_data, dict):
            finances.append({
                "annee": int(year_str),
                "chiffre_affaires": year_data.get("ca", 0) or 0,
                "resultat": year_data.get("resultat_net", 0) or 0,
            })

    # --- Map etablissements count ---
    nb_etab = company.get("nombre_etablissements_ouverts", 1) or 1
    etablissements = [{"siret": siege.get("siret", "")}] * nb_etab

    # --- Map nature_juridique to forme_juridique text ---
    nature_juridique = company.get("nature_juridique", "")
    forme_juridique = _nature_juridique_to_text(nature_juridique)

    # --- Map tranche_effectif to effectif string ---
    effectif = _tranche_to_effectif(
        siege.get("tranche_effectif_salarie", "")
    )

    # --- Build Pappers-compatible dict ---
    return {
        "siren": company.get("siren", ""),
        "nom_entreprise": company.get("nom_complet", "") or company.get("nom_raison_sociale", ""),
        "siege": {
            "adresse": siege.get("adresse", ""),
            "code_postal": siege.get("code_postal", ""),
            "ville": siege.get("commune", ""),
            "siret": siege.get("siret", ""),
        },
        "code_naf": siege.get("activite_principale", "") or company.get("activite_principale", ""),
        "libelle_code_naf": siege.get("libelle_activite_principale", "") or "",
        "date_creation": company.get("date_creation", ""),
        "forme_juridique": forme_juridique,
        "effectif": effectif,
        "representants": representants,
        "finances": finances,
        "etablissements": etablissements,
        "entreprise_cessee": company.get("etat_administratif") == "F",
        "date_cessation": company.get("date_fermeture"),
        "statut_activite": "Radie" if company.get("etat_administratif") == "F" else "En activite",
        "categorie_entreprise": company.get("categorie_entreprise", ""),
        # Fields that free API doesn't provide (set to empty)
        "beneficiaires_effectifs": [],
        "publications_bodacc": [],  # Filled by fetch_bodacc()
        "procedures_collectives": [],
        "procedure_collective_en_cours": False,
        "procedure_collective_existe": False,
        "scoring_non_financier": None,
        "infogreffe_actes": [],  # Filled by existing /api/infogreffe endpoint
        "news_articles": [],  # Filled by existing /api/news endpoint
    }


# ==========================================================================
# BODACC (Legal Announcements)
# ==========================================================================

async def fetch_bodacc(siren: str) -> list[dict]:
    """Fetch BODACC announcements for a company.
    Returns list in Pappers publications_bodacc format."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(BODACC_API, params={
                "dataset": "annonces-commerciales",
                "q": siren,
                "rows": 20,
                "sort": "-dateparution",
            })
            if resp.status_code != 200:
                print(f"[Papperclip] BODACC error: HTTP {resp.status_code}")
                return []
            data = resp.json()
            records = data.get("records", [])
            publications = []
            for rec in records:
                fields = rec.get("fields", {})
                pub_type = _bodacc_type(fields)
                publications.append({
                    "type": pub_type,
                    "date": fields.get("dateparution", ""),
                    "description": fields.get("modificationsgenerales", "")
                                   or fields.get("familleavis_lib", ""),
                    "administration": "",
                })
            return publications
    except Exception as e:
        print(f"[Papperclip] BODACC exception: {e}")
        return []


def _bodacc_type(fields: dict) -> str:
    """Map BODACC familleavis to Pappers-compatible type string."""
    famille = (fields.get("familleavis", "") or "").lower()
    modifs = (fields.get("modificationsgenerales", "") or "").lower()
    lib = (fields.get("familleavis_lib", "") or "").lower()
    combined = f"{famille} {modifs} {lib}"

    if "vente" in combined or "cession" in combined:
        return "Vente"
    if "radiation" in combined:
        return "Radiation"
    if "capital" in combined:
        return "Modification"
    if "depot" in combined or "dpc" in famille:
        return "Depot des comptes"
    if "modification" in combined:
        return "Modification"
    if "immatriculation" in combined:
        return "Immatriculation"
    if "dissolution" in combined or "liquidation" in combined:
        return "Radiation"
    return "Modification"


# ==========================================================================
# Aggregate all sources into a single company_info
# ==========================================================================

async def get_full_company_info(siren: str) -> dict | None:
    """Fetch and aggregate data from all free sources for a given SIREN.
    Returns a complete company_info dict compatible with build_target()
    and detect_signals()."""
    # Primary: identification + dirigeants + finances
    company_info = await fetch_company_from_gouv(siren)
    if not company_info:
        return None

    # Secondary: BODACC legal announcements (enriches signals)
    bodacc = await fetch_bodacc(siren)
    if bodacc:
        company_info["publications_bodacc"] = bodacc
        # Check for procedures collectives in BODACC
        for pub in bodacc:
            desc = (pub.get("description") or "").lower()
            pub_type = (pub.get("type") or "").lower()
            if any(w in f"{desc} {pub_type}" for w in [
                "redressement", "liquidation judiciaire", "sauvegarde",
                "procedure collective"
            ]):
                company_info["procedure_collective_en_cours"] = True
                company_info["procedure_collective_existe"] = True
                company_info["procedures_collectives"] = [pub]
                break

    print(f"[Papperclip] Aggregated data for {company_info.get('nom_entreprise', siren)}: "
          f"{len(company_info.get('representants', []))} dirigeants, "
          f"{len(company_info.get('finances', []))} exercices, "
          f"{len(bodacc)} annonces BODACC")

    return company_info


async def search_and_enrich(
    query: str = "",
    code_naf: str = "",
    departement: str = "",
    count: int = 10,
) -> list[dict]:
    """Search companies and enrich each with BODACC data.
    Returns list of Pappers-compatible company_info dicts."""
    companies = await search_companies_gouv(
        query=query,
        code_naf=code_naf,
        departement=departement,
        per_page=min(count, 25),
    )
    enriched = []
    for company in companies:
        siren = company.get("siren", "")
        if siren:
            bodacc = await fetch_bodacc(siren)
            if bodacc:
                company["publications_bodacc"] = bodacc
        enriched.append(company)
    return enriched


# ==========================================================================
# Helper mappings
# ==========================================================================

def _nature_juridique_to_text(code: str) -> str:
    """Map nature_juridique code to human-readable text."""
    if not code:
        return ""
    code = str(code)
    mapping = {
        "1000": "Entrepreneur individuel",
        "5498": "SAS",
        "5499": "SAS unipersonnelle (SASU)",
        "5710": "SAS",
        "5720": "SASU",
        "5410": "SARL",
        "5422": "SARL unipersonnelle (EURL)",
        "5599": "SA a conseil d'administration",
        "5505": "SA a directoire",
        "5510": "SA a conseil d'administration",
        "5699": "SA a directoire",
        "6540": "SCI",
        "5307": "SNC",
        "9220": "Association declaree",
        "9221": "Association declaree reconnue d'utilite publique",
    }
    return mapping.get(code, f"Forme juridique {code}")


_TRANCHE_MAP = {
    "00": "0",
    "01": "1-2",
    "02": "3-5",
    "03": "6-9",
    "11": "10-19",
    "12": "20-49",
    "21": "50-99",
    "22": "100-199",
    "31": "200-249",
    "32": "250-499",
    "41": "500-999",
    "42": "1000-1999",
    "51": "2000-4999",
    "52": "5000-9999",
    "53": "10000+",
}


def _tranche_to_effectif(tranche: str) -> str:
    """Map tranche_effectif_salarie code to readable range."""
    if not tranche:
        return "N/A"
    return _TRANCHE_MAP.get(str(tranche), str(tranche))
