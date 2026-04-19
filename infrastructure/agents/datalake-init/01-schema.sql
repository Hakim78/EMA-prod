-- DEMOEMA Datalake — schémas Medallion + tables bronze + audit

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

CREATE SCHEMA IF NOT EXISTS bronze AUTHORIZATION demoema_agents;
CREATE SCHEMA IF NOT EXISTS silver AUTHORIZATION demoema_agents;
CREATE SCHEMA IF NOT EXISTS gold   AUTHORIZATION demoema_agents;
CREATE SCHEMA IF NOT EXISTS mart   AUTHORIZATION demoema_agents;
CREATE SCHEMA IF NOT EXISTS ref    AUTHORIZATION demoema_agents;
CREATE SCHEMA IF NOT EXISTS audit  AUTHORIZATION demoema_agents;

COMMENT ON SCHEMA bronze IS 'Raw ingestion layer';
COMMENT ON SCHEMA silver IS 'Normalized staging';
COMMENT ON SCHEMA gold IS 'Master entities cross-sources';
COMMENT ON SCHEMA mart IS 'Feature-oriented denormalized';
COMMENT ON SCHEMA ref IS 'Referential lookups';
COMMENT ON SCHEMA audit IS 'Agent actions, alerts, source freshness';

-- Bronze : BODACC
CREATE TABLE IF NOT EXISTS bronze.bodacc_annonces_raw (
  id                BIGSERIAL PRIMARY KEY,
  annonce_id        VARCHAR(128) UNIQUE NOT NULL,
  date_publication  DATE,
  type_avis         VARCHAR(64),
  familleavis_lib   VARCHAR(128),
  departement       VARCHAR(8),
  ville             VARCHAR(255),
  registre          VARCHAR(64),
  numero_annonce    VARCHAR(64),
  tribunal          VARCHAR(255),
  siren             CHAR(9),
  payload           JSONB NOT NULL,
  ingested_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bodacc_date_pub ON bronze.bodacc_annonces_raw(date_publication DESC);
CREATE INDEX IF NOT EXISTS idx_bodacc_ingested ON bronze.bodacc_annonces_raw(ingested_at DESC);
CREATE INDEX IF NOT EXISTS idx_bodacc_siren ON bronze.bodacc_annonces_raw(siren) WHERE siren IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bodacc_type ON bronze.bodacc_annonces_raw(type_avis);

-- Bronze : OpenSanctions
CREATE TABLE IF NOT EXISTS bronze.opensanctions_entities_raw (
  id                BIGSERIAL PRIMARY KEY,
  entity_id         VARCHAR(128) UNIQUE NOT NULL,
  name              VARCHAR(512),
  schema_type       VARCHAR(64),
  countries         TEXT[],
  programs          TEXT[],
  first_seen        TIMESTAMPTZ,
  last_seen         TIMESTAMPTZ,
  payload           JSONB NOT NULL,
  ingested_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_opensanctions_last_seen ON bronze.opensanctions_entities_raw(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_opensanctions_countries ON bronze.opensanctions_entities_raw USING GIN(countries);

-- Bronze : Gels Avoirs
CREATE TABLE IF NOT EXISTS bronze.gels_avoirs_raw (
  id                BIGSERIAL PRIMARY KEY,
  identifiant_un    VARCHAR(128),
  nom               VARCHAR(512),
  qualite           VARCHAR(64),
  programme         VARCHAR(128),
  date_inscription  DATE,
  payload           JSONB NOT NULL,
  ingested_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(identifiant_un, nom)
);

-- Audit
CREATE TABLE IF NOT EXISTS audit.agent_actions (
  id            BIGSERIAL PRIMARY KEY,
  agent_role    VARCHAR(64) NOT NULL,
  task_id       UUID,
  source_id     VARCHAR(64),
  action        VARCHAR(64) NOT NULL,
  payload_in    JSONB,
  payload_out   JSONB,
  status        VARCHAR(32),
  duration_ms   INT,
  llm_model     VARCHAR(64),
  llm_tokens    INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_agent_actions_source_created ON audit.agent_actions(source_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_failures ON audit.agent_actions(created_at DESC) WHERE status <> 'success';

CREATE TABLE IF NOT EXISTS audit.alerts (
  id            BIGSERIAL PRIMARY KEY,
  level         VARCHAR(16) NOT NULL CHECK (level IN ('info','warning','critical')),
  source_id     VARCHAR(64),
  message       TEXT NOT NULL,
  resolution    TEXT,
  notified_via  TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON audit.alerts(created_at DESC) WHERE resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS audit.source_freshness (
  source_id         VARCHAR(64) PRIMARY KEY,
  last_success_at   TIMESTAMPTZ,
  last_failure_at   TIMESTAMPTZ,
  rows_last_run     INT,
  total_rows        BIGINT DEFAULT 0,
  sla_minutes       INT,
  status            VARCHAR(16) CHECK (status IN ('ok','degraded','failed','never_run'))
);

-- Permissions
GRANT USAGE ON SCHEMA bronze, silver, gold, mart, ref, audit TO demoema_agents;
GRANT ALL ON ALL TABLES IN SCHEMA bronze, silver, gold, mart, ref, audit TO demoema_agents;
GRANT ALL ON ALL SEQUENCES IN SCHEMA bronze, silver, gold, mart, ref, audit TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA bronze GRANT ALL ON TABLES TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA silver GRANT ALL ON TABLES TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA gold   GRANT ALL ON TABLES TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA mart   GRANT ALL ON TABLES TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit  GRANT ALL ON TABLES TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA bronze GRANT ALL ON SEQUENCES TO demoema_agents;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit  GRANT ALL ON SEQUENCES TO demoema_agents;

GRANT USAGE ON SCHEMA bronze, silver, gold, mart, ref, audit TO demoema_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA bronze, silver, gold, mart, ref, audit TO demoema_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA bronze GRANT SELECT ON TABLES TO demoema_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA silver GRANT SELECT ON TABLES TO demoema_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA gold   GRANT SELECT ON TABLES TO demoema_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA mart   GRANT SELECT ON TABLES TO demoema_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit  GRANT SELECT ON TABLES TO demoema_ro;
