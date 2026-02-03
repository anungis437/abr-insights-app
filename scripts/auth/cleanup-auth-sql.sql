-- Clean up all auth data to start fresh
-- Run this in Supabase SQL Editor at: 
-- https://supabase.com/dashboard/project/zdcmugkafbczvxcyofiz/sql/new

-- Delete all data from auth tables (in correct order to respect foreign keys)
DELETE FROM auth.identities;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.sessions;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.sso_providers;
DELETE FROM auth.sso_domains;
DELETE FROM auth.saml_providers;
DELETE FROM auth.saml_relay_states;
DELETE FROM auth.flow_state;
DELETE FROM auth.users;

-- Delete profiles
DELETE FROM public.profiles;

SELECT 'Auth tables cleaned successfully!' as result;
