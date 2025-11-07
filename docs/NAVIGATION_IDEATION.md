# Navigation & Footer Ideation - Public vs Authenticated

**Date:** November 7, 2025  
**Status:** 📋 Planning Phase

## Executive Summary

Current navigation is a single component serving both public visitors and authenticated users with different roles. This creates UX friction and doesn't properly surface role-specific features. We need to split into **Public Navigation** and **Authenticated Navigation** with role-aware adaptive menus.

---

## Current State Analysis

### Current Navigation Component
- **Location:** `components/shared/Navigation.tsx` (173 lines)
- **Type:** Single unified navigation with conditional rendering
- **Auth Detection:** Uses `useAuth()` hook to check `user` state
- **Links:** 7 main navigation links (About, Courses, Cases, Analytics, Pricing, Resources, Contact)

### Current Footer Component
- **Location:** `components/shared/Footer.tsx` (200 lines)
- **Type:** Static footer (same for all users)
- **Sections:** About, Product, Company, Legal (4 columns)
- **Links:** 21 footer links total

### Problems Identified

1. **Mixed Context Navigation**
   - Public visitors see "Analytics" link (requires auth)
   - Authenticated users see "Pricing" (less relevant post-signup)
   - No role-specific features surfaced (e.g., admin links)

2. **Confusing CTAs**
   - "Dashboard" link goes to `/analytics` (inconsistent naming)
   - "Get Started" vs "Sign Up" confusion
   - Mobile menu shows dashboard + user profile redundantly

3. **Missing Features**
   - No quick access to role-specific pages (admin, team, profile)
   - No notifications/alerts indicator
   - No organization switcher for multi-org users
   - No help/support access point

4. **Footer Issues**
   - Same footer for everyone (public + authenticated)
   - Links to pages that require auth without indication
   - No authenticated user shortcuts (profile, settings, etc.)

---

## User Personas & Navigation Needs

### 1. **Public Visitor** (Not Logged In)
**Goals:** Learn about product, explore capabilities, sign up

**Top Nav Needs:**
- ✅ About ABR Insights
- ✅ Product features overview
- ✅ Browse public case studies
- ✅ View course catalog
- ✅ Pricing information
- ✅ Contact/demo request
- ✅ Clear CTA to Sign Up
- ✅ Login link

**Footer Needs:**
- Company info (About, Contact, Careers)
- Product overview (Features, Use Cases)
- Legal (Privacy, Terms, Security)
- Social proof (Testimonials link, Case Studies)
- Resources (Blog, FAQ, Help Center)

---

### 2. **Learner** (Authenticated - Basic User)
**Goals:** Take courses, explore cases, track progress

**Top Nav Needs:**
- 🆕 Dashboard (overview of progress)
- 🆕 My Learning (courses, progress)
- ✅ Case Explorer (browse all cases)
- ✅ Leaderboard (gamification)
- 🆕 Achievements (badges/points)
- 🆕 Profile (dropdown: settings, logout)
- 🆕 Notifications icon

**Footer Needs:**
- Help & Support
- My Profile
- Settings
- Legal (Privacy, Terms)
- Feedback/Report Issue

---

### 3. **Educator** (Authenticated - Content Creator)
**Goals:** Create courses, manage content, track learner progress

**Top Nav Needs:**
- 🆕 Dashboard
- 🆕 My Courses (courses I teach)
- 🆕 Content Library (create/edit)
- ✅ Case Explorer
- 🆕 Learner Analytics (my students)
- 🆕 Profile (dropdown)
- 🆕 Notifications

**Footer Needs:**
- Help Center (Educator Guide)
- Content Guidelines
- My Profile
- Analytics Dashboard
- Support

---

### 4. **Analyst/Investigator** (Authenticated - Data/Case Focus)
**Goals:** Analyze data, investigate cases, generate reports

**Top Nav Needs:**
- 🆕 Dashboard
- 🆕 Analytics (advanced)
- 🆕 Case Management (create/edit cases)
- 🆕 Reports (generate insights)
- 🆕 Data Explorer (advanced filters)
- 🆕 Team (collaborate)
- 🆕 Profile (dropdown)
- 🆕 Notifications

**Footer Needs:**
- Analytics Help
- API Documentation
- Data Export
- Team Settings
- Support

---

### 5. **Org Admin** (Authenticated - Organization Management)
**Goals:** Manage team, configure org, monitor usage

**Top Nav Needs:**
- 🆕 Dashboard
- 🆕 Team Management (add/remove users)
- 🆕 Org Settings (config, branding)
- 🆕 Usage Analytics (org-wide metrics)
- 🆕 Billing (subscription, invoices)
- ✅ Case Explorer
- 🆕 Admin Panel (dropdown: team, org, billing)
- 🆕 Profile (dropdown)
- 🆕 Notifications

**Footer Needs:**
- Admin Help Center
- Team Management
- Billing Portal
- API Keys
- Support (priority)

---

### 6. **Compliance Officer** (Authenticated - Oversight/Audit)
**Goals:** Monitor compliance, audit activity, generate reports

**Top Nav Needs:**
- 🆕 Dashboard (compliance metrics)
- 🆕 Audit Logs (activity tracking)
- 🆕 Compliance Reports
- 🆕 Case Review (flagged cases)
- 🆕 Team Activity (monitor usage)
- 🆕 Admin Panel (dropdown)
- 🆕 Profile (dropdown)
- 🆕 Notifications

**Footer Needs:**
- Compliance Guide
- Audit Logs
- Policy Documentation
- Legal Resources
- Support

---

### 7. **Super Admin** (Authenticated - Platform Admin)
**Goals:** Manage entire platform, all organizations, system config

**Top Nav Needs:**
- 🆕 Admin Dashboard (global)
- 🆕 Organizations (manage all orgs)
- 🆕 Users (global user management)
- 🆕 System Settings (platform config)
- 🆕 AI Models (train/manage AI)
- 🆕 Ingestion (data pipeline)
- 🆕 Analytics (platform-wide)
- 🆕 Admin Panel (full dropdown menu)
- 🆕 Profile (dropdown)
- 🆕 Notifications

**Footer Needs:**
- System Administration
- Developer Tools
- API Management
- Platform Health
- Support Dashboard

---

## Proposed Architecture

### Option A: Separate Components (Recommended ✅)

**Structure:**
```
components/
  shared/
    navigation/
      PublicNavigation.tsx       // For non-authenticated users
      AuthenticatedNavigation.tsx // For authenticated users
      NavigationWrapper.tsx      // Smart wrapper that chooses
      MobileMenu.tsx             // Shared mobile menu logic
      UserMenu.tsx               // Dropdown for authenticated users
      NotificationBell.tsx       // Notification indicator
    footer/
      PublicFooter.tsx           // For non-authenticated users
      AuthenticatedFooter.tsx    // For authenticated users
      FooterWrapper.tsx          // Smart wrapper that chooses
```

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Easier to maintain/test each independently
- ✅ Can optimize bundle size (code splitting)
- ✅ Different layouts/styles possible
- ✅ Role-specific logic isolated

**Drawbacks:**
- More files to manage
- Potential code duplication for shared elements
- Need wrapper component for routing

---

### Option B: Single Adaptive Component

**Structure:**
```
components/
  shared/
    Navigation.tsx              // Single component with role logic
    NavigationConfig.ts         // Config object with role-based menus
    Footer.tsx                  // Single component with role logic
    FooterConfig.ts             // Config object with role-based links
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easier to ensure consistency
- ✅ Less file management

**Drawbacks:**
- Complex conditional logic
- Harder to test
- Larger bundle size (includes all variations)
- Mixing concerns (public + auth + roles)

---

## Recommended Approach: **Option A with Config**

Best of both worlds:
1. **Separate components** (PublicNavigation, AuthenticatedNavigation)
2. **Shared config file** (navigationConfig.ts) defining links per role
3. **Smart wrapper** (NavigationWrapper.tsx) that detects auth state and role
4. **Shared UI components** (MobileMenu, UserMenu, NotificationBell)

---

## Detailed Navigation Design

### Public Navigation (Not Logged In)

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [ABR Logo]  About  Courses  Cases  Pricing  Resources          │
│                                          [Sign In]  [Get Started] │
└─────────────────────────────────────────────────────────────────┘
```

**Links:**
- **Logo** → Homepage
- **About** → `/about`
- **Courses** → `/courses` (browse catalog)
- **Cases** → `/cases/browse` (public cases only)
- **Pricing** → `/pricing`
- **Resources** → Dropdown: Blog, FAQ, Help Center, Contact
- **Sign In** → `/auth/login`
- **Get Started** → `/auth/signup` (primary CTA)

**Mobile:** Hamburger menu with same links

---

### Authenticated Navigation (Logged In)

**Desktop Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [ABR Logo]  Dashboard  Learning  Cases  Team  [🔔3]  [👤 John ▾]│
└─────────────────────────────────────────────────────────────────┘
```

**Base Links (All Authenticated Users):**
- **Logo** → `/dashboard` (not homepage)
- **Dashboard** → `/dashboard`
- **Learning** → Dropdown: My Courses, Browse Catalog, My Progress
- **Cases** → Dropdown: Explore Cases, My Cases, Browse All
- **[🔔]** → Notification dropdown (bell icon with badge count)
- **[👤 User]** → Dropdown: Profile, Settings, Help, Sign Out

**Role-Specific Additions:**

**Educator:**
- **+ Content** → Dropdown: Create Course, My Courses, Content Library

**Analyst/Investigator:**
- **+ Analytics** → Dropdown: My Reports, Create Report, Data Explorer
- **+ Team** → `/team`

**Org Admin:**
- **+ Team** → `/team`
- **+ Admin** → Dropdown: Team Management, Org Settings, Billing, Usage Analytics

**Compliance Officer:**
- **+ Compliance** → Dropdown: Audit Logs, Flagged Cases, Compliance Reports, Team Activity

**Super Admin:**
- **+ Admin** → Dropdown: 
  - Organizations (all orgs)
  - Users (global)
  - AI Models
  - Ingestion Pipeline
  - System Settings
  - Platform Analytics

**Mobile:** 
- Hamburger menu with role-based links
- Notification icon in header
- User menu in hamburger (at bottom)

---

## User Menu Dropdown Design

**Authenticated User Menu (Click user avatar/name):**

```
┌──────────────────────────────┐
│ John Doe                     │
│ john@company.com            │
│ Org Admin                    │
├──────────────────────────────┤
│ 👤 My Profile               │
│ ⚙️  Settings                │
│ 🏆 Achievements (123 pts)   │
│ 📊 My Analytics             │
│ ❓ Help & Support           │
├──────────────────────────────┤
│ 🔓 Sign Out                 │
└──────────────────────────────┘
```

**Links:**
- **My Profile** → `/profile`
- **Settings** → `/profile/settings`
- **Achievements** → `/achievements` (with point count)
- **My Analytics** → `/analytics` (personal)
- **Help & Support** → `/help` or opens support widget
- **Sign Out** → Triggers `signOut()` function

---

## Notification Menu Design

**Notification Dropdown (Click bell icon):**

```
┌──────────────────────────────────────┐
│ Notifications              (Mark all)│
├──────────────────────────────────────┤
│ 🆕 New course assigned: "Ethics 101"│
│    2 hours ago                       │
├──────────────────────────────────────┤
│ 📊 Report ready: Q4 Analysis        │
│    Yesterday                         │
├──────────────────────────────────────┤
│ 🏆 Achievement unlocked!             │
│    2 days ago                        │
├──────────────────────────────────────┤
│ [View All Notifications]             │
└──────────────────────────────────────┘
```

**Features:**
- Badge count on bell icon (max display: 99+)
- Unread notifications highlighted
- Mark all as read button
- Link to full notifications page
- Real-time updates (via Supabase realtime)

---

## Footer Design

### Public Footer (Not Logged In)

**4 Column Layout:**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [ABR Logo]           PRODUCT          COMPANY       LEGAL     │
│  Empowering orgs      Courses          About Us      Privacy   │
│  with insights        Case Explorer    Contact       Terms     │
│                       Analytics        Resources     Security  │
│  [Social Icons]       Pricing          Careers       Cookies   │
│                       Enterprise       Blog          Access.   │
│                                        FAQ                      │
│                                                                │
│  © 2025 ABR Insights. All rights reserved.  Built with ❤️ in 🇨🇦│
└────────────────────────────────────────────────────────────────┘
```

**Links remain similar to current footer**

---

### Authenticated Footer (Logged In)

**3 Column Layout (Simplified):**

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [ABR Logo]           QUICK LINKS      SUPPORT       LEGAL     │
│                       Dashboard         Help Center   Privacy   │
│  John Doe             My Learning      Contact       Terms     │
│  Org Admin            Team             Feedback      Security  │
│  Acme Corp            Analytics        API Docs                │
│                       Profile                                  │
│  [Social Icons]       Settings                                │
│                                                                │
│  © 2025 ABR Insights. All rights reserved.  Built with ❤️ in 🇨🇦│
└────────────────────────────────────────────────────────────────┘
```

**Differences:**
- User info in footer (name, role, org)
- Quick links to common authenticated pages
- Support column with Help Center, API Docs
- Fewer marketing links (no "Pricing", "About Us")
- Role-specific links (e.g., "Admin Panel" for admins)

---

## Navigation Configuration Schema

**File:** `lib/navigation/navigationConfig.ts`

```typescript
export type NavLink = {
  label: string
  href: string
  icon?: React.ComponentType
  badge?: string | number
  requiresAuth?: boolean
  allowedRoles?: UserRole[]
  children?: NavLink[] // For dropdowns
}

export type NavigationConfig = {
  public: NavLink[]
  authenticated: {
    base: NavLink[] // All authenticated users
    learner: NavLink[]
    educator: NavLink[]
    analyst: NavLink[]
    investigator: NavLink[]
    org_admin: NavLink[]
    compliance_officer: NavLink[]
    super_admin: NavLink[]
  }
}

export const navigationConfig: NavigationConfig = {
  public: [
    { label: 'About', href: '/about' },
    { label: 'Courses', href: '/courses' },
    { label: 'Cases', href: '/cases/browse' },
    { label: 'Pricing', href: '/pricing' },
    {
      label: 'Resources',
      href: '#',
      children: [
        { label: 'Blog', href: '/blog' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Help Center', href: '/help' },
        { label: 'Contact', href: '/contact' },
      ]
    }
  ],
  authenticated: {
    base: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      {
        label: 'Learning',
        href: '#',
        children: [
          { label: 'My Courses', href: '/training' },
          { label: 'Browse Catalog', href: '/courses' },
          { label: 'My Progress', href: '/profile/progress' },
        ]
      },
      {
        label: 'Cases',
        href: '#',
        children: [
          { label: 'Explore Cases', href: '/cases/explore' },
          { label: 'My Cases', href: '/cases/my-cases' },
          { label: 'Browse All', href: '/cases/browse' },
        ]
      }
    ],
    learner: [],
    educator: [
      {
        label: 'Content',
        href: '#',
        icon: BookOpen,
        children: [
          { label: 'Create Course', href: '/admin/courses/create' },
          { label: 'My Courses', href: '/admin/courses' },
          { label: 'Content Library', href: '/resources' },
        ]
      }
    ],
    analyst: [
      {
        label: 'Analytics',
        href: '#',
        icon: BarChart3,
        children: [
          { label: 'My Reports', href: '/analytics/my-reports' },
          { label: 'Create Report', href: '/analytics/create' },
          { label: 'Data Explorer', href: '/analytics' },
        ]
      },
      { label: 'Team', href: '/team', icon: Users }
    ],
    investigator: [
      {
        label: 'Analytics',
        href: '#',
        icon: BarChart3,
        children: [
          { label: 'My Reports', href: '/analytics/my-reports' },
          { label: 'Create Report', href: '/analytics/create' },
          { label: 'Data Explorer', href: '/analytics' },
        ]
      },
      { label: 'Team', href: '/team', icon: Users }
    ],
    org_admin: [
      { label: 'Team', href: '/team', icon: Users },
      {
        label: 'Admin',
        href: '#',
        icon: Settings,
        children: [
          { label: 'Team Management', href: '/admin/team' },
          { label: 'Org Settings', href: '/admin/org-settings' },
          { label: 'Billing', href: '/admin/billing' },
          { label: 'Usage Analytics', href: '/admin/analytics' },
        ]
      }
    ],
    compliance_officer: [
      {
        label: 'Compliance',
        href: '#',
        icon: Shield,
        children: [
          { label: 'Audit Logs', href: '/admin/audit-logs' },
          { label: 'Flagged Cases', href: '/cases/flagged' },
          { label: 'Compliance Reports', href: '/admin/compliance' },
          { label: 'Team Activity', href: '/admin/team-activity' },
        ]
      }
    ],
    super_admin: [
      {
        label: 'Admin',
        href: '#',
        icon: Shield,
        children: [
          { label: 'Organizations', href: '/admin/organizations' },
          { label: 'Users', href: '/admin/users' },
          { label: 'AI Models', href: '/admin/ai-models' },
          { label: 'Ingestion Pipeline', href: '/admin/ingestion' },
          { label: 'System Settings', href: '/admin/settings' },
          { label: 'Platform Analytics', href: '/admin/analytics' },
        ]
      }
    ]
  }
}
```

---

## Implementation Plan

### Phase 1: Create New Components (No Breaking Changes)
**Time Estimate:** 4-6 hours

1. Create `components/shared/navigation/` directory
2. Build `PublicNavigation.tsx` (extract current public logic)
3. Build `AuthenticatedNavigation.tsx` (new role-aware version)
4. Build `NavigationWrapper.tsx` (smart router component)
5. Build `UserMenu.tsx` (dropdown component)
6. Build `NotificationBell.tsx` (placeholder, no backend yet)
7. Create `lib/navigation/navigationConfig.ts` (config file)

**Validation:**
- Both navigation types render correctly
- No console errors
- Mobile responsive on both

---

### Phase 2: Create New Footer Components
**Time Estimate:** 2-3 hours

1. Create `components/shared/footer/` directory
2. Build `PublicFooter.tsx` (similar to current)
3. Build `AuthenticatedFooter.tsx` (simplified, user-focused)
4. Build `FooterWrapper.tsx` (smart router component)
5. Create `lib/navigation/footerConfig.ts` (config file)

**Validation:**
- Both footers render correctly
- Links work on both versions
- Mobile responsive

---

### Phase 3: Integrate NavigationWrapper
**Time Estimate:** 2-3 hours

1. Update `app/layout.tsx` to use `NavigationWrapper` instead of `Navigation`
2. Test public pages (homepage, about, pricing)
3. Test authenticated pages (dashboard, analytics)
4. Test role switching (login as different roles)

**Validation:**
- Public users see `PublicNavigation`
- Authenticated users see `AuthenticatedNavigation`
- Role-specific links appear correctly
- No layout shifts or flicker

---

### Phase 4: Integrate FooterWrapper
**Time Estimate:** 1-2 hours

1. Update `app/layout.tsx` to use `FooterWrapper` instead of `Footer`
2. Test public footer on marketing pages
3. Test authenticated footer on app pages
4. Verify all links work

**Validation:**
- Correct footer shows for each user type
- No broken links
- Mobile responsive

---

### Phase 5: Remove Old Components
**Time Estimate:** 30 minutes

1. Archive old `Navigation.tsx` → `Navigation.tsx.old`
2. Archive old `Footer.tsx` → `Footer.tsx.old`
3. Update any direct imports (should be none after Phase 3-4)
4. Run build and test
5. Delete old files if all tests pass

**Validation:**
- Build successful
- No import errors
- All pages load correctly

---

### Phase 6: Add Notification System (Future)
**Time Estimate:** 8-12 hours (separate epic)

1. Create `notifications` table in Supabase
2. Build notification service (`lib/services/notificationService.ts`)
3. Add real-time subscription logic
4. Populate `NotificationBell` with real data
5. Create `/notifications` page for full list
6. Add notification creation triggers (course assigned, achievement unlocked, etc.)

---

## Technical Considerations

### 1. Role Detection
```typescript
// lib/navigation/useNavigation.ts
export function useNavigation() {
  const { user, profile } = useAuth()
  
  const role = profile?.role || 'guest'
  const isAuthenticated = !!user
  
  const getNavigationLinks = () => {
    if (!isAuthenticated) {
      return navigationConfig.public
    }
    
    // Merge base + role-specific
    return [
      ...navigationConfig.authenticated.base,
      ...(navigationConfig.authenticated[role] || [])
    ]
  }
  
  return {
    links: getNavigationLinks(),
    isAuthenticated,
    role
  }
}
```

### 2. Dropdown Component
```typescript
// components/shared/navigation/NavDropdown.tsx
type NavDropdownProps = {
  label: string
  children: NavLink[]
  icon?: React.ComponentType
}

export function NavDropdown({ label, children, icon: Icon }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        <ChevronDown className="h-3 w-3" />
      </button>
      
      {open && (
        <div className="absolute top-full mt-2 w-48 bg-white shadow-lg rounded-lg">
          {children.map(child => (
            <Link key={child.href} href={child.href} className="block px-4 py-2 hover:bg-gray-50">
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 3. Code Splitting
```typescript
// components/shared/navigation/NavigationWrapper.tsx
import dynamic from 'next/dynamic'

const PublicNavigation = dynamic(() => import('./PublicNavigation'))
const AuthenticatedNavigation = dynamic(() => import('./AuthenticatedNavigation'))

export default function NavigationWrapper() {
  const { user } = useAuth()
  
  return user ? <AuthenticatedNavigation /> : <PublicNavigation />
}
```

### 4. Mobile Responsiveness
- Both navigations must work on mobile (hamburger menu)
- Dropdowns convert to accordion on mobile
- User menu remains accessible
- Notification bell remains visible

### 5. Performance
- Use `dynamic()` for code splitting
- Lazy load user menu dropdown
- Cache navigation config
- Minimize re-renders (use `useMemo` for links)

---

## Open Questions / Decisions Needed

1. **Notification Backend:**
   - Do we build notifications table now or later?
   - Use Supabase Realtime or polling?
   - What events trigger notifications?

2. **Organization Switcher:**
   - Do users belong to multiple orgs?
   - If yes, where does org switcher go? (Top nav, user menu, or both?)

3. **Search Bar:**
   - Should nav include global search?
   - If yes, public only or authenticated too?
   - Position: Center of nav or right side?

4. **Breadcrumbs:**
   - Should authenticated pages have breadcrumbs?
   - If yes, part of nav or separate component?

5. **Themes/Dark Mode:**
   - Do we support dark mode navigation?
   - User preference or system preference?

6. **Mobile App:**
   - Is there a native mobile app planned?
   - If yes, should nav match mobile UI patterns?

---

## Success Metrics

### UX Metrics
- ✅ Public visitors find signup CTA within 3 seconds
- ✅ Authenticated users access their role-specific features in 2 clicks max
- ✅ Navigation adapts instantly on login/logout (no page reload)
- ✅ Mobile navigation is fully functional (no missing features)

### Technical Metrics
- ✅ Navigation bundle size < 50KB (gzipped)
- ✅ Navigation renders in < 100ms
- ✅ No layout shift on auth state change
- ✅ No console errors or warnings

### Business Metrics
- 📈 Increase signup conversion rate (fewer barriers)
- 📈 Reduce time-to-first-action for new users
- 📈 Increase feature discovery (role-specific links)
- 📈 Reduce support tickets about "where is X feature"

---

## Next Steps

**Awaiting User Feedback:**
1. ✅ Approve navigation separation approach (Option A)
2. ✅ Confirm role-specific link priorities
3. ✅ Decide on notification system (now or later)
4. ✅ Confirm footer design (simplified auth version)
5. ✅ Approve implementation plan phases

**Once Approved:**
1. Create todo list for Phase 1-5
2. Begin implementation (Phase 1: Components)
3. Test with RBAC accounts (already have 9 test users)
4. Iterate based on feedback

---

## References

- Current Navigation: `components/shared/Navigation.tsx`
- Current Footer: `components/shared/Footer.tsx`
- RBAC Test Accounts: `RBAC_TEST_ACCOUNTS_COMPLETE.md`
- Auth Context: `lib/auth/AuthContext.tsx`
- User Roles: `super_admin`, `compliance_officer`, `org_admin`, `analyst`, `investigator`, `educator`, `learner`, `viewer`, `guest`

---

**Status:** 📋 Ready for review and feedback
