-- Fix remaining recursive policies on profiles table
-- These policies query the profiles table while being evaluated ON the profiles table
-- This causes infinite recursion error 42P17

-- Drop the recursive policies
DROP POLICY IF EXISTS "Compliance officers can update roles" ON profiles;
DROP POLICY IF EXISTS "Test accounts are viewable by authenticated users" ON profiles;

-- For now, simplify to basic policies only
-- Super admin/compliance officer role checks will be handled at application level
-- after fetching the user's own profile (which doesn't cause recursion)

-- Note: This temporarily removes organization-wide admin access
-- Phase 10 will implement proper organization-based access control
-- using a separate lookup table that doesn't cause recursion
