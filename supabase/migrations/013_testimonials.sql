-- Create testimonials table for storing user testimonials and reviews
-- Part of Phase 4: Public Site Enhancement

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Testimonial content
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  organization VARCHAR(150) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 50 AND char_length(content) <= 500),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Display settings
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Optional metadata
  photo_url TEXT,
  linkedin_url TEXT,
  case_study_url TEXT,
  
  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(organization, '') || ' ' || coalesce(content, ''))
  ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_testimonials_featured ON testimonials(featured) WHERE featured = true AND active = true;
CREATE INDEX idx_testimonials_active ON testimonials(active) WHERE active = true;
CREATE INDEX idx_testimonials_display_order ON testimonials(display_order);
CREATE INDEX idx_testimonials_rating ON testimonials(rating);
CREATE INDEX idx_testimonials_search ON testimonials USING gin(search_vector);

-- Create updated_at trigger
CREATE TRIGGER set_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read access for active testimonials
CREATE POLICY "Testimonials are viewable by everyone"
  ON testimonials
  FOR SELECT
  USING (active = true);

-- Admin write access (will be restricted to admin users)
CREATE POLICY "Admins can insert testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update testimonials"
  ON testimonials
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can delete testimonials"
  ON testimonials
  FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Insert sample testimonials for demo
INSERT INTO testimonials (name, role, organization, content, rating, featured, display_order, photo_url) VALUES
  (
    'Sarah Johnson',
    'Chief Diversity Officer',
    'TechCorp Canada',
    'ABR Insights has transformed how we approach equity in our workplace. The tribunal case database alone has been invaluable for understanding systemic issues and making data-driven decisions. Our leadership team now has the tools to create meaningful change.',
    5,
    true,
    1,
    '/images/testimonials/sarah-johnson.jpg'
  ),
  (
    'Marcus Williams',
    'HR Director',
    'National Bank of Canada',
    'The training courses are exceptional - evidence-based, practical, and designed by experts who understand the nuances of anti-Black racism. Our team engagement scores have improved significantly since implementing ABR Insights across our organization.',
    5,
    true,
    2,
    '/images/testimonials/marcus-williams.jpg'
  ),
  (
    'Dr. Aisha Patel',
    'Head of Learning & Development',
    'Healthcare Systems Ontario',
    'What sets ABR Insights apart is the combination of legal precedents, expert training, and actionable analytics. We've been able to identify and address equity gaps we didn't even know existed. This platform is essential for any organization serious about EDI.',
    5,
    true,
    3,
    '/images/testimonials/aisha-patel.jpg'
  ),
  (
    'James Chen',
    'VP of People Operations',
    'RetailCo Inc.',
    'ABR Insights provides the evidence and framework we needed to move beyond performative diversity initiatives. The case studies and best practices have guided our policy development and training programs. Highly recommend for any Canadian organization.',
    5,
    true,
    4,
    '/images/testimonials/james-chen.jpg'
  );

-- Add comment
COMMENT ON TABLE testimonials IS 'User testimonials and reviews for social proof on public site';
