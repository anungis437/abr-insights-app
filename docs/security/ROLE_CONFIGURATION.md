# Role Configuration - Internal vs Public

## Overview

The ABR Insights platform distinguishes between **public roles** (available for subscription) and **internal roles** (staff/admin only).

## Role Classification

### Internal Roles (Staff Only)

These roles are **NOT** available for public signup or subscription:

| Role                   | Level | Landing Page      | Purpose                                          |
| ---------------------- | ----- | ----------------- | ------------------------------------------------ |
| **super_admin**        | 60    | /admin/dashboard  | Platform administration and system configuration |
| **compliance_officer** | 50    | /admin/compliance | Legal compliance and audit oversight             |
| **investigator**       | 30    | /analytics        | Internal case investigation and research         |
| **analyst**            | 30    | /analytics        | Internal data analysis and reporting             |

**Why Internal?**

- **investigator** and **analyst** are specialized internal roles for ABR Insights staff
- They have access to sensitive data and internal analytics tools
- Making them available for subscription would complicate billing and access control
- These roles should only be assigned manually by super_admin

### Public Roles (Subscription Available)

These roles are available through pricing/subscription tiers:

| Role          | Level | Landing Page          | Target Audience                              |
| ------------- | ----- | --------------------- | -------------------------------------------- |
| **org_admin** | 50    | /admin/dashboard      | Organization administrators managing teams   |
| **educator**  | 20    | /instructor/dashboard | Course creators and instructors              |
| **learner**   | 10    | / (homepage)          | Default end-user role for course consumption |
| **viewer**    | 5     | /dashboard            | Read-only access (limited features)          |
| **guest**     | 0     | /                     | Temporary unauthenticated access             |

## Usage in Code

### Check if Role is Internal

```typescript
import { isInternalRole } from '@/lib/types/roles'

if (isInternalRole('investigator')) {
  // Don't show in pricing page
}
```

### Get Public Roles Only

```typescript
import { getPublicRoles } from '@/lib/types/roles'

const publicRoles = getPublicRoles()
// Returns: [org_admin, educator, learner, viewer, guest]
```

### Get Subscription-Available Roles

```typescript
import { getSubscriptionRoles } from '@/lib/types/roles'

const subscriptionRoles = getSubscriptionRoles()
// Returns: [org_admin, educator, learner]
// Excludes: guest, viewer (too limited), internal roles
```

### Get Default Landing Page

```typescript
import { getDefaultLandingPage } from '@/lib/types/roles'

const landingPage = getDefaultLandingPage('investigator')
// Returns: '/analytics'
```

## Implementation Status

### ✅ Completed

1. **Role Configuration** (`lib/types/roles.ts`)
   - Comprehensive role metadata
   - Internal/public classification
   - Default landing pages
   - Helper functions

2. **Login Flow** (`app/auth/login/page.tsx`)
   - Uses `getDefaultLandingPage()` for role-based routing
   - Investigator/Analyst → `/analytics`
   - Learner → `/` (homepage)
   - Others → `/dashboard` or role-specific page

### 🔄 To Do

1. **Update Pricing Page** (`app/pricing/page.tsx`)
   - Filter out internal roles from subscription options
   - Only show: learner, educator, org_admin

2. **Update Signup Flow** (`app/auth/signup/page.tsx`)
   - Remove investigator/analyst from public role selection
   - Default to 'learner' for new signups

3. **Admin User Management** (`app/admin/users/page.tsx`)
   - Show all roles for super_admin
   - Mark internal roles with badge
   - Warn when assigning internal roles

4. **Documentation** (`docs/security/RBAC_DOCUMENTATION.md`)
   - Update role hierarchy
   - Document internal vs public distinction
   - Add role assignment guidelines

## Security Considerations

### Role Assignment Rules

- **Public roles**: Can be selected during signup or via subscription
- **Internal roles**: Only assignable by super_admin via admin panel
- **Super admin**: Cannot be assigned by anyone except existing super_admins

### Subscription Validation

When processing subscriptions, validate that:

- Only public roles are being assigned
- Internal roles (investigator, analyst) cannot be purchased
- Users attempting to "upgrade" to internal roles are rejected

### API Endpoints

Ensure these endpoints respect role boundaries:

- `POST /api/stripe/checkout` - Reject internal roles
- `POST /api/admin/users/assign-role` - Check permissions
- `POST /api/auth/signup` - Default to 'learner' only

## Migration Notes

### Existing Users

- No database migration needed (roles table already has `is_system` column)
- Internal roles should already be marked correctly in database
- If needed, run update query:

```sql
-- Mark internal roles in database
UPDATE roles
SET is_system = true
WHERE slug IN ('super_admin', 'compliance_officer', 'investigator', 'analyst');
```

### Test Accounts

Current test accounts include both internal and public roles:

- `investigator@abr-insights.com` - Keep for internal testing
- `analyst@abr-insights.com` - Keep for internal testing
- These should NOT appear in pricing/signup flows

## Configuration File Reference

See `lib/types/roles.ts` for the source of truth on role configuration.

All role-based logic should reference this file to ensure consistency.
