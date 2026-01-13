# Expected Schema After Migrations
Generated: 2026-01-12T21:17:49.911Z

## Tables

### enrollments
Source: 017_courses_enhancement_phase1.sql

| Column | Type | Source |
|--------|------|--------|
| CREATE | TABLE | 017_courses_enhancement_phase1.sql |
| id | UUID | 017_courses_enhancement_phase1.sql |
| user_id | UUID | 017_courses_enhancement_phase1.sql |
| course_id | UUID | 017_courses_enhancement_phase1.sql |
| learning_path_id | UUID | 017_courses_enhancement_phase1.sql |
| enrollment_date | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |
| enrollment_source | VARCHAR(50) | 017_courses_enhancement_phase1.sql |
| status | VARCHAR(50) | 017_courses_enhancement_phase1.sql |
| progress_percentage | INTEGER | 017_courses_enhancement_phase1.sql |
| completed_at | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |
| completion_certificate_issued | BOOLEAN | 017_courses_enhancement_phase1.sql |
| certificate_issued_at | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |
| certificate_id | VARCHAR(100) | 017_courses_enhancement_phase1.sql |
| last_accessed_at | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |
| total_time_spent_minutes | INTEGER | 017_courses_enhancement_phase1.sql |
| average_quiz_score | DECIMAL(5,2) | 017_courses_enhancement_phase1.sql |
| quizzes_passed | INTEGER | 017_courses_enhancement_phase1.sql |
| quizzes_failed | INTEGER | 017_courses_enhancement_phase1.sql |
| access_expires_at | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |
| is_access_granted | BOOLEAN | 017_courses_enhancement_phase1.sql |
| enrollment_metadata | JSONB | 017_courses_enhancement_phase1.sql |
| created_at | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |
| updated_at | TIMESTAMPTZ | 017_courses_enhancement_phase1.sql |

