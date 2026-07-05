-- =============================================================================
-- Migration: 001_registrations
-- Creates the multi-form registration system tables, RLS policies, indexes,
-- and the atomic check_and_record_submission function.
-- Non-destructive: uses IF NOT EXISTS throughout.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table: form_schemas
-- Stores the definition of each form type. Fields are defined as a jsonb
-- array so new form types can be created without schema changes.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS form_schemas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL,  -- array of field definitions
  is_active boolean NOT NULL DEFAULT true,
  allow_duplicates boolean NOT NULL DEFAULT false,
  -- The key from "fields" used for duplicate detection (e.g. "email", "student_id").
  -- If NULL, duplicate checking is skipped regardless of allow_duplicates.
  identity_field text,
  -- Per-form rate limit override. Default 3 submissions per IP per hour.
  max_submissions_per_hour integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Table: registrations
-- Stores every submission across all form types. The "data" column holds
-- form-specific answers as key-value pairs matching the schema's field keys.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  data jsonb NOT NULL,
  -- Bot trap field — must always arrive empty. Stored for audit logging.
  honeypot text,
  -- SHA-256 hash of submitter IP + salt. Never store raw IPs.
  -- NOTE: IP-hash rate limiting will under-count distinct users when many
  -- submit from the same NAT'd network (e.g. campus wifi). This is a known
  -- tradeoff — rate limiting here is a bot/abuse deterrent, not a precise
  -- per-person limit.
  submitter_ip_hash text
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_registrations_form_type_created
  ON registrations (form_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_registrations_form_type_status
  ON registrations (form_type, status);

CREATE INDEX IF NOT EXISTS idx_registrations_ip_form_created
  ON registrations (submitter_ip_hash, form_type, created_at);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE form_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- form_schemas: public can SELECT active schemas only (allows both anon and authenticated)
DO $$ BEGIN
  -- Clean up the old anon-only policy if it exists
  DROP POLICY IF EXISTS form_schemas_anon_select ON form_schemas;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'form_schemas_public_select' AND tablename = 'form_schemas'
  ) THEN
    CREATE POLICY form_schemas_public_select ON form_schemas
      FOR SELECT TO public
      USING (is_active = true);
  END IF;
END $$;

-- form_schemas: service_role has full access (bypasses RLS by default,
-- but explicit policy for clarity)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'form_schemas_service_all' AND tablename = 'form_schemas'
  ) THEN
    CREATE POLICY form_schemas_service_all ON form_schemas
      FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- registrations: anon can INSERT only, and only when form_type matches an active schema
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'registrations_anon_insert' AND tablename = 'registrations'
  ) THEN
    CREATE POLICY registrations_anon_insert ON registrations
      FOR INSERT TO anon
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM form_schemas
          WHERE form_schemas.form_type = registrations.form_type
            AND form_schemas.is_active = true
        )
      );
  END IF;
END $$;

-- registrations: service_role has full access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'registrations_service_all' AND tablename = 'registrations'
  ) THEN
    CREATE POLICY registrations_service_all ON registrations
      FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Function: check_and_record_submission
--
-- Atomically checks rate limit, checks for duplicates, and inserts a new
-- registration — all inside a single transaction with an advisory lock.
-- This eliminates the race condition where two concurrent submissions from
-- the same IP could both pass the count check before either row is inserted.
--
-- SET search_path = public is required on SECURITY DEFINER functions.
-- Without it, a malicious actor could create objects in a schema earlier in
-- the search_path resolution order, causing this function to reference
-- attacker-controlled objects instead of the intended public.registrations
-- table. This is a well-known privilege-escalation vector in Postgres.
--
-- NOTE on NAT/shared-IP: IP-hash rate limiting will under-count distinct
-- users behind the same NAT gateway (e.g. campus wifi). This is intentional
-- — rate limiting here is a bot/abuse deterrent, not a precise per-person
-- limit.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_and_record_submission(
  p_form_type text,
  p_data jsonb,
  p_honeypot text,
  p_submitter_ip_hash text,
  p_max_per_hour integer DEFAULT 3,
  p_allow_duplicates boolean DEFAULT false,
  p_identity_field text DEFAULT NULL,
  p_identity_value text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
  v_count integer;
  v_dup_count integer;
  v_new_id uuid;
BEGIN
  -- Acquire advisory lock keyed on hash of (ip_hash + form_type) to serialize
  -- concurrent submissions from the same IP for the same form type.
  -- The lock is automatically released at transaction end.
  PERFORM pg_advisory_xact_lock(hashtext(p_submitter_ip_hash || ':' || p_form_type));

  -- Rate limit check: count submissions in the last hour
  SELECT count(*) INTO v_count
  FROM registrations
  WHERE submitter_ip_hash = p_submitter_ip_hash
    AND form_type = p_form_type
    AND created_at > now() - interval '1 hour';

  IF v_count >= p_max_per_hour THEN
    RETURN jsonb_build_object('success', false, 'error_code', 'rate_limit');
  END IF;

  -- Duplicate check (only if allow_duplicates is false AND identity_field is set)
  IF NOT p_allow_duplicates AND p_identity_field IS NOT NULL AND p_identity_value IS NOT NULL THEN
    SELECT count(*) INTO v_dup_count
    FROM registrations
    WHERE form_type = p_form_type
      AND status IN ('pending', 'accepted')
      AND data ->> p_identity_field = p_identity_value;

    IF v_dup_count > 0 THEN
      RETURN jsonb_build_object('success', false, 'error_code', 'duplicate_submission');
    END IF;
  END IF;

  -- Insert the registration
  INSERT INTO registrations (form_type, data, honeypot, submitter_ip_hash)
  VALUES (p_form_type, p_data, p_honeypot, p_submitter_ip_hash)
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object('success', true, 'id', v_new_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to service_role (the server action uses this role)
GRANT EXECUTE ON FUNCTION check_and_record_submission TO service_role;
