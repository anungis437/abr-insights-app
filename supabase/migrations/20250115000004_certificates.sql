-- ============================================================================
-- PHASE 3 TASK 3: CERTIFICATE GENERATION SYSTEM
-- ============================================================================
-- This migration creates the certificate and digital badge infrastructure
-- for tracking course completions, issuing professional certificates,
-- and managing digital credentials (Open Badges 2.0 standard)
--
-- Tables:
-- 1. certificates - Certificate records with metadata
-- 2. digital_badges - Open Badges 2.0 compliant digital credentials
-- 3. certificate_templates - Customizable certificate designs
--
-- Created: 2025-01-15
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Certificate types
CREATE TYPE certificate_type AS ENUM (
  'completion',      -- Course completion certificate
  'certification',   -- Professional certification
  'ce_credit',       -- Continuing education credit
  'achievement',     -- Special achievement award
  'participation'    -- Participation certificate
);

-- Certificate status
CREATE TYPE certificate_status AS ENUM (
  'active',          -- Valid and active
  'revoked',         -- Revoked/cancelled
  'expired',         -- Past expiry date
  'pending'          -- Pending approval/generation
);

-- Badge status
CREATE TYPE badge_status AS ENUM (
  'issued',          -- Successfully issued
  'revoked',         -- Revoked/cancelled
  'expired'          -- Past expiration date
);

-- ============================================================================
-- TABLE: certificate_templates
-- ============================================================================

CREATE TABLE certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type certificate_type NOT NULL DEFAULT 'completion',
  
  -- Design Configuration
  layout_json JSONB NOT NULL DEFAULT '{}', -- Template layout structure
  styles_json JSONB NOT NULL DEFAULT '{}', -- CSS/styling information
  background_image_url TEXT,
  logo_url TEXT,
  
  -- Content Fields
  title_template VARCHAR(500) NOT NULL DEFAULT 'Certificate of {{type}}',
  body_template TEXT,
  signature_fields JSONB DEFAULT '[]', -- Array of signature configurations
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_default_per_type UNIQUE (template_type, is_default) WHERE is_default = true
);

-- Indexes
CREATE INDEX idx_certificate_templates_type ON certificate_templates(template_type);
CREATE INDEX idx_certificate_templates_active ON certificate_templates(is_active) WHERE is_active = true;

-- ============================================================================
-- TABLE: certificates
-- ============================================================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Course References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  template_id UUID REFERENCES certificate_templates(id) ON DELETE SET NULL,
  
  -- Certificate Identity
  certificate_number VARCHAR(50) NOT NULL UNIQUE,
  certificate_type certificate_type NOT NULL DEFAULT 'completion',
  status certificate_status NOT NULL DEFAULT 'active',
  
  -- Certificate Details
  title VARCHAR(500) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  description TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  
  -- Continuing Education Credits
  ce_credits NUMERIC(5,2) DEFAULT 0,
  ce_hours NUMERIC(5,2) DEFAULT 0,
  regulatory_body VARCHAR(100), -- MFDA, IIROC, provincial bodies
  credit_category VARCHAR(100), -- ethics, technical, products, etc.
  
  -- Verification
  qr_code_data TEXT, -- QR code content for verification
  verification_url TEXT, -- Public verification URL
  blockchain_hash TEXT, -- Optional blockchain verification
  
  -- Files & Assets
  pdf_url TEXT,
  pdf_file_path TEXT,
  thumbnail_url TEXT,
  
  -- Badge Reference
  badge_id UUID, -- Links to digital_badges table
  
  -- Signatures
  signatures JSONB DEFAULT '[]', -- Array of signature data
  
  -- Approval Workflow
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Revocation
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_expiry_date CHECK (expiry_date IS NULL OR expiry_date > issue_date),
  CONSTRAINT valid_ce_credits CHECK (ce_credits >= 0),
  CONSTRAINT valid_ce_hours CHECK (ce_hours >= 0)
);

-- Indexes
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_course ON certificates(course_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_type ON certificates(certificate_type);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_issue_date ON certificates(issue_date DESC);
CREATE INDEX idx_certificates_expiry ON certificates(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_certificates_regulatory ON certificates(regulatory_body) WHERE regulatory_body IS NOT NULL;

-- ============================================================================
-- TABLE: digital_badges
-- ============================================================================
-- Open Badges 2.0 specification compliant
-- Reference: https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html

CREATE TABLE digital_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Certificate Link
  certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Open Badges Identity
  badge_class_id VARCHAR(255) NOT NULL, -- Unique identifier for badge type
  assertion_id VARCHAR(255) NOT NULL UNIQUE, -- Unique assertion ID
  
  -- Badge Details
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL, -- Badge image
  criteria_url TEXT, -- URL describing how to earn badge
  
  -- Issuer Information (Open Badges format)
  issuer_name VARCHAR(255) NOT NULL,
  issuer_url TEXT NOT NULL,
  issuer_email VARCHAR(255),
  issuer_image_url TEXT,
  
  -- Recipient Information
  recipient_identity VARCHAR(255) NOT NULL, -- Hashed email or identifier
  recipient_type VARCHAR(50) NOT NULL DEFAULT 'email',
  recipient_hashed BOOLEAN DEFAULT true,
  
  -- Badge Status
  status badge_status NOT NULL DEFAULT 'issued',
  issued_on TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_on TIMESTAMPTZ,
  
  -- Evidence & Verification
  evidence_url TEXT, -- Link to evidence (course completion, quiz results)
  verification_url TEXT, -- Public verification URL
  assertion_url TEXT, -- Hosted assertion URL
  
  -- Open Badges JSON-LD
  badge_assertion_json JSONB NOT NULL DEFAULT '{}', -- Full Open Badges 2.0 assertion
  
  -- Revocation
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_expiration CHECK (expires_on IS NULL OR expires_on > issued_on)
);

-- Indexes
CREATE INDEX idx_badges_certificate ON digital_badges(certificate_id);
CREATE INDEX idx_badges_user ON digital_badges(user_id);
CREATE INDEX idx_badges_assertion ON digital_badges(assertion_id);
CREATE INDEX idx_badges_class ON digital_badges(badge_class_id);
CREATE INDEX idx_badges_status ON digital_badges(status);
CREATE INDEX idx_badges_issued ON digital_badges(issued_on DESC);
CREATE INDEX idx_badges_expires ON digital_badges(expires_on) WHERE expires_on IS NOT NULL;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number(
  cert_type certificate_type DEFAULT 'completion'
)
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
  type_prefix VARCHAR(10);
  year_part VARCHAR(4);
  sequence_num INTEGER;
  cert_number VARCHAR(50);
BEGIN
  -- Determine prefix based on certificate type
  type_prefix := CASE cert_type
    WHEN 'completion' THEN 'COMP'
    WHEN 'certification' THEN 'CERT'
    WHEN 'ce_credit' THEN 'CECR'
    WHEN 'achievement' THEN 'ACHV'
    WHEN 'participation' THEN 'PART'
    ELSE 'UNKN'
  END;
  
  -- Get current year
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  
  -- Get next sequence number for this type and year
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(certificate_number FROM LENGTH(type_prefix || '-' || year_part || '-') + 1)
      AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM certificates
  WHERE certificate_type = cert_type
    AND EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Format: PREFIX-YYYY-NNNNNN (e.g., COMP-2025-000001)
  cert_number := type_prefix || '-' || year_part || '-' || LPAD(sequence_num::VARCHAR, 6, '0');
  
  RETURN cert_number;
END;
$$;

-- Generate badge assertion ID
CREATE OR REPLACE FUNCTION generate_badge_assertion_id()
RETURNS VARCHAR(255)
LANGUAGE plpgsql
AS $$
DECLARE
  assertion_id VARCHAR(255);
BEGIN
  -- Generate unique assertion ID: badge-{uuid}
  assertion_id := 'badge-' || gen_random_uuid()::VARCHAR;
  
  RETURN assertion_id;
END;
$$;

-- Update certificate status based on expiry
CREATE OR REPLACE FUNCTION update_certificate_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if certificate has expired
  IF NEW.expiry_date IS NOT NULL 
     AND NEW.expiry_date < CURRENT_DATE 
     AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for certificate status
CREATE TRIGGER certificate_status_update
  BEFORE INSERT OR UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_status();

-- Update badge status based on expiry
CREATE OR REPLACE FUNCTION update_badge_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if badge has expired
  IF NEW.expires_on IS NOT NULL 
     AND NEW.expires_on < now() 
     AND NEW.status = 'issued' THEN
    NEW.status := 'expired';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for badge status
CREATE TRIGGER badge_status_update
  BEFORE INSERT OR UPDATE ON digital_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_badge_status();

-- Sync badge_id when badge is created
CREATE OR REPLACE FUNCTION sync_certificate_badge_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update certificate with badge_id
  UPDATE certificates
  SET badge_id = NEW.id,
      updated_at = now()
  WHERE id = NEW.certificate_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for badge creation
CREATE TRIGGER certificate_badge_sync
  AFTER INSERT ON digital_badges
  FOR EACH ROW
  EXECUTE FUNCTION sync_certificate_badge_id();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_certificate_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER certificate_templates_update
  BEFORE UPDATE ON certificate_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_timestamp();

CREATE TRIGGER certificates_update
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_timestamp();

CREATE TRIGGER digital_badges_update
  BEFORE UPDATE ON digital_badges
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_badges ENABLE ROW LEVEL SECURITY;

-- Certificate Templates Policies
CREATE POLICY certificate_templates_select_all ON certificate_templates
  FOR SELECT
  USING (is_active = true);

CREATE POLICY certificate_templates_admin ON certificate_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Certificates Policies
CREATE POLICY certificates_select_own ON certificates
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY certificates_select_public ON certificates
  FOR SELECT
  USING (
    status = 'active'
    AND (
      -- Public verification by certificate number
      certificate_number IS NOT NULL
      -- Or through shared verification URL
      OR verification_url IS NOT NULL
    )
  );

CREATE POLICY certificates_insert_admin ON certificates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'instructor')
    )
  );

CREATE POLICY certificates_update_admin ON certificates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'instructor')
    )
  );

CREATE POLICY certificates_delete_admin ON certificates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Digital Badges Policies
CREATE POLICY badges_select_own ON digital_badges
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY badges_select_public ON digital_badges
  FOR SELECT
  USING (
    status = 'issued'
    AND (
      -- Public verification by assertion ID
      assertion_id IS NOT NULL
      -- Or through verification URL
      OR verification_url IS NOT NULL
    )
  );

CREATE POLICY badges_insert_admin ON digital_badges
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'instructor')
    )
  );

CREATE POLICY badges_update_admin ON digital_badges
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin', 'instructor')
    )
  );

CREATE POLICY badges_delete_admin ON digital_badges
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- SEED DATA: Default Certificate Template
-- ============================================================================

INSERT INTO certificate_templates (
  name,
  description,
  template_type,
  title_template,
  body_template,
  layout_json,
  styles_json,
  signature_fields,
  is_default,
  is_active
) VALUES (
  'Default Completion Certificate',
  'Standard course completion certificate template',
  'completion',
  'Certificate of Completion',
  'This certifies that {{recipient_name}} has successfully completed the course "{{course_title}}" on {{completion_date}}.',
  '{
    "orientation": "landscape",
    "size": "letter",
    "margins": {"top": 50, "right": 50, "bottom": 50, "left": 50},
    "sections": [
      {"type": "header", "height": 100},
      {"type": "title", "height": 80},
      {"type": "body", "height": 200},
      {"type": "signatures", "height": 100},
      {"type": "footer", "height": 50}
    ]
  }',
  '{
    "font": {"family": "Times New Roman", "size": 14},
    "colors": {"primary": "#1a202c", "secondary": "#4a5568", "accent": "#805ad5"},
    "border": {"width": 2, "color": "#805ad5", "style": "solid"}
  }',
  '[
    {"name": "Instructor", "title": "Course Instructor", "line": true},
    {"name": "Director", "title": "Program Director", "line": true}
  ]',
  true,
  true
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE certificate_templates IS 'Customizable certificate design templates';
COMMENT ON TABLE certificates IS 'Certificate records for course completions and achievements';
COMMENT ON TABLE digital_badges IS 'Open Badges 2.0 compliant digital credentials';

COMMENT ON FUNCTION generate_certificate_number IS 'Generates unique certificate numbers in format: TYPE-YYYY-NNNNNN';
COMMENT ON FUNCTION generate_badge_assertion_id IS 'Generates unique Open Badges assertion IDs';
COMMENT ON FUNCTION update_certificate_status IS 'Automatically updates certificate status based on expiry date';
COMMENT ON FUNCTION update_badge_status IS 'Automatically updates badge status based on expiry date';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
