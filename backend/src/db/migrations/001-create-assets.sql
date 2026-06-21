CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  type text NOT NULL CHECK (type IN ('pipe', 'hydrant', 'sensor', 'valve')),
  status text NOT NULL CHECK (status IN ('ok', 'warning', 'critical')),
  lat double precision NOT NULL CHECK (lat >= -90 AND lat <= 90),
  lng double precision NOT NULL CHECK (lng >= -180 AND lng <= 180),
  location geography(Point, 4326)
    GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) STORED,
  installed_at date NOT NULL,
  last_inspected_at date NULL,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inspected_after_install
    CHECK (last_inspected_at IS NULL OR last_inspected_at >= installed_at)
);

CREATE INDEX IF NOT EXISTS assets_location_gix ON assets USING gist (location);
CREATE INDEX IF NOT EXISTS assets_type_idx ON assets (type);
CREATE INDEX IF NOT EXISTS assets_status_idx ON assets (status);
CREATE INDEX IF NOT EXISTS assets_installed_at_idx ON assets (installed_at);
