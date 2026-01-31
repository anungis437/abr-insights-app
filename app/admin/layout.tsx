import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAdminRole } from '@/lib/auth/serverAuth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // P0 Security: Ensure valid session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login?redirect=/admin')
  }

  // Fetch user's organization context
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/auth/login?redirect=/admin')
  }

  // P0 Security: Check admin role via RBAC tables (user_roles / roles)
  // This matches the backend authorization model used by DB-side functions
  const isAdmin = await hasAdminRole(user.id, profile.organization_id)
  
  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  return <>{children}</>
}
