# API Documentation

This document provides a comprehensive overview of the API endpoints, Supabase queries, RPC functions, real-time subscriptions, and Azure Function endpoints for the ABR Insights platform. It includes request/response schemas, authentication requirements, and integration notes for both frontend and backend consumers.

---

## Table of Contents

1. Supabase REST & GraphQL Endpoints
2. Supabase RPC Functions
3. Real-Time Subscriptions
4. Azure Function Endpoints
5. Authentication & Security
6. Error Handling & Response Format
7. Example API Flows

---

## 1. Supabase REST & GraphQL Endpoints

### Users

- `GET /rest/v1/users`: List users
- `POST /rest/v1/users`: Create user
- `PATCH /rest/v1/users?id=eq.{id}`: Update user
- `DELETE /rest/v1/users?id=eq.{id}`: Delete user

#### Request Example

```http
GET /rest/v1/users?select=id,email,role,created_at
Authorization: Bearer <JWT>
```

#### Response Example

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin",
    "created_at": "2025-11-05T12:00:00Z"
  }
]
```

### Courses

- `GET /rest/v1/courses`: List courses
- `POST /rest/v1/courses`: Create course
- `PATCH /rest/v1/courses?id=eq.{id}`: Update course
- `DELETE /rest/v1/courses?id=eq.{id}`: Delete course

### Progress

- `GET /rest/v1/progress?user_id=eq.{user_id}`: Get user progress
- `POST /rest/v1/progress`: Create progress record

### Achievements

- `GET /rest/v1/achievements?user_id=eq.{user_id}`: List user achievements

### Payments & Subscriptions

- `GET /rest/v1/payments?user_id=eq.{user_id}`: List payments
- `GET /rest/v1/subscriptions?user_id=eq.{user_id}`: List subscriptions

---

## 2. Supabase RPC Functions

### `get_user_dashboard(user_id uuid)`

- Returns dashboard data for a user.
- Request: `POST /rest/v1/rpc/get_user_dashboard`
- Body: `{ "user_id": "uuid" }`

### `enroll_in_course(user_id uuid, course_id uuid)`

- Enrolls a user in a course.
- Request: `POST /rest/v1/rpc/enroll_in_course`
- Body: `{ "user_id": "uuid", "course_id": "uuid" }`

### `award_achievement(user_id uuid, achievement_id uuid)`

- Awards an achievement to a user.
- Request: `POST /rest/v1/rpc/award_achievement`
- Body: `{ "user_id": "uuid", "achievement_id": "uuid" }`

---

## 3. Real-Time Subscriptions

### Table Changes

- `users`: Listen for user creation/update/delete
- `progress`: Listen for progress updates
- `achievements`: Listen for new achievements

#### Example (Supabase JS)

```js
supabase
  .channel('public:progress')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'progress' }, (payload) => {
    // Handle progress update
  })
  .subscribe()
```

---

## 4. Azure Function Endpoints

### Ingestion Processor

- `POST /api/ingestion-processor`
- Body: `{ "source": "string", "payload": { ... } }`
- Response: `{ "status": "success", "details": { ... } }`

### AI Classification

- `POST /api/ai-classification`
- Body: `{ "input": "string" }`
- Response: `{ "classification": "string", "confidence": 0.98 }`

### Stripe Webhooks

- `POST /api/stripe-webhooks`
- Body: Stripe event payload
- Response: `{ "received": true }`

### Tribunal Ingestion Cron

- `POST /api/tribunal-ingestion-cron`
- Body: `{ "run": true }`
- Response: `{ "status": "started" }`

### Analytics Aggregation

- `POST /api/analytics-aggregation`
- Body: `{ "date_range": "2025-11" }`
- Response: `{ "aggregated": true, "results": { ... } }`

### Email Notifications

- `POST /api/email-notifications`
- Body: `{ "to": "user@example.com", "template": "welcome", "params": { ... } }`
- Response: `{ "sent": true }`

### Report Generation

- `POST /api/report-generation`
- Body: `{ "user_id": "uuid", "report_type": "progress" }`
- Response: `{ "url": "https://.../report.pdf" }`

---

## 5. Authentication & Security

- All Supabase endpoints require JWT Bearer token (user or service role).
- Azure Functions require API key or JWT (via Authorization header).
- Stripe webhooks require signature verification.
- RLS policies enforced for all user data.

---

## 6. Error Handling & Response Format

- All endpoints return JSON.
- Standard error format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "string"
  }
}
```

---

## 7. Example API Flows

### User Enrollment

1. `POST /rest/v1/users` → create user
2. `POST /rest/v1/rpc/enroll_in_course` → enroll user
3. `GET /rest/v1/progress?user_id=eq.{user_id}` → fetch progress

### Stripe Payment

1. `POST /api/stripe-webhooks` → receive event
2. `GET /rest/v1/payments?user_id=eq.{user_id}` → list payments
3. `GET /rest/v1/subscriptions?user_id=eq.{user_id}` → list subscriptions

---

## Notes

- See [DATABASE_SCHEMA.md](../architecture/DATABASE_SCHEMA.md) for table definitions.
- See [AZURE_FUNCTIONS.md](./AZURE_FUNCTIONS.md) for function specs.

- All endpoints are versioned and subject to change; use OpenAPI spec for integration.
