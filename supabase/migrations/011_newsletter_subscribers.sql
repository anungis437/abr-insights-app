-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE INDEX IF NOT EXISTS on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email 
  ON public.newsletter_subscribers(email);

-- CREATE INDEX IF NOT EXISTS on active subscribers
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active 
  ON public.newsletter_subscribers(is_active) 
  WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Service role can delete subscribers" ON public.newsletter_subscribers;

-- RLS Policy: Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policy: Only authenticated users can view
CREATE POLICY "Authenticated users can view subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Only service role can update/delete
CREATE POLICY "Service role can update subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can delete subscribers"
  ON public.newsletter_subscribers
  FOR DELETE
  TO service_role
  USING (true);

-- Update timestamp trigger
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comment
COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter email subscriptions';



