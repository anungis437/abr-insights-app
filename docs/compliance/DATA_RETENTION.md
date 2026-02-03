# Data Retention Policy

**Document Version**: 1.0  
**Last Updated**: February 3, 2026  
**Status**: Production Ready  
**Compliance**: GDPR, CCPA, PIPEDA

## Executive Summary

This document outlines ABR Insights App's data retention policies, deletion procedures, and compliance with privacy regulations (GDPR, CCPA, PIPEDA). All data retention practices align with legal requirements and business necessity.

**Key Principles**:

- **Data Minimization**: Collect only necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Storage Limitation**: Retain data only as long as needed
- **User Rights**: Support deletion, export, rectification

## Regulatory Requirements

### GDPR (General Data Protection Regulation)

**Applicability**: EU/EEA residents

**Key Rights**:

- **Right to Access** (Article 15): User can request all data we hold
- **Right to Rectification** (Article 16): User can correct inaccurate data
- **Right to Erasure** (Article 17): User can request deletion ("right to be forgotten")
- **Right to Data Portability** (Article 20): User can export data in machine-readable format
- **Right to Restrict Processing** (Article 18): User can limit how we use their data

**Retention Limits**:

- Personal data: No specific limit, but must be "no longer than necessary"
- Our policy: User data retained while account active + 30 days after deletion request

### CCPA (California Consumer Privacy Act)

**Applicability**: California residents

**Key Rights**:

- **Right to Know**: What data we collect, use, share
- **Right to Delete**: Request deletion of personal information
- **Right to Opt-Out**: Opt-out of data sales (we don't sell data)

**Retention Limits**:

- No specific retention period required
- Our policy: Align with GDPR (strictest standard)

### PIPEDA (Personal Information Protection and Electronic Documents Act)

**Applicability**: Canadian residents

**Key Requirements**:

- Consent for data collection and use
- Data retention "only as long as necessary"
- Secure destruction of personal information

**Retention Limits**:

- Our policy: Align with GDPR

## Data Categories & Retention

### 1. User Account Data

**Data Included**:

- Name, email address
- Password hash (bcrypt)
- Profile information (bio, avatar)
- Role assignments (student, instructor, admin)
- Organization membership

**Retention Period**:

- **Active Account**: Indefinite (while account active)
- **After Deletion Request**: 30 days (soft delete), then permanent deletion
- **After Anonymization**: Name → "Deleted User {UUID}", email deleted

**Legal Basis** (GDPR):

- **Contract Performance**: Account needed to provide services
- **Legitimate Interest**: Business operations, support

**Deletion Triggers**:

- User-initiated deletion (`/api/user/delete-account`)
- Organization offboarding (cascade delete)
- Inactive for 3 years (email warning sent at 2.5 years)

### 2. Course Enrollment & Progress

**Data Included**:

- Course enrollments
- Lesson completion status
- Quiz submissions and scores
- Certificates earned
- Study time tracking

**Retention Period**:

- **Active Account**: Indefinite
- **After Deletion**: 30 days (soft delete), then permanent deletion
- **After Account Deletion**: Anonymized (student_id → NULL, name → "Deleted User")

**Legal Basis**:

- **Contract Performance**: Needed to track progress and issue certificates
- **Legitimate Interest**: Educational records

**Deletion Triggers**:

- User-initiated account deletion
- Course enrollment withdrawal (soft delete, restored if re-enrolled within 30 days)

### 3. Payment & Billing Data

**Data Included**:

- Stripe customer ID
- Subscription plan (Basic, Pro, Team, Enterprise)
- Payment history (invoice IDs, amounts, dates)
- Billing address (stored in Stripe, not our DB)

**Retention Period**:

- **Active Subscription**: Indefinite
- **After Subscription Cancellation**: 7 years (tax/accounting compliance)
- **After Account Deletion**: 7 years (financial records)

**Legal Basis**:

- **Legal Obligation**: Tax laws require 7-year retention
- **Contract Performance**: Billing for services

**Special Handling**:

- **Credit card numbers**: Never stored (Stripe handles)
- **Invoices**: Retained for 7 years (PDF export)
- **Refund records**: Retained for 7 years

**Deletion Triggers**:

- After 7 years: Automatic deletion (scheduled job)
- User can request export before deletion

### 4. Audit Logs

**Data Included**:

- User actions (login, course enrollment, quiz submission)
- Admin actions (role assignment, org settings changes)
- API requests (endpoint, method, status, duration)
- Security events (failed logins, CSP violations, rate limit exceeded)

**Retention Period**:

- **Operational Logs**: 90 days
- **Security Logs**: 1 year (fraud investigation, compliance)
- **Financial Logs**: 7 years (linked to billing records)

**Legal Basis**:

- **Legitimate Interest**: Security, fraud prevention, debugging
- **Legal Obligation**: Compliance investigations

**Deletion Triggers**:

- Automatic deletion after retention period (scheduled job)
- User account deletion does NOT delete audit logs (anonymized instead)

**Anonymization**:

- User ID → `deleted_user_{uuid}`
- Email → `deleted_{timestamp}@example.com`
- Name → "Deleted User"

### 5. AI Chat History

**Data Included**:

- User messages to AI assistant
- AI assistant responses
- Session metadata (start time, duration, message count)
- Quota usage (messages per day/month)

**Retention Period**:

- **Active Session**: 7 days (Redis cache)
- **After Session End**: 30 days (database archive)
- **After 30 Days**: Permanent deletion (no business need)

**Legal Basis**:

- **Legitimate Interest**: Improve AI quality, quota enforcement
- **Consent**: User consents to AI feature usage

**Deletion Triggers**:

- Automatic deletion after 30 days
- User-initiated deletion (delete chat history button)
- Account deletion (immediate deletion)

**Special Handling**:

- **PII in Messages**: AI trained to not request PII, but if provided by user, retained for 30 days max
- **OpenAI Storage**: OpenAI stores prompts for 30 days (their policy), then deletes

### 6. CanLII Case Metadata

**Data Included**:

- Case ID, jurisdiction, court
- Decision date, title, citation
- URL, judges, keywords
- **NOT INCLUDED**: Case text/content (compliance with CanLII terms)

**Retention Period**:

- **Indefinite**: Case metadata is public information (no PII)
- **Exception**: If CanLII requests deletion, comply within 48 hours

**Legal Basis**:

- **Legitimate Interest**: Educational content, legal research

**Deletion Triggers**:

- CanLII terms violation notice (immediate deletion)
- Case metadata outdated (manual review, quarterly)

### 7. Support Tickets

**Data Included**:

- User messages (email, in-app support)
- Support agent responses
- Ticket status, priority, tags
- Attachments (screenshots, error logs)

**Retention Period**:

- **Open Tickets**: Indefinite (until resolved)
- **Closed Tickets**: 2 years (customer service reference)
- **After Account Deletion**: 2 years (anonymized)

**Legal Basis**:

- **Legitimate Interest**: Customer support, quality improvement

**Deletion Triggers**:

- Automatic deletion after 2 years (scheduled job)
- User can request deletion (anonymized, not deleted)

## Data Deletion Procedures

### User-Initiated Account Deletion

**Implementation**: PR-06 (Data Lifecycle Management)

**Trigger**: User clicks "Delete Account" in profile settings

**Process** (`/api/user/delete-account`):

1. **Pre-Deletion Export** (5-10 seconds):
   - Generate ZIP archive: user data, enrollments, quiz submissions, certificates
   - Email download link (valid for 7 days)
   - User must download before deletion completes

2. **Soft Delete** (immediate):
   - Set `deleted_at` timestamp
   - Mark profile as `deleted=true`
   - Anonymize: Name → "Deleted User {UUID}"
   - Revoke all sessions (force logout)
   - Cancel Stripe subscription (if active)

3. **Cascade Deletion** (immediate):
   - Enrollments: Soft delete (mark as deleted)
   - Quiz submissions: Anonymize (student_id → NULL)
   - Certificates: Revoke (mark as invalid)
   - AI chat history: Permanent delete
   - Profile settings: Delete

4. **Grace Period** (30 days):
   - Data marked as deleted but not purged
   - User can request restoration (email support)
   - After 30 days: Permanent deletion (no recovery)

5. **Permanent Deletion** (after 30 days):
   - Profile: DELETE FROM profiles WHERE deleted_at < NOW() - INTERVAL '30 days'
   - Enrollments: DELETE FROM enrollments WHERE deleted_at < NOW() - INTERVAL '30 days'
   - Data export ZIP: Delete from storage

6. **Audit Log** (retained 1 year):
   - Event: `user.account_deleted`
   - User ID: `deleted_user_{uuid}`
   - Timestamp: `2026-02-03T10:30:45Z`
   - Trigger: `user_initiated`

**User Communication**:

- Immediate: "Account deletion in progress. Download your data: [LINK]"
- 7 days: "Reminder: Your data will be permanently deleted in 23 days"
- 30 days: "Your account has been permanently deleted"

### Organization Offboarding

**Implementation**: PR-06 (Data Lifecycle Management)

**Trigger**: Org admin clicks "Offboard Organization" or Stripe subscription ends

**Process** (`/api/org/offboard`):

1. **Pre-Offboard Export** (30-60 seconds):
   - Generate ZIP archive: All org data (users, courses, enrollments, billing)
   - Email org admin (valid for 30 days)
   - Must download before permanent deletion

2. **Grace Period** (30 days):
   - Organization marked as `offboarded=true`
   - Users can log in (read-only mode)
   - No new enrollments, quiz submissions
   - Stripe subscription canceled

3. **User Notification** (immediate):
   - Email all org users: "Your organization subscription has ended"
   - Option to export individual data
   - Option to join another organization

4. **Permanent Deletion** (after 30 days):
   - All org users: Cascade delete (same as user-initiated)
   - Courses: Soft delete (if org-specific), archived (if public)
   - Billing records: Retained 7 years (anonymized)
   - Organization record: Delete

5. **Audit Log** (retained 1 year):
   - Event: `organization.offboarded`
   - Org ID: `org_{uuid}`
   - User count: 50
   - Trigger: `admin_initiated` or `subscription_ended`

### Automated Deletion Jobs

**Scheduled Jobs** (via cron or Azure Functions):

#### 1. Purge Soft-Deleted Users (Daily at 2 AM UTC)

```sql
DELETE FROM profiles
WHERE deleted = true
  AND deleted_at < NOW() - INTERVAL '30 days';
```

#### 2. Purge Old Audit Logs (Weekly, Sunday 3 AM UTC)

```sql
DELETE FROM audit_log
WHERE created_at < NOW() - INTERVAL '90 days'
  AND event_type NOT IN ('billing', 'security');
```

#### 3. Purge Old AI Chat History (Daily at 4 AM UTC)

```sql
DELETE FROM ai_chat_sessions
WHERE ended_at < NOW() - INTERVAL '30 days';
```

#### 4. Purge Old Support Tickets (Monthly, 1st at 5 AM UTC)

```sql
DELETE FROM support_tickets
WHERE status = 'closed'
  AND closed_at < NOW() - INTERVAL '2 years';
```

#### 5. Purge Old Billing Records (Yearly, Jan 1 at 6 AM UTC)

```sql
DELETE FROM billing_transactions
WHERE created_at < NOW() - INTERVAL '7 years';
```

**Monitoring**:

- Job execution logged (start time, end time, rows deleted)
- Alerts on job failure (PagerDuty)
- Monthly report: Deletion statistics (users, logs, tickets)

## Data Export Procedures

### User Data Export (GDPR Right to Portability)

**Implementation**: PR-06

**Trigger**: User clicks "Export My Data" in profile settings

**Process** (`/api/user/export-data`):

1. **Generate Export** (5-10 seconds):
   - Format: ZIP archive
   - Contents:
     - `profile.json`: Name, email, role, created_at
     - `enrollments.json`: Course IDs, enrollment dates, completion status
     - `quiz_submissions.json`: Quiz IDs, scores, timestamps
     - `certificates.json`: Certificate IDs, issue dates, PDF links
     - `ai_chat_history.json`: All chat messages (last 30 days)
     - `audit_log.json`: User actions (last 90 days)

2. **Upload to Storage** (Azure Blob Storage):
   - File name: `user_export_{user_id}_{timestamp}.zip`
   - Expiration: 7 days (auto-delete)
   - Access: Signed URL (single-use, expires in 1 hour)

3. **Notify User** (email):
   - Subject: "Your data export is ready"
   - Body: "Download your data: [LINK] (expires in 7 days)"

**Rate Limiting**:

- Max 1 export per user per day (prevent abuse)
- Max 100 MB per export (split if larger)

**Audit Log**:

- Event: `user.data_exported`
- User ID: `user_xyz789`
- File size: 2.5 MB
- Download count: 1

### Organization Data Export

**Trigger**: Org admin clicks "Export Organization Data"

**Process** (`/api/org/export-data`):

1. **Generate Export** (30-60 seconds):
   - Format: ZIP archive
   - Contents:
     - `organization.json`: Org name, plan, created_at
     - `users.json`: All org users (name, email, role)
     - `courses.json`: All org courses (if org-specific)
     - `enrollments.json`: All enrollments
     - `billing.json`: All invoices, transactions

2. **Upload & Notify** (same as user export)

**Access Control**:

- Only org admins can export
- Requires 2FA confirmation (if enabled)

## Data Breach Procedures

### Breach Detection

**Indicators**:

- Unauthorized database access (audit log)
- Mass data export (>1000 records in 1 hour)
- CSP violations (data exfiltration attempt)
- Failed RLS checks (cross-tenant access attempt)

**Response**: See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)

### Breach Notification

**GDPR Requirements** (72 hours):

1. Notify privacy regulator (Office of the Privacy Commissioner of Canada)
2. Notify affected users (if high risk)
3. Document breach (nature, consequences, remedial action)

**CCPA Requirements**:

1. Notify California Attorney General (if >500 CA residents)
2. Notify affected users

**Notification Template**: See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)

## User Rights Management

### Request Handling

**Channels**:

- Self-service: Profile settings (`/profile/privacy`)
- Email: privacy@abr-insights.com
- Phone: +1-XXX-XXX-XXXX (business hours)

**Response Time**:

- **GDPR**: 30 days (can extend to 60 days if complex)
- **CCPA**: 45 days (can extend to 90 days if necessary)
- **Our SLA**: 7 business days (target)

### Request Types

#### 1. Access Request (GDPR Article 15)

**What**: User wants to know what data we hold

**Response**:

- Generate data export (see above)
- Include: Data categories, processing purposes, retention periods
- Format: JSON + PDF summary

#### 2. Rectification Request (GDPR Article 16)

**What**: User wants to correct inaccurate data

**Response**:

- User can self-update: Name, email, bio (in profile settings)
- For corrections requiring admin: Email support with details
- Update within 7 days, notify user

#### 3. Erasure Request (GDPR Article 17)

**What**: User wants to delete their data

**Response**:

- User can self-delete: "Delete Account" button
- Confirm identity (email verification code)
- Execute deletion procedure (see above)

#### 4. Portability Request (GDPR Article 20)

**What**: User wants to export data to another service

**Response**:

- Generate data export (machine-readable JSON)
- Include: All user-provided data (profile, enrollments, submissions)
- Exclude: Derived data (certificates, quiz scores generated by us)

#### 5. Restriction Request (GDPR Article 18)

**What**: User wants to limit how we process their data

**Response**:

- Mark account as `processing_restricted=true`
- Stop: AI features, email notifications, data analytics
- Continue: Essential processing (billing, legal compliance)

#### 6. Objection Request (GDPR Article 21)

**What**: User objects to data processing (e.g., marketing)

**Response**:

- Stop processing for that purpose
- User can opt-out: Marketing emails (unsubscribe link)
- Essential processing continues (contract performance)

## Data Retention Schedule (Summary)

| Data Category                | Retention Period | Deletion Trigger    | Legal Basis         |
| ---------------------------- | ---------------- | ------------------- | ------------------- |
| **User Accounts**            | Active + 30 days | User/org deletion   | Contract            |
| **Course Progress**          | Active + 30 days | User/org deletion   | Contract            |
| **Billing Records**          | 7 years          | Automatic           | Legal obligation    |
| **Audit Logs (Operational)** | 90 days          | Automatic           | Legitimate interest |
| **Audit Logs (Security)**    | 1 year           | Automatic           | Legitimate interest |
| **Audit Logs (Financial)**   | 7 years          | Automatic           | Legal obligation    |
| **AI Chat History**          | 30 days          | Automatic           | Legitimate interest |
| **CanLII Metadata**          | Indefinite       | Manual (on request) | Legitimate interest |
| **Support Tickets**          | 2 years          | Automatic           | Legitimate interest |
| **Data Exports**             | 7 days           | Automatic           | User request        |

## Compliance Verification

### Annual Review

**Process**:

1. Review retention periods (align with legal changes)
2. Audit deletion jobs (verify execution, row counts)
3. Test data export (completeness, format)
4. Test data deletion (cascade, anonymization)
5. Update documentation (if policies changed)

**Responsible**: Privacy Officer + Engineering Lead

### Audit Trail

**Records Maintained**:

- Data exports: User ID, timestamp, file size, download count
- Data deletions: User ID, timestamp, deletion type (soft/hard)
- User requests: Request type, timestamp, response time, resolution
- Scheduled jobs: Job name, execution time, rows affected

**Retention**: 7 years (compliance)

## Training & Awareness

**Target Audience**: All employees

**Topics**:

- GDPR, CCPA, PIPEDA requirements
- Data minimization principles
- User rights (access, deletion, portability)
- Secure data handling (encryption, access control)
- Incident response (breach notification)

**Frequency**: Annually + onboarding for new hires

## Related Documents

- [SECURITY_OVERVIEW.md](./SECURITY_OVERVIEW.md): Security architecture
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md): Breach procedures
- [ACCESS_CONTROL_RBAC.md](./ACCESS_CONTROL_RBAC.md): Access controls

---

**Document History**:

- v1.0 (2026-02-03): Initial version (PR-08 compliance pack)
