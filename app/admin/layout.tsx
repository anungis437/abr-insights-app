import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

  // Fetch user profile with role and organization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/auth/login?redirect=/admin')
  }

  // P0 Security: Require admin or super_admin role
  const allowedRoles = ['admin', 'super_admin', 'org_admin']
  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard?error=unauthorized')
  }

  return <>{children}</>
}
