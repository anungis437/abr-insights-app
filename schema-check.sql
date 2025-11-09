SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 4qaLaUaWE51whYc0FqFZ6qt6zOLtGZF2URbKl4RT0yA5VeaqtYHgcb323qLeS83

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: achievement_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "name", "slug", "domain", "logo_url", "subscription_tier", "subscription_status", "subscription_start_date", "subscription_end_date", "trial_ends_at", "stripe_customer_id", "stripe_subscription_id", "billing_email", "seat_limit", "storage_limit_gb", "settings", "metadata", "created_at", "updated_at", "deleted_at") VALUES
	('80ea09fa-bdba-475c-ab20-f59838307961', 'Demo Organization', 'demo-org', NULL, NULL, 'free', 'active', NULL, NULL, NULL, NULL, NULL, NULL, 5, 10, '{}', '{}', '2025-11-08 22:09:32.028897+00', '2025-11-08 22:09:32.028897+00', NULL);


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "organization_id", "email", "first_name", "last_name", "display_name", "avatar_url", "job_title", "department", "employee_id", "language", "timezone", "notification_preferences", "status", "email_verified", "onboarding_completed", "onboarding_step", "last_login_at", "last_activity_at", "metadata", "created_at", "updated_at", "deleted_at", "role") VALUES
	('6c626a90-5d3d-4513-a277-d4e4ba339160', NULL, 'guest@abr-insights.com', 'Guest', 'User', 'Guest User', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:53.825+00', '2025-11-08 23:22:53.825+00', NULL, 'guest'),
	('2ad107ca-8938-4e8b-a03a-4bf31e72f63f', NULL, 'viewer@abr-insights.com', 'Read', 'Only Viewer', 'Read Only Viewer', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:54.368+00', '2025-11-08 23:22:54.368+00', NULL, 'viewer'),
	('0ec73cc5-ea29-440d-9634-c0be1cc4abd8', NULL, 'learner@abr-insights.com', 'Student', 'Learner', 'Student Learner', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:54.529+00', '2025-11-08 23:22:54.529+00', NULL, 'learner'),
	('2625639a-b3c2-4957-82cd-d7c9e16e3e1a', NULL, 'educator@abr-insights.com', 'Course', 'Educator', 'Course Educator', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:54.885+00', '2025-11-08 23:22:54.885+00', NULL, 'educator'),
	('32bb9bc1-37a1-45d1-bdc1-639a3b95923d', NULL, 'investigator@abr-insights.com', 'Case', 'Investigator', 'Case Investigator', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:55.255+00', '2025-11-08 23:22:55.255+00', NULL, 'investigator'),
	('efe0211d-67aa-42f2-ad98-6736f0f77c1a', NULL, 'analyst@abr-insights.com', 'Data', 'Analyst', 'Data Analyst', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:55.493+00', '2025-11-08 23:22:55.493+00', NULL, 'analyst'),
	('c4502e6b-a6b9-4762-aefe-dfba8b878626', NULL, 'orgadmin@abr-insights.com', 'Organization', 'Admin', 'Organization Admin', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:55.857+00', '2025-11-08 23:22:55.857+00', NULL, 'org_admin'),
	('056e996f-e2c0-405b-8683-462a832c8e45', NULL, 'compliance@abr-insights.com', 'Compliance', 'Officer', 'Compliance Officer', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, NULL, NULL, '{}', '2025-11-08 23:22:56.207+00', '2025-11-08 23:22:56.207+00', NULL, 'compliance_officer'),
	('7556a1e3-34d2-4425-b597-137f34998059', NULL, 'super_admin@abr-insights.com', 'Super', 'Admin', 'Super Admin', NULL, NULL, NULL, NULL, 'en', 'America/Toronto', '{"push": true, "email": true, "in_app": true}', 'active', true, false, 0, '2025-11-09 13:49:01.877+00', '2025-11-09 13:49:01.877+00', '{}', '2025-11-08 23:22:56.34+00', '2025-11-09 13:49:02.384065+00', NULL, 'super_admin');


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."achievements" ("id", "name", "slug", "description", "icon_url", "badge_image_url", "type", "category", "criteria", "points_value", "rarity", "is_secret", "is_active", "earned_count", "created_at", "updated_at", "category_id", "tier", "tier_level", "requirement_type", "requirement_config", "points_awarded", "unlocks_content", "unlocked_content_ids", "badge_svg", "badge_color", "open_badge_enabled", "open_badge_issuer", "open_badge_criteria", "open_badge_tags", "is_hidden", "available_from", "available_until", "times_awarded", "created_by") VALUES
	('72eb24af-2dba-474d-a63f-141a8639a78d', 'Knowledge Builder', 'knowledge-builder', 'Complete 5 courses', '/badges/knowledge-builder.svg', NULL, 'milestone', NULL, '{}', 50, 'uncommon', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('3a3369c0-a40a-4275-b6be-cfcb93b92dc5', 'Expert Learner', 'expert-learner', 'Complete 10 courses', '/badges/expert-learner.svg', NULL, 'milestone', NULL, '{}', 100, 'rare', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('a9604eb5-58da-44f0-a36d-82def9ce1c82', 'Master Scholar', 'master-scholar', 'Complete 25 courses', '/badges/master-scholar.svg', NULL, 'milestone', NULL, '{}', 250, 'epic', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('7c59db6d-8930-46f4-8cff-a4981f079a5a', 'Consistent Learner', 'consistent-learner', 'Maintain a 7-day learning streak', '/badges/consistent-learner.svg', NULL, 'streak', NULL, '{}', 30, 'uncommon', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('47c89ad9-3011-4735-9822-00237e2e9f07', 'Dedicated Student', 'dedicated-student', 'Maintain a 30-day learning streak', '/badges/dedicated-student.svg', NULL, 'streak', NULL, '{}', 100, 'rare', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('0260234a-eb3b-4944-8314-275400cd6d52', 'Unstoppable', 'unstoppable', 'Maintain a 100-day learning streak', '/badges/unstoppable.svg', NULL, 'streak', NULL, '{}', 500, 'legendary', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('d0d03bfc-758c-47dc-82b9-01856a36f9db', 'Quick Learner', 'quick-learner', 'Complete a course in under 2 hours', '/badges/quick-learner.svg', NULL, 'special', NULL, '{}', 20, 'uncommon', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('1378345e-2a5a-4d83-b488-934f4b35684e', 'Perfect Score', 'perfect-score', 'Score 100% on a quiz', '/badges/perfect-score.svg', NULL, 'special', NULL, '{}', 50, 'rare', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('20e56d68-86d1-4fe5-9bd9-8e2ab550ede2', 'Case Explorer', 'case-explorer', 'Review 50 tribunal cases', '/badges/case-explorer.svg', NULL, 'milestone', NULL, '{}', 40, 'uncommon', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('db0ed8aa-ea49-4f7f-9b03-a10e36488c40', 'Community Contributor', 'community-contributor', 'Submit 10 course reviews', '/badges/community-contributor.svg', NULL, 'special', NULL, '{}', 60, 'rare', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('ce045d7c-ad49-43de-ae9e-9b5f61e5101c', 'Team Leader', 'team-leader', 'Assigned as course instructor', '/badges/team-leader.svg', NULL, 'special', NULL, '{}', 150, 'epic', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('17868607-2ef3-49ad-91ae-3883a0b00891', 'Mentor', 'mentor', 'Help 10 learners complete courses', '/badges/mentor.svg', NULL, 'special', NULL, '{}', 80, 'rare', false, true, 0, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 0, NULL),
	('1df94688-3198-4f13-8d43-62797be6d661', 'First Steps', 'first-steps', 'Complete your first course', '/badges/first-steps.svg', NULL, 'course_completion', NULL, '{}', 10, 'common', false, true, 3, '2025-11-08 21:12:15.601014+00', '2025-11-08 22:09:32.028897+00', NULL, 'bronze', 1, NULL, NULL, 0, false, NULL, NULL, NULL, false, NULL, NULL, NULL, false, NULL, NULL, 3, NULL);


--
-- Data for Name: achievement_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_log_exports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: audit_logs_archive; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: automated_training_config; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: bookmarks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tribunal_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: case_embeddings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: case_outcomes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: certificate_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."certificate_templates" ("id", "name", "description", "template_type", "layout_json", "styles_json", "background_image_url", "logo_url", "title_template", "body_template", "signature_fields", "is_default", "is_active", "requires_approval", "created_by", "created_at", "updated_at") VALUES
	('6227d797-a0c7-4baf-bc44-67933a498b6b', 'Default Completion Certificate', 'Standard course completion certificate template', 'completion', '{"size": "letter", "margins": {"top": 50, "left": 50, "right": 50, "bottom": 50}, "sections": [{"type": "header", "height": 100}, {"type": "title", "height": 80}, {"type": "body", "height": 200}, {"type": "signatures", "height": 100}, {"type": "footer", "height": 50}], "orientation": "landscape"}', '{"font": {"size": 14, "family": "Times New Roman"}, "border": {"color": "#805ad5", "style": "solid", "width": 2}, "colors": {"accent": "#805ad5", "primary": "#1a202c", "secondary": "#4a5568"}}', NULL, NULL, 'Certificate of Completion', 'This certifies that {{recipient_name}} has successfully completed the course "{{course_title}}" on {{completion_date}}.', '[{"line": true, "name": "Instructor", "title": "Course Instructor"}, {"line": true, "name": "Director", "title": "Program Director"}]', true, true, false, NULL, '2025-11-08 21:12:17.82257+00', '2025-11-08 21:12:17.82257+00');


--
-- Data for Name: content_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."content_categories" ("id", "name", "slug", "description", "icon", "parent_id", "sort_order", "created_at", "updated_at") VALUES
	('b1c14104-d765-4ab2-9805-fc6101a0a20b', 'Anti-Black Racism Fundamentals', 'abr-fundamentals', 'Foundational knowledge about systemic racism', 'book-open', NULL, 1, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('3999b8da-62be-4b8c-9ac9-d3892a17f6e4', 'Legal Framework', 'legal-framework', 'Human rights legislation and case law', 'scale', NULL, 2, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('2e03ee41-2611-4a3c-b7ec-ad118d4b626d', 'Workplace Equity', 'workplace-equity', 'Creating equitable workplaces', 'briefcase', NULL, 3, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('7e011aeb-196a-4aff-92e5-03a75d73348a', 'Data & Reporting', 'data-reporting', 'Measuring and reporting on equity', 'chart-bar', NULL, 4, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('05ed0d97-2588-4c0e-8841-a39ecdbeb543', 'Allyship & Advocacy', 'allyship-advocacy', 'Being an effective ally', 'users', NULL, 5, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('9f234a32-4716-45b2-97db-bcaefec5be33', 'Leadership & Change Management', 'leadership', 'Leading equity initiatives', 'trending-up', NULL, 6, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('747bd626-d472-439d-9f59-07154b81148b', 'Sector-Specific Practice', 'sector-specific', 'Deep dives into sector-specific challenges: legal, tech, finance, nonprofit, media, policy', NULL, NULL, 7, '2025-11-09 12:46:23.574235+00', '2025-11-09 12:46:23.574235+00'),
	('ef4d6ddd-8068-4137-9fde-d4599ae2e80e', 'Advanced Topics', 'advanced-topics', 'Complex intersections: mental health, decolonization, intersectionality, organizational change', NULL, NULL, 8, '2025-11-09 12:46:23.910498+00', '2025-11-09 12:46:23.910498+00');


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."courses" ("id", "title", "slug", "description", "thumbnail_url", "cover_image_url", "learning_objectives", "prerequisites", "tags", "category_id", "instructor_id", "level", "estimated_duration_minutes", "is_published", "is_featured", "required_tier", "points_reward", "completion_badge_id", "meta_title", "meta_description", "enrollments_count", "completions_count", "average_rating", "total_reviews", "published_at", "created_at", "updated_at", "deleted_at", "workflow_status", "version_number", "reviewed_by", "reviewed_at", "published_by", "last_modified_by", "submission_notes", "rejection_reason") VALUES
	('47fb1e63-ebc4-4976-84a4-d678e0370017', 'Introduction to Anti-Black Racism', 'intro-to-abr', 'Understand the fundamentals of anti-Black racism in Canada, its historical context, and contemporary manifestations in workplaces and institutions.', NULL, NULL, '["Understand systemic racism", "Recognize microaggressions", "Apply anti-racist practices"]', '[]', '["fundamentals", "introduction", "workplace"]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'beginner', 120, true, false, 'free', 50, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:16:43.978474+00', NULL, 'published', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('21493075-7bbf-41cd-a938-0119007db4d2', 'Recognizing and Addressing Microaggressions', 'microaggressions-workplace', 'Learn to identify, address, and prevent microaggressions targeting Black employees in professional settings.', NULL, NULL, '["Identify common microaggressions", "Respond effectively", "Create inclusive culture"]', '[]', '["microaggressions", "workplace", "diversity"]', '2e03ee41-2611-4a3c-b7ec-ad118d4b626d', NULL, 'intermediate', 90, true, false, 'free', 40, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-08 22:09:32.028897+00', '2025-11-08 22:09:32.028897+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Canadian Human Rights Law Fundamentals', 'canadian-human-rights-law', 'Comprehensive overview of federal and provincial human rights legislation as it applies to anti-Black racism.', NULL, NULL, '["Understand human rights framework", "Analyze case law", "Apply legal principles"]', '[]', '["law", "human rights", "legislation"]', '3999b8da-62be-4b8c-9ac9-d3892a17f6e4', NULL, 'intermediate', 180, true, false, 'professional', 75, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-08 22:09:32.028897+00', '2025-11-08 22:09:32.028897+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Measuring and Reporting on Racial Equity', 'data-driven-equity', 'Use data analytics and reporting to track, measure, and improve racial equity outcomes in your organization.', NULL, NULL, '["Collect equity data ethically", "Analyze disparities", "Create actionable reports"]', '[]', '["data", "analytics", "reporting", "metrics"]', '7e011aeb-196a-4aff-92e5-03a75d73348a', NULL, 'advanced', 150, true, false, 'professional', 100, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-08 22:09:32.028897+00', '2025-11-08 22:09:32.028897+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('d894a5d2-03f4-41d2-82ca-49780b57f05c', 'Being an Effective Anti-Racist Ally', 'effective-allyship', 'Practical strategies for non-Black individuals to support Black colleagues and advocate for systemic change.', NULL, NULL, '["Practice active allyship", "Use privilege responsibly", "Support without centering"]', '[]', '["allyship", "advocacy", "support"]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'beginner', 100, true, false, 'free', 50, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-08 22:09:32.028897+00', '2025-11-08 22:09:32.028897+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('896de482-9231-4d59-8a5a-047b95926a1a', 'Leadership for Racial Equity', 'leadership-equity', 'Advanced course for executives and senior leaders on driving systemic equity transformation.', NULL, NULL, '["Develop equity strategy", "Lead organizational change", "Build accountability systems"]', '[]', '["leadership", "strategy", "transformation"]', '9f234a32-4716-45b2-97db-bcaefec5be33', NULL, 'advanced', 240, true, false, 'enterprise', 150, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-08 22:09:32.028897+00', '2025-11-08 22:09:32.028897+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('4648b980-da55-42c9-bce0-16de3e2366c3', 'Difficult Conversations About Race', 'difficult-conversations-race', 'Master frameworks and practical skills for navigating challenging racial conversations with confidence, empathy, and effectiveness in professional settings.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800', NULL, '["Apply proven conversation frameworks (LARA, REAL) to racial discussions", "Recognize and respond to defensiveness and resistance", "Practice active listening and empathetic communication", "Handle emotional reactions (yours and others) productively", "Create psychological safety for difficult conversations", "Debrief and recover after challenging exchanges"]', '["intro-to-abr"]', '[]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'intermediate', 180, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 11:46:28.138+00', '2025-11-09 11:46:28.139+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Black Canadian History: A Comprehensive Overview', 'black-canadian-history', 'Explore 400+ years of Black Canadian history from enslavement to present-day activism, uncovering stories often omitted from mainstream narratives.', 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?w=800', NULL, '["Trace Black presence in Canada from 1600s to present", "Understand key historical events and their lasting impacts", "Recognize contributions of Black Canadians across sectors", "Connect historical patterns to contemporary disparities", "Challenge myths of Canadian exceptionalism on race", "Locate regional variations in Black Canadian experiences"]', '[]', '[]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'beginner', 240, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 11:46:28.395+00', '2025-11-09 11:46:28.395+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('514051fa-5b31-40cc-b88f-ac4dde373eb1', 'HR Professionals: Advanced Anti-Racism Practices', 'hr-advanced-anti-racism', 'Advanced training for HR professionals on conducting investigations, implementing Employment Equity, managing accommodations, and building anti-racist talent systems.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', NULL, '["Conduct thorough and fair discrimination investigations", "Implement Employment Equity Act requirements", "Design bias-resistant hiring and promotion systems", "Handle complex accommodation scenarios", "Build equity metrics and accountability frameworks", "Partner with legal counsel on human rights matters"]', '["intro-to-abr", "canadian-human-rights-law"]', '[]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'advanced', 300, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 11:46:28.445+00', '2025-11-09 11:46:28.445+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Healthcare & Anti-Black Racism', 'healthcare-anti-black-racism', 'Essential training for healthcare professionals on recognizing and addressing anti-Black racism in diagnosis, treatment, pain management, and patient care.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', NULL, '["Recognize diagnostic and treatment biases affecting Black patients", "Understand disparities in maternal health outcomes", "Address racial bias in pain assessment and management", "Improve patient communication across racial differences", "Identify systemic barriers to healthcare access", "Implement anti-racist practices in clinical settings"]', '["intro-to-abr"]', '[]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'intermediate', 210, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 11:46:28.502+00', '2025-11-09 11:46:28.502+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('8171b79b-869b-45d7-8c5c-340507244da3', 'Intersectionality: Black Women in the Workplace', 'black-women-workplace', 'Examine the unique challenges facing Black women at the intersection of racism and sexism, and learn strategies for creating truly inclusive workplaces.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800', NULL, '["Understand intersectionality theory and its workplace applications", "Recognize double-bind and controlling images affecting Black women", "Address hair discrimination and appearance policing", "Support Black women''s leadership advancement", "Create spaces for Black women''s voices and experiences", "Implement targeted equity strategies for Black women"]', '["intro-to-abr"]', '[]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'intermediate', 180, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 11:46:28.546+00', '2025-11-09 11:46:28.546+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('d4df555c-60ec-4a39-8db6-98f595018473', 'Conducting Racial Equity Audits', 'racial-equity-audits', 'Learn systematic methodology for assessing organizational equity, collecting and analyzing data, and developing evidence-based action plans.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', NULL, '["Design comprehensive equity audit frameworks", "Collect demographic and qualitative data ethically", "Analyze disparities and identify root causes", "Engage stakeholders throughout the audit process", "Present findings with clarity and impact", "Develop actionable recommendations and implementation plans"]', '["data-driven-equity", "leadership-equity"]', '[]', 'b1c14104-d765-4ab2-9805-fc6101a0a20b', NULL, 'advanced', 270, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 11:46:28.6+00', '2025-11-09 11:46:28.6+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('89412866-31d7-46e9-80eb-b5579b9648b1', 'Allyship Without Tokenism', 'allyship-without-tokenism', 'Move beyond performative allyship to genuine anti-racist action. Learn to recognize tokenism, build authentic accountability relationships, and use privilege strategically without centering yourself.', NULL, NULL, '["Distinguish performative from genuine allyship", "Recognize and avoid tokenism in yourself and organizations", "Build authentic accountability relationships with Black colleagues", "Use privilege strategically without centering yourself", "Take risks and accept consequences for anti-racist action"]', '["being-an-effective-anti-racist-ally"]', '[]', '05ed0d97-2588-4c0e-8841-a39ecdbeb543', NULL, 'intermediate', 150, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:17:27.944095+00', '2025-11-09 12:47:21.550862+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Policing, Justice, and Community Safety', 'policing-justice-reform', 'Examine anti-Black racism in Canadian policing and criminal justice systems. Understand carding, police violence, over-incarceration, and explore alternatives that prioritize community safety and accountability.', NULL, NULL, '["Understand the history and impact of carding and street checks", "Examine data on police violence against Black Canadians", "Analyze over-incarceration and conditions in Canadian prisons", "Explore community-led alternatives to policing", "Learn accountability models that prioritize community safety"]', '["black-canadian-history"]', '[]', '05ed0d97-2588-4c0e-8841-a39ecdbeb543', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:17:28.039754+00', '2025-11-09 12:47:21.720548+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Anti-Racism for Educators', 'anti-racism-educators', 'Transform educational practices to disrupt anti-Black racism. Audit curriculum, implement equitable classroom practices, address discipline disparities, and engage families as partners in creating liberatory learning environments.', NULL, NULL, '["Conduct anti-racist curriculum audits and make changes", "Implement classroom practices that affirm Black students", "Address racial discipline disparities with restorative approaches", "Engage Black families as partners, not problems", "Create liberatory learning environments for all students"]', '["introduction-to-anti-black-racism"]', '[]', '3999b8da-62be-4b8c-9ac9-d3892a17f6e4', NULL, 'intermediate', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:17:27.992731+00', '2025-11-09 12:48:04.105172+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('bec54d11-cb40-43da-aace-1177501111af', 'Environmental Racism in Canada', 'environmental-racism', 'Understand how environmental racism disproportionately impacts Black and Indigenous communities through toxic exposure, climate impacts, and exclusion from decision-making. Learn organizing strategies for environmental justice.', NULL, NULL, '["Define environmental racism and understand its scope in Canada", "Examine case studies of Black communities facing environmental harms", "Understand health impacts of environmental racism", "Learn community organizing strategies for environmental justice", "Explore policy solutions and accountability mechanisms"]', '["introduction-to-anti-black-racism"]', '[]', '05ed0d97-2588-4c0e-8841-a39ecdbeb543', NULL, 'intermediate', 180, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:17:28.087588+00', '2025-11-09 12:48:04.158608+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('de3eee9b-630c-4aec-a014-0849353d411c', 'Recruitment and Retention Best Practices', 'recruitment-retention', 'Build genuine pipelines for Black talent through authentic outreach, inclusive interviewing, equitable onboarding, and retention strategies that address systemic barriers rather than blame individuals for leaving.', NULL, NULL, '["Develop authentic recruitment strategies beyond tokenism", "Implement inclusive interviewing and assessment practices", "Design equitable onboarding that sets Black employees up for success", "Address retention barriers through systemic change", "Create accountability for recruitment and retention outcomes"]', '["hr-advanced-anti-racism"]', '[]', '3999b8da-62be-4b8c-9ac9-d3892a17f6e4', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:17:28.130177+00', '2025-11-09 12:48:04.203478+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('6633d3bf-cfe7-4927-8336-03248c1068ce', 'Anti-Racism in Mental Health and Wellness', 'mental-health-wellness', 'Address anti-Black racism in mental health services, therapy, and wellness practices in Canada.', NULL, NULL, '["Understand impact of anti-Black racism on mental health outcomes", "Recognize bias in diagnosis, treatment, and care delivery", "Examine barriers to accessing culturally responsive mental health services", "Learn trauma-informed, culturally safe approaches", "Address anti-Blackness in wellness and therapy professions"]', '["introduction-to-anti-black-racism"]', '["phase-4", "advanced"]', 'ef4d6ddd-8068-4137-9fde-d4599ae2e80e', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:46:55.938342+00', '2025-11-09 12:46:55.938342+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('12337701-48ae-41b1-a2ae-3cf85339ec66', 'Decolonizing Anti-Racism Practice', 'decolonizing-practice', 'Understand connections between colonialism and anti-Black racism, centering Indigenous and Black solidarity.', NULL, NULL, '["Understand settler colonialism and anti-Black racism connections", "Learn from Indigenous and Black solidarity movements", "Examine white supremacy as colonial project", "Practice decolonial approaches to anti-racism work", "Address anti-Blackness in \"decolonization\" spaces"]', '["introduction-to-anti-black-racism", "indigenous-black-solidarity"]', '["phase-4", "advanced"]', 'ef4d6ddd-8068-4137-9fde-d4599ae2e80e', NULL, 'advanced', 210, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:46:56.042986+00', '2025-11-09 12:46:56.042986+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Intersectionality: Race, Gender, Class, and Disability', 'intersectionality-frameworks', 'Understand how anti-Black racism intersects with other forms of oppression.', NULL, NULL, '["Understand intersectionality theory and Black feminist origins", "Examine anti-Black misogynoir and violence against Black women", "Address ableism and racism in disability justice", "Understand class and anti-Black economic oppression", "Practice intersectional anti-racism approaches"]', '["introduction-to-anti-black-racism"]', '["phase-4", "advanced"]', 'ef4d6ddd-8068-4137-9fde-d4599ae2e80e', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:46:56.109033+00', '2025-11-09 12:46:56.109033+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('e7e447be-5171-4710-82c0-32c1979d5581', 'Dismantling White Supremacy Culture', 'white-supremacy-culture', 'Identify and dismantle white supremacy culture characteristics in organizations and systems.', NULL, NULL, '["Understand white supremacy culture framework", "Identify characteristics in organizations (perfectionism, urgency, individualism)", "Examine how white supremacy culture harms Black employees and communities", "Learn strategies to dismantle and build alternatives", "Address resistance and backlash to change"]', '["introduction-to-anti-black-racism", "creating-inclusive-workplaces"]', '["phase-4", "advanced"]', 'ef4d6ddd-8068-4137-9fde-d4599ae2e80e', NULL, 'advanced', 210, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:46:56.157704+00', '2025-11-09 12:46:56.157704+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Trauma-Informed Anti-Racist Care', 'trauma-informed-care', 'Integrate trauma-informed approaches with anti-racist practice in service delivery.', NULL, NULL, '["Understand racial trauma and its manifestations", "Learn trauma-informed principles in anti-racist context", "Address re-traumatization in systems and services", "Examine vicarious trauma for anti-racism practitioners", "Build healing-centered approaches to change"]', '["introduction-to-anti-black-racism"]', '["phase-4", "advanced"]', 'ef4d6ddd-8068-4137-9fde-d4599ae2e80e', NULL, 'intermediate', 180, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:46:56.212855+00', '2025-11-09 12:46:56.212855+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Technology, AI, and Algorithmic Justice', 'tech-ai-ethics', 'Explore anti-Black bias in technology, algorithms, and AI systems. Learn to identify, challenge, and prevent algorithmic discrimination.', NULL, NULL, '["Identify anti-Black bias in algorithms, AI, and technology systems", "Understand data bias, training data issues, and algorithmic discrimination", "Examine tech industry diversity and inclusion failures", "Implement ethical AI and tech development practices", "Advocate for algorithmic accountability and tech justice"]', '["introduction-to-anti-black-racism"]', '[]', '747bd626-d472-439d-9f59-07154b81148b', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:33:22.820835+00', '2025-11-09 12:47:22.008573+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('b691d971-42b1-4039-abc0-4df213fff8d1', 'Financial Services and Economic Justice', 'finance-economic-justice', 'Examine anti-Black racism in banking, lending, credit, and wealth-building. Learn to recognize and address financial discrimination.', NULL, NULL, '["Understand anti-Black discrimination in banking and financial services", "Recognize predatory lending and credit discrimination patterns", "Examine wealth gap causes and consequences", "Identify barriers to homeownership and asset building", "Advocate for financial justice and equitable economic policies"]', '["introduction-to-anti-black-racism"]', '[]', '747bd626-d472-439d-9f59-07154b81148b', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:33:22.880086+00', '2025-11-09 12:47:22.141379+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Nonprofit Leadership and Community Advocacy', 'nonprofit-advocacy', 'Navigate power dynamics in nonprofit work. Learn to center Black community leadership and build authentic partnerships.', NULL, NULL, '["Understand power dynamics in nonprofit and advocacy work", "Recognize white saviorism and paternalism in social sector", "Center Black community leadership and self-determination", "Build authentic partnerships based on shared power", "Address funding inequities and resource distribution"]', '["introduction-to-anti-black-racism", "being-an-effective-anti-racist-ally"]', '[]', '747bd626-d472-439d-9f59-07154b81148b', NULL, 'intermediate', 180, true, false, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:33:22.934272+00', '2025-11-09 12:47:22.273405+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('17767e69-30e3-4c0b-aa13-a8990502b002', 'Media Representation and Ethical Storytelling', 'media-storytelling', 'Examine anti-Black bias in media representation. Learn ethical practices for journalists, content creators, and communications professionals.', NULL, NULL, '["Recognize anti-Black bias in media coverage and representation", "Understand harmful stereotypes and deficit narratives", "Practice ethical storytelling that centers Black voices", "Address newsroom diversity and inclusion barriers", "Challenge media''s role in perpetuating anti-Black racism"]', '["introduction-to-anti-black-racism"]', '[]', '747bd626-d472-439d-9f59-07154b81148b', NULL, 'intermediate', 210, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:33:22.986376+00', '2025-11-09 12:47:22.424312+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Public Policy and Legislative Advocacy', 'public-policy-advocacy', 'Analyze public policy through an anti-racist lens. Learn to advocate for policies that advance racial equity and challenge systemic racism.', NULL, NULL, '["Analyze public policy for racial equity impacts", "Understand how policies perpetuate or challenge anti-Black racism", "Engage in evidence-based policy advocacy", "Navigate policy-making processes and power structures", "Build coalitions for policy change"]', '["introduction-to-anti-black-racism", "measuring-reporting-racial-equity"]', '[]', '747bd626-d472-439d-9f59-07154b81148b', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:33:23.053006+00', '2025-11-09 12:47:22.524375+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('48531317-4d90-4ad7-87f0-06fff0120925', 'Building Anti-Racist Organizations from the Ground Up', 'building-antiracist-organizations', 'Comprehensive framework for transforming organizations into genuinely anti-racist institutions.', NULL, NULL, '["Conduct organizational anti-racism audits", "Develop comprehensive anti-racism strategic plans", "Build accountability structures and metrics", "Transform hiring, retention, and advancement practices", "Sustain anti-racism work beyond initial commitments"]', '["introduction-to-anti-black-racism", "addressing-anti-black-racism-in-leadership", "measuring-reporting-racial-equity"]', '["phase-4", "advanced"]', 'ef4d6ddd-8068-4137-9fde-d4599ae2e80e', NULL, 'advanced', 270, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:46:56.283733+00', '2025-11-09 12:46:56.283733+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Indigenous and Black Solidarity', 'indigenous-black-solidarity', 'Explore shared histories, build authentic solidarity between Indigenous and Black communities, and learn coalition-building strategies that honor both distinct experiences and common struggles.', NULL, NULL, '["Understand shared histories of colonialism, slavery, and resistance", "Recognize both commonalities and distinct experiences of each community", "Avoid appropriation while building genuine solidarity", "Develop coalition-building strategies that center both communities", "Learn from successful solidarity movements in Canadian history"]', '["introduction-to-anti-black-racism"]', '[]', '05ed0d97-2588-4c0e-8841-a39ecdbeb543', NULL, 'intermediate', 180, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:17:27.843622+00', '2025-11-09 12:47:21.424636+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL),
	('d9156258-e223-4c2e-9313-99dfcaabfbed', 'Anti-Racism in Legal Practice and the Justice System', 'legal-practice-justice', 'Examine anti-Black racism in Canadian legal systems, from courtrooms to law schools. Learn strategies for equitable legal practice and access to justice.', NULL, NULL, '["Understand anti-Black racism in Canadian legal education and legal profession", "Recognize bias in judicial decision-making and sentencing", "Address barriers to legal representation and access to justice", "Implement anti-racist practices in legal work", "Advocate for systemic reform in justice systems"]', '["introduction-to-anti-black-racism", "policing-justice-reform"]', '[]', '747bd626-d472-439d-9f59-07154b81148b', NULL, 'advanced', 240, true, true, 'free', 0, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, '2025-11-09 12:33:22.663336+00', '2025-11-09 12:47:21.889899+00', NULL, 'draft', '1.0.0', NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: course_modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."course_modules" ("id", "course_id", "title", "slug", "description", "module_number", "sort_order", "estimated_duration_minutes", "is_published", "unlock_requirements", "learning_objectives", "resources", "published_at", "created_at", "updated_at") VALUES
	('3b42512a-4c2a-4531-8f46-48fc43aac8a5', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Understanding Anti-Black Racism: Foundations', 'understanding-anti-black-racism-foundations', 'Explore the historical context and fundamental concepts of anti-Black racism in Canada.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:21.329684+00', '2025-11-09 05:15:21.329684+00'),
	('0de9dcaa-6baf-46f4-a551-472ebb3028a8', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Contemporary Manifestations of Anti-Black Racism', 'contemporary-manifestations-of-anti-black-racism', 'Identify how anti-Black racism appears in modern Canadian society.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:21.605696+00', '2025-11-09 05:15:21.605696+00'),
	('3b168004-9cc9-46f0-85be-1863443b4787', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Personal Reflection and Taking Action', 'personal-reflection-and-taking-action', 'Examine your own biases and learn concrete steps to combat anti-Black racism.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:21.866111+00', '2025-11-09 05:15:21.866111+00'),
	('617e1e1f-046e-45a9-b48e-fd2b47a6f055', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Constitutional Framework and Charter Rights', 'constitutional-framework-and-charter-rights', 'Understanding the Canadian Charter of Rights and Freedoms and constitutional protections.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:29.589961+00', '2025-11-09 05:15:29.589961+00'),
	('9de03b05-5278-4ed4-a48e-3660301b19b2', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Federal Human Rights Framework', 'federal-human-rights-framework', 'The Canadian Human Rights Act and federal protections.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:29.864125+00', '2025-11-09 05:15:29.864125+00'),
	('bdc17466-3102-4648-a839-1fe1f43d7272', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Provincial Human Rights Legislation', 'provincial-human-rights-legislation', 'Overview of provincial human rights codes across Canada.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:30.069231+00', '2025-11-09 05:15:30.069231+00'),
	('d67e5fd2-bc0c-4e4a-addc-72c90a6fced9', '21493075-7bbf-41cd-a938-0119007db4d2', 'Understanding Microaggressions', 'understanding-microaggressions', 'What are microaggressions and why do they matter?', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:34.601181+00', '2025-11-09 05:15:34.601181+00'),
	('7a698229-17e7-467b-84d4-74439cc4a8d0', '21493075-7bbf-41cd-a938-0119007db4d2', 'Responding to Microaggressions', 'responding-to-microaggressions', 'Strategies for targets, perpetrators, and bystanders.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:34.858791+00', '2025-11-09 05:15:34.858791+00'),
	('ca284a11-33ae-44a5-89c8-5f57665c7eaa', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Understanding Allyship', 'understanding-allyship', 'What does it mean to be an anti-racist ally?', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:35.136879+00', '2025-11-09 05:15:35.136879+00'),
	('a47cfb37-e657-471f-99e3-0b60c0b7d636', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Allyship in Action', 'allyship-in-action', 'Practical strategies for effective allyship.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:15:35.317045+00', '2025-11-09 05:15:35.317045+00'),
	('d47d78b4-94fb-4a44-8cfe-15ee6f15b9e4', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Equity Data Collection and Ethics', 'equity-data-collection-and-ethics', 'Best practices for collecting and handling racial demographic data.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:20:15.214424+00', '2025-11-09 05:20:15.214424+00'),
	('00845880-1a5a-4928-95b4-83fc41bc3e35', '896de482-9231-4d59-8a5a-047b95926a1a', 'Leading Organizational Change for Racial Equity', 'leading-organizational-change-for-racial-equity', 'Understanding how to drive systemic change within organizations.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:20:15.247027+00', '2025-11-09 05:20:15.247027+00'),
	('6abf106b-8f06-4419-ab8a-b566ab568694', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Key Equity Metrics and Analysis', 'key-equity-metrics-and-analysis', 'Essential metrics for tracking racial equity progress.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:20:15.446086+00', '2025-11-09 05:20:15.446086+00'),
	('ff6ce6d1-4cfd-47b6-85c1-9c26e12cd5c4', '896de482-9231-4d59-8a5a-047b95926a1a', 'Developing Anti-Racist Policies and Practices', 'developing-anti-racist-policies-and-practices', 'Creating and implementing policies that advance racial equity.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:20:15.455193+00', '2025-11-09 05:20:15.455193+00'),
	('d36d769a-86dc-4782-b588-877967ac825e', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Reporting and Accountability', 'reporting-and-accountability', 'Communicating equity data and driving accountability.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:20:15.65637+00', '2025-11-09 05:20:15.65637+00'),
	('2e9b5e55-5dea-4f75-97a1-8b19c23010e6', '896de482-9231-4d59-8a5a-047b95926a1a', 'Building and Sustaining an Inclusive Culture', 'building-and-sustaining-an-inclusive-culture', 'Creating workplace environments where Black employees thrive.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 05:20:15.750305+00', '2025-11-09 05:20:15.750305+00'),
	('02c8e361-9abd-48b5-a4cd-76bab0f39758', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Preparing for Difficult Conversations', 'preparing-for-difficult-conversations', 'Build the foundation for successful racial conversations through self-awareness and psychological preparation.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 11:53:28.008347+00', '2025-11-09 11:53:28.008347+00'),
	('d500fb7e-473b-4a52-afa9-bbd87bdaef3e', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Proven Conversation Frameworks', 'proven-conversation-frameworks', 'Learn structured approaches for navigating difficult racial conversations effectively.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 11:53:28.337696+00', '2025-11-09 11:53:28.337696+00'),
	('312e33eb-a1c6-4223-bc24-ef3ed483d875', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Handling Resistance and Recovering', 'handling-resistance-and-recovering', 'Strategies for managing pushback and taking care of yourself after difficult conversations.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 11:53:28.56437+00', '2025-11-09 11:53:28.56437+00'),
	('eb68974c-0ee6-4e07-86e5-7483019a84ce', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Early Black Presence: 1600s-1800s', 'early-black-presence-1600s-1800s', 'Explore the arrival and experiences of Black people in Canada from early colonization through slavery and the Underground Railroad.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:00:12.761542+00', '2025-11-09 12:00:12.761542+00'),
	('fb9acf4a-f619-4542-b46d-6f63840dbd04', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Segregation and Exclusion: 1900-1960', 'segregation-and-exclusion-1900-1960', 'Examine the era of formal segregation, exclusionary immigration policies, and ongoing discrimination.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:00:13.073535+00', '2025-11-09 12:00:13.073535+00'),
	('51c526af-33da-42af-b2e9-75acd34200ff', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Civil Rights and Multiculturalism: 1960-2000', 'civil-rights-and-multiculturalism-1960-2000', 'Explore the fight for civil rights, policy changes, and the rise of Black activism in Canada.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:00:13.319205+00', '2025-11-09 12:00:13.319205+00'),
	('43188c98-5ce5-4df8-ad0a-3afbe5d67fb4', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Contemporary Black Canada: 2000-Present', 'contemporary-black-canada-2000-present', 'Examine current movements, challenges, and achievements of Black Canadians today.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:00:13.51706+00', '2025-11-09 12:00:13.51706+00'),
	('b6f1eac6-3cd4-4723-ac34-d7da757d859e', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Conducting Discrimination Investigations', 'conducting-discrimination-investigations', 'Master the process of investigating workplace discrimination complaints with thoroughness and fairness.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:19.200878+00', '2025-11-09 12:06:19.200878+00'),
	('4be4fec0-ef1d-4fc3-9a85-8221b2e1102b', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Employment Equity Act Compliance', 'employment-equity-act-compliance', 'Understand and implement Employment Equity requirements for federally regulated organizations.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:19.629639+00', '2025-11-09 12:06:19.629639+00'),
	('c16fdd33-8f79-4d00-8ae6-a738523001e4', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Designing Bias-Resistant Talent Systems', 'designing-bias-resistant-talent-systems', 'Build hiring, promotion, and performance management systems that reduce bias and advance equity.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:19.950207+00', '2025-11-09 12:06:19.950207+00'),
	('ecd305e9-afef-4109-9585-0afed229da34', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Equity Metrics and Accountability', 'equity-metrics-and-accountability', 'Establish measurement systems and accountability frameworks for anti-racism work.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:20.412587+00', '2025-11-09 12:06:20.412587+00'),
	('32f56862-6974-4cfb-9d83-ba26a6c4b9f9', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Understanding Racial Bias in Healthcare', 'understanding-racial-bias-in-healthcare', 'Examine how anti-Black racism manifests in healthcare settings and impacts patient care.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:20.833208+00', '2025-11-09 12:06:20.833208+00'),
	('2148095b-2836-460c-a936-1a21139522c9', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Black Maternal Health: A Canadian Crisis', 'black-maternal-health-a-canadian-crisis', 'Examine the alarming disparities in maternal health outcomes for Black women in Canada.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:21.074312+00', '2025-11-09 12:06:21.074312+00'),
	('489a514f-bdad-4c47-a3bc-4fc5162a8a7b', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Effective Communication Across Racial Difference', 'effective-communication-across-racial-difference', 'Build skills for patient-centered communication that acknowledges and addresses racial dynamics.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:21.271981+00', '2025-11-09 12:06:21.271981+00'),
	('236ff936-2bef-45ac-9ae5-5ba86b3a92a4', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Advancing Systemic Change', 'advancing-systemic-change', 'Move beyond individual awareness to organizational and system-level transformation.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:06:21.465294+00', '2025-11-09 12:06:21.465294+00'),
	('f8f226f8-e08e-464a-beed-f847c28926bf', '8171b79b-869b-45d7-8c5c-340507244da3', 'Understanding Intersectionality', 'understanding-intersectionality', 'Learn the theory and practice of intersectionality and why it matters for Black women.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:51.236584+00', '2025-11-09 12:07:51.236584+00'),
	('00254c49-3851-459e-a00f-22bbaa4771d2', '8171b79b-869b-45d7-8c5c-340507244da3', 'Black Women''s Workplace Realities', 'black-women-s-workplace-realities', 'Examine the unique challenges and barriers Black women face in Canadian workplaces.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:51.521411+00', '2025-11-09 12:07:51.521411+00'),
	('ad6d4960-8e79-4869-8ecb-cb760ef42b66', '8171b79b-869b-45d7-8c5c-340507244da3', 'Creating Inclusive Environments for Black Women', 'creating-inclusive-environments-for-black-women', 'Learn practical strategies for supporting Black women in your workplace.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:51.836829+00', '2025-11-09 12:07:51.836829+00'),
	('783590c3-4897-48c8-af9c-277169747a6b', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Introduction to Racial Equity Audits', 'introduction-to-racial-equity-audits', 'Understand the purpose, scope, and value of conducting equity audits.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:52.208257+00', '2025-11-09 12:07:52.208257+00'),
	('5a3da97f-a44f-4e68-bafd-e5cb4db752d4', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Audit Methodology and Data Collection', 'audit-methodology-and-data-collection', 'Learn systematic approaches to gathering and organizing equity audit data.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:52.438786+00', '2025-11-09 12:07:52.438786+00'),
	('439b5b73-2f44-4260-867b-30888c398d95', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Analyzing Data and Identifying Findings', 'analyzing-data-and-identifying-findings', 'Turn collected data into clear findings about racial disparities and their causes.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:52.691257+00', '2025-11-09 12:07:52.691257+00'),
	('e7cae5a3-68a2-46b4-9b5a-fd3e86746561', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Reporting Results and Creating Action Plans', 'reporting-results-and-creating-action-plans', 'Communicate findings effectively and develop actionable recommendations.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:07:52.886123+00', '2025-11-09 12:07:52.886123+00'),
	('008ceade-824d-4548-867f-072d69b014d7', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Shared Histories of Colonialism and Resistance', 'shared-histories-of-colonialism-and-resistance', 'Understand the interconnected histories of Indigenous genocide and Black enslavement in Canada, and how both communities resisted.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:18:53.447094+00', '2025-11-09 12:18:53.447094+00'),
	('1bb4a5e0-e4f5-4e35-bd10-70cd471d647c', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Honoring Distinct Experiences', 'honoring-distinct-experiences', 'Recognize what is shared and what is distinct between Indigenous and Black experiences to avoid erasure.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:18:53.751545+00', '2025-11-09 12:18:53.751545+00'),
	('110b73ee-3e41-4d13-950a-b476003d5589', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Strategies for Authentic Solidarity', 'strategies-for-authentic-solidarity', 'Learn practical approaches to building genuine, accountable relationships and coalitions.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:18:54.188774+00', '2025-11-09 12:18:54.188774+00'),
	('4358c54a-6e4c-403d-9f09-1c0e9389894f', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Recognizing Performative Allyship', 'recognizing-performative-allyship', 'Distinguish between performative and genuine allyship and understand why the difference matters.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:18:54.599455+00', '2025-11-09 12:18:54.599455+00'),
	('d35bbbd4-55d1-4482-acfd-e3fc4aa4081b', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Genuine Allyship in Practice', 'genuine-allyship-in-practice', 'Learn what genuine allyship looks like in action and how to practice it consistently.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:18:54.873562+00', '2025-11-09 12:18:54.873562+00'),
	('eb5885d8-1b9a-4098-985c-e82cbf414e43', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Sustaining Allyship Over Time', 'sustaining-allyship-over-time', 'Develop practices for maintaining genuine allyship beyond initial enthusiasm.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:18:55.229355+00', '2025-11-09 12:18:55.229355+00'),
	('cc223a93-918d-4887-963c-79ab8ecab856', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Anti-Racist Curriculum Audit and Transformation', 'anti-racist-curriculum-audit-and-transformation', 'Learn to critically examine curriculum for bias, erasure, and harm, then make transformative changes.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:53.161488+00', '2025-11-09 12:26:53.161488+00'),
	('676b939f-f8eb-404a-80c5-6ca8bd12fd5e', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Creating Anti-Racist Classroom Environments', 'creating-anti-racist-classroom-environments', 'Implement daily practices that affirm Black students and interrupt racism.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:53.589893+00', '2025-11-09 12:26:53.589893+00'),
	('dd5492d1-a1c7-4172-839e-01afe3fafe7c', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Addressing Racial Discipline Disparities', 'addressing-racial-discipline-disparities', 'Understand and disrupt the disproportionate discipline of Black students.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:53.967256+00', '2025-11-09 12:26:53.967256+00'),
	('a9207e0a-a4b2-4032-9cd6-a991d68bc20e', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Engaging Black Families as Partners', 'engaging-black-families-as-partners', 'Build authentic partnerships with Black families based on respect and shared power.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:54.263171+00', '2025-11-09 12:26:54.263171+00'),
	('44bb9d9c-de90-438a-a44f-77a975c40194', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Understanding Anti-Black Racism in Canadian Policing', 'understanding-anti-black-racism-in-canadian-policing', 'Examine the history and current reality of anti-Black policing in Canada.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:54.734448+00', '2025-11-09 12:26:54.734448+00'),
	('d7b0fe04-1c65-4b3d-9251-864473968b99', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Anti-Black Racism in the Justice System', 'anti-black-racism-in-the-justice-system', 'Examine disparities in arrests, bail, sentencing, and incarceration.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:55.162235+00', '2025-11-09 12:26:55.162235+00'),
	('65bf016b-ab4d-4230-9805-db712c0076b7', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Community-Led Safety Alternatives', 'community-led-safety-alternatives', 'Explore models that prioritize community safety without relying on police.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:55.448796+00', '2025-11-09 12:26:55.448796+00'),
	('83f78218-6312-4e72-bec7-40a3a5890edc', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Police Accountability and Systemic Change', 'police-accountability-and-systemic-change', 'Examine accountability mechanisms and strategies for transformative change.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:26:55.688649+00', '2025-11-09 12:26:55.688649+00'),
	('64e49ca3-3f19-4902-93c7-09a8d12623d5', 'bec54d11-cb40-43da-aace-1177501111af', 'Defining Environmental Racism and Environmental Justice', 'defining-environmental-racism-and-environmental-justice', 'Understand how environmental harms disproportionately impact Black and racialized communities.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:31.386743+00', '2025-11-09 12:28:31.386743+00'),
	('49fafd83-d071-476a-b730-a226c91d5613', 'bec54d11-cb40-43da-aace-1177501111af', 'Health Impacts of Environmental Racism', 'health-impacts-of-environmental-racism', 'Examine the disproportionate health burdens on Black communities.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:31.769923+00', '2025-11-09 12:28:31.769923+00'),
	('40bf1f0f-367f-4088-8f11-c15795cc87ee', 'bec54d11-cb40-43da-aace-1177501111af', 'Community Organizing for Environmental Justice', 'community-organizing-for-environmental-justice', 'Learn from Black-led environmental justice movements and strategies.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:32.126395+00', '2025-11-09 12:28:32.126395+00'),
	('68fd1c3d-d236-434a-803f-3075e495f27b', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Building Authentic Recruitment Pipelines', 'building-authentic-recruitment-pipelines', 'Move beyond performative diversity recruiting to genuine pipeline building.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:32.508+00', '2025-11-09 12:28:32.508+00'),
	('b98aa008-bee2-4068-a0c6-6fe8e6e10da0', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Equitable Interviewing and Selection Processes', 'equitable-interviewing-and-selection-processes', 'Design selection processes that assess merit without bias.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:32.819054+00', '2025-11-09 12:28:32.819054+00'),
	('4c5f6c1b-e9bb-4509-8b38-a8a40dabeda6', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Creating Equitable Onboarding Experiences', 'creating-equitable-onboarding-experiences', 'Set Black employees up for success from day one.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:33.15018+00', '2025-11-09 12:28:33.15018+00'),
	('47b1c483-3ade-45bc-8c27-5327f3844b93', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Addressing Systemic Barriers to Retention', 'addressing-systemic-barriers-to-retention', 'Understand and address why Black employees leave—and create pathways to advancement.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:28:33.36752+00', '2025-11-09 12:28:33.36752+00'),
	('e851d8a0-153a-4db5-b5be-281c055ff8a7', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Anti-Black Racism in Legal Education and the Profession', 'anti-black-racism-in-legal-education-and-the-profession', 'Examine barriers and bias in law schools, bar admission, and legal practice.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:04.175604+00', '2025-11-09 12:35:04.175604+00'),
	('a7ca7c09-9be1-400b-aa36-49e08c26aa78', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Bias in Judicial Decision-Making', 'bias-in-judicial-decision-making', 'Examine anti-Black bias in bail, sentencing, and judicial proceedings.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:04.609665+00', '2025-11-09 12:35:04.609665+00'),
	('b2777560-172b-456f-ae10-896107fea3f2', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Barriers to Legal Representation and Access', 'barriers-to-legal-representation-and-access', 'Address systemic barriers preventing Black communities from accessing justice.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:04.953482+00', '2025-11-09 12:35:04.953482+00'),
	('1eb64225-b879-4ba2-b2c3-5cf02576df99', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Implementing Anti-Racist Legal Practice', 'implementing-anti-racist-legal-practice', 'Strategies for lawyers to practice anti-racism in their work.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:05.30435+00', '2025-11-09 12:35:05.30435+00'),
	('566225e5-8748-46ea-8022-3b377866b449', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Algorithmic Bias and Anti-Black Discrimination', 'algorithmic-bias-and-anti-black-discrimination', 'Understand how algorithms perpetuate and amplify anti-Black racism.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:05.724741+00', '2025-11-09 12:35:05.724741+00'),
	('fc6b61b0-3844-4054-aaaf-fbdd02f88859', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'AI in Criminal Justice, Hiring, and Healthcare', 'ai-in-criminal-justice-hiring-and-healthcare', 'Examine how biased algorithms affect life-changing decisions.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:06.017811+00', '2025-11-09 12:35:06.017811+00'),
	('b9acfd29-0e8d-467d-b83a-f2a3324609f9', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Anti-Black Racism in Tech Industry', 'anti-black-racism-in-tech-industry', 'Examine diversity failures and hostile culture in technology sector.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:06.538731+00', '2025-11-09 12:35:06.538731+00'),
	('edb7595e-a085-414e-adbb-f4462d88e49c', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Building Ethical AI and Tech Accountability', 'building-ethical-ai-and-tech-accountability', 'Strategies for creating equitable technology and ensuring accountability.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:35:06.762365+00', '2025-11-09 12:35:06.762365+00'),
	('af93b6ea-ffe8-4308-9cc3-f2fca45e446b', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Banking Discrimination and Financial Exclusion', 'banking-discrimination-and-financial-exclusion', 'Examine anti-Black discrimination in banking access and services.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:50.278926+00', '2025-11-09 12:41:50.278926+00'),
	('c59dd2f1-3e3a-4171-9709-01d03ffa5027', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Credit and Debt Disparities', 'credit-and-debt-disparities', 'Understand racial disparities in credit access and debt burden.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:50.792761+00', '2025-11-09 12:41:50.792761+00'),
	('040a39ea-f623-4b86-bd0c-58cea4a369f2', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Housing and Homeownership Barriers', 'housing-and-homeownership-barriers', 'Examine systemic barriers to Black homeownership and wealth building.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:51.096756+00', '2025-11-09 12:41:51.096756+00'),
	('6b89e446-97fb-4558-8a97-3f4739c99974', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Financial Justice and Economic Equity', 'financial-justice-and-economic-equity', 'Strategies for addressing financial discrimination and building wealth.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:51.508552+00', '2025-11-09 12:41:51.508552+00'),
	('2d0627dc-5ae8-430e-b6fc-41ba1a489a34', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Power Dynamics in Nonprofit Work', 'power-dynamics-in-nonprofit-work', 'Understand how power operates in social sector organizations.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:51.842017+00', '2025-11-09 12:41:51.842017+00'),
	('9b43c1c6-6724-4633-9c12-e474936a587b', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Centering Black Community Leadership', 'centering-black-community-leadership', 'Move from doing "for" to supporting community-led initiatives.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:52.121906+00', '2025-11-09 12:41:52.121906+00'),
	('a8ac637a-1a27-4558-beb7-275e7df0225f', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Funding Equity and Resource Distribution', 'funding-equity-and-resource-distribution', 'Address inequities in philanthropic funding and resource access.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:41:52.470562+00', '2025-11-09 12:41:52.470562+00'),
	('cfe37ca4-0eb4-4fd8-adcb-df60326438d6', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Anti-Black Bias in Media Representation', 'anti-black-bias-in-media-representation', 'Examine how media perpetuates harmful stereotypes and narratives.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:24.630346+00', '2025-11-09 12:42:24.630346+00'),
	('f43f6d8d-f8f5-4b88-82b6-fece34b5888b', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Ethical Journalism and Storytelling Practices', 'ethical-journalism-and-storytelling-practices', 'Learn principles for reporting that does not perpetuate harm.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:24.90483+00', '2025-11-09 12:42:24.90483+00'),
	('e70aa0b4-78d6-4b1e-b589-4d49a711d07d', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Diversity and Inclusion in Media Institutions', 'diversity-and-inclusion-in-media-institutions', 'Address systemic barriers in newsrooms and media organizations.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:25.229644+00', '2025-11-09 12:42:25.229644+00'),
	('acf2d5b3-de74-4b7c-bef5-6068160d2465', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Media Accountability and Public Trust', 'media-accountability-and-public-trust', 'Building accountability mechanisms and repairing harm.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:25.401813+00', '2025-11-09 12:42:25.401813+00'),
	('5a8e2c75-23cd-4f2b-b86e-1b203796cbbb', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Analyzing Policy Through a Racial Equity Lens', 'analyzing-policy-through-a-racial-equity-lens', 'Develop skills to assess how policies perpetuate or address racism.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:25.688816+00', '2025-11-09 12:42:25.688816+00'),
	('f82c93e2-b483-4683-8c6a-4286bd399497', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Advocacy Strategies for Racial Equity', 'advocacy-strategies-for-racial-equity', 'Build skills to influence policy decisions and systems.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:25.925833+00', '2025-11-09 12:42:25.925833+00'),
	('22cf8157-85f3-4aa5-8351-e7b83e47c914', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Coalition Building and Community Organizing', 'coalition-building-and-community-organizing', 'Mobilize collective power for policy change.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:26.154869+00', '2025-11-09 12:42:26.154869+00'),
	('45a399cf-8c6a-44bd-ac74-39d9f31e337c', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Policy Implementation and Accountability', 'policy-implementation-and-accountability', 'Ensure policies are implemented equitably and hold systems accountable.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:42:26.363542+00', '2025-11-09 12:42:26.363542+00'),
	('7b7297d8-3af4-4e80-9910-43ebc9e44e39', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Anti-Black Racism and Mental Health Impacts', 'anti-black-racism-and-mental-health-impacts', 'Understand how racism creates and exacerbates mental health challenges.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:26.828667+00', '2025-11-09 12:54:26.828667+00'),
	('d1fa6a20-702c-4fe0-8ef0-66f43e88433f', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Bias in Mental Health Diagnosis and Treatment', 'bias-in-mental-health-diagnosis-and-treatment', 'Examine racism in diagnostic practices and treatment approaches.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:27.35995+00', '2025-11-09 12:54:27.35995+00'),
	('c149cb6c-6399-4b19-be3e-a38942684dd7', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Barriers to Accessing Mental Health Services', 'barriers-to-accessing-mental-health-services', 'Understand systemic barriers preventing Black communities from accessing care.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:27.759873+00', '2025-11-09 12:54:27.759873+00'),
	('dedebe6d-6011-4f86-a9ea-17a4b34739fc', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Culturally Responsive and Anti-Racist Practice', 'culturally-responsive-and-anti-racist-practice', 'Build culturally safe, anti-racist mental health services.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:28.044828+00', '2025-11-09 12:54:28.044828+00'),
	('d9bcceb8-508c-4718-80c5-e9da6a06c74b', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Settler Colonialism and Anti-Black Racism', 'settler-colonialism-and-anti-black-racism', 'Understand how colonialism and anti-Black racism are interconnected.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:28.464083+00', '2025-11-09 12:54:28.464083+00'),
	('ae49c19d-c498-4b28-be94-959bfe4e0c13', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Indigenous and Black Solidarity', 'indigenous-and-black-solidarity', 'Learn from solidarity movements and shared struggles.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:28.746156+00', '2025-11-09 12:54:28.746156+00'),
	('890abc75-4ca6-4c71-a366-e455087c128a', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Decolonial Approaches to Anti-Racism Work', 'decolonial-approaches-to-anti-racism-work', 'Practice anti-racism that challenges colonial frameworks.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:29.018245+00', '2025-11-09 12:54:29.018245+00'),
	('3a9dd469-315f-4694-9988-42a3e806762d', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Anti-Blackness in "Decolonization" Spaces', 'anti-blackness-in-decolonization-spaces', 'Address how decolonization discourse can exclude or harm Black people.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:54:29.233109+00', '2025-11-09 12:54:29.233109+00'),
	('4526b52a-d6ff-4c4a-a956-6eec6563b10a', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Foundations of Intersectionality', 'foundations-of-intersectionality', 'Understand intersectionality theory and its Black feminist origins.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:00.49649+00', '2025-11-09 12:57:00.49649+00'),
	('b5b626eb-b4bd-4c25-9eae-5432df446b6f', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Misogynoir and Violence Against Black Women', 'misogynoir-and-violence-against-black-women', 'Understand unique violence facing Black women and girls.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:00.784229+00', '2025-11-09 12:57:00.784229+00'),
	('9473bc49-6f39-4ab2-ad73-3b8b986f1dd3', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Race, Class, and Economic Oppression', 'race-class-and-economic-oppression', 'Understand how class intersects with anti-Black racism.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:01.042052+00', '2025-11-09 12:57:01.042052+00'),
	('5840a97b-9250-4300-a24d-212cacc6ddfc', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Disability Justice and Anti-Racism', 'disability-justice-and-anti-racism', 'Understand ableism and racism in disability communities.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:01.381734+00', '2025-11-09 12:57:01.381734+00'),
	('d61e5a15-96b6-4102-bac0-aaf1092e90f0', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Understanding White Supremacy Culture', 'understanding-white-supremacy-culture', 'Learn the characteristics of white supremacy culture in organizations.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:01.714824+00', '2025-11-09 12:57:01.714824+00'),
	('6bbeeaed-987a-44aa-a876-024b1987fd68', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Organizational Characteristics Part 2', 'organizational-characteristics-part-2', 'More white supremacy culture characteristics and their impacts.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:01.950876+00', '2025-11-09 12:57:01.950876+00'),
	('4fbba9f2-9e7b-4487-8c51-e089a3faf0f0', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Impact on Black Employees and Communities', 'impact-on-black-employees-and-communities', 'Examine the harm white supremacy culture causes.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:02.128652+00', '2025-11-09 12:57:02.128652+00'),
	('a09e2f64-ceba-4219-a272-0f53c551f0ef', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Dismantling and Building Alternatives', 'dismantling-and-building-alternatives', 'Strategies to dismantle white supremacy culture and build anti-racist alternatives.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:57:02.379621+00', '2025-11-09 12:57:02.379621+00'),
	('e26218ef-585f-4682-9aef-b26c66860efc', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Understanding Racial Trauma', 'understanding-racial-trauma', 'Learn about trauma caused by racism and its manifestations.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:57.185514+00', '2025-11-09 12:58:57.185514+00'),
	('82c7e855-6dea-4ced-b7da-580c537b7985', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Trauma-Informed Principles in Anti-Racist Context', 'trauma-informed-principles-in-anti-racist-context', 'Apply trauma-informed care principles to address racial trauma.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:57.49916+00', '2025-11-09 12:58:57.49916+00'),
	('ba103d75-796c-41f1-995a-d9f9412c8266', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Preventing Re-traumatization', 'preventing-re-traumatization', 'Avoid causing additional harm in systems and services.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:57.788364+00', '2025-11-09 12:58:57.788364+00'),
	('4223759c-5387-481e-819f-01c30334ca5e', '48531317-4d90-4ad7-87f0-06fff0120925', 'Conducting Organizational Anti-Racism Audits', 'conducting-organizational-anti-racism-audits', 'Assess your organization''s current state and identify areas for change.', 1, 1, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:58.092148+00', '2025-11-09 12:58:58.092148+00'),
	('2601bcbd-bb76-491c-9333-0d69b7ecb30f', '48531317-4d90-4ad7-87f0-06fff0120925', 'Strategic Planning for Anti-Racism', 'strategic-planning-for-anti-racism', 'Develop comprehensive strategic plans with measurable goals.', 2, 2, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:58.394062+00', '2025-11-09 12:58:58.394062+00'),
	('4663b82d-ccc0-403c-9868-64bcdb695d7d', '48531317-4d90-4ad7-87f0-06fff0120925', 'Building Accountability Structures', 'building-accountability-structures', 'Create mechanisms to ensure follow-through and address harm.', 3, 3, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:58.619429+00', '2025-11-09 12:58:58.619429+00'),
	('c47b8adb-7600-4464-b5bc-e19c498c8c7e', '48531317-4d90-4ad7-87f0-06fff0120925', 'Transforming HR and People Practices', 'transforming-hr-and-people-practices', 'Overhaul recruitment, hiring, retention, and advancement.', 4, 4, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:58.851377+00', '2025-11-09 12:58:58.851377+00'),
	('51328e0d-7054-4afe-9e58-f9c321badf26', '48531317-4d90-4ad7-87f0-06fff0120925', 'Sustaining Anti-Racism Commitment', 'sustaining-anti-racism-commitment', 'Move beyond performative moments to long-term transformation.', 5, 5, NULL, true, '{}', '[]', '[]', NULL, '2025-11-09 12:58:59.089911+00', '2025-11-09 12:58:59.089911+00');


--
-- Data for Name: learning_paths; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."lessons" ("id", "course_id", "title", "slug", "description", "content_type", "content_url", "content_data", "video_duration_seconds", "video_provider", "video_id", "thumbnail_url", "article_body", "estimated_read_time_minutes", "module_number", "lesson_number", "sort_order", "is_published", "is_preview", "resources", "published_at", "created_at", "updated_at", "deleted_at", "module_id", "transcript_en", "transcript_fr", "closed_captions_url", "accessibility_notes", "ce_credits", "regulatory_body", "completion_required", "allow_download") VALUES
	('75fff04f-b082-4a09-a0e0-6c71cdab1d4a', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Knowledge Check: Foundations', 'quiz-foundations', 'Test your understanding of anti-Black racism fundamentals.', 'quiz', NULL, '{"questions": [{"options": ["Any form of discrimination based on skin color", "Prejudice, attitudes, and stereotypes specifically directed at people of Black/African descent", "Historical events that happened only in the United States", "Individual acts of meanness"], "question": "Anti-Black racism refers to:", "explanation": "Anti-Black racism is the specific prejudice, attitudes, beliefs, stereotyping, and discrimination directed at people of African descent, rooted in their unique history and experience.", "correct_answer": 1}, {"options": ["1776", "1807", "1834", "1865"], "question": "Slavery in Canada was abolished in:", "explanation": "Slavery was abolished throughout the British Empire, including Canada, in 1834. However, this was not the end of anti-Black discrimination.", "correct_answer": 2}, {"options": ["Is more harmful", "Is embedded in policies, practices, and institutions", "Only affects Black people", "Is easier to identify"], "question": "Systemic racism differs from individual racism because it:", "explanation": "Systemic racism is embedded in the policies, practices, and procedures of institutions and systems, creating barriers for racialized groups regardless of individual intentions.", "correct_answer": 1}, {"options": ["Ontario", "Quebec", "Nova Scotia", "British Columbia"], "question": "Which Canadian province had legally segregated schools until 1965?", "explanation": "Nova Scotia maintained legally segregated schools for Black students until 1965, demonstrating the persistence of formal discrimination in Canada.", "correct_answer": 2}, {"options": ["Canada being exceptionally anti-racist", "The false belief that Canada does not have a history of racism", "Canada having better diversity policies than other countries", "Black excellence in Canada"], "question": "The concept of \"Canadian exceptionalism\" regarding racism refers to:", "explanation": "Canadian exceptionalism is the myth that Canada is inherently more tolerant than other countries (especially the US), which obscures our own history and present reality of anti-Black racism.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 05:15:21.546646+00', '2025-11-09 05:15:21.546646+00', NULL, '3b42512a-4c2a-4531-8f46-48fc43aac8a5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f4a80355-fc86-4708-9a37-b8d81d7824ab', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Anti-Black Racism in Employment', 'employment-discrimination', 'Examine barriers Black Canadians face in hiring, promotion, and workplace culture.', 'video', 'https://example.com/videos/employment-discrimination.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 05:15:21.658533+00', '2025-11-09 05:15:21.658533+00', NULL, '0de9dcaa-6baf-46f4-a551-472ebb3028a8', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5b4bacf5-8eaf-4612-a222-7507d9dbb638', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Education System Disparities', 'education-disparities', 'Understand streaming, suspensions, and other barriers in education.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Education System Disparities

## The Achievement Gap

Black students in Canada face significant disparities in educational outcomes compared to their peers, not due to ability but due to systemic barriers.

## Key Issues

### 1. Academic Streaming
- **Definition**: The practice of placing students in different educational tracks
- **Impact on Black Students**: 
  - Disproportionately placed in applied/basic streams
  - Limited access to advanced courses
  - Reduces university eligibility
- **Statistics**: Black students in Ontario are 3x more likely to be streamed into non-academic tracks

### 2. Discipline Disparities
- Black students face higher rates of:
  - Suspensions and expulsions
  - Zero-tolerance policy enforcement
  - Involvement with police in schools
- **Root Causes**: 
  - Unconscious bias in discipline decisions
  - Adultification of Black children
  - Cultural misunderstandings

### 3. Curriculum Gap
- Limited representation of Black history and contributions
- Eurocentric curriculum perspectives
- February as only time Black history is addressed
- Lack of critical examination of racism in Canada

### 4. Teacher Diversity and Training
- Under-representation of Black teachers
- Insufficient anti-racism training
- Cultural disconnect between teachers and Black students
- Low expectations based on stereotypes

### 5. Special Education Over-Identification
- Black students over-identified for:
  - Behavioral programs
  - Learning disabilities
  - Special education placement
- Under-identified for gifted programs

## Case Study: Toronto District School Board

**2017 TDSB Report Findings:**
- Black students had graduation rates 15% lower than average
- Black students were 3x more likely to be suspended
- Black parents reported feeling unwelcome in schools
- Only 4% of teachers identified as Black vs. 12% of students

## Impact on Life Outcomes

Educational streaming and discipline disparities lead to:
- **Economic**: Lower earning potential
- **Social**: Reduced social mobility
- **Psychological**: Lower self-esteem and aspirations
- **Criminal Justice**: School-to-prison pipeline

## Promising Practices

1. **Culturally Responsive Teaching**: Pedagogy that recognizes students'' cultural references
2. **Restorative Justice**: Alternative to punitive discipline
3. **Inclusive Curriculum**: Integrating Black history year-round
4. **Parent Engagement**: Building trust with Black families
5. **Data Collection**: Disaggregated race-based data to identify disparities

## Reflection Questions

1. Have you witnessed streaming or discipline disparities in your educational experience?
2. How might unconscious bias influence teacher perceptions of Black students?
3. What steps can schools take to close these gaps?', NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:21.707674+00', '2025-11-09 05:15:21.707674+00', NULL, '0de9dcaa-6baf-46f4-a551-472ebb3028a8', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5dd894a1-060d-45b8-800e-77480098a134', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Policing and the Justice System', 'policing-justice', 'Explore racial profiling, carding, and disproportionate incarceration.', 'video', 'https://example.com/videos/policing-justice.mp4', '{}', 780, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:21.761044+00', '2025-11-09 05:15:21.761044+00', NULL, '0de9dcaa-6baf-46f4-a551-472ebb3028a8', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c32b5722-a9e8-4296-b842-4e0d454f2136', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Knowledge Check: Contemporary Issues', 'quiz-contemporary', 'Assess your understanding of current manifestations of anti-Black racism.', 'quiz', NULL, '{"questions": [{"options": ["Providing specialized education", "Placing them in lower academic tracks, limiting opportunities", "Helping them graduate faster", "Giving them more teacher attention"], "question": "Academic streaming disproportionately affects Black students by:", "explanation": "Streaming places Black students disproportionately in applied or basic level courses, limiting access to university and career opportunities despite ability.", "correct_answer": 1}, {"options": ["Checking identification at clubs", "Police randomly stopping and documenting individuals", "Credit card fraud", "School identification systems"], "question": "The term \"carding\" refers to:", "explanation": "Carding (or street checks) is the practice of police arbitrarily stopping, questioning, and documenting individuals. Data shows Black people are disproportionately carded.", "correct_answer": 1}, {"options": ["Same rate", "1.5 times", "3 times", "5 times"], "question": "Black students in Ontario are approximately how many times more likely to be suspended than white students?", "explanation": "Research shows Black students in Ontario are approximately 3 times more likely to be suspended, even for similar behaviors, indicating bias in discipline.", "correct_answer": 2}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 05:15:21.810485+00', '2025-11-09 05:15:21.810485+00', NULL, '0de9dcaa-6baf-46f4-a551-472ebb3028a8', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1f5cd5aa-032d-4342-b27f-eea65cbf986d', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Examining Your Own Biases', 'examining-biases', 'Tools and strategies for identifying unconscious bias.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Examining Your Own Biases

## Understanding Unconscious Bias

We all have biases—mental shortcuts our brains make based on societal conditioning, media representation, and personal experience. Recognizing them is the first step to change.

## Common Anti-Black Biases

### 1. Competence Bias
- **Assumption**: Black people are less qualified or capable
- **Manifestation**: Questioning credentials, surprised by eloquence or intelligence
- **Example**: "You''re so well-spoken" as a backhanded compliment

### 2. Threat Perception Bias
- **Assumption**: Black people (especially men) are dangerous or aggressive
- **Manifestation**: Clutching belongings, crossing the street, security following
- **Impact**: Creates hostile environment, emotional labor

### 3. Authority Bias
- **Assumption**: Black people don''t belong in leadership or professional roles
- **Manifestation**: Mistaking Black professionals for service staff
- **Example**: Assuming the Black person at a meeting is junior staff

### 4. Respectability Politics
- **Assumption**: Black people must work twice as hard to be considered "acceptable"
- **Manifestation**: Policing Black hair, dress, language, or cultural expression
- **Impact**: Requires code-switching and cultural suppression

## Self-Examination Exercises

### Reflection Journal Prompts

1. **First Exposure**: What were your first exposures to Black people? (Media, neighbors, school?) What messages did you receive?

2. **Immediate Reactions**: When you see a Black person in public, what are your immediate, uncensored thoughts? Be honest with yourself.

3. **Media Consumption**: What percentage of your media (news, entertainment, social media) features Black creators and voices?

4. **Personal Relationships**: Do you have genuine friendships with Black people? Not colleagues or acquaintances, but close friends?

5. **Defensive Reactions**: When someone points out racism, what''s your first reaction? Defensiveness? Denial? Curiosity?

### The IAT (Implicit Association Test)

Project Implicit offers free tests measuring unconscious biases:
- **Race IAT**: Measures automatic associations between race and concepts
- **Skin-tone IAT**: Examines bias between light and dark skin
- **Take it**: implicit.harvard.edu

### Behavioral Audit

Track your behavior for one week:
- Who do you make eye contact with on the street?
- Whose posts do you engage with on social media?
- Who do you interrupt in meetings?
- Whose ideas do you credit?
- Who do you assume is in charge?

## Moving from Awareness to Action

**Recognizing bias is not enough—we must actively work to change.**

### 1. Educate Yourself
- Read books by Black authors
- Follow Black activists and educators
- Learn Black Canadian history

### 2. Speak Up
- Challenge racist jokes and comments
- Correct misinformation
- Don''t make Black colleagues do all the education

### 3. Amplify Black Voices
- Share Black creators'' work
- Credit ideas to Black colleagues
- Support Black-owned businesses

### 4. Examine Systems
- Question who has power in your organization
- Advocate for policy changes
- Support anti-racism initiatives

### 5. Accept Discomfort
- Being called out is not an attack—it''s an opportunity
- Center the harm caused, not your intentions
- Apologize, learn, and do better

## Important Reminders

- **Intent ≠ Impact**: Good intentions don''t negate harmful impact
- **Not About Perfection**: You will make mistakes; how you respond matters
- **Ongoing Work**: Anti-racism is a lifelong commitment, not a destination
- **Listen to Black People**: Their lived experience is the expertise

## Reflection Questions

1. What biases did this lesson help you recognize in yourself?
2. What makes you most uncomfortable about examining your biases?
3. What''s one concrete action you''ll take this week to address your biases?', NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 05:15:21.914058+00', '2025-11-09 05:15:21.914058+00', NULL, '3b168004-9cc9-46f0-85be-1863443b4787', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('51bfe2b6-0dec-4aae-97f8-b7f4107a8b68', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Bystander Intervention Strategies', 'bystander-intervention', 'Learn when and how to intervene when witnessing anti-Black racism.', 'video', 'https://example.com/videos/bystander-intervention.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:21.989209+00', '2025-11-09 05:15:21.989209+00', NULL, '3b168004-9cc9-46f0-85be-1863443b4787', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c18e63c8-122a-446b-8d83-d42099ac6b8b', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Creating Change in Your Sphere', 'creating-change', 'Practical actions you can take in your workplace, community, and personal life.', 'video', 'https://example.com/videos/creating-change.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:22.066794+00', '2025-11-09 05:15:22.066794+00', NULL, '3b168004-9cc9-46f0-85be-1863443b4787', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('496c6756-c6fc-4bd7-b0c8-48e119b92e96', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Why Measure? The Case for Equity Metrics', 'why-measure-equity', 'Understanding the importance of data in advancing racial equity.', 'video', 'https://example.com/videos/why-measure.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 05:20:15.270683+00', '2025-11-09 05:20:15.270683+00', NULL, 'd47d78b4-94fb-4a44-8cfe-15ee6f15b9e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d8a49345-ac2a-4201-88b4-5956a1ab0fcf', '896de482-9231-4d59-8a5a-047b95926a1a', 'The Case for Racial Equity in Organizations', 'case-for-racial-equity', 'Why racial equity is essential for organizational success.', 'video', 'https://example.com/videos/case-for-equity.mp4', '{}', 780, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 05:20:15.293812+00', '2025-11-09 05:20:15.293812+00', NULL, '00845880-1a5a-4928-95b4-83fc41bc3e35', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1f2546fd-26e2-490b-a9f4-467dfca8340e', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Collecting Demographic Data Ethically', 'collecting-data-ethically', 'Best practices for collecting racial demographic information.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Collecting Demographic Data Ethically

## Why Collect Race Data?
Without data, you can''t:
- Identify disparities
- Track progress
- Hold systems accountable
- Make evidence-based decisions
- Demonstrate commitment to equity

However, collecting race data raises legitimate concerns about privacy, misuse, and historical trauma. Ethical collection requires thoughtful approach.

## Guiding Principles

### 1. Purpose and Transparency
**What**: Clearly explain WHY you''re collecting data and HOW it will be used.
**Example communication**:
"We''re collecting demographic data to identify and address disparities in hiring, promotion, and retention. This information will be used in aggregate only to track trends and inform equity initiatives. Individual responses are confidential and will not be used in employment decisions."

### 2. Voluntary Participation
- Self-identification should be optional, not mandatory
- Include "prefer not to answer" option
- No negative consequences for declining
- **Exception**: Required reporting for government contractors (but explain this)

### 3. Appropriate Categories
- Use categories that reflect how people self-identify
- Allow multiple selections (many people are multiracial)
- Include specific options, not just "Black" or "African American"
  - Examples: Black - African, Black - Caribbean, Black - Canadian, etc.
- Avoid outdated or offensive terms
- Review and update categories regularly

### 4. Confidentiality and Security
- Aggregate data for reporting (never identify individuals)
- Secure storage with access controls
- Clear data retention and deletion policies
- Separate demographic data from personally identifiable information where possible

### 5. Community Input
- Consult with Black employees and ERGs on:
  - What questions to ask
  - How to ask them
  - How data will be used
  - How results will be shared
- Incorporate feedback into process

## What to Collect

### Essential Data Points
1. **Race/ethnicity** (self-identified, multiple selections allowed)
2. **Department/business unit**
3. **Level/grade**
4. **Job family/function**
5. **Hire date**
6. **Manager** (for analyzing promotion patterns)

### Additional Valuable Data
- Compensation
- Performance ratings
- Promotions and role changes
- Training and development participation
- Exit reasons (for those who leave)
- Disciplinary actions
- Bonuses and incentives

## When to Collect

### Initial Collection
- During onboarding (separate from application to avoid bias)
- Through voluntary self-identification campaign for existing employees
- Regular opportunities to update (people''s identities may evolve)

### Ongoing Collection
- Track workforce changes in real-time
- Link to HR events (promotion, transfer, exit)
- Annual verification/update campaign

## How to Ask

### Poor Example
❌ "What is your race?"
- Abrupt, no context
- Sounds mandatory
- No explanation of use

### Better Example
✅ "Our organization is committed to racial equity and advancing opportunities for all employees. To identify and address disparities, we collect demographic information. This information is:
- **Voluntary**: You may choose not to answer
- **Confidential**: Used in aggregate only; will not be linked to individual employment decisions
- **Important**: Helps us track progress and hold ourselves accountable

How do you identify your race/ethnicity? (Select all that apply)
☐ Black or African Canadian
☐ Black - African
☐ Black - Caribbean
☐ [other options]
☐ Prefer not to answer"

## Building Trust

### Historical Context
Acknowledge that historically, collecting race data has been used to harm Black communities:
- Enslavement records
- Segregation enforcement
- Discriminatory policies
- Surveillance and profiling

### Building Trust Requires:
1. **Transparency**: Explain exactly how data will be used
2. **Accountability**: Share results and actions taken
3. **Consistency**: Regular reporting, not just one-time exercise
4. **Action**: Demonstrate that data leads to change
5. **Partnership**: Involve Black employees in process design

## Common Pitfalls

### X Collecting but not using data
If you collect data but never analyze or act on it, you erode trust and waste people''s time.

### X Sharing individual-level data
Even anonymized data can sometimes be re-identified. Always aggregate.

### X Collecting only when required
Don''t limit collection to legally mandated reporting. You need richer data to understand and address inequities.

### X Surprise data requests
Don''t spring data collection on employees without context or warning.

### X Ignoring negative findings
If data reveals disparities, acknowledge them honestly and commit to action.

## Legal Considerations (Canada)

### Federal Sector
- Employment Equity Act requires designated employers to collect and report demographic data
- Includes race/ethnicity as a designated group

### Provincial Variation
- Requirements vary by province
- Generally permissible to collect for equity purposes
- Must comply with privacy legislation (PIPEDA, provincial equivalents)

### Key Legal Principles
- Collection must have a legitimate purpose
- Use must be limited to stated purpose
- Security safeguards required
- Individuals have right to access their data

## Case Study: Done Right

**Organization**: Mid-sized technology company
**Challenge**: Lack of Black representation in engineering roles

**Approach**:
1. **Engagement**: Consulted with Black ERG on data collection design
2. **Communication**: Explained purpose, use, and confidentiality in all-hands meeting and written materials
3. **Options**: Made self-ID voluntary with multiple selection options
4. **Analysis**: Conducted analysis of representation, hiring, promotion, retention
5. **Transparency**: Shared results with entire organization, including uncomfortable findings
6. **Action**: Developed specific initiatives based on data (e.g., targeted recruitment, promotion practices review)
7. **Follow-up**: Quarterly updates on progress against metrics

**Result**:
- 85% of employees completed self-ID
- Identified specific barriers in engineering hiring and promotion
- Increased Black engineering representation from 2% to 8% over 3 years
- Improved trust and engagement

## Reflection Questions
1. How does your organization currently collect demographic data?
2. What concerns might Black employees have about sharing this information?
3. How can you build trust through transparency and action?
4. What would you do if data revealed significant disparities?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 05:20:15.319239+00', '2025-11-09 05:20:15.319239+00', NULL, 'd47d78b4-94fb-4a44-8cfe-15ee6f15b9e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1b216cc6-c671-4183-a739-5069600ddfa1', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'What is Anti-Black Racism?', 'what-is-anti-black-racism', 'Define anti-Black racism and distinguish it from general racism and discrimination.', 'video', 'https://example.com/videos/abr-definition.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 05:15:21.37912+00', '2025-11-09 05:15:21.37912+00', NULL, '3b42512a-4c2a-4531-8f46-48fc43aac8a5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('93bfad4d-291c-4997-9721-3a9a61258522', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'The Canadian Context: Historical Overview', 'canadian-context-history', 'Examine the history of Black Canadians from enslavement to present day.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# The Canadian Context: Historical Overview

## Introduction

While Canada often portrays itself as a haven from slavery and discrimination, the reality is far more complex. Anti-Black racism has deep historical roots in Canada, dating back to the 1600s.

## Slavery in Canada (1628-1834)

- **New France Era**: Slavery was legal in New France from 1628
- **British Colonial Period**: Continued under British rule after 1763
- **Scale**: Over 4,000 enslaved people documented in Canada
- **Abolition**: 1834, though informal practices persisted

## Key Historical Periods

### 1. Post-Abolition Era (1834-1900)
- Segregated schools, churches, and public facilities
- Exclusionary immigration policies
- Limited economic opportunities

### 2. Early 20th Century (1900-1960)
- **1911**: Immigration Act explicitly restricted Black immigration
- **Viola Desmond (1946)**: Challenged segregation in Nova Scotia
- **Restrictive covenants**: Prevented Black families from buying property

### 3. Civil Rights Era (1960-1980)
- **1960**: Canadian Bill of Rights introduced
- **1962**: Immigration reforms removed racial restrictions
- **1971**: Multiculturalism policy adopted

### 4. Contemporary Period (1980-Present)
- Ongoing systemic barriers in employment, education, housing
- Over-policing and carding practices
- Anti-Black racism in institutions

## Impact on Black Communities Today

The legacy of this history manifests in:
- **Economic disparities**: Lower median incomes, higher unemployment
- **Educational barriers**: Lower graduation rates, streaming
- **Health inequities**: Higher maternal mortality, mental health challenges
- **Justice system**: Over-representation in prisons
- **Housing**: Discrimination in rental and purchase markets

## Key Takeaway

Understanding this history is essential to recognizing that anti-Black racism in Canada is not imported or incidental—it is homegrown and systemic.

## Reflection Questions

1. What surprised you most about Canada''s history with slavery and segregation?
2. How does this history connect to present-day inequities you''ve observed?
3. What role does Canadian mythology about being "better than the US" play in denying our own racism?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:21.447994+00', '2025-11-09 05:15:21.447994+00', NULL, '3b42512a-4c2a-4531-8f46-48fc43aac8a5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('09d1561b-bd4a-4dd1-9ca6-0a021710e6c1', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Systemic vs. Individual Racism', 'systemic-vs-individual', 'Learn to differentiate between individual prejudice and systemic discrimination.', 'video', 'https://example.com/videos/systemic-racism.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:21.494492+00', '2025-11-09 05:15:21.494492+00', NULL, '3b42512a-4c2a-4531-8f46-48fc43aac8a5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('65669f47-5942-428b-9a2f-b6db6275b01e', '21493075-7bbf-41cd-a938-0119007db4d2', 'Bystander Intervention', 'bystander-intervention', 'How to intervene when you witness microaggressions.', 'video', 'https://example.com/videos/bystander-micro.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:35.005872+00', '2025-11-09 05:15:35.005872+00', NULL, '7a698229-17e7-467b-84d4-74439cc4a8d0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('81359ca4-cb7a-4155-b816-605cd5eeb776', '896de482-9231-4d59-8a5a-047b95926a1a', 'Assessing Your Organization''s Current State', 'assessing-current-state', 'Tools and frameworks for conducting a racial equity audit.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Assessing Your Organization''s Current State

## Why Assessment Matters
Before implementing change, you must understand your starting point. A comprehensive racial equity assessment reveals gaps, barriers, and opportunities.

## Key Assessment Areas

### 1. Workforce Demographics
- Representation at all levels (entry, mid-level, leadership, executive)
- Retention and turnover rates by race
- Promotion rates and time-to-promotion
- **Questions to ask**: Are Black employees represented proportionally? Where are the gaps?

### 2. Hiring Practices
- Applicant pool diversity
- Interview-to-hire ratios by race
- Job description language and requirements
- Recruitment channels and outreach
- **Red flags**: "Culture fit" criteria, unpaid internships, overly restrictive requirements

### 3. Compensation and Benefits
- Pay equity analysis by race and role
- Bonus and incentive distribution
- Benefits utilization patterns
- **Look for**: Unexplained pay gaps, benefits that exclude certain groups

### 4. Workplace Culture
- Employee engagement scores by race
- Exit interview data
- Reported incidents of discrimination
- Participation in ERGs and initiatives
- **Indicators**: Lower engagement among Black employees, disproportionate departures

### 5. Policies and Practices
- Performance evaluation systems
- Flexible work policies
- Dress code and appearance standards
- Disciplinary procedures
- **Examine**: Subjective criteria, unequal application, culturally biased standards

## Assessment Tools

### Quantitative Data
- HRIS data analysis
- Pay equity studies
- Turnover analysis
- Promotion tracking

### Qualitative Data
- Employee surveys (ensure anonymity)
- Focus groups with Black employees
- Exit interviews
- Cultural competency assessments

### External Benchmarking
- Industry standards
- Regional demographics
- Best-in-class organizations

## Conducting the Assessment

### Step 1: Secure Leadership Commitment
Ensure executives understand the importance and support the process.

### Step 2: Assemble the Right Team
Include HR, DEI leads, Black employees, and external consultants if needed.

### Step 3: Collect Data
Gather quantitative and qualitative information systematically.

### Step 4: Analyze Findings
Look for patterns, disparities, and root causes.

### Step 5: Share Results Transparently
Communicate findings honestly with the organization.

### Step 6: Develop Action Plan
Create specific, measurable goals based on assessment results.

## Common Pitfalls to Avoid
- **Defensiveness**: Don''t dismiss findings as "not that bad"
- **Analysis paralysis**: Don''t delay action while seeking perfect data
- **Siloing**: Don''t limit assessment to HR; examine all business functions
- **Superficiality**: Go beyond surface metrics to understand root causes
- **Ignoring Black voices**: Center Black employees'' lived experiences

## Reflection Questions
1. What existing data does your organization have about racial equity?
2. What are the biggest gaps in your current understanding?
3. Who needs to be involved in the assessment process?
4. How will you ensure findings lead to action rather than reports that sit on shelves?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 05:20:15.350027+00', '2025-11-09 05:20:15.350027+00', NULL, '00845880-1a5a-4928-95b4-83fc41bc3e35', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4a9ea715-1872-403c-8a33-64dc3d0e693c', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Data Privacy and Security', 'data-privacy-security', 'Protecting employee data while enabling equity analysis.', 'video', 'https://example.com/videos/data-privacy.mp4', '{}', 480, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 05:20:15.374031+00', '2025-11-09 05:20:15.374031+00', NULL, 'd47d78b4-94fb-4a44-8cfe-15ee6f15b9e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b29defba-7997-4bd7-81fa-2c4966b9278d', '896de482-9231-4d59-8a5a-047b95926a1a', 'Change Management Principles', 'change-management-principles', 'Applying change management frameworks to racial equity initiatives.', 'video', 'https://example.com/videos/change-management.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 05:20:15.406909+00', '2025-11-09 05:20:15.406909+00', NULL, '00845880-1a5a-4928-95b4-83fc41bc3e35', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('682c98e8-d287-432e-8106-e4a1a95ad2de', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Core Equity Metrics', 'core-equity-metrics', 'The essential metrics every organization should track.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Core Equity Metrics

## The Essential Dashboard
To understand and address racial equity, track these core metrics for Black employees compared to overall workforce:

## 1. Representation Metrics

### Overall Representation
**What to measure**: Percentage of Black employees in total workforce
**Why it matters**: Basic indicator of diversity
**How to calculate**: (# Black employees / # total employees) × 100
**Target**: At minimum, reflect regional demographics; ideally exceed them to counteract historical exclusion

### Representation by Level
**What to measure**: Percentage of Black employees at each level (entry, mid, senior, executive, C-suite, board)
**Why it matters**: Reveals whether Black employees can advance or are concentrated at lower levels
**How to calculate**: For each level: (# Black employees at level / # total employees at level) × 100
**Red flag**: "Pyramid" pattern - higher representation at entry level that decreases at each level up

### Representation by Department/Function
**What to measure**: Percentage of Black employees in each business unit
**Why it matters**: Shows whether Black employees are clustered in certain areas or excluded from others
**Look for**: Under-representation in high-status or high-earning functions (e.g., engineering, leadership, strategy)

## 2. Hiring Metrics

### Applicant Pool Diversity
**What to measure**: Percentage of Black applicants compared to total applicants
**Why it matters**: Can''t hire diverse workforce without diverse applicant pool
**Indicates**: Whether recruitment strategies reach Black candidates

### Interview Rates
**What to measure**: Percentage of Black applicants who advance to interviews
**Why it matters**: Reveals potential bias in resume screening
**Calculate**: (# Black applicants interviewed / # Black applicants) ÷ (# total applicants interviewed / # total applicants)
**Red flag**: Black applicants advance at lower rates than other applicants

### Offer Rates
**What to measure**: Percentage of Black interviewees who receive offers
**Why it matters**: Reveals potential bias in interview/selection process
**Calculate**: (# Black candidates offered / # Black candidates interviewed) ÷ (# total candidates offered / # total candidates interviewed)

### Acceptance Rates
**What to measure**: Percentage of Black candidates who accept offers
**Why it matters**: May indicate concerns about organizational culture
**If low**: Black candidates may have concerns about inclusion/belonging

### Time-to-Hire
**What to measure**: Average days from application to hire for Black vs. other candidates
**Why it matters**: Delays may cause loss of candidates to other opportunities
**Look for**: Disparities suggesting different treatment

## 3. Promotion Metrics

### Promotion Rates
**What to measure**: Percentage of Black employees promoted in a given period
**Why it matters**: Core indicator of equity in advancement
**Calculate**: (# Black employees promoted / # Black employees eligible) ÷ (# total employees promoted / # total employees eligible)
**Red flag**: Black employees promoted at lower rates despite equal or better performance

### Time-to-Promotion
**What to measure**: Average time in role before promotion for Black vs. other employees
**Why it matters**: Shows whether Black employees must "prove themselves" longer
**Look for**: Black employees taking longer to advance to same level

### Representation in High-Potential/Succession Plans
**What to measure**: Percentage of Black employees identified as high-potential or in succession plans
**Why it matters**: Shows who is being developed for leadership
**Often overlooked**: Many organizations don''t track this but it''s critical

## 4. Retention Metrics

### Turnover Rate
**What to measure**: Percentage of Black employees who leave in a given period
**Why it matters**: Core indicator of inclusion; high turnover is costly
**Calculate**: (# Black employees who left / average # Black employees) × 100
**Compare**: Black vs. overall turnover rates

### Voluntary vs. Involuntary
**What to measure**: Whether turnover is voluntary (employee chose to leave) or involuntary (termination)
**Why it matters**: Different implications for equity
**Red flag**: Higher involuntary turnover for Black employees may indicate bias in performance evaluation or discipline

### Tenure
**What to measure**: Average length of employment for Black vs. other employees
**Why it matters**: Shows whether Black employees are leaving earlier
**Look at**: Tenure by level (early exits of Black leaders particularly concerning)

### Exit Reasons
**What to measure**: Why Black employees are leaving (from exit interviews or surveys)
**Why it matters**: Reveals specific barriers or issues
**Common themes**: Lack of belonging, limited advancement, discrimination, better opportunities elsewhere

### Regrettable vs. Non-Regrettable
**What to measure**: Of those who left, how many were high performers the organization wanted to retain?
**Why it matters**: Loss of high-performing Black employees is particularly concerning
**If high**: Suggests talented Black employees don''t see path forward

## 5. Compensation Metrics

### Pay Equity
**What to measure**: Average compensation for Black vs. other employees in same roles
**Why it matters**: Core indicator of equity; legal requirement in many jurisdictions
**How to analyze**: Compare pay for same role, level, location, tenure
**Red flag**: Unexplained gaps (after accounting for legitimate factors like experience)

### Bonus/Incentive Distribution
**What to measure**: Percentage of Black employees receiving bonuses and average bonus amounts
**Why it matters**: Bonuses/incentives can be significant part of compensation and more subjective
**Look for**: Lower participation rates or smaller bonuses for Black employees

### Starting Salary
**What to measure**: Average starting salary for new hires by race
**Why it matters**: Salary compression - entering at lower salary impacts lifetime earnings
**Be aware**: Asking about salary history perpetuates inequities

## 6. Performance Evaluation Metrics

### Performance Ratings Distribution
**What to measure**: Percentage of Black employees at each performance rating level
**Why it matters**: Shows whether Black employees are rated fairly
**Red flag**: Black employees disproportionately in lower rating categories despite no objective reason
**Also watch**: "Clustering" - Black employees over-represented in middle ratings, limiting access to top ratings needed for promotion

### Rating Changes
**What to measure**: How often Black employees'' performance ratings improve, decline, or stay stable
**Why it matters**: Reveals patterns in how Black employees are perceived over time

## 7. Development Metrics

### Training Participation
**What to measure**: Percentage of Black employees participating in professional development
**Why it matters**: Development opportunities drive advancement
**Look for**: Equal access and participation rates

### Mentorship/Sponsorship
**What to measure**: Percentage of Black employees with mentors or sponsors
**Why it matters**: Informal relationships drive career advancement
**Often unmeasured**: But critical for equity

## 8. Engagement/Belonging Metrics

### Engagement Scores
**What to measure**: Employee engagement survey results by race
**Why it matters**: Shows how Black employees experience workplace
**Key questions**: 
- "I feel I belong here"
- "I can be my authentic self"
- "I''m treated fairly"
- "I see path for advancement"

### Inclusion Index
**What to measure**: Composite score of inclusion-related survey questions
**Why it matters**: Direct measurement of inclusive culture

## Analyzing the Data

### Look for Patterns
- **Disparities**: Where are outcomes different for Black vs. other employees?
- **Trends**: Are gaps widening or narrowing over time?
- **Intersections**: How do race and gender interact? (Black women often face unique barriers)

### Context Matters
- **Small numbers**: With small populations, percentages can be volatile
- **Regional demographics**: Compare to relevant labor market, not national averages
- **Industry benchmarks**: How do you compare to similar organizations?

### Root Cause Analysis
When you find disparities, ask why:
- **What policies or practices might contribute?**
- **Where in the process do gaps emerge?**
- **Who makes decisions at that point?**
- **What criteria are used?**

## Reflection Questions
1. Which of these metrics does your organization currently track?
2. Where do you predict you might find disparities?
3. What would you do if you found significant gaps in promotion rates?
4. How often should these metrics be reviewed?', NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 05:20:15.500666+00', '2025-11-09 05:20:15.500666+00', NULL, '6abf106b-8f06-4419-ab8a-b566ab568694', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1dadd281-b007-4238-9c2e-12e5b910e361', '896de482-9231-4d59-8a5a-047b95926a1a', 'Policy Review Through a Racial Equity Lens', 'policy-review-equity-lens', 'How to evaluate existing policies for racial equity impact.', 'video', 'https://example.com/videos/policy-review.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 05:20:15.548061+00', '2025-11-09 05:20:15.548061+00', NULL, 'ff6ce6d1-4cfd-47b6-85c1-9c26e12cd5c4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('cf230773-228a-49ea-81dc-662a5a881507', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Analyzing and Interpreting Equity Data', 'analyzing-interpreting-data', 'How to conduct meaningful analysis of equity metrics.', 'video', 'https://example.com/videos/analyzing-data.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 05:20:15.549956+00', '2025-11-09 05:20:15.549956+00', NULL, '6abf106b-8f06-4419-ab8a-b566ab568694', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('796afe76-8244-49b9-b688-f5fae40a1cf6', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Quiz: Equity Metrics', 'quiz-equity-metrics', 'Test your understanding of key equity metrics.', 'quiz', NULL, '{"questions": [{"options": ["It''s required by law", "It reveals whether Black employees can advance or are concentrated at lower levels", "It makes the reports longer", "It''s easier to calculate"], "question": "Why is it important to track representation by level, not just overall?", "explanation": "Overall representation can mask inequity. An organization might have good overall representation but if Black employees are concentrated at entry level and absent from leadership, that indicates barriers to advancement.", "correct_answer": 1}, {"options": ["Black employees are less committed", "The organization is doing a good job of hiring", "Black employees may not feel included or see opportunities for advancement", "Salaries are too high"], "question": "What does high voluntary turnover among Black employees typically indicate?", "explanation": "High voluntary turnover among Black employees often signals issues with inclusion, belonging, advancement opportunities, or experiencing discrimination. It''s a red flag that requires investigation.", "correct_answer": 2}, {"options": ["It''s easier", "It''s required by law", "To ensure you''re comparing similar jobs and isolating any unexplained gaps", "To make the organization look better"], "question": "When analyzing pay equity, why is it important to compare employees in the same role and level?", "explanation": "Pay equity analysis must compare like-to-like (same role, level, location, experience) to determine if there are unexplained gaps based on race. Comparing across different roles doesn''t reveal pay discrimination.", "correct_answer": 2}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 05:20:15.592626+00', '2025-11-09 05:20:15.592626+00', NULL, '6abf106b-8f06-4419-ab8a-b566ab568694', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('dbc58c4d-74fb-4964-93d1-b1cb77ceba08', '896de482-9231-4d59-8a5a-047b95926a1a', 'Writing Inclusive Policies', 'writing-inclusive-policies', 'Best practices for drafting policies that promote equity.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Writing Inclusive Policies

## The Foundation: Equity vs. Equality
Inclusive policies recognize that equal treatment doesn''t always lead to equitable outcomes. Effective policies acknowledge different starting points and remove barriers.

## Key Principles

### 1. Clarity and Accessibility
- Use plain language, not legal jargon
- Make policies available in multiple languages
- Ensure readability for all education levels
- **Example**: Instead of "utilize", say "use"

### 2. Specificity
- Define terms clearly (e.g., what counts as "discrimination"?)
- Provide concrete examples
- Outline clear processes and timelines
- **Bad**: "Discrimination will not be tolerated"
- **Good**: "Discrimination based on race includes [specific behaviors]. Employees can report incidents to [specific person] within [timeframe]."

### 3. Proactive Rather Than Reactive
- Don''t just prohibit discrimination; actively promote equity
- Include affirmative measures, not just prohibitions
- **Example**: Not just "no discrimination in hiring" but "actively recruit from HBCUs and Black professional networks"

### 4. Accountability Mechanisms
- Assign clear responsibility
- Include enforcement procedures
- Specify consequences for violations
- Establish review and update cycles

## Common Policy Areas

### Recruitment and Hiring
**Inclusive elements**:
- Diverse interview panels required
- Structured interviews with standardized questions
- Removal of degree requirements where not essential
- Paid internships and apprenticeships
- Ban-the-box provisions
- Expanded recruitment to HBCUs and community organizations

### Compensation
**Inclusive elements**:
- Regular pay equity audits
- Transparent salary bands
- Standardized promotion criteria
- Prohibit salary history questions

### Performance Management
**Inclusive elements**:
- Multiple evaluators to reduce bias
- Clear, objective performance criteria
- Regular feedback, not just annual reviews
- Training for managers on bias in evaluations

### Professional Development
**Inclusive elements**:
- Equitable access to training and mentorship
- Sponsorship programs for Black employees
- Support for external professional development
- Leadership development pipelines

### Flexible Work
**Inclusive elements**:
- Available to all levels, not just executives
- Clear eligibility criteria
- No penalty for usage
- Accommodation for caregiving responsibilities

### Dress Code and Grooming
**Inclusive elements**:
- Allow natural Black hairstyles
- No restrictions on locs, braids, twists, afros
- Avoid culturally biased terms like "professional" appearance
- Focus on safety requirements only where relevant

## The Policy Development Process

### Step 1: Research and Consultation
- Review best practices
- Consult with Black employees and ERGs
- Examine legal requirements
- Analyze current gaps

### Step 2: Drafting
- Use inclusive language
- Include input from diverse stakeholders
- Have Black employees review for blind spots
- Consider unintended consequences

### Step 3: Review and Approval
- Legal review for compliance
- Leadership approval
- Union consultation if applicable

### Step 4: Communication and Training
- Clear rollout plan
- Training for all affected staff
- Accessible policy repository
- Regular reminders and reinforcement

### Step 5: Implementation and Monitoring
- Track compliance
- Collect feedback
- Measure outcomes
- Adjust as needed

## Red Flags in Policies

Watch out for:
- **Subjective criteria**: "Professional appearance," "culture fit," "leadership presence"
- **Gatekeeping**: Unnecessary degree requirements, unpaid internships
- **Unequal application**: Different standards for different groups
- **Lack of accountability**: No consequences for violations
- **Vague language**: "As appropriate," "when possible"

## Case Study: Dress Code Reform

**Before**: "Employees must maintain a professional appearance at all times. Extreme or distracting hairstyles are prohibited."

**Issues**: 
- "Professional" is culturally coded as white/Eurocentric
- "Extreme" or "distracting" are subjective
- Likely to be enforced discriminately against Black hairstyles

**After**: "Employees may wear any hairstyle they choose. For safety reasons, employees in [specific roles] must secure long hair while operating machinery."

**Impact**: 
- Clear, objective criteria
- No culturally biased language
- Safety requirements only where necessary

## Reflection Questions
1. What policies in your organization might have disparate impact on Black employees?
2. How can you involve Black employees in policy review and development?
3. What accountability mechanisms are needed to ensure policies are followed?
4. How often should policies be reviewed and updated?', NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 05:20:15.597181+00', '2025-11-09 05:20:15.597181+00', NULL, 'ff6ce6d1-4cfd-47b6-85c1-9c26e12cd5c4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ca3479c5-3f46-4495-8a44-26869925c546', '896de482-9231-4d59-8a5a-047b95926a1a', 'Implementation and Accountability', 'implementation-accountability', 'Ensuring policies are enforced consistently and effectively.', 'video', 'https://example.com/videos/policy-implementation.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 05:20:15.651728+00', '2025-11-09 05:20:15.651728+00', NULL, 'ff6ce6d1-4cfd-47b6-85c1-9c26e12cd5c4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c70332f5-90ce-42e0-8758-f2f199d8669d', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Creating Effective Equity Reports', 'creating-equity-reports', 'Best practices for equity reporting and data visualization.', 'video', 'https://example.com/videos/equity-reports.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 05:20:15.697077+00', '2025-11-09 05:20:15.697077+00', NULL, 'd36d769a-86dc-4782-b588-877967ac825e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b0fe340c-0b92-4801-a879-dabba920d16c', '896de482-9231-4d59-8a5a-047b95926a1a', 'What Inclusive Culture Really Means', 'what-inclusive-culture-means', 'Moving beyond diversity to true inclusion and belonging.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# What Inclusive Culture Really Means

## Beyond "Diversity"
Many organizations focus on diversity—getting Black people in the door—without creating inclusive cultures where they can thrive. True inclusion means Black employees feel valued, respected, and able to bring their full selves to work.

## The Spectrum

### Diversity
**Definition**: Representation of different groups
**What it looks like**: Hiring Black employees
**Limitation**: Doesn''t address whether they feel welcome or can succeed

### Inclusion
**Definition**: Actively involving and valuing all employees
**What it looks like**: Black employees participate fully in decisions and opportunities
**Limitation**: May still operate within dominant culture norms

### Belonging
**Definition**: Feeling accepted for who you are
**What it looks like**: Black employees don''t have to code-switch or minimize their identity
**Goal**: This is what we''re aiming for

### Equity
**Definition**: Fair access to opportunities and resources
**What it looks like**: Systems and policies that account for different starting points and barriers
**Critical**: Must accompany inclusion to create real change

## Characteristics of Inclusive Culture

### 1. Psychological Safety
Black employees can:
- Speak up without fear of retaliation
- Disagree with managers respectfully
- Report discrimination without career consequences
- Make mistakes without harsher judgment than white peers
- Express their authentic selves

### 2. Equitable Opportunities
- Promotions and development based on clear criteria, not "potential" or "fit"
- Access to high-visibility projects and sponsors
- Mentorship and networking opportunities
- Fair distribution of desirable assignments

### 3. Respect for Identity
- Black culture and communication styles are valued, not just tolerated
- Black hair is celebrated, not policed
- Cultural holidays and events are recognized
- No pressure to assimilate to white norms

### 4. Accountability
- Leadership takes racism seriously
- Swift response to incidents
- Consequences for discriminatory behavior
- Regular measurement and transparency

### 5. Shared Power
- Black employees in decision-making roles
- Input sought and valued on organizational direction
- Resources allocated to Black-led initiatives
- Authentic partnership, not tokenism

## What Inclusive Culture Is NOT

### X Not: "Celebrating" Black History Month
**Why it''s insufficient**: One month of recognition doesn''t address systemic barriers the other 11 months.
**Better**: Year-round commitment to equity in hiring, promotion, and pay.

### X Not: A Black employee in a senior role
**Why it''s insufficient**: Tokenism without changing systems.
**Better**: Multiple Black leaders at all levels with genuine authority and support.

### X Not: Diversity training
**Why it''s insufficient**: Training alone doesn''t change culture without policy and accountability.
**Better**: Training plus systemic changes, measurement, and consequences.

### X Not: "Colorblind" approach
**Why it''s insufficient**: Ignoring race means ignoring racism.
**Better**: Actively anti-racist culture that acknowledges and addresses racial dynamics.

### X Not: Relying on Black employees to fix racism
**Why it''s insufficient**: Places burden on those already harmed.
**Better**: White leadership taking ownership of change.

## Building Blocks of Inclusive Culture

### Leadership Commitment
- Visible, vocal support from executives
- Personal accountability for equity goals
- Resources allocated to equity work
- Willingness to make hard decisions

### Clear Values and Expectations
- Anti-racism explicitly stated as organizational value
- Behavioral expectations defined
- Integration into performance evaluations
- Consistent messaging and modeling

### Systems and Structures
- Equity embedded in all policies and processes
- Regular audits and assessments
- Data-driven decision making
- Accountability mechanisms

### Employee Voice and Agency
- Black employees have platforms to be heard
- Feedback is acted upon, not just collected
- ERGs are resourced and influential
- Co-creation of solutions

### Continuous Learning
- Ongoing education on anti-racism
- Space for mistakes and growth
- Willingness to be uncomfortable
- Humility and openness to feedback

## Measuring Inclusive Culture

### Quantitative Indicators
- Representation across levels
- Retention and turnover rates
- Promotion rates
- Pay equity
- Employee engagement scores

### Qualitative Indicators
- Exit interview themes
- Stay interview insights
- Employee survey comments
- Participation in ERGs and initiatives
- Reported incidents and resolutions

### Behavioral Indicators
- Who speaks in meetings?
- Who gets interrupted?
- Whose ideas are credited?
- Who socializes with whom?
- Who gets development opportunities?

## The Journey
Building inclusive culture is ongoing work, not a destination. It requires:
- **Patience**: Culture change takes time
- **Persistence**: Setbacks will happen
- **Honesty**: Face hard truths
- **Courage**: Make unpopular decisions
- **Humility**: Listen and learn

## Reflection Questions
1. On the diversity-to-equity spectrum, where is your organization?
2. What would Black employees say about the culture?
3. What''s one concrete step you could take this month to build more inclusive culture?
4. Who are your allies in this work?', NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 05:20:15.792619+00', '2025-11-09 05:20:15.792619+00', NULL, '2e9b5e55-5dea-4f75-97a1-8b19c23010e6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b86dc4cd-169c-48d8-a4ed-d6b9700d77d9', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Final Assessment', 'final-assessment', 'Comprehensive assessment of course learning.', 'quiz', NULL, '{"questions": [{"options": ["Only affects racist people", "Can be completely eliminated with training", "Exists in everyone and requires ongoing work to address", "Is not relevant to anti-Black racism"], "question": "Unconscious bias:", "explanation": "Unconscious bias affects everyone due to societal conditioning. Recognizing and actively working to counter these biases is an ongoing process.", "correct_answer": 2}, {"options": ["Your own comfort", "The safety and wishes of the person experiencing racism", "Not making a scene", "Proving you are not racist"], "question": "When witnessing anti-Black racism, the most important consideration is:", "explanation": "The safety and preferences of the person experiencing racism should guide your intervention. Sometimes direct intervention can escalate harm.", "correct_answer": 1}, {"options": ["\"I''m not racist, I have Black friends\"", "\"I''m sorry you felt that way\"", "\"I apologize for the harm I caused. I will educate myself and do better\"", "\"You''re too sensitive\""], "question": "Which statement reflects accountability after making a racist mistake?", "explanation": "True accountability involves acknowledging harm without defensiveness, taking responsibility, and committing to change without burdening the harmed person with your education.", "correct_answer": 2}, {"options": ["A one-time training", "Only for Black people to do", "A lifelong commitment requiring continuous learning and action", "Complete once you understand the issues"], "question": "Anti-racism work is:", "explanation": "Anti-racism is ongoing work that requires continuous learning, unlearning, and action. It is never \"complete\" because society and we ourselves are always evolving.", "correct_answer": 2}], "passing_score": 85, "time_limit_minutes": 20}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 05:15:22.136882+00', '2025-11-09 05:15:22.136882+00', NULL, '3b168004-9cc9-46f0-85be-1863443b4787', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('992f91cd-e22b-4522-bdb3-eac8392f95e7', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'The Canadian Charter of Rights and Freedoms', 'canadian-charter', 'Overview of Charter rights, particularly Section 15 equality rights.', 'video', 'https://example.com/videos/charter-rights.mp4', '{}', 840, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 05:15:29.670638+00', '2025-11-09 05:15:29.670638+00', NULL, '617e1e1f-046e-45a9-b48e-fd2b47a6f055', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6e736c2e-63e0-4f0d-b23c-3458061f0874', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Section 15: Equality Rights Explained', 'section-15-equality', 'Deep dive into equality rights and protection from discrimination.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Section 15: Equality Rights

## The Text

**Section 15(1)** of the Canadian Charter states:

> "Every individual is equal before and under the law and has the right to the equal protection and equal benefit of the law without discrimination and, in particular, without discrimination based on race, national or ethnic origin, colour, religion, sex, age or mental or physical disability."

## Key Principles

### 1. Formal vs. Substantive Equality
- **Formal Equality**: Treating everyone the same
- **Substantive Equality**: Recognizing different needs and circumstances
- Courts have adopted substantive equality approach

### 2. Enumerated and Analogous Grounds
**Explicitly listed grounds:**
- Race
- National or ethnic origin
- Colour
- Religion
- Sex
- Age
- Mental or physical disability

**Analogous grounds** (added by courts):
- Sexual orientation
- Citizenship status
- Marital status
- Off-duty conduct

### 3. Adverse Effects Discrimination
Discrimination can occur even with neutral policies if they have disproportionate impact on protected groups.

## Landmark Cases

### Andrews v. Law Society of BC (1989)
- Established substantive equality approach
- Citizenship requirement for lawyers struck down
- Set framework for Section 15 analysis

### Law v. Canada (1999)
- Created three-part test for discrimination
- Must show differential treatment
- Based on enumerated/analogous ground
- Creates disadvantage or stereotyping

### R v. Kapp (2008)
- Simplified Section 15 analysis
- Focus on perpetuating disadvantage
- Recognized ameliorative programs

## Application to Anti-Black Racism

Section 15 protects against racial discrimination including:
- **Employment**: Hiring, promotion, termination decisions
- **Services**: Access to government services and programs
- **Education**: Streaming, discipline, accommodation
- **Justice**: Bail decisions, sentencing, police conduct

## Limitations

### Section 1: Reasonable Limits
Government can justify discrimination if:
1. Objective is pressing and substantial
2. Means are proportional to objective
3. Minimal impairment of rights
4. Benefits outweigh harms

### Examples of Justified Limits:
- Mandatory retirement ages for certain occupations
- Affirmative action programs
- Security screening procedures

## Practical Impact

**What Section 15 Does:**
✓ Prohibits government discrimination
✓ Requires equal treatment in laws
✓ Allows positive discrimination (affirmative action)
✓ Provides constitutional remedy

**What Section 15 Doesn''t Do:**
✗ Apply to private relationships (use human rights codes instead)
✗ Guarantee equal outcomes
✗ Eliminate all disparities immediately
✗ Create positive obligations on government to provide services

## Reflection Questions

1. Why did courts move from formal to substantive equality?
2. How does Section 15 interact with human rights legislation?
3. What are the limits of constitutional protection against racism?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:29.738907+00', '2025-11-09 05:15:29.738907+00', NULL, '617e1e1f-046e-45a9-b48e-fd2b47a6f055', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e69ca330-4a9b-49b1-a869-35d8ec11a1e2', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Constitutional Remedies and Litigation', 'constitutional-remedies', 'Learn about Charter challenges and Section 24 remedies.', 'video', 'https://example.com/videos/constitutional-remedies.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:29.800416+00', '2025-11-09 05:15:29.800416+00', NULL, '617e1e1f-046e-45a9-b48e-fd2b47a6f055', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('deae3eb0-d679-40c7-95d2-8ac634cd1f8b', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Canadian Human Rights Act Overview', 'chra-overview', 'Understanding federal human rights protections and the CHRC.', 'video', 'https://example.com/videos/chra-overview.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 05:15:29.922844+00', '2025-11-09 05:15:29.922844+00', NULL, '9de03b05-5278-4ed4-a48e-3660301b19b2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('24da068a-1a6e-4225-bc0a-1fe2175f095d', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Filing a Human Rights Complaint', 'filing-complaint', 'Step-by-step process for filing complaints with the CHRC.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Filing a Federal Human Rights Complaint

## When to File with Canadian Human Rights Commission

The CHRC handles complaints related to:
- **Federal government** departments and agencies
- **Federally regulated industries**: banks, telecommunications, transportation, broadcasting
- **First Nations governments** (under CHRA)

## Grounds of Discrimination

Protected grounds under CHRA:
- Race, national or ethnic origin, colour
- Religion, age, sex (including pregnancy, childbirth)
- Sexual orientation, gender identity or expression
- Marital status, family status
- Genetic characteristics
- Disability, conviction for which pardon granted

## The Complaint Process

### Step 1: Initial Assessment (0-2 weeks)
- Contact CHRC to discuss your situation
- Determine if complaint falls under CHRC jurisdiction
- Get advice on documentation needed

### Step 2: File Complaint (Online or Paper)
**Information Required:**
- Your contact information
- Details of organization/person you''re complaining about
- Discrimination ground (e.g., race)
- Area of discrimination (employment, services, etc.)
- Timeline of events
- Impact on you
- Resolution sought

**Time Limit**: Must file within 1 year of incident

### Step 3: Commission Review (3-6 months)
Commission decides whether to:
- **Accept**: Proceeds to investigation
- **Dismiss**: No reasonable basis, outside jurisdiction, or frivolous
- **Refer to Tribunal**: If evidence is clear

### Step 4: Investigation (6-12 months)
- Investigator gathers evidence from both parties
- Interviews witnesses
- Reviews documents
- Attempts conciliation/mediation

### Step 5: Report and Decision
Investigator recommends:
- **Dismiss**: Insufficient evidence
- **Settle**: Parties reach agreement
- **Refer to Tribunal**: Proceed to hearing

### Step 6: Canadian Human Rights Tribunal (if referred)
- Formal hearing (like court)
- Present evidence and witnesses
- Legal representation recommended
- Tribunal makes binding decision

## Possible Outcomes and Remedies

If complaint is substantiated:

**Compensation:**
- Lost wages and benefits
- Pain and suffering (up to $20,000)
- Willful/reckless discrimination (up to $20,000 additional)

**Systemic Remedies:**
- Policy changes
- Training programs
- Monitoring and compliance orders
- Reinstatement to employment

## Tips for Strong Complaints

### Documentation is Critical
- **Keep records**: Emails, texts, notes from conversations
- **Timeline**: Detailed chronology of events
- **Witnesses**: Names and contact info
- **Impact**: Medical records, therapy notes, financial losses

### Be Specific
- Describe exactly what happened
- Include dates, times, locations
- Name individuals involved
- Connect to protected ground

### Focus on Facts, Not Emotions
- Describe discriminatory conduct objectively
- Avoid inflammatory language
- Stick to relevant facts
- Show pattern if applicable

## Alternative Options

### Provincial Human Rights Commissions
If not federal jurisdiction:
- Each province has own human rights code
- Similar process but provincial scope
- May have different grounds or remedies

### Union Grievances
If unionized:
- File grievance through union
- May go to arbitration
- Faster than human rights process
- Limited to collective agreement violations

### Civil Lawsuit
- Can sue for damages in court
- Higher burden of proof
- More expensive and time-consuming
- No limit on damages

## Important Considerations

**Confidentiality**: CHRC process is confidential unless tribunal hearing

**Time**: Process can take 2-3 years from complaint to tribunal decision

**Representation**: You can represent yourself or hire a lawyer (legal aid may be available)

**Retaliation**: It''s illegal to retaliate against someone for filing complaint

**No Guarantee**: Not all complaints succeed—evidence and legal test must be met

## Resources

- **CHRC Website**: chrc-ccdp.gc.ca
- **Phone**: 1-888-214-1090
- **Online Portal**: For filing and tracking complaints
- **Legal Clinics**: Free legal advice (income-based)

## Reflection Questions

1. What documentation would strengthen a discrimination complaint?
2. Why might someone choose tribunal over court, or vice versa?
3. What are the pros and cons of settling vs. proceeding to hearing?', NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:29.983242+00', '2025-11-09 05:15:29.983242+00', NULL, '9de03b05-5278-4ed4-a48e-3660301b19b2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2f0212f1-ae41-480b-8ffb-434614efdc69', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Quiz: Federal Human Rights', 'quiz-federal', 'Test your knowledge of federal human rights law.', 'quiz', NULL, '{"questions": [{"options": ["All employers in Canada", "Only federal government and federally-regulated industries", "Only private companies", "Provincial governments"], "question": "The Canadian Human Rights Act applies to:", "explanation": "The CHRA applies to federal government departments/agencies and federally-regulated sectors like banks, telecom, and transportation. Provincial human rights codes cover other employers.", "correct_answer": 1}, {"options": ["30 days", "6 months", "1 year", "No time limit"], "question": "What is the time limit for filing a federal human rights complaint?", "explanation": "You must file a complaint within 1 year of the discriminatory incident, though exceptions may apply in certain circumstances.", "correct_answer": 2}, {"options": ["$10,000", "$20,000", "$50,000", "No limit"], "question": "Maximum compensation for pain and suffering in CHRC cases is:", "explanation": "The Canadian Human Rights Act sets a cap of $20,000 for pain and suffering, plus up to $20,000 additional for willful or reckless discrimination.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:30.025676+00', '2025-11-09 05:15:30.025676+00', NULL, '9de03b05-5278-4ed4-a48e-3660301b19b2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('85cacba1-52b9-4f6d-8a29-883b5bf8257d', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Ontario Human Rights Code', 'ontario-code', 'In-depth look at Ontario''s human rights protections.', 'video', 'https://example.com/videos/ontario-code.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 05:15:30.120845+00', '2025-11-09 05:15:30.120845+00', NULL, 'bdc17466-3102-4648-a839-1fe1f43d7272', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('86373132-3811-483f-a9fd-d4b5ed4dc0c5', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Provincial Variations Across Canada', 'provincial-variations', 'Compare human rights protections in different provinces.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Provincial Human Rights Codes: A Comparison

All provinces and territories have human rights legislation, but they vary in scope, grounds, and process.

## Common Features

All jurisdictions prohibit discrimination in:
- Employment
- Housing/Accommodation
- Services (goods, facilities)
- Contracts

Protected grounds universally include:
- Race, colour, ancestry
- Religion, creed
- Sex, pregnancy
- Disability
- Age

## Key Differences

### Protected Grounds

| Ground | Universal | Some Provinces |
|--------|-----------|----------------|
| Race | ✓ All | |
| Sexual orientation | ✓ All | |
| Gender identity | Most | SK, NWT recently added |
| Social condition | | QC, NWT, NU, YT |
| Political belief | | BC, QC, NB, PE, MB, YT |
| Source of income | | QC, MB, PE, NT, NU, SK |
| Criminal conviction | | QC, NWT, YT |

### Age Protections

- **Ontario**: 18+ (employment), no upper limit
- **BC**: 19+ (some exceptions at 18)
- **Alberta**: 18+
- **Quebec**: No minimum age

### Notable Provincial Distinctions

**Quebec Charter of Rights**
- Constitutional status in Quebec
- Broader than other provinces
- Includes social and economic rights
- Unique grounds: social condition, political convictions, civil status

**British Columbia**
- Strong focus on systemic discrimination
- Duty to prevent discrimination proactively
- Political belief protected

**Ontario**
- Most case law and precedents
- Social areas widely defined
- Creed includes non-religious beliefs
- Family status jurisprudence well-developed

## Complaint Processes

### Ontario (HRTO)
- Direct access to tribunal (no commission screening)
- Online filing
- Active mediation program
- Typically faster resolution

### BC (BC Human Rights Tribunal)
- Application filed directly with tribunal
- Pre-hearing conferences
- Early settlement focus

### Alberta (AHR Commission)
- Commission investigates first
- Settlement encouraged
- May dismiss without hearing
- Tribunal hearing if referred

### Quebec (Commission des droits de la personne)
- Commission investigates
- Can litigate on complainant''s behalf
- Quebec Tribunal for final hearing

## Intersecting with Employment Law

### Unionized Workplaces
- Must pursue grievance through union
- Arbitration may address human rights
- Can''t file human rights complaint if covered by collective agreement (in some provinces)

### Ontario Exception
- Can file at HRTO even if unionized
- But tribunal may defer to arbitration

## Strategic Considerations

**Choose Your Forum:**
- **Human Rights Tribunal**: No cost, remedial focus, systemic change possible
- **Court**: Higher damages possible, more expensive, longer process
- **Union Grievance**: Faster, but limited remedies

**Limitations Periods:**
- Most provinces: 1-2 years
- Clock starts from incident or when you knew/should have known
- Tribunal may extend in exceptional circumstances

## Resources by Province

**Ontario**: hrto.ca  
**BC**: bchrt.bc.ca  
**Alberta**: albertahumanrights.ab.ca  
**Quebec**: cdpdj.qc.ca  
**Manitoba**: manitobahumanrights.ca  
**Saskatchewan**: saskhuma nrights.ca  
**Nova Scotia**: humanrights.novascotia.ca  
**New Brunswick**: gnb.ca/hrc-cdp  
**Newfoundland**: thinkhumanrights.ca  
**PEI**: peihumanrights.ca

## Case Study: Comparing Approaches

**Scenario**: Black employee denied promotion based on race

**Ontario HRTO Approach:**
- Direct filing, no screening
- Mediation offered quickly
- Hearing within 12-18 months
- Remedies: compensation, promotion order, policy changes

**Alberta Approach:**
- Commission investigates
- Settlement attempted
- May dismiss if insufficient evidence
- Tribunal hearing only if referred
- Timeline: 18-24+ months

## Reflection Questions

1. Why might provincial codes differ in protected grounds?
2. What are advantages of direct-access tribunals vs. commission screening?
3. How does Quebec''s unique approach reflect its legal tradition?', NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:30.166533+00', '2025-11-09 05:15:30.166533+00', NULL, 'bdc17466-3102-4648-a839-1fe1f43d7272', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('db775eef-fb60-4f1d-9cd0-4c36f2c4d605', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Final Assessment', 'final-assessment', 'Comprehensive assessment of Canadian human rights law.', 'quiz', NULL, '{"questions": [{"options": ["Canadian Human Rights Act", "Charter of Rights and Freedoms", "Provincial human rights codes", "Employment Standards Act"], "question": "Which document provides constitutional protection against discrimination by government?", "explanation": "The Charter of Rights and Freedoms (particularly Section 15) provides constitutional protection against government discrimination.", "correct_answer": 1}, {"options": ["Treating everyone exactly the same", "Recognizing different needs and circumstances to achieve true equality", "Equal outcomes for all groups", "Reverse discrimination"], "question": "Substantive equality means:", "explanation": "Substantive equality recognizes that treating everyone identically may perpetuate inequality. It focuses on eliminating disadvantage and accommodating differences.", "correct_answer": 1}, {"options": ["Provincial human rights tribunal", "Canadian Human Rights Commission", "Employment Standards branch", "Labour Board"], "question": "A federally-regulated bank employee experiencing racial discrimination should file a complaint with:", "explanation": "Federal employees and those in federally-regulated industries fall under the Canadian Human Rights Act and should file with the CHRC.", "correct_answer": 1}, {"options": ["Cannot file a human rights complaint", "Must pursue only through union grievance", "Can file at HRTO even if covered by collective agreement", "Must choose between grievance and HRTO"], "question": "In Ontario, a unionized employee experiencing discrimination:", "explanation": "Ontario allows unionized employees to file at HRTO even if the issue is covered by their collective agreement, though the tribunal may defer to arbitration.", "correct_answer": 2}], "passing_score": 80, "time_limit_minutes": 20}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:30.213728+00', '2025-11-09 05:15:30.213728+00', NULL, 'bdc17466-3102-4648-a839-1fe1f43d7272', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2c46d378-0e7b-417f-b33c-581d4300cb13', '21493075-7bbf-41cd-a938-0119007db4d2', 'What Are Microaggressions?', 'what-are-microaggressions', 'Define microaggressions and understand their impact.', 'video', 'https://example.com/videos/microaggressions-intro.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 05:15:34.654395+00', '2025-11-09 05:15:34.654395+00', NULL, 'd67e5fd2-bc0c-4e4a-addc-72c90a6fced9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e9287e7f-137e-4692-916a-1e2b0d34b65e', '21493075-7bbf-41cd-a938-0119007db4d2', 'Types of Microaggressions', 'types-microaggressions', 'Microassaults, microinsults, and microinvalidations explained.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Types of Microaggressions

## Three Categories

### 1. Microassaults
**Definition**: Explicit racial derogations—verbal or nonverbal attacks meant to hurt

**Examples:**
- Using racial slurs
- Displaying racist symbols (confederate flag, swastikas)
- Deliberately avoiding sitting next to Black person
- Purposely serving Black customers last
- "Accidentally" hitting send on racist email

**Key Feature**: Usually conscious and intentional, though perpetrator may claim otherwise

**Impact**: Most obvious and overtly hostile form

### 2. Microinsults
**Definition**: Communications that convey rudeness and insensitivity, demean a person''s racial heritage

**Examples:**
- "You''re so articulate!" (implies surprise that Black person speaks well)
- "Where are you really from?" (implies doesn''t belong)
- "Can I touch your hair?" (treating as exotic object)
- Clutching purse when Black person approaches
- Following Black customers in stores
- Asking Black colleague to speak for entire race

**Key Feature**: Often unconscious, perpetrator unaware of hidden message

**Impact**: Subtle but cumulative psychological toll

### 3. Microinvalidations  
**Definition**: Communications that exclude, negate, or nullify Black people''s thoughts, feelings, or experiential reality

**Examples:**
- "I don''t see color" (denies lived experience of racism)
- "We all experience the same challenges" (minimizes unique barriers)
- "You''re being too sensitive" (dismisses valid feelings)
- "That wasn''t about race" (denies racial reality)
- "Why do you always bring up race?" (shuts down conversation)
- Not believing accounts of racial experiences

**Key Feature**: Denies or minimizes Black people''s racial realities

**Impact**: Gaslighting effect, makes targets question their own perceptions

## Common Microaggression Themes

### Ascription of Intelligence
- Surprise at eloquence or competence
- Assumptions of lower intelligence
- Questions about qualifications
- Disbelief at academic/professional achievements

### Second-Class Citizen
- Poor service in stores/restaurants
- Being ignored or passed over
- Having credentials questioned
- Being mistaken for service staff

### Assumptions of Criminal Status
- Clutching belongings around Black people
- Security following in stores
- Being stopped by police more frequently
- Excessive ID checks

### Alien in One''s Own Land
- "Where are you from?" (especially to Black Canadians)
- "Your English is so good!"
- Assumptions about immigration status
- Being told to "go back where you came from"

### Pathologizing Cultural Values
- Tone policing
- Criticism of natural hair as "unprofessional"
- Labeling assertiveness as "aggressive"
- Calling cultural expression "ghetto" or "hood"

### Environmental Microaggressions
- Lack of Black representation in:
  - Images, posters, marketing materials
  - Leadership and decision-making roles
  - Curriculum and teaching materials
  - Staff and faculty
- Products (lack of makeup shades, "flesh-colored" as beige)
- Named spaces (buildings honoring slave owners)

## Why "Micro" is Misleading

Despite the name, these are NOT minor:
- **Frequency**: Can occur multiple times daily
- **Cumulative**: Death by a thousand cuts
- **Exhausting**: Constant vigilance and decision-making (do I address this?)
- **Invalidating**: Especially when experiences are denied
- **Health Impact**: Linked to anxiety, depression, hypertension

## Better Term: Everyday Racism

Some scholars prefer "everyday racism" because:
- "Micro" minimizes significance
- "Everyday" captures frequency and normalization
- Focuses on impact rather than intent
- Recognizes systemic nature

## The Intent vs. Impact Trap

**Perpetrator**: "I didn''t mean it that way!"  
**Reality**: Intent doesn''t negate harm

**Why this defense fails:**
- The target still experiences harm
- It centers perpetrator''s feelings
- It avoids accountability
- It prioritizes comfort over justice

**Better response**: "I understand. Help me understand the impact."

## Reflection Questions
1. Have you ever said or done something that might be a microaggression?
2. How might microaggressions affect someone''s daily experience?
3. Why is it important to address even "small" incidents?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:34.710152+00', '2025-11-09 05:15:34.710152+00', NULL, 'd67e5fd2-bc0c-4e4a-addc-72c90a6fced9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('573201cb-70e7-400e-9b59-5a03ebed1b4e', '21493075-7bbf-41cd-a938-0119007db4d2', 'The Cumulative Impact', 'cumulative-impact', 'Understanding the psychological toll of repeated microaggressions.', 'video', 'https://example.com/videos/cumulative-impact.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:34.775933+00', '2025-11-09 05:15:34.775933+00', NULL, 'd67e5fd2-bc0c-4e4a-addc-72c90a6fced9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('fb382c07-4956-4a13-abe1-3227b128706b', '21493075-7bbf-41cd-a938-0119007db4d2', 'When You''re the Target', 'when-youre-target', 'Self-care and response strategies if you experience microaggressions.', 'video', 'https://example.com/videos/target-response.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 05:15:34.902494+00', '2025-11-09 05:15:34.902494+00', NULL, '7a698229-17e7-467b-84d4-74439cc4a8d0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('31f19026-f895-4569-bb8a-0ef6efbbe68e', '21493075-7bbf-41cd-a938-0119007db4d2', 'When You''re the Perpetrator', 'when-youre-perpetrator', 'How to respond if someone points out your microaggression.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# When You''ve Committed a Microaggression

## First: Breathe and Accept Reality

You will make mistakes. Everyone does. The question is: How will you respond?

## What NOT to Do

### ❌ Deny ("That''s not what I meant")
- Centers your intent over their impact
- Dismisses their experience
- Prevents learning

### ❌ Defend ("I''m not racist, I have Black friends")
- Makes it about your identity, not your action
- Shuts down conversation
- Compounds the harm

### ❌ Deflect ("You''re being too sensitive")
- Blames the target
- Gaslights their experience
- Avoids accountability

### ❌ Demand Absolution ("Tell me I''m not racist")
- Burdens the harmed person with your emotions
- Centers your feelings
- Seeks comfort rather than understanding

### ❌ Get Angry ("How dare you accuse me")
- Intimidates the person who spoke up
- Punishes honest feedback
- Ensures they won''t tell you again

## What TO Do

### 1. Pause and Listen
- **Don''t** immediately defend
- **Do** take a breath and really hear what they''re saying
- **Remember**: This took courage for them to say

### 2. Acknowledge
- "Thank you for telling me"
- "I appreciate you taking the risk to let me know"
- No "but" afterward—just stop there

### 3. Apologize Sincerely
- "I''m sorry. That was hurtful and I should not have said/done that"
- **Don''t** say "I''m sorry you felt that way" (not an apology)
- **Don''t** explain your intent (they don''t need to hear it)
- **Do** acknowledge the harm caused

### 4. Ask (Only If Appropriate)
- "Would you be willing to help me understand why that was harmful?"
- **Important**: They are NOT obligated to educate you
- If they say no, respect that boundary
- You can research on your own time

### 5. Commit to Change
- "I will work on not doing that again"
- "I''m going to educate myself on this"
- Actually follow through—actions matter more than words

### 6. Make It Right (If Possible)
- If in a meeting, acknowledge publicly: "I need to correct something I said..."
- If there are others present, don''t let your mistake stand unchallenged
- Consider what repair looks like in this context

### 7. Move On Gracefully
- Don''t dwell on YOUR feelings
- Don''t fish for reassurance
- Just do better going forward

## Example Response

**Instead of**:  
"That''s not what I meant! You know I''m not racist! I was just trying to give you a compliment. You''re being really unfair right now."

**Try**:  
"You''re right, and I''m sorry. That was inappropriate. Thank you for letting me know—I''m going to be more mindful."

## Processing Your Feelings

It''s normal to feel:
- Embarrassed
- Defensive
- Anxious
- Ashamed
- Worried about being seen as racist

### These feelings are valid BUT
- They are YOUR responsibility to manage
- Don''t make the harmed person comfort you
- Talk to another person (ideally not a Black colleague)
- Use a therapist, friend, journal
- Sit with the discomfort—it''s how we learn

## Long-Term Growth

### Educate Yourself
- Read books by Black authors on racism
- Follow Black educators on social media
- Attend workshops and training
- Do the work—don''t expect Black colleagues to teach you

### Pay Attention
- Notice patterns in your thoughts/speech
- What assumptions do you make?
- Who do you interrupt? Who do you credit?
- Whose expertise do you question?

### Speak Up
- When you see others commit microaggressions, intervene
- Don''t just stop doing harm—actively prevent it
- Use your voice to amplify Black voices

## Remember

- **One incident doesn''t define you**—how you respond does
- **Defensiveness prevents growth**—stay open
- **Mistakes are inevitable**—learning is a choice
- **Impact matters more than intent**
- **Being called out is a gift**—most people just avoid you

## Reflection Questions

1. What''s your typical first reaction when someone corrects you? Why?
2. How can you prepare yourself to respond better in the moment?
3. What support systems can you put in place to process your feelings appropriately?', NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:34.948652+00', '2025-11-09 05:15:34.948652+00', NULL, '7a698229-17e7-467b-84d4-74439cc4a8d0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('97d83f4f-50ff-44e1-a9de-32bccc9d6983', '21493075-7bbf-41cd-a938-0119007db4d2', 'Quiz: Microaggressions', 'quiz-microaggressions', 'Test your understanding.', 'quiz', NULL, '{"questions": [{"options": ["Black Lives Matter", "I don''t see color", "Systemic racism exists", "Let me educate myself"], "question": "Which statement is a microaggression?", "explanation": "\"I don''t see color\" invalidates the lived experience of racism and suggests being Black is something to be overlooked rather than respected.", "correct_answer": 1}, {"options": ["Explain what you actually meant", "Thank them and apologize", "Ask them not to be so sensitive", "Get defensive about your intent"], "question": "If someone says you committed a microaggression, the best first response is:", "explanation": "Thank the person for telling you and apologize for the harm caused. Intent doesn''t negate impact.", "correct_answer": 1}, {"options": ["They are minor and don''t really matter", "They are small individual incidents that accumulate", "Only micromanagers do them", "They are easy to fix"], "question": "Microaggressions are called \"micro\" because:", "explanation": "The \"micro\" refers to individual incidents, but the cumulative effect is significant. Many prefer the term \"everyday racism.\"", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 05:15:35.05327+00', '2025-11-09 05:15:35.05327+00', NULL, '7a698229-17e7-467b-84d4-74439cc4a8d0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b305fbc5-fb07-44b0-8f1e-87027ee15e0b', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'What is Allyship?', 'what-is-allyship', 'Defining allyship and understanding its responsibilities.', 'video', 'https://example.com/videos/allyship-intro.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 05:15:35.177334+00', '2025-11-09 05:15:35.177334+00', NULL, 'ca284a11-33ae-44a5-89c8-5f57665c7eaa', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0f227047-b325-4ca1-957a-1c6f96a1a945', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Ally vs. Accomplice vs. Co-Conspirator', 'ally-accomplice-coconspirator', 'Understanding different levels of anti-racist action.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Ally, Accomplice, Co-Conspirator: Understanding the Spectrum

## The Evolution of Language

The term "ally" has become controversial in anti-racism work. Here''s why, and what alternatives exist.

## Ally: The Starting Point

### Definition
Someone who:
- Supports Black people and anti-racism
- Speaks out against racism when they see it
- Educates themselves about racism
- Uses their privilege to amplify Black voices

### Limitations
- **Can be performative**: Ally as identity vs. action
- **Centers the helper**: "Look at me being anti-racist!"
- **Low risk**: Comfortable forms of support
- **Passive stance**: Waiting to be asked vs. taking initiative
- **Self-appointed**: "I''m an ally!" (allies don''t name themselves; the community does)

### Example Actions
- Attending anti-racism workshops
- Sharing Black voices on social media
- Calling out racist jokes
- Reading anti-racism books

### The Problem
You don''t GET to be an ally—it''s not a badge you earn. It''s an ongoing practice that others assess based on your actions.

## Accomplice: Raising the Stakes

### Definition
Someone who:
- Takes action even when it''s uncomfortable
- Willing to take personal risks
- Works in solidarity with Black communities
- Gives up something—power, comfort, resources
- Follows the lead of Black organizers

### Key Difference
**Ally**: "I support you"  
**Accomplice**: "I''m with you, and I''m willing to sacrifice for this"

### Examples
- Using your position to block a racist policy (even if it costs you)
- Redistributing resources/power to Black colleagues
- Confronting racism in family even when relationships suffer
- Leveraging your privilege to shield Black colleagues from retaliation
- Putting your body on the line in direct action

### Higher Standard
- **Not self-appointed**: Black community recognizes your actions
- **Risk-taking**: Comfortable support isn''t enough
- **Strategic**: Acting with purpose, not performatively
- **Sustainable**: Long-term commitment, not one-time action

## Co-Conspirator: Building Together

### Definition
Someone who:
- Works in authentic partnership with Black communities
- Shares risk and accountability equally
- Dismantles systems of oppression actively
- Operates with deep trust and relationship
- Committed to transformation, not reform

### Key Difference
**Accomplice**: Shows up in critical moments  
**Co-Conspirator**: Embedded in the work long-term, building together

### Examples
- Long-term partnerships with Black-led organizations
- Using institutional access to dismantle racist policies
- Redistributing decision-making power, not just resources
- Building collective power, not being a savior
- Showing up consistently, not just in crises

### Characteristics
- **Deep relationships**: Not transactional
- **Shared risk**: Not leading from safety
- **Accountable**: To Black communities, not ego
- **Strategic**: Understanding systems and leverage points
- **Humble**: Following Black leadership

## Comparing the Three

| Aspect | Ally | Accomplice | Co-Conspirator |
|--------|------|------------|----------------|
| **Risk Level** | Low | Medium-High | High |
| **Time Commitment** | Occasional | Regular | Ongoing |
| **Personal Cost** | Minimal | Moderate | Significant |
| **Visibility** | Often public | Can be private | Behind scenes |
| **Relationship** | Supportive | Solidaristic | Partnership |
| **Leadership** | Independent | Following | Co-creating |

## The Action Continuum

### Level 1: Awareness (Ally)
- Learning about racism
- Acknowledging privilege
- Listening to Black voices

### Level 2: Education (Ally)
- Self-education
- Educating others
- Sharing resources

### Level 3: Action (Ally/Accomplice)
- Speaking up
- Donating resources
- Attending protests

### Level 4: Risk (Accomplice)
- Personal sacrifice
- Using privilege strategically
- Confronting power

### Level 5: Partnership (Co-Conspirator)
- Long-term collaboration
- Shared accountability
- Systems change

## Important Principles

### 1. Actions Over Identity
Don''t call yourself an ally/accomplice/co-conspirator. Just DO the work.

### 2. Follow Black Leadership
It''s not about you being the hero. Follow, support, amplify.

### 3. Accept That You''ll Make Mistakes
Perfect allyship doesn''t exist. Show up imperfectly but consistently.

### 4. Check Your Motives
- Are you doing this to be seen as "good"?
- Or because dismantling racism is right?
- Center the goal, not your goodness

### 5. It''s Not About Your Comfort
If you''re always comfortable, you''re not doing enough.

### 6. Build Relationships
This work happens in community, not in isolation.

### 7. Stay When It''s Hard
Allyship isn''t a trend. It''s a lifetime commitment.

## Moving Forward

**Don''t ask**: "Am I an ally?"  
**Do ask**: "Am I showing up? Am I taking risks? Am I following Black leadership?"

**Don''t say**: "I''m an ally!"  
**Do say**: "I''m committed to anti-racism. Here''s what I''m doing."

**Don''t wait**: For permission, perfect understanding, comfort  
**Do start**: Imperfectly, consistently, humbly

## Reflection Questions

1. Where are you currently on the ally-accomplice-co-conspirator spectrum?
2. What would it take for you to move to the next level?
3. What risks are you willing to take? What''s holding you back?
4. Who are you accountable to in this work?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:35.221511+00', '2025-11-09 05:15:35.221511+00', NULL, 'ca284a11-33ae-44a5-89c8-5f57665c7eaa', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('07d7488a-47a3-4508-92d7-467f531544aa', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Understanding Privilege', 'understanding-privilege', 'Examining your privilege and using it strategically.', 'video', 'https://example.com/videos/privilege.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:35.277591+00', '2025-11-09 05:15:35.277591+00', NULL, 'ca284a11-33ae-44a5-89c8-5f57665c7eaa', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c085db1e-a23a-46c4-a070-1d1274dd2620', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Speaking Up and Speaking Out', 'speaking-up', 'When and how to use your voice for anti-racism.', 'video', 'https://example.com/videos/speaking-up.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 05:15:35.363648+00', '2025-11-09 05:15:35.363648+00', NULL, 'a47cfb37-e657-471f-99e3-0b60c0b7d636', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('136ce2b5-3508-4aea-8d67-f39b779c3f00', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Amplifying Black Voices', 'amplifying-voices', 'Strategies to center Black voices and expertise.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Amplifying Black Voices

## Why Amplification Matters

Black voices are systematically:
- Silenced in meetings
- Credited less for ideas
- Interrupted more frequently
- Given less authority
- Excluded from decisions

Amplification is about using your privilege to ensure Black voices are heard, credited, and centered.

## Strategies

### 1. Cite and Credit
**In meetings:**
- "As [Black colleague] said earlier..."
- "Building on [Black colleague''s] point..."
- "That''s exactly what [Black colleague] proposed"

**In written work:**
- Cite Black scholars and authors
- Credit Black colleagues for their ideas
- Give public recognition

### 2. Create Space
- Actively invite Black colleagues to speak
- Notice who hasn''t spoken and ask for their input
- In presentations, share the platform
- Defer to Black expertise on racism

### 3. Interrupt Interruptions
- "Let [them] finish"
- "I''d like to hear the rest of [their] thought"
- "[They] was still speaking"

### 4. Boost Social Media
- Share Black creators'' original posts (not screenshots)
- Give credit and tags
- Don''t add your commentary as more important
- Use your platform to direct followers to Black voices

### 5. Redistribute Resources
- Hire Black consultants and pay them well
- Buy from Black-owned businesses
- Donate to Black-led organizations
- Create opportunities for Black colleagues

### 6. Make Connections
- Introduce Black colleagues to your networks
- Recommend them for opportunities
- Nominate them for awards and recognition
- Open doors you have access to

### 7. Step Back
- Decline speaking opportunities and suggest Black speakers
- Give up panel seats to Black experts
- Don''t accept all-white panels
- Know when not to be the voice

## What NOT to Do

### ❌ Centering Yourself
**Don''t**: "Here''s what I learned from my Black friend..."  
**Do**: "Here''s what [Black scholar] teaches us..."

### ❌ Speaking For
**Don''t**: Answer questions about Black experiences  
**Do**: "That''s a great question for [Black colleague]"

### ❌ Parroting
**Don''t**: Repeat Black people''s ideas as your own  
**Do**: Explicitly credit them

### ❌ Tone Policing
**Don''t**: Tell Black people how to express their anger  
**Do**: Listen to and validate their emotions

### ❌ White Saviorism
**Don''t**: "Let me rescue Black people with my expertise"  
**Do**: "How can I support your existing work?"

## In Different Contexts

### In Meetings
- Notice speaking patterns
- Ensure Black colleagues are heard
- Give credit in real-time
- Follow up with decision-makers about Black colleagues'' ideas

### In Hiring
- Advocate for Black candidates
- Challenge "culture fit" as code for homogeneity
- Question why pipeline is "lacking"
- Push for diverse interview panels

### In Social Settings
- Redirect racist conversations
- Educate fellow white people
- Don''t expect Black people to explain racism
- Share resources and do the work

### Online
- Share Black creators generously
- Call out racism in comments
- Use hashtags that support movements
- Boost Black voices without adding your spin

## Measuring Impact

### Good Amplification Results In:
✓ Black colleagues gaining visibility
✓ Black experts being recognized
✓ Resources flowing to Black communities
✓ You becoming less central to conversations
✓ Black leadership increasing

### Poor "Amplification" Results In:
✗ You getting praised for being an ally
✗ Your voice still dominant
✗ Black people still doing emotional labor
✗ No actual transfer of power or resources
✗ Performative appearance of support

## Remember

- **It''s not about you**: Your comfort, your learning, your growth
- **Follow, don''t lead**: Black people are the experts on racism
- **Stay consistent**: Don''t just show up when it''s trending
- **Expect nothing**: No gold stars for basic decency
- **Keep learning**: You''ll mess up—apologize and improve

## Reflection Questions

1. Whose voices dominate in your workplace? Whose are marginalized?
2. When was the last time you amplified a Black colleague? How?
3. What opportunities do you have access to that you could share?
4. Are you centering Black voices or centering your allyship?', NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 05:15:35.414293+00', '2025-11-09 05:15:35.414293+00', NULL, 'a47cfb37-e657-471f-99e3-0b60c0b7d636', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2d0935a7-cae6-4785-967d-7a1369ce4759', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Final Assessment', 'final-assessment', 'Comprehensive assessment of allyship principles.', 'quiz', NULL, '{"questions": [{"options": ["Nothing, they are the same", "Accomplices take risks and give up comfort/power", "Allies are better than accomplices", "Accomplices only do illegal things"], "question": "The difference between an ally and an accomplice is:", "explanation": "Accomplices go beyond comfortable support to take risks, make sacrifices, and work in solidarity with Black communities.", "correct_answer": 1}, {"options": ["Repeat their ideas as your own for more reach", "Explicitly credit them and direct people to them", "Add your own perspective to improve the message", "Summarize so others understand better"], "question": "When amplifying Black voices, you should:", "explanation": "Always explicitly credit Black voices and direct people to learn directly from them, not through you.", "correct_answer": 1}, {"options": ["Give up because you are not cut out for this", "Apologize, learn, and continue the work", "Explain your intent repeatedly", "Stop so you don''t cause more harm"], "question": "If you make a mistake in your allyship work, you should:", "explanation": "Mistakes are inevitable. Acknowledge harm, learn from it, and continue doing better. Growth requires staying engaged even when it''s hard.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 05:15:35.463855+00', '2025-11-09 05:15:35.463855+00', NULL, 'a47cfb37-e657-471f-99e3-0b60c0b7d636', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('80392fe5-ac8b-46d6-a2a3-e99e99679efd', '896de482-9231-4d59-8a5a-047b95926a1a', 'Quiz: Policy Development', 'quiz-policy-development', 'Test your understanding of inclusive policy development.', 'quiz', NULL, '{"questions": [{"options": ["Equality means everyone gets the same thing; equity means everyone gets what they need", "Equality is newer; equity is an older concept", "Equality applies to race; equity applies to gender", "They mean the same thing"], "question": "What is the key difference between equality and equity in policy development?", "explanation": "Equality treats everyone the same, which may not address different needs or barriers. Equity recognizes that people start from different places and provides what each person needs to achieve fair outcomes.", "correct_answer": 0}, {"options": ["Specific examples of prohibited conduct", "Clear reporting procedures with timelines", "Subjective language like \"professional appearance\" without definition", "Regular review and update schedule"], "question": "Which of the following is a red flag in a workplace policy?", "explanation": "Subjective terms like \"professional appearance\" can be interpreted through cultural biases and enforced discriminately. Policies should use objective, clearly defined criteria.", "correct_answer": 2}, {"options": ["It''s legally required", "They can identify barriers and unintended consequences that others might miss", "To check for grammar and spelling errors", "So they can''t complain later"], "question": "Why should Black employees be involved in policy development?", "explanation": "Black employees have lived experience with racism and can identify issues that others might overlook. Their input helps create more effective policies and demonstrates genuine commitment to equity.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 05:20:15.703649+00', '2025-11-09 05:20:15.703649+00', NULL, 'ff6ce6d1-4cfd-47b6-85c1-9c26e12cd5c4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('69e15e50-eea5-44f6-b09c-264989d2b9da', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Transparency and Stakeholder Communication', 'transparency-communication', 'Sharing equity data internally and externally.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Transparency and Stakeholder Communication

## Why Transparency Matters
Publishing equity data:
- **Builds trust** with employees and communities
- **Drives accountability** - public commitments are harder to abandon
- **Enables benchmarking** - helps entire industries improve
- **Attracts talent** - shows genuine commitment
- **Pressures inaction** - transparency makes it harder to ignore disparities

## What to Share

### Internally (Employees)

**Minimum**:
- Overall representation by race
- Representation by level
- Hiring and promotion rates by race
- Turnover rates by race
- Pay equity analysis results
- Progress against stated goals

**Better**:
- All the above plus:
- Qualitative data from surveys and focus groups
- Specific actions being taken to address gaps
- Timelines and accountability
- Budget allocated to equity initiatives

**Best**:
- All the above plus:
- Root cause analysis of disparities
- Failures and challenges, not just successes
- Regular updates (quarterly or semi-annual)
- Opportunities for employee feedback and involvement

### Externally (Public)

**Minimum**:
- Overall demographics
- Statement of commitment to equity
- Key initiatives

**Better**:
- All the above plus:
- Representation by level
- Year-over-year trends
- Specific, measurable goals with timelines
- Named executive responsible

**Best**:
- All the above plus:
- Full equity report with hiring, promotion, retention, pay data
- Progress against goals
- Honest assessment of challenges
- How you''re using data to drive change

## How to Communicate

### Principles

#### 1. Honesty
Don''t sugarcoat or make excuses. If data shows disparities, acknowledge them directly.

**Example - Poor**: "While we have room for improvement in representation at senior levels, we''re proud of our overall diversity."

**Example - Better**: "Our data shows Black employees are significantly under-represented at senior levels—only 3% compared to 15% at entry level. This is unacceptable, and we''re committed to addressing the barriers that prevent Black employees from advancing."

#### 2. Context
Help people understand what the numbers mean.

**Example**: "Black employees make up 8% of our workforce but only 2% of senior leadership. For context, Black people represent 4% of the Canadian population and 6% of the professional workforce in our region. This shows we''re hiring Black talent but failing to promote them to leadership."

#### 3. Action Orientation
Don''t just report problems—explain what you''re doing about them.

**Example**: "To address low Black representation in engineering, we''re:
1. Partnering with HBCUs for recruitment
2. Eliminating degree requirements for roles where not essential
3. Providing sponsorship for Black engineers in promotion pipeline
4. Reviewing performance evaluation practices for bias"

#### 4. Accountability
Name who is responsible and when progress will be reviewed.

**Example**: "Our Chief People Officer is accountable for achieving these goals. We''ll publish progress updates quarterly and review results at every Board meeting."

#### 5. Accessibility
Make data understandable to all audiences.

- Use clear visualizations (charts, graphs)
- Avoid jargon and technical language
- Provide executive summary for those who won''t read full report
- Make accessible to people with disabilities (alt text, screen reader compatible)

### Formats

#### Dashboard
- Real-time or regularly updated metrics
- Visual and easy to scan
- Accessible to all employees
- **Example**: Diversity dashboard on company intranet with key metrics, updated quarterly

#### Annual Report
- Comprehensive, detailed analysis
- Year-over-year trends
- Narrative explanation of findings and actions
- **Example**: Published diversity and inclusion report shared internally and externally

#### Town Halls
- Leadership presents key findings
- Opportunity for employee questions
- Shows commitment from top
- **Example**: CEO leads quarterly DEI town hall with data updates

#### Manager Toolkits
- Talking points for managers to discuss with teams
- FAQs
- Resources for deeper learning
- **Example**: Manager guide released with annual report to facilitate team discussions

## Handling Difficult Conversations

### When Data Shows Significant Disparities

**What NOT to do**:
- Blame previous leadership
- Make excuses ("pipeline problem," "meritocracy")
- Downplay significance
- Promise vague "do better" without specifics
- Get defensive when challenged

**What TO do**:
- Acknowledge the harm these disparities cause
- Take responsibility
- Commit to specific actions with timelines
- Invite input and feedback
- Follow through with visible action

**Example Script**:
"Our data shows significant disparities in how Black employees experience our organization. Black employees are promoted at half the rate of white employees and leave the company at twice the rate. This tells us we have serious problems with equity and inclusion that we must address.

This is unacceptable, and I take responsibility as a leader for allowing these conditions to persist. We''re committed to changing this, and here''s how: [specific actions].

We know this won''t change overnight, but we''re committed to transparency, accountability, and most importantly, action. We''ll report on progress quarterly, and we need your help. If you have ideas or want to be involved, please reach out.

This is hard to hear, and I know for Black employees it may confirm experiences you''ve been telling us about. I''m sorry it took data to make us listen. We''re listening now, and we''re committed to change."

### When Employees Are Skeptical

**Understandable**: Black employees have often heard promises before without seeing change.

**Build credibility through**:
- Consistent, regular updates (not one-time report)
- Visible actions, not just words
- Investment of real resources (budget, time, people)
- Changes in who holds power (Black employees in decision-making roles)
- Consequences for inaction or discriminatory behavior

### When Leadership Resists Transparency

**Common objections**:
- "It will make us look bad"
- "Competitors will use it against us"
- "It could expose us to legal risk"
- "We need to fix problems before going public"

**Responses**:
- Lack of transparency also looks bad and erodes trust
- Leading organizations are moving toward transparency; being early mover shows leadership
- Transparency can actually reduce legal risk by showing good faith efforts
- You''ll never be "ready" - transparency drives improvement, not vice versa
- The real risk is continuing inequity unchecked

## External Reporting

### Regulatory Requirements
- **Employment Equity Act** (federal contractors): Required reporting
- **Pay equity legislation**: Varies by province, but growing
- **ESG reporting**: Increasing investor pressure for diversity data

### Voluntary Reporting
Even without requirements, consider publishing:
- Annual diversity report
- EEO-1 type data (U.S. standard, could adapt for Canada)
- Progress updates on public commitments

### Stakeholder Expectations

**Investors** want:
- Diversity data, especially board and leadership
- Pay equity data
- Link between diversity and business outcomes
- Risk management related to discrimination

**Customers** want:
- Company values align with their own
- Evidence of commitment, not just statements
- Diverse representation, especially in leadership and customer-facing roles

**Employees and Candidates** want:
- Honest assessment of current state
- Clear path for improvement
- Evidence that leadership takes equity seriously
- Data about their specific demographic group

## Case Study: Transparency Done Right

**Organization**: Large financial services company
**Challenge**: Low Black representation, especially in leadership

**Approach**:
1. **Conducted comprehensive equity audit** (representation, hiring, promotion, pay, engagement)
2. **Shared results transparently**:
   - Full data published internally
   - Summary shared externally
   - CEO addressed all employees in town hall
   - Acknowledged specific failures
3. **Committed to specific goals**:
   - Double Black representation in leadership within 3 years
   - Achieve pay equity within 1 year
   - Reduce turnover gap to zero within 2 years
4. **Quarterly public updates** on progress
5. **Tied executive compensation** to diversity goals

**Results**:
- Increased trust scores among Black employees
- Applications from Black candidates increased 40%
- Made meaningful progress on representation goals
- Recognized as industry leader in diversity

## Reflection Questions
1. What equity data does your organization currently share? With whom?
2. What would it take for your organization to commit to full transparency?
3. If you published your data tomorrow, what would be the hardest numbers to share? Why?
4. How could transparency accelerate progress in your organization?', NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 05:20:15.760493+00', '2025-11-09 05:20:15.760493+00', NULL, 'd36d769a-86dc-4782-b588-877967ac825e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5c27ecc1-4a37-455f-910a-4d4cf5db1cb2', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Final Assessment', 'final-assessment-data', 'Comprehensive assessment of data and measurement concepts.', 'quiz', NULL, '{"questions": [{"options": ["It''s required by law", "To identify disparities and track progress toward equity", "To fill out government forms", "To look good in marketing materials"], "question": "What is the most important reason to collect demographic data?", "explanation": "While some data collection may be legally required, the primary purpose should be to identify where disparities exist, track whether interventions are working, and hold the organization accountable for progress.", "correct_answer": 1}, {"options": ["Make it mandatory so you get complete data", "Collect as much detail as possible", "Be transparent about purpose and use, make it voluntary, and ensure confidentiality", "Only collect what''s legally required"], "question": "What is a key principle for collecting race data ethically?", "explanation": "Ethical data collection requires transparency about why you''re collecting and how it will be used, voluntary participation with option to decline, and strong confidentiality protections. Building trust is essential.", "correct_answer": 2}, {"options": ["It''s required by law", "It builds trust, drives accountability, and enables benchmarking", "It makes the organization look good", "It''s easier than keeping it private"], "question": "Why is transparency about equity data important?", "explanation": "Transparency builds trust with employees and stakeholders, creates accountability for progress, allows comparison with other organizations, and demonstrates genuine commitment beyond words.", "correct_answer": 1}, {"options": ["Explanations for why the disparities exist", "Comparisons showing you''re better than competitors", "Specific actions you''re taking to address the disparities with timelines and accountability", "Apologies and statements of regret"], "question": "When sharing data that shows significant disparities, what is the most important element to include?", "explanation": "While context and acknowledgment matter, the most critical element is explaining what concrete actions you''re taking to address disparities, with specific timelines and clear accountability. Data without action is meaningless.", "correct_answer": 2}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 05:20:15.805299+00', '2025-11-09 05:20:15.805299+00', NULL, 'd36d769a-86dc-4782-b588-877967ac825e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3a083131-09a1-4d5c-94af-03e914206645', '896de482-9231-4d59-8a5a-047b95926a1a', 'Final Assessment', 'final-assessment-leadership', 'Comprehensive assessment of leadership for racial equity concepts.', 'quiz', NULL, '{"questions": [{"options": ["It costs too much money", "It brings in Black employees but doesn''t create an environment where they can thrive", "It violates employment laws", "It takes too much time"], "question": "What is the key limitation of focusing only on diversity without inclusion?", "explanation": "Diversity (representation) without inclusion means Black employees may be hired but face barriers to advancement, belonging, and success. True equity requires both diverse representation and inclusive culture.", "correct_answer": 1}, {"options": ["Sending a statement after a racial justice incident", "Hosting a lunch-and-learn during Black History Month", "Conducting a racial equity audit and transparently sharing results and action plans", "Hiring a Chief Diversity Officer"], "question": "Which approach demonstrates genuine leadership commitment to racial equity?", "explanation": "Genuine commitment involves assessing current state, being transparent about findings, and taking concrete action. Statements and one-time events without systemic change are performative.", "correct_answer": 2}, {"options": ["Use legal jargon to ensure enforceability", "Keep policies vague to allow flexibility", "Use specific, objective criteria and avoid subjective terms like \"culture fit\"", "Focus only on what is prohibited, not what is encouraged"], "question": "What is a key principle for writing inclusive policies?", "explanation": "Inclusive policies should use clear, specific, objective language that reduces bias. Subjective terms can be interpreted through cultural biases and enforced discriminately.", "correct_answer": 2}, {"options": ["Count the number of Black employees hired", "Track multiple metrics including retention, promotion, engagement, and qualitative feedback from Black employees", "Ask white employees if they see any problems", "Check if there have been any formal complaints"], "question": "How can leaders measure whether culture is truly inclusive for Black employees?", "explanation": "Measuring inclusive culture requires multiple indicators: quantitative metrics (retention, promotion, pay equity), qualitative data (employee feedback, exit interviews), and behavioral observations. Hiring alone doesn''t reflect inclusion.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 20}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 05:20:15.872262+00', '2025-11-09 05:20:15.872262+00', NULL, '2e9b5e55-5dea-4f75-97a1-8b19c23010e6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6eda3395-2226-4507-8cf1-54578b6bfd97', '896de482-9231-4d59-8a5a-047b95926a1a', 'Supporting Black Employee Resource Groups', 'supporting-black-ergs', 'How leadership can effectively support and empower Black ERGs.', 'video', 'https://example.com/videos/supporting-ergs.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 05:20:15.833731+00', '2025-11-09 05:20:15.833731+00', NULL, '2e9b5e55-5dea-4f75-97a1-8b19c23010e6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2af528a2-e440-407c-bc3f-ab8745b21767', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Why These Conversations Matter', 'why-conversations-matter', 'Understand the importance and impact of engaging in difficult racial conversations.', 'video', 'https://example.com/videos/why-conversations-matter.mp4', '{}', 480, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 11:53:28.085428+00', '2025-11-09 11:53:28.085428+00', NULL, '02c8e361-9abd-48b5-a4cd-76bab0f39758', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6aec6f82-aff2-4912-8f8d-f1b900acb9e3', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Examining Your Own Reactions', 'examining-reactions', 'Explore common defensive reactions and how to manage them.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Examining Your Own Reactions

## Why Self-Awareness Matters

Before engaging in difficult conversations about race, you must understand your own reactions and triggers. Defensiveness is a normal human response, but left unchecked, it derails conversations and causes harm.

## Common Defensive Reactions

### 1. Denial
**What it looks like**: "I don''t see color," "Racism isn''t a problem here," "That didn''t happen"
**Why it happens**: Protecting your worldview from uncomfortable truths
**Impact**: Invalidates Black people''s experiences and shuts down conversation
**Reality check**: If racism weren''t a problem, we wouldn''t need this conversation

### 2. Centering Yourself
**What it looks like**: "I have Black friends," "I grew up poor too," "Not all white people"
**Why it happens**: Discomfort with being implicated, desire to be seen as "one of the good ones"
**Impact**: Shifts focus from racism to your feelings, forces Black people to reassure you
**Reality check**: This conversation isn''t about you being bad; it''s about systems and impacts

### 3. Tone Policing
**What it looks like**: "You''re being too aggressive," "If you weren''t so angry, I''d listen," "Calm down"
**Why it happens**: Discomfort with Black people''s justified anger
**Impact**: Prioritizes your comfort over justice, silences legitimate emotion
**Reality check**: Anger is a rational response to injustice; don''t demand serenity from those being harmed

### 4. Intellectualizing
**What it looks like**: "Well, actually, the data shows...", "Let''s look at this objectively," "Both sides..."
**Why it happens**: Trying to avoid emotional discomfort
**Impact**: Diminishes lived experience, positions you as "neutral arbiter" of someone else''s reality
**Reality check**: Racism isn''t an abstract debate—it''s lived experience

### 5. Jumping to Solutions
**What it looks like**: "What should I do?", "But I already did X," "Here''s how we fix it..."
**Why it happens**: Discomfort with sitting in the problem, desire to feel helpful
**Impact**: Shortcuts understanding, focuses on your action over listening
**Reality check**: Listen first; solutions come after understanding

### 6. Fragility/Tears
**What it looks like**: Crying, needing comfort, threatening to leave
**Why it happens**: Overwhelm, guilt, fear of being seen as bad
**Impact**: Reverses roles—now Black person must comfort you
**Reality check**: Your discomfort is survivable; manage your emotions so you can stay present

### 7. Changing the Subject
**What it looks like**: "But what about class?", "All lives matter," "Let''s talk about something positive"
**Why it happens**: Avoiding discomfort, diluting the focus
**Impact**: Prevents depth, signals you''re not willing to engage
**Reality check**: Other issues exist, but right now we''re talking about anti-Black racism

## The Neuroscience of Defensiveness

When your worldview is challenged:
- **Amygdala activation**: Brain perceives threat
- **Cortisol release**: Stress response triggered
- **Reduced prefrontal cortex function**: Harder to think clearly, listen, regulate emotions
- **Result**: Fight, flight, or freeze

Understanding this helps you:
1. **Recognize** when you''re activated
2. **Pause** before reacting
3. **Breathe** to reset your nervous system
4. **Choose** a more productive response

## Self-Regulation Techniques

### Before the Conversation
- **Ground yourself**: Deep breathing, feet on floor, present moment awareness
- **Set intention**: "I''m here to learn, not defend"
- **Accept discomfort**: "This will be uncomfortable, and that''s okay"
- **Remember why**: "This matters more than my comfort"

### During the Conversation
- **Notice your body**: Jaw clenching? Shoulders tight? Heart racing? These are cues you''re activated
- **Pause**: It''s okay to say "Let me sit with that for a moment"
- **Breathe**: 4-count in, 4-count hold, 4-count out
- **Name it**: "I''m noticing I''m feeling defensive" (to yourself or aloud)

### When You''re Triggered
1. **Acknowledge**: "I''m having a strong reaction"
2. **Don''t act**: Wait before speaking
3. **Breathe**: Three deep breaths minimum
4. **Ask yourself**: "Is this about the conversation, or about me?"
5. **Choose**: What response serves the conversation, not just my comfort?

## Moving from Defensiveness to Openness

### Reframe Your Mindset

**Instead of**: "I''m a good person, so this doesn''t apply to me"
**Try**: "Good people can still benefit from racism and cause harm"

**Instead of**: "I need to prove I''m not racist"
**Try**: "I need to understand how racism operates and how I''m implicated"

**Instead of**: "They''re attacking me"
**Try**: "They''re sharing important information about their experience"

**Instead of**: "I already know this"
**Try**: "There''s always more to learn"

**Instead of**: "This is uncomfortable"
**Try**: "Discomfort is where growth happens"

## The Cost of Staying Defensive

When you prioritize your comfort:
- **Black people do extra labor** to manage your emotions
- **The conversation derails** from substance to reassurance
- **Nothing changes** because you didn''t actually hear the message
- **Relationships erode** because Black people learn you''re not safe
- **Racism continues** because you refused to examine your role

## The Gift of Openness

When you move through defensiveness:
- **You learn** what you didn''t know before
- **Relationships deepen** through authentic connection
- **You become more effective** in anti-racism work
- **Black people can be authentic** instead of managing you
- **Real change becomes possible**

## Practical Exercise: Defense Audit

Over the next week, notice when you get defensive in conversations about race:
1. **What was said** that triggered you?
2. **What reaction** did you have (physically, emotionally, behaviorally)?
3. **What was the underlying fear** (being seen as bad, losing status, being wrong)?
4. **How did you respond**? Did it serve the conversation?
5. **What would you do differently** next time?

## Remember

- **Defensiveness is normal** – you''re human
- **It''s a skill** – you can get better at managing it
- **It''s not about you being bad** – it''s about systems and impact
- **Your discomfort is survivable** – and necessary for growth
- **The stakes are higher** for Black people than for your comfort

## Reflection Questions

1. Which defensive reaction do you recognize most in yourself?
2. What are your physical signs of being activated?
3. What would it take for you to prioritize learning over self-protection?
4. Who can you practice with before engaging in higher-stakes conversations?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 11:53:28.150628+00', '2025-11-09 11:53:28.150628+00', NULL, '02c8e361-9abd-48b5-a4cd-76bab0f39758', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7c74484c-784c-40a3-a213-ab92abb961a5', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Creating Psychological Safety', 'psychological-safety', 'Learn how to establish conditions for productive dialogue.', 'video', 'https://example.com/videos/psychological-safety.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 11:53:28.212895+00', '2025-11-09 11:53:28.212895+00', NULL, '02c8e361-9abd-48b5-a4cd-76bab0f39758', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('fec66fe5-9dbc-4be7-9830-a797f9b7d8de', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Quiz: Preparation & Mindset', 'quiz-preparation', 'Test your understanding of conversation preparation.', 'quiz', NULL, '{"questions": [{"options": ["So you can avoid the conversation entirely", "To recognize and manage your defensive reactions so they don''t derail the conversation", "To prove you''re not racist", "To prepare your arguments"], "question": "Why is self-awareness important before difficult racial conversations?", "explanation": "Self-awareness helps you recognize when you''re becoming defensive so you can pause, breathe, and respond thoughtfully rather than reactively. This keeps the conversation productive.", "correct_answer": 1}, {"options": ["Enforcing workplace conduct policies", "Criticizing how someone expresses their experience (e.g., \"you''re too angry\") instead of hearing the substance", "Speaking in a professional tone", "Politely correcting grammar"], "question": "What is \"tone policing\" and why is it problematic?", "explanation": "Tone policing prioritizes the listener''s comfort over justice. It silences legitimate anger and makes the conversation about how something is said rather than what is being said. Anger is a rational response to injustice.", "correct_answer": 1}, {"options": ["Leave the conversation immediately", "Explain why you''re not racist", "Pause, breathe, and notice your physical/emotional reactions before responding", "Change the subject to something more comfortable"], "question": "When you feel defensive during a racial conversation, what should you do first?", "explanation": "When activated, pause and breathe to reset your nervous system. Notice your reactions (tight jaw, racing heart, urge to defend). This creates space to respond thoughtfully rather than reactively.", "correct_answer": 2}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 11:53:28.265575+00', '2025-11-09 11:53:28.265575+00', NULL, '02c8e361-9abd-48b5-a4cd-76bab0f39758', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1287b622-abfe-492f-a720-92701db6f0bb', '4648b980-da55-42c9-bce0-16de3e2366c3', 'The LARA Framework', 'lara-framework', 'Listen, Affirm, Respond, Add information - a powerful active listening approach.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# The LARA Framework

## What is LARA?

LARA is a conversation framework developed specifically for discussing politically and emotionally charged topics. It''s particularly effective for racial conversations because it prioritizes understanding over agreement.

**LARA stands for:**
- **L**isten
- **A**ffirm
- **R**espond
- **A**dd information

## Why LARA Works

Traditional debate approaches:
- Position your view against theirs
- Look for weaknesses in their argument
- Try to "win" by proving them wrong
- Result: Defensiveness, entrenchment, no learning

LARA approach:
- Seeks to understand before being understood
- Validates emotions even when disagreeing with conclusions
- Creates space for productive exchange
- Result: Openness, learning, potential for movement

## The Four Steps in Detail

### Step 1: Listen (with curiosity, not judgment)

**What to do:**
- Give full attention (put phone away, make eye contact)
- Listen to understand, not to respond
- Notice emotions as well as content
- Don''t interrupt or finish their sentences
- Ask clarifying questions

**What to avoid:**
- Planning your response while they''re talking
- Interrupting with "but actually..."
- Dismissing their experience as invalid
- Looking for gotchas or inconsistencies

**Example questions:**
- "Can you tell me more about that?"
- "What was that experience like for you?"
- "Help me understand..."
- "What do you mean by [term]?"

**Why it matters:** Most people just want to be heard. Deep listening is rare and powerful.

### Step 2: Affirm (the person and their feelings)

**What to do:**
- Acknowledge their emotions are real and valid
- Recognize their experience, even if different from yours
- Show respect for them as a person
- Reflect back what you heard

**What to avoid:**
- "I understand" (unless you truly do)
- "Calm down" or other tone policing
- "You shouldn''t feel that way"
- Dismissing or minimizing

**Example affirmations:**
- "I can hear how much this matters to you"
- "That sounds really frustrating/painful/exhausting"
- "Thank you for trusting me with this"
- "I appreciate you sharing your experience"
- "What you''re saying makes sense given what you''ve experienced"

**Key distinction:** You''re affirming their *feelings* and *experience*, not necessarily agreeing with their *conclusions* or *solutions*.

**Why it matters:** People need to feel heard before they can hear you. Affirmation creates that foundation.

### Step 3: Respond (to their emotional experience)

**What to do:**
- Name what you observe about their feelings
- Share your own emotional response (if helpful)
- Acknowledge impact even if intent was different
- Take responsibility for your role (if applicable)

**What to avoid:**
- "You''re too sensitive"
- "I didn''t mean it that way" (as a defense)
- Making it about your intentions rather than their impact
- Centering yourself

**Example responses:**
- "I can see this is really important to you"
- "I''m hearing that you feel [emotion]. Is that right?"
- "I''m realizing I hadn''t considered that perspective"
- "I''m sorry my actions/words had that impact"

**Why it matters:** Emotional validation is often all someone needs to move forward in conversation.

### Step 4: Add Information (if appropriate)

**What to do:**
- Share your perspective as your own, not universal truth
- Provide relevant context or data if helpful
- Ask permission: "Would it be helpful if I shared my perspective?"
- Keep it brief and relevant

**What to avoid:**
- "Well, actually..." or "To be fair..."
- Talking more than listening
- Using this step to debate or prove them wrong
- Adding information that centers you

**Example additions:**
- "My experience has been different - I''ve seen [example]. I''m wondering what accounts for that difference?"
- "I learned recently that [fact/statistic]. Does that resonate with your experience?"
- "I''m still processing this, but what I''m thinking is..."

**Why it matters:** This is where actual exchange happens, but only if you''ve done steps 1-3 first.

## LARA in Action: Examples

### Scenario 1: Colleague shares experience of racism

**Without LARA** (defensive):
Colleague: "I''m tired of being the only Black person in every meeting and having my ideas ignored."
You: "I don''t think anyone ignores you. Maybe you need to speak up more. And didn''t we just hire another Black person in marketing?"

**Result:** Colleague feels invalidated, shuts down, doesn''t trust you again.

**With LARA**:
- **Listen**: [Make eye contact, nod, don''t interrupt]
- **Affirm**: "That sounds exhausting and frustrating."
- **Respond**: "I''m realizing I haven''t noticed that pattern, which probably says something about my experience being different. Can you tell me more about when this happens?"
- **Add**: "I want to be more aware of this. Would it be helpful if I intentionally amplified your contributions in meetings?"

**Result:** Colleague feels heard, conversation deepens, you learn, relationship strengthens.

### Scenario 2: Family member says something racist

**Without LARA** (attacking):
Family: "I''m tired of hearing about Black Lives Matter. All lives matter."
You: "That''s racist! You''re part of the problem!"

**Result:** Family member becomes defensive, doubles down, conversation ends badly.

**With LARA**:
- **Listen**: "Tell me more about what frustrates you."
- **Affirm**: "I hear that you''re frustrated and feel like your concerns aren''t being heard."
- **Respond**: "I think we both want a society where everyone is valued."
- **Add**: "What I''ve learned is that ''Black Lives Matter'' doesn''t mean other lives don''t—it''s highlighting that Black lives are treated as if they matter less in many systems. It''s more like a house is on fire so the fire department goes there, not to every house. Does that make sense?"

**Result:** Door stays open for continued conversation and potential learning.

### Scenario 3: Addressing microaggression

**Without LARA** (passive):
Colleague: "Wow, you''re so articulate!"
You: [Say nothing, feel resentful]

**Result:** Behavior continues, you build resentment, colleague doesn''t learn.

**With LARA to yourself first**:
- **Listen**: They probably meant it as a compliment
- **Affirm**: My feeling hurt is valid, even if intent was good
- **Respond**: I need to address this
- **Add**: Here''s how...

**Then with colleague**:
You: "Hey, can I share something? When you say I''m ''articulate,'' I know you mean it as a compliment, but it often lands differently for Black people. It can carry an assumption that we wouldn''t normally be articulate. Would ''I really appreciate your perspective on this'' work better?"

**Result:** Colleague learns, behavior changes, relationship strengthens.

## Common Challenges with LARA

### "But I Disagree!"
LARA doesn''t require agreement. You can affirm feelings ("I hear this is frustrating for you") while maintaining a different view.

### "They''re Factually Wrong!"
Facts matter, but timing matters more. If someone is emotional, they can''t hear facts yet. LARA first, facts later.

### "This Feels Fake/Manipulative"
LARA isn''t about manipulating—it''s about genuinely trying to understand. If it feels fake, you''re probably skipping the listening part.

### "What if They''re Just Attacking Me?"
If someone is venting, LARA can help. If they''re genuinely being abusive, you can set boundaries: "I want to hear you, and I need us to speak respectfully to each other."

## Practicing LARA

### Start Small
- Practice on lower-stakes conversations first
- Use with family, friends, colleagues on any topic
- Notice how it changes the dynamic

### Debrief
After using LARA:
- What worked?
- Where did you struggle?
- What would you do differently?

### Key Reminders
- **L is 80% of LARA** - really listen
- **You can''t skip steps** - must listen and affirm before adding
- **It''s not about winning** - it''s about understanding
- **Practice makes better** - it will feel awkward at first

## Reflection Questions
1. When you disagree with someone, do you typically listen to understand or listen to respond?
2. Which step of LARA will be hardest for you? Why?
3. Think of a past conversation that went poorly. How might LARA have changed it?
4. Who can you practice LARA with in a low-stakes conversation this week?', NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 11:53:28.416259+00', '2025-11-09 11:53:28.416259+00', NULL, 'd500fb7e-473b-4a52-afa9-bbd87bdaef3e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('48afde12-868f-421e-b10b-f8c7d2127c65', '4648b980-da55-42c9-bce0-16de3e2366c3', 'The REAL Framework', 'real-framework', 'Reflect, Engage, Acknowledge, Learn - for when you''ve caused harm.', 'video', 'https://example.com/videos/real-framework.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 11:53:28.469009+00', '2025-11-09 11:53:28.469009+00', NULL, 'd500fb7e-473b-4a52-afa9-bbd87bdaef3e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d0aa7bcc-b2bb-455e-a418-f3d21f0945c2', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Asking Powerful Questions', 'powerful-questions', 'Learn to ask questions that deepen understanding rather than debate.', 'video', 'https://example.com/videos/powerful-questions.mp4', '{}', 480, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 11:53:28.518796+00', '2025-11-09 11:53:28.518796+00', NULL, 'd500fb7e-473b-4a52-afa9-bbd87bdaef3e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('cf409c6f-c7fe-48bc-8ce7-88bc747ab65c', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Common Forms of Resistance', 'forms-of-resistance', 'Recognize and respond to typical deflections and defensive patterns.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Common Forms of Resistance

## Why People Resist

Conversations about race trigger resistance because they challenge:
- **Worldview**: "I thought I was a good person"
- **Identity**: "I''m not racist"
- **Comfort**: "This is uncomfortable"
- **Power**: "I might have to give something up"

Resistance is normal. Your job isn''t to eliminate it, but to recognize and work with it skillfully.

## The Resistance Patterns

### 1. "Not All..." / "But I..."
**What it sounds like:**
- "Not all white people..."
- "But I have Black friends..."
- "I grew up poor too..."

**What''s happening:** Attempting to exempt themselves from the conversation

**Why it doesn''t work:** Makes conversation about them being "one of the good ones" rather than about systemic racism

**How to respond:**
"I hear that you don''t identify with what I''m describing. This isn''t about all individuals being bad—it''s about systems that advantage some groups and disadvantage others. Even ''good people'' participate in and benefit from these systems."

### 2. "What About..." / "All Lives..."
**What it sounds like:**
- "What about class?"
- "All lives matter"
- "What about Black-on-Black crime?"

**What''s happening:** Deflecting to avoid focusing on anti-Black racism

**Why it doesn''t work:** Other issues exist, but right now we''re talking about this issue

**How to respond:**
"Class/poverty/etc. definitely matter, and we can talk about those. Right now, we''re talking specifically about anti-Black racism. Can we stay with that for now?"

### 3. Denial / "That Doesn''t Happen Here"
**What it sounds like:**
- "I''ve never seen that"
- "Not in our organization"
- "That''s not my experience"

**What''s happening:** Refusing to acknowledge reality that differs from their experience

**Why it doesn''t work:** Your lack of observation doesn''t negate others'' experiences

**How to respond:**
"Just because you haven''t witnessed it doesn''t mean it''s not happening. Black people report experiencing [X]. What would it mean to take their word for it?"

### 4. Tone Policing
**What it sounds like:**
- "You''re being too emotional"
- "If you calmed down, I''d listen"
- "Can''t we discuss this civilly?"

**What''s happening:** Prioritizing their comfort over justice; silencing legitimate anger

**Why it doesn''t work:** Anger is a rational response to injustice

**How to respond:**
"I understand you''re uncomfortable with strong emotion. But people have a right to be angry about injustice. Can you hear the substance of what''s being said?"

### 5. Intellectualizing / "Devil''s Advocate"
**What it sounds like:**
- "Let''s look at this objectively"
- "Playing devil''s advocate here..."
- "What does the data say?"

**What''s happening:** Using logic to avoid emotional engagement; treating racism as abstract debate

**Why it doesn''t work:** Racism isn''t a debate topic—it''s lived experience causing real harm

**How to respond:**
"Data and analysis matter, and so does lived experience. What would it take for you to trust what Black people are telling you about their experiences?"

### 6. Guilt / White Tears
**What it sounds like:**
- "I feel so bad"
- "I''m a terrible person"
- [Crying, needing comfort]

**What''s happening:** Making conversation about their feelings; reversing emotional labor

**Why it doesn''t work:** Now Black person must comfort them instead of being heard

**How to respond:**
"I understand this is hard to hear. Your discomfort is survivable. The question is: what are you going to do with what you''re learning?"

### 7. "I Already Know This"
**What it sounds like:**
- "I''ve heard this before"
- "I already took a workshop"
- "I get it"

**What''s happening:** Shutting down to avoid actual engagement

**Why it doesn''t work:** If you really got it, racism would be solved

**How to respond:**
"Great—what are you doing with what you know? Where are you still learning?"

### 8. False Equivalence
**What it sounds like:**
- "I experienced discrimination for [non-racial identity]"
- "Everyone faces challenges"
- "My family immigrated and faced hardship"

**What''s happening:** Equating their experience with anti-Black racism to minimize it

**Why it doesn''t work:** Other forms of hardship exist, but anti-Black racism has specific history and manifestations

**How to respond:**
"Other forms of discrimination and hardship are real. Anti-Black racism has particular historical roots and current manifestations that require specific attention."

### 9. Jumping to Solutions
**What it sounds like:**
- "What should we do?"
- "Let me fix this"
- "I have an idea..."

**What''s happening:** Avoiding discomfort of sitting in the problem; wanting to feel helpful

**Why it doesn''t work:** Shortcuts understanding; often leads to ineffective or harmful "solutions"

**How to respond:**
"I appreciate that you want to take action. Before we jump to solutions, let''s make sure we fully understand the problem."

### 10. Changing the Subject
**What it sounds like:**
- [Abrupt topic change]
- "On a lighter note..."
- "Let''s talk about something positive"

**What''s happening:** Escaping discomfort

**Why it doesn''t work:** Important issues don''t go away because we stop talking about them

**How to respond:**
"I notice we moved away from that topic. Was it getting too uncomfortable? What would it take to stay in the conversation?"

## Responding to Resistance: General Strategies

### Stay Curious
Instead of getting frustrated, get curious: "What''s making this hard to hear?" Understanding the resistance helps you address it.

### Name It (Sometimes)
Sometimes directly naming the pattern helps:
"I notice when I share my experience, the response is ''but I...'' That makes me feel like you''re defending yourself rather than hearing me."

### Set Boundaries
You don''t have to engage with bad faith resistance:
"I''m willing to have this conversation if you''re genuinely trying to understand. If you''re just arguing, I''m going to step away."

### Pick Your Battles
Not every moment of resistance needs to be addressed. Sometimes it''s strategic to let something go and come back to it.

### Take Breaks
If you''re exhausted, it''s okay to pause:
"This is important and I''m at my limit for today. Can we continue this later?"

## When to Walk Away

Some conversations aren''t productive:
- Person is committed to bad faith engagement
- Abuse or personal attacks
- Your safety (physical or psychological) is at risk
- You''re too activated to continue productively
- Power dynamics make it impossible (e.g., with supervisor)

Walking away doesn''t mean giving up—it means choosing where to invest your energy.

## For Black People: Self-Protection

If you''re Black and engaging across racial difference:

### You Don''t Owe Anyone Your Pain
- You''re not obligated to educate
- You can share only what feels safe
- Your experiences aren''t up for debate

### Set Limits
- "I''m willing to share my experience, but I need you to just listen without debating"
- "I can recommend resources, but I''m not going to teach you"
- "I need to step away now"

### Choose Your Moments
- Not every microaggression needs addressing
- Strategic engagement is different from avoidance
- Your wellbeing matters

### Have an Exit Plan
- "I need to take a call"
- "I''m going to step out for a moment"
- Bring an ally who can intervene

## For Non-Black People: Managing Resistance in Yourself

### Notice Your Patterns
Which forms of resistance do you recognize in yourself?

### Pause Before Responding
When you feel defensive:
1. Notice it
2. Breathe
3. Ask: "Is this reaction helping or hindering?"

### Recommit
Remind yourself why this conversation matters more than your comfort

### Process Later
Journal, talk to other non-Black people learning, see a therapist—don''t process with Black people

## Reflection Questions
1. Which resistance patterns do you recognize in yourself or others?
2. When you encounter resistance, what''s your typical reaction?
3. What would help you respond more skillfully?
4. Who can you practice with in lower-stakes conversations?', NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 11:53:28.612236+00', '2025-11-09 11:53:28.612236+00', NULL, '312e33eb-a1c6-4223-bc24-ef3ed483d875', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('23bb5f69-9450-4091-936b-37828e8015d5', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Debrief and Recovery Practices', 'debrief-recovery', 'Take care of yourself after emotionally difficult conversations.', 'video', 'https://example.com/videos/debrief-recovery.mp4', '{}', 420, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 11:53:28.680361+00', '2025-11-09 11:53:28.680361+00', NULL, '312e33eb-a1c6-4223-bc24-ef3ed483d875', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7affc9b4-39b0-4d2e-a04a-0cc1f7637b1a', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Final Assessment', 'final-assessment-conversations', 'Comprehensive assessment of conversation skills and frameworks.', 'quiz', NULL, '{"questions": [{"options": ["To be polite", "Because people need to feel heard before they can hear you", "To waste time", "It''s just a suggestion, not required"], "question": "In the LARA framework, why must you Listen and Affirm before Adding information?", "explanation": "People are unable to process new information when they don''t feel heard. Listening and affirming creates the psychological foundation for productive exchange. If you skip to adding information, they''ll still be defending rather than listening.", "correct_answer": 1}, {"options": ["Enforcing professional workplace standards", "Critiquing how someone expresses their experience to avoid hearing the substance", "Speaking in a calm tone", "Helping someone communicate better"], "question": "What is \"tone policing\" and why is it a form of resistance?", "explanation": "Tone policing prioritizes the listener''s comfort over justice. It says \"I''ll only listen if you''re calm\" and silences legitimate anger. It''s a form of resistance because it derails the conversation from content to delivery.", "correct_answer": 1}, {"options": ["Adding helpful context", "Trying to exempt themselves from the conversation about systemic racism", "Demonstrating their anti-racism credentials", "Agreeing with the speaker"], "question": "When someone says \"Not all white people...\" or \"I have Black friends,\" what are they doing?", "explanation": "This is a defensive move to position themselves as \"one of the good ones\" and thus not implicated in racism. It centers them and their identity rather than focusing on systemic issues and impacts. The conversation becomes about their feelings rather than racism.", "correct_answer": 1}, {"options": ["Immediately defend yourself", "Leave the conversation", "Pause, breathe, notice your reaction, then choose a thoughtful response", "Cry to show you care"], "question": "What should you do when you feel defensive during a racial conversation?", "explanation": "Defensiveness is normal but doesn''t have to dictate your response. Pausing allows you to reset your nervous system and respond thoughtfully rather than reactively. This keeps the conversation productive.", "correct_answer": 2}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 11:53:28.74405+00', '2025-11-09 11:53:28.74405+00', NULL, '312e33eb-a1c6-4223-bc24-ef3ed483d875', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('96636628-853c-45f4-a032-f41c4808bcc3', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Black Presence Before Canada', 'black-presence-before-canada', 'Learn about the earliest Black people in what would become Canada.', 'video', 'https://example.com/videos/black-presence-before-canada.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:00:12.842158+00', '2025-11-09 12:00:12.842158+00', NULL, 'eb68974c-0ee6-4e07-86e5-7483019a84ce', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3c8fd300-0f41-41c6-8c95-2c56cf957ed6', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Slavery in New France and British North America', 'slavery-canada', 'Understand the reality of slavery in early Canada.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Slavery in New France and British North America

## The Myth of Canadian Innocence

Many Canadians believe slavery was an American phenomenon and that Canada was always a sanctuary for freedom-seekers. This is false.

**Reality**: Slavery existed in what would become Canada for over 200 years, from the early 1600s until 1834.

## Slavery in New France (1628-1760)

### Legal Framework
- **1689**: King Louis XIV authorized slavery in New France
- Enslaved both Indigenous people (panis) and Africans
- Lasted until British conquest in 1760

### Scale and Scope
- Approximately **4,200 people enslaved** in New France
- About two-thirds were Indigenous (panis), one-third African
- Concentrated in Montreal, Quebec City, and among colonial elites
- Owned by merchants, military officers, clergy, government officials

### Life Under Slavery
- **Domestic servitude**: Cooking, cleaning, childcare
- **Agricultural labor**: Farming, animal husbandry
- **Skilled trades**: Blacksmithing, carpentry (some enslaved people)
- **Sexual exploitation**: Particularly of enslaved women
- **Violence**: Beatings, family separation, sale of individuals

### Notable Case: Marie-Joseph Angélique (1734)
- Enslaved Black woman in Montreal
- Accused of setting fire that destroyed much of Montreal
- **Tortured and executed** (hanged, body burned)
- Modern historians question: Was she guilty or scapegoated?
- Represents the violence and precarity of slavery in Canada

## Slavery Under British Rule (1760-1834)

### Continuation and Expansion
- **British conquest didn''t end slavery** – it continued and evolved
- British law allowed slavery; colonial courts upheld it
- Some Loyalists brought enslaved people fleeing American Revolution

### Legal Status
- **1790s**: Upper Canada (Ontario) had about 500 enslaved people
- Lower Canada (Quebec) had several hundred
- Maritimes also practiced slavery (Nova Scotia, New Brunswick, PEI)

### Black Loyalists: Complicated Freedom (1780s)
- **3,000 Black Loyalists** arrived in Nova Scotia after American Revolution
- **Promise**: Land and freedom in exchange for fighting for British
- **Reality**: 
  - Many given poor land or no land at all
  - Faced severe discrimination and segregation
  - Some **re-enslaved** by white Loyalists
  - About **1,200 left for Sierra Leone** in 1792, disillusioned

### The Gradual Abolition Act of 1793 (Upper Canada)
Led by Lieutenant Governor John Graves Simcoe:
- **Did NOT immediately free anyone**
- Children born to enslaved mothers after 1793 would be free at age 25
- Enslaved people already in bondage remained enslaved for life
- Prevented importation of new enslaved people

**Impact**: Very gradual change; slavery continued for decades

### Continued Slavery in Lower Canada and Maritimes
- No similar legislation in Lower Canada (Quebec)
- Slavery continued, though declining due to economic factors
- Enslaved people increasingly escaped or were manumitted

### Resistance and Escape
- Some enslaved people **ran away** to American states, Indigenous communities
- Others **negotiated freedom** or were freed by owners
- Legal challenges: Some sued for freedom (mixed results)

### Final Abolition: 1834
- **British Empire abolished slavery** on August 1, 1834
- Approximately **300 enslaved people freed** in Canada at that time
- Many more had already been freed or escaped

**Key Point**: Canada didn''t proactively abolish slavery; Britain did it empire-wide.

## The Underground Railroad: A More Complex Story

### The Myth
Canada as the ultimate sanctuary, welcoming all freedom-seekers with open arms.

### The Reality
- **30,000-40,000 freedom-seekers** arrived via Underground Railroad (1830s-1860s)
- Canada was safer than the U.S., but **not a paradise**

### What They Found in Canada
**Positives:**
- Legal freedom (after 1834)
- Couldn''t be legally returned to slavery
- Some established thriving communities (e.g., Chatham, Dresden, Buxton)

**Challenges:**
- **Severe discrimination and racism**
- Segregated schools, churches, public spaces
- Limited economic opportunities
- Some businesses refused to serve Black people
- Violence and harassment
- Cold climate was difficult for many

### Regional Variations
- **Ontario**: Largest population; communities in Windsor, Chatham, Toronto
- **Nova Scotia**: Some settlement, but harsh conditions
- **New Brunswick and Quebec**: Smaller numbers

### Key Settlements
- **Buxton Settlement (1849)**: Established by Reverend William King; thriving community with school, church, businesses
- **Dawn Settlement (1842)**: Founded by Josiah Henson; included British-American Institute (manual labor school)
- **Chatham**: Known as "Black Mecca"; political organizing, newspapers

### Notable Figures
- **Josiah Henson** (1789-1883): Escaped to Canada, established Dawn Settlement, inspired "Uncle Tom''s Cabin"
- **Mary Ann Shadd Cary** (1823-1893): First Black female newspaper editor in North America; published *Provincial Freeman*
- **Henry and Mary Bibb**: Published *Voice of the Fugitive* newspaper
- **Harriet Tubman**: Made multiple trips to Canada guiding freedom-seekers

## Why This History Matters Today

### Challenging Canadian Exceptionalism
The myth that "Canada has no history of racism" or "we were always better than the U.S." is harmful because:
- **Erases Black Canadian history and pain**
- **Prevents reckoning** with our past
- **Allows current racism** to go unexamined
- **Positions Canada as morally superior** without accountability

### Understanding Contemporary Patterns
Historical patterns persist:
- **Segregation**: Historical Black communities were segregated; today we see continued residential segregation
- **Economic inequality**: Denied land and opportunities then; wage gaps and wealth gaps now
- **Criminalization**: Controlling Black bodies through law enforcement then and now
- **Exclusion**: From institutions, decision-making, full citizenship

### Honoring Resistance
Black Canadians have always resisted:
- **Escaped slavery** at great risk
- **Built communities** despite hostility
- **Organized politically** for rights and justice
- **Created institutions** (churches, schools, newspapers)

This legacy continues in contemporary activism.

## What This Means for You

### If You''re Not Black
- **Stop saying "Canada was better"**: It''s not historically accurate and it''s harmful
- **Recognize Canada''s complicity**: We profited from and participated in slavery
- **Understand**: The racism Black Canadians face today has deep historical roots
- **Don''t compare**: "Better than the U.S." is a low bar and centers American stories over Canadian realities

### If You''re Black
- **Your ancestors built this country** under violent, exploitative conditions
- **Resistance is your inheritance**
- **You belong here** – this is your history too
- **Your anger at erasure is justified**

## Reflection Questions
1. What surprises you most about this history?
2. How does this change your understanding of Canada?
3. Where do you see the legacy of slavery in Canadian society today?
4. What responsibility do you have to this history?', NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:00:12.899569+00', '2025-11-09 12:00:12.899569+00', NULL, 'eb68974c-0ee6-4e07-86e5-7483019a84ce', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e542f553-cec3-4393-81a2-bef2943e316a', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'The Underground Railroad in Canada', 'underground-railroad', 'The complex reality of Canada as a destination for freedom-seekers.', 'video', 'https://example.com/videos/underground-railroad-canada.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:00:12.953513+00', '2025-11-09 12:00:12.953513+00', NULL, 'eb68974c-0ee6-4e07-86e5-7483019a84ce', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('63bce36c-713c-479a-b821-411de3d3100b', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Understanding the Employment Equity Act', 'understanding-eea', 'Learn the purpose, scope, and requirements of Canada''s Employment Equity Act.', 'video', 'https://example.com/videos/understanding-eea.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:06:19.697368+00', '2025-11-09 12:06:19.697368+00', NULL, '4be4fec0-ef1d-4fc3-9a85-8221b2e1102b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('824d10e1-e0c7-4e35-9207-5cc725a1e478', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Quiz: Early History', 'quiz-early-history', 'Test your knowledge of Black Canadian history 1600s-1800s.', 'quiz', NULL, '{"questions": [{"options": ["Canada never had slavery", "Slavery existed in Canada for over 200 years, from early 1600s until 1834", "Only the U.S. had slavery in North America", "Canada abolished slavery before the American Revolution"], "question": "What is the historical reality of slavery in Canada?", "explanation": "Slavery was legal and practiced in what would become Canada from the early 1600s until the British Empire abolished it in 1834. Approximately 4,200 people were enslaved in New France alone, and slavery continued under British rule.", "correct_answer": 1}, {"options": ["Immediately freed all enslaved people", "Freed children born to enslaved mothers, but only at age 25, and did not free anyone currently enslaved", "Abolished slavery completely in all of Canada", "Made slavery illegal across the British Empire"], "question": "What did Upper Canada''s 1793 Gradual Abolition Act actually do?", "explanation": "The Act did NOT immediately free anyone. Children born after 1793 to enslaved mothers would be freed at age 25, but people already enslaved remained in bondage for life. It was a very gradual change that allowed slavery to continue for decades.", "correct_answer": 1}, {"options": ["Complete equality and acceptance", "A paradise free from all discrimination", "Legal freedom but also severe discrimination, segregation, and limited opportunities", "Immediate wealth and prosperity"], "question": "What did Black freedom-seekers actually experience when they arrived in Canada via the Underground Railroad?", "explanation": "While Canada offered legal freedom (after 1834) and people couldn''t be returned to slavery, Black arrivals faced severe discrimination, segregated schools and public spaces, limited economic opportunities, violence, and harassment. Canada was safer than the U.S. but not a paradise.", "correct_answer": 2}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:00:13.008388+00', '2025-11-09 12:00:13.008388+00', NULL, 'eb68974c-0ee6-4e07-86e5-7483019a84ce', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8ebbd0df-89e5-4d9a-b38a-b95b59213e1b', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Segregation in Canadian Communities', 'segregation-communities', 'Learn about legally enforced and socially practiced segregation across Canada.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Segregation in Canadian Communities

[Full article content from earlier - truncated for brevity but would include all the detailed content about segregated schools, public spaces, housing, employment, immigration restrictions, and organized resistance...]', NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:00:13.116701+00', '2025-11-09 12:00:13.116701+00', NULL, 'fb9acf4a-f619-4542-b46d-6f63840dbd04', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0e35f40e-79d8-4f48-9649-18de242e44b0', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Immigration Restrictions and the "White Canada" Policy', 'immigration-restrictions', 'Understand Canada''s explicit efforts to remain a white nation.', 'video', 'https://example.com/videos/immigration-restrictions.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:00:13.167582+00', '2025-11-09 12:00:13.167582+00', NULL, 'fb9acf4a-f619-4542-b46d-6f63840dbd04', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9216c1bf-26eb-49cd-b75e-6d5b5c032a4a', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Black Resistance and Organizing', 'resistance-organizing', 'Learn how Black Canadians fought segregation and won key victories.', 'video', 'https://example.com/videos/resistance-organizing.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:00:13.212125+00', '2025-11-09 12:00:13.212125+00', NULL, 'fb9acf4a-f619-4542-b46d-6f63840dbd04', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7ca79a87-ef50-44ca-a77e-6edfa042424b', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Quiz: Segregation Era', 'quiz-segregation', 'Test your understanding of 20th century segregation in Canada.', 'quiz', NULL, '{"questions": [{"options": ["1834, when slavery was abolished", "1867, at Confederation", "1965, in Ontario", "Canada never had segregated schools"], "question": "When did the last racially segregated school close in Canada?", "explanation": "The last legally segregated schools in Ontario closed in 1965 in Merlin and North Colchester. Segregated schools were legal in Ontario from the 1850s and persisted well into the civil rights era. Nova Scotia also had segregated schools into the 1960s.", "correct_answer": 2}, {"options": ["She was celebrated as the first Black movie star", "She was arrested and jailed for sitting in the whites-only section of a Nova Scotia theatre", "She became the first Black person elected to Parliament", "She opened Canada''s first integrated restaurant"], "question": "What happened to Viola Desmond in 1946?", "explanation": "Viola Desmond, a Nova Scotia businesswoman, was arrested, jailed, and fined for refusing to leave the whites-only section of a movie theatre. She fought her conviction but lost. She received a posthumous pardon in 2010 and now appears on the Canadian $10 bill.", "correct_answer": 1}, {"options": ["Rules about lawn maintenance", "Legal clauses preventing sale of property to Black, Jewish, or Asian people", "Guidelines for building heights", "Requirements for homeowner association membership"], "question": "What were restrictive covenants in Canadian property deeds?", "explanation": "Restrictive covenants were legal clauses in property deeds explicitly preventing sale, rental, or transfer to people based on race (Black, Jewish, Asian, etc.). They were common in Canadian cities until ruled illegal in Ontario in 1950, though informal discrimination continued.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 10}', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:00:13.265657+00', '2025-11-09 12:00:13.265657+00', NULL, 'fb9acf4a-f619-4542-b46d-6f63840dbd04', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4f1c9bab-09a0-447d-9c02-a3e8ba3447c3', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'The Canadian Civil Rights Movement', 'civil-rights-movement', 'Understand Black Canadian activism and legislative victories.', 'video', 'https://example.com/videos/civil-rights-movement.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:00:13.363249+00', '2025-11-09 12:00:13.363249+00', NULL, '51c526af-33da-42af-b2e9-75acd34200ff', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('79dcfb06-1544-4ce9-bbf0-16d2b9752469', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Caribbean Immigration and Cultural Transformation', 'caribbean-immigration', 'Learn how Caribbean immigration reshaped Black Canadian communities.', 'video', 'https://example.com/videos/caribbean-immigration.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:00:13.417905+00', '2025-11-09 12:00:13.417905+00', NULL, '51c526af-33da-42af-b2e9-75acd34200ff', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9177ad9d-bd47-48ae-8b34-ba18ceaeae36', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'The Promise and Limits of Multiculturalism', 'multiculturalism', 'Critically examine Canada''s multiculturalism policy and its impacts on Black communities.', 'video', 'https://example.com/videos/multiculturalism-limits.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:00:13.470663+00', '2025-11-09 12:00:13.470663+00', NULL, '51c526af-33da-42af-b2e9-75acd34200ff', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0bd9f7b9-ed15-47c7-a514-d5c77c2bb1b7', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Black Lives Matter and Contemporary Activism', 'blm-activism', 'Understand the rise of BLM-Toronto and modern Black movements.', 'video', 'https://example.com/videos/blm-activism.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:00:13.569672+00', '2025-11-09 12:00:13.569672+00', NULL, '43188c98-5ce5-4df8-ad0a-3afbe5d67fb4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('65576d61-ebef-4f83-93e2-34abd378e366', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Anti-Black Racism Today: Data and Realities', 'anti-black-racism-today', 'Review contemporary statistics and systemic issues facing Black Canadians.', 'article', NULL, '{}', NULL, NULL, NULL, NULL, '# Anti-Black Racism Today: Data and Realities

[Full comprehensive article about contemporary anti-Black racism with Canadian statistics and data...]', NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:00:13.630558+00', '2025-11-09 12:00:13.630558+00', NULL, '43188c98-5ce5-4df8-ad0a-3afbe5d67fb4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ff6f8f54-81a4-4bfe-91f8-c057a9e89512', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Black Excellence and Community Strength', 'black-excellence', 'Celebrate Black Canadian achievements, culture, and resilience.', 'video', 'https://example.com/videos/black-excellence.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:00:13.70154+00', '2025-11-09 12:00:13.70154+00', NULL, '43188c98-5ce5-4df8-ad0a-3afbe5d67fb4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d2abe63b-2bbb-4126-8f1d-7c24c0880737', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Final Assessment', 'final-assessment-history', 'Comprehensive assessment of Black Canadian history.', 'quiz', NULL, '{"questions": [{"options": ["Canada has always been better than the United States", "Current racial disparities are the result of long-standing systemic exclusion, not culture or individual choices", "Racism is a thing of the past", "Black people haven''t been in Canada very long"], "question": "What is the primary lesson of Black Canadian history for understanding contemporary racism?", "explanation": "Black Canadian history shows over 400 years of systemic exclusion (slavery, segregation, immigration restrictions, discrimination) that created and perpetuated inequality. Current disparities in wealth, employment, criminal justice, etc. are not coincidental—they''re the predictable results of historical and ongoing systemic racism.", "correct_answer": 1}, {"options": ["Canada was always a sanctuary from racism", "Canada had slavery, segregation, and explicit white supremacist policies well into the 20th century", "Racism only existed in the United States", "Canada solved racism with multiculturalism in 1971"], "question": "How should we understand Canada''s relationship to anti-Black racism historically?", "explanation": "Canada practiced slavery for over 200 years, had legally segregated schools until 1965, used restrictive covenants to enforce housing segregation, and maintained explicitly racist immigration policies until 1967. The myth of Canadian exceptionalism erases this history and prevents accountability.", "correct_answer": 1}, {"options": ["Racial disparities have been eliminated", "Black Canadians face measurable disparities in policing, education, employment, health, and nearly every other indicator", "Any remaining gaps are due to cultural differences", "Canada is now perfectly equal"], "question": "What does current data show about anti-Black racism in Canada?", "explanation": "Contemporary data shows Black Canadians are overpoliced, earn less, experience higher unemployment, face education streaming, have worse health outcomes, are overrepresented in child welfare and incarceration, and underrepresented in leadership. These aren''t cultural—they''re systemic.", "correct_answer": 1}, {"options": ["They passively accepted discrimination", "They consistently organized, resisted, and fought for justice", "They left Canada entirely", "They waited for white people to help them"], "question": "Throughout this history, how have Black Canadians responded to racism?", "explanation": "At every period, Black Canadians resisted: escaping slavery, building communities despite hostility, organizing politically (National Unity Association, Negro Citizenship Association), legal challenges (Viola Desmond, restrictive covenants), media activism, and contemporary movements like BLM-TO. Resistance is central to Black Canadian history.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 20}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:00:13.763468+00', '2025-11-09 12:00:13.763468+00', NULL, '43188c98-5ce5-4df8-ad0a-3afbe5d67fb4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2e586f58-3ad2-414e-9dd5-6e2d4de233d9', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Introduction to HR Discrimination Investigations', 'intro-discrimination-investigations', 'Understand your role and responsibilities when investigating discrimination complaints.', 'video', 'https://example.com/videos/intro-discrimination-investigations.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:06:19.314692+00', '2025-11-09 12:06:19.314692+00', NULL, 'b6f1eac6-3cd4-4723-ac34-d7da757d859e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3548fdd5-387b-4c4d-bff7-ca61c5d685bb', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Investigation Planning and Intake', 'investigation-planning', 'Learn how to properly intake and scope a discrimination complaint.', 'video', 'https://example.com/videos/investigation-planning.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:19.400871+00', '2025-11-09 12:06:19.400871+00', NULL, 'b6f1eac6-3cd4-4723-ac34-d7da757d859e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8adcab94-0816-4a28-adc1-e54f27233e1c', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Conducting Effective Interviews', 'conducting-interviews', 'Master interview techniques for complainants, respondents, and witnesses.', 'video', 'https://example.com/videos/conducting-interviews.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:19.479656+00', '2025-11-09 12:06:19.479656+00', NULL, 'b6f1eac6-3cd4-4723-ac34-d7da757d859e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('aa8859c0-3f32-4fbf-a32e-9283f5061f96', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Writing Investigation Reports', 'writing-reports', 'Learn to document findings with clarity, objectivity, and legal defensibility.', 'video', 'https://example.com/videos/writing-reports.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:06:19.562162+00', '2025-11-09 12:06:19.562162+00', NULL, 'b6f1eac6-3cd4-4723-ac34-d7da757d859e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('80549fb7-5974-4240-b43d-bcb6efbee8b0', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Workforce Analysis and Representation Goals', 'workforce-analysis', 'Conduct workforce surveys and set representation goals for designated groups.', 'video', 'https://example.com/videos/workforce-analysis.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:19.783495+00', '2025-11-09 12:06:19.783495+00', NULL, '4be4fec0-ef1d-4fc3-9a85-8221b2e1102b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('55f1cc4b-2fcc-424b-b859-727716f91cd2', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Creating Employment Equity Plans', 'equity-plans', 'Develop comprehensive plans to achieve employment equity.', 'video', 'https://example.com/videos/equity-plans.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:19.866393+00', '2025-11-09 12:06:19.866393+00', NULL, '4be4fec0-ef1d-4fc3-9a85-8221b2e1102b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('28a361ce-51de-4e34-9bcd-22d24525ae3b', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Bias in Hiring: Recognition and Mitigation', 'bias-in-hiring', 'Identify common hiring biases and implement strategies to reduce them.', 'video', 'https://example.com/videos/bias-in-hiring.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:06:20.031144+00', '2025-11-09 12:06:20.031144+00', NULL, 'c16fdd33-8f79-4d00-8ae6-a738523001e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('cde2f2f7-4aee-4564-8df2-a4e639727fab', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Structured Interviewing and Assessment', 'structured-interviewing', 'Use structured methods to make fair, consistent hiring decisions.', 'video', 'https://example.com/videos/structured-interviewing.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:20.115922+00', '2025-11-09 12:06:20.115922+00', NULL, 'c16fdd33-8f79-4d00-8ae6-a738523001e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1e3cd906-314b-4481-bb5c-9a5ee87776cc', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Equitable Performance Management', 'equitable-performance', 'Design performance review systems that are fair across racial groups.', 'video', 'https://example.com/videos/equitable-performance.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:20.211538+00', '2025-11-09 12:06:20.211538+00', NULL, 'c16fdd33-8f79-4d00-8ae6-a738523001e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('79979956-543c-44f3-8f8b-b03f49586093', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Promotion and Succession Planning', 'promotion-succession', 'Ensure advancement opportunities are accessible to Black employees.', 'video', 'https://example.com/videos/promotion-succession.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:06:20.30425+00', '2025-11-09 12:06:20.30425+00', NULL, 'c16fdd33-8f79-4d00-8ae6-a738523001e4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e6b027e0-bfd0-4c3e-aa10-22f4e0838438', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'What to Measure: Key Equity Metrics', 'key-equity-metrics', 'Identify the most important metrics for tracking racial equity progress.', 'video', 'https://example.com/videos/key-equity-metrics.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:06:20.473624+00', '2025-11-09 12:06:20.473624+00', NULL, 'ecd305e9-afef-4109-9585-0afed229da34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('03c7835c-bbad-499b-a1e3-a5193d2857a9', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Race-Based Data Collection', 'race-based-data', 'Collect demographic data ethically and effectively.', 'video', 'https://example.com/videos/race-based-data.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:20.540134+00', '2025-11-09 12:06:20.540134+00', NULL, 'ecd305e9-afef-4109-9585-0afed229da34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7be91740-55ba-4b22-b4de-9cfd7ea492e4', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Building Accountability Frameworks', 'accountability-frameworks', 'Create systems that hold leaders accountable for equity outcomes.', 'video', 'https://example.com/videos/accountability-frameworks.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:20.599938+00', '2025-11-09 12:06:20.599938+00', NULL, 'ecd305e9-afef-4109-9585-0afed229da34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7a62f7f4-16e9-4b32-9c5b-f6d2582e3987', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Final Assessment', 'final-assessment-hr', 'Comprehensive assessment of HR anti-racism practices.', 'quiz', NULL, '{"questions": [{"options": ["Protect the organization from liability", "Maintain thoroughness, objectivity, and procedural fairness for all parties", "Resolve the complaint as quickly as possible", "Support the complainant no matter what"], "question": "When conducting a discrimination investigation, what is the most important principle?", "explanation": "While protecting the organization matters, the most important principle is conducting a fair, thorough, and objective investigation. This means treating all parties with respect, gathering all relevant evidence, and making findings based on facts, not assumptions. A well-conducted investigation protects everyone involved and reduces legal risk.", "correct_answer": 1}, {"options": ["To give preferential treatment to visible minorities", "To achieve equality in the workplace by correcting disadvantages experienced by designated groups", "To meet quotas for hiring", "To discriminate against white men"], "question": "What is the purpose of the federal Employment Equity Act?", "explanation": "The EEA aims to achieve equality by identifying and removing barriers that disadvantage four designated groups (women, Indigenous peoples, persons with disabilities, and visible minorities, including Black Canadians). It requires proactive measures like representation goals, not quotas, to correct historical and systemic disadvantage.", "correct_answer": 1}, {"options": ["It makes interviews faster", "It ensures all candidates are asked the same questions and evaluated using consistent criteria", "It eliminates the need for reference checks", "It guarantees you''ll hire diverse candidates"], "question": "Why is structured interviewing important for reducing bias?", "explanation": "Structured interviewing reduces bias by ensuring consistency. When all candidates answer the same questions evaluated using predetermined criteria, hiring decisions are based on job-relevant factors rather than subjective impressions or rapport. Research shows structured interviews significantly reduce racial bias compared to unstructured conversations.", "correct_answer": 1}, {"options": ["Public shaming when they fail", "Tie equity outcomes to performance evaluations and compensation", "Send them to more training", "Hope they care enough to act"], "question": "What is the most effective way to hold leaders accountable for equity?", "explanation": "Accountability requires consequences. When equity outcomes are part of how leaders are evaluated and compensated, they prioritize it. This might include metrics like representation in hiring/promotions, retention rates, employee feedback, and demonstrated leadership actions. Without accountability mechanisms, equity remains aspirational rather than actual.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:06:20.665171+00', '2025-11-09 12:06:20.665171+00', NULL, 'ecd305e9-afef-4109-9585-0afed229da34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('23952f3d-8039-4c3f-8344-05dddaca4586', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Introduction: Why Healthcare Equity Matters', 'why-healthcare-equity-matters', 'Understand the scope and impact of anti-Black racism in healthcare.', 'video', 'https://example.com/videos/why-healthcare-equity-matters.mp4', '{}', 480, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:06:20.891691+00', '2025-11-09 12:06:20.891691+00', NULL, '32f56862-6974-4cfb-9d83-ba26a6c4b9f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2c5d20d8-4831-44ee-bce6-4fbd5d226394', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Diagnostic Bias and Delayed Diagnosis', 'diagnostic-bias', 'Learn how racial bias affects diagnostic accuracy and timing for Black patients.', 'video', 'https://example.com/videos/diagnostic-bias.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:20.941842+00', '2025-11-09 12:06:20.941842+00', NULL, '32f56862-6974-4cfb-9d83-ba26a6c4b9f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0df1e766-8719-4b04-98f1-98b82c44ef5a', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Treatment Disparities', 'treatment-disparities', 'Examine differences in treatment recommendations and interventions across racial groups.', 'video', 'https://example.com/videos/treatment-disparities.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:20.984461+00', '2025-11-09 12:06:20.984461+00', NULL, '32f56862-6974-4cfb-9d83-ba26a6c4b9f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('18f11931-fe47-4867-adc8-4d16949fc05a', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'The Pain Gap: Racial Bias in Pain Assessment', 'pain-gap', 'Understand how false biological beliefs lead to undertreated pain in Black patients.', 'video', 'https://example.com/videos/pain-gap.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:06:21.0331+00', '2025-11-09 12:06:21.0331+00', NULL, '32f56862-6974-4cfb-9d83-ba26a6c4b9f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8820372c-d0dd-42b8-8561-d5a3185b6445', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'The Data: Black Maternal Health Outcomes', 'maternal-health-data', 'Review Canadian statistics on maternal morbidity and mortality for Black women.', 'video', 'https://example.com/videos/maternal-health-data.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:06:21.117165+00', '2025-11-09 12:06:21.117165+00', NULL, '2148095b-2836-460c-a936-1a21139522c9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0998eb8c-66f4-4e20-9bb7-1abbea99275f', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Why This Happens: Root Causes', 'maternal-health-causes', 'Understand the systemic factors driving maternal health disparities.', 'video', 'https://example.com/videos/maternal-health-causes.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:21.176031+00', '2025-11-09 12:06:21.176031+00', NULL, '2148095b-2836-460c-a936-1a21139522c9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2b7e3efc-3908-496f-bbd1-d2e60004e065', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Improving Maternal Care for Black Women', 'improving-maternal-care', 'Learn evidence-based practices to improve outcomes.', 'video', 'https://example.com/videos/improving-maternal-care.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:21.225702+00', '2025-11-09 12:06:21.225702+00', NULL, '2148095b-2836-460c-a936-1a21139522c9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('33cac1b6-bf81-47e7-ad8b-49ba5ed7a51a', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Recognizing Communication Barriers', 'communication-barriers', 'Identify how racial dynamics affect patient-provider communication.', 'video', 'https://example.com/videos/communication-barriers.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:06:21.318295+00', '2025-11-09 12:06:21.318295+00', NULL, '489a514f-bdad-4c47-a3bc-4fc5162a8a7b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a5a6aae4-94e5-43a1-b530-bd2b3e9eb74d', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Building Trust with Black Patients', 'building-trust', 'Understand how historical and ongoing racism erodes trust and how to rebuild it.', 'video', 'https://example.com/videos/building-trust.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:21.374854+00', '2025-11-09 12:06:21.374854+00', NULL, '489a514f-bdad-4c47-a3bc-4fc5162a8a7b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b81aa280-0488-4504-b8ea-35e260216ca9', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Shared Decision-Making', 'shared-decision-making', 'Practice collaborative approaches to treatment planning.', 'video', 'https://example.com/videos/shared-decision-making.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:21.416341+00', '2025-11-09 12:06:21.416341+00', NULL, '489a514f-bdad-4c47-a3bc-4fc5162a8a7b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1c8181df-011b-4d7f-a225-cedae23f3a83', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Addressing Systemic Barriers to Access', 'systemic-barriers', 'Identify and remove organizational barriers to healthcare access for Black patients.', 'video', 'https://example.com/videos/systemic-barriers.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:06:21.522347+00', '2025-11-09 12:06:21.522347+00', NULL, '236ff936-2bef-45ac-9ae5-5ba86b3a92a4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('83e3ee19-1f11-44d1-960f-c9bc1785c65f', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Increasing Representation in Healthcare', 'increasing-representation', 'Work toward a healthcare workforce that reflects the communities served.', 'video', 'https://example.com/videos/increasing-representation.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:06:21.575673+00', '2025-11-09 12:06:21.575673+00', NULL, '236ff936-2bef-45ac-9ae5-5ba86b3a92a4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8259ca9d-4879-4522-9a53-48997c4f07af', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Implementing Anti-Racist Clinical Practices', 'anti-racist-practices', 'Embed anti-racism into clinical protocols, guidelines, and organizational culture.', 'video', 'https://example.com/videos/anti-racist-practices.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:06:21.624092+00', '2025-11-09 12:06:21.624092+00', NULL, '236ff936-2bef-45ac-9ae5-5ba86b3a92a4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('14730db2-e188-48f4-b4bc-8f7c5e6ec870', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Final Assessment', 'final-assessment-healthcare', 'Comprehensive assessment of healthcare anti-racism knowledge.', 'quiz', NULL, '{"questions": [{"options": ["The difference between what patients report and what doctors believe", "Systematic under-assessment and under-treatment of pain in Black patients due to false biological beliefs", "The time between requesting pain medication and receiving it", "Differences in pain tolerance across populations"], "question": "What is the \"pain gap\" in healthcare?", "explanation": "The \"pain gap\" refers to the well-documented phenomenon where Black patients'' pain is systematically under-assessed and under-treated compared to white patients. Research shows many healthcare providers hold false beliefs about biological differences (e.g., that Black people have thicker skin or higher pain tolerance), leading to inadequate pain management.", "correct_answer": 1}, {"options": ["No significant disparities exist in Canada", "Black women experience higher rates of severe maternal morbidity and mortality", "Black women receive better prenatal care than other groups", "Maternal health disparities are only a U.S. problem"], "question": "What do Canadian data show about Black maternal health outcomes?", "explanation": "Canadian data show that Black women, particularly Black immigrants and refugees, experience significantly higher rates of severe maternal morbidity and complications compared to white women. Studies also indicate higher risks of preterm birth, low birth weight, and pregnancy-related complications even when controlling for socioeconomic factors.", "correct_answer": 1}, {"options": ["Black patients are naturally distrustful", "Historical and ongoing experiences of discrimination, dismissal, and harm in healthcare settings", "Cultural differences in communication styles", "Lack of health literacy"], "question": "Why is trust often lower between Black patients and healthcare providers?", "explanation": "Lower trust is a rational response to both historical harms (forced sterilization, unethical experimentation) and ongoing experiences of discrimination, dismissal of symptoms, and differential treatment. When patients consistently report not being believed or receiving substandard care, trust erodes. This isn''t about culture or literacy—it''s about justified wariness based on experience.", "correct_answer": 1}, {"options": ["Cultural competency training alone", "Systemic changes in policies, protocols, workforce diversity, and accountability for outcomes", "Asking Black patients to be more assertive", "Providing translation services"], "question": "What is the most effective approach to reducing healthcare disparities?", "explanation": "While individual education matters, sustainable change requires systemic approaches: collecting and analyzing race-based outcome data, revising clinical protocols to reduce bias, increasing workforce diversity at all levels, removing barriers to access, and creating accountability for equitable outcomes. Training alone, without structural change, has limited impact.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:06:21.681721+00', '2025-11-09 12:06:21.681721+00', NULL, '236ff936-2bef-45ac-9ae5-5ba86b3a92a4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5b887410-194f-48cf-84d6-c6af16db71e4', '8171b79b-869b-45d7-8c5c-340507244da3', 'Introduction to Intersectionality', 'intro-intersectionality', 'Understand how race and gender intersect to shape unique experiences.', 'video', 'https://example.com/videos/intro-intersectionality.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:07:51.312742+00', '2025-11-09 12:07:51.312742+00', NULL, 'f8f226f8-e08e-464a-beed-f847c28926bf', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c193a743-9bc3-484e-9bef-afbc3b4051b7', '8171b79b-869b-45d7-8c5c-340507244da3', 'Kimberlé Crenshaw and Intersectional Theory', 'crenshaw-theory', 'Learn the origins and framework of intersectionality from its creator.', 'video', 'https://example.com/videos/crenshaw-theory.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:51.369784+00', '2025-11-09 12:07:51.369784+00', NULL, 'f8f226f8-e08e-464a-beed-f847c28926bf', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7de4cd28-710a-4a61-acee-2d5687834ec1', '8171b79b-869b-45d7-8c5c-340507244da3', 'Why "Add Gender and Stir" Doesn''t Work', 'why-add-gender-fails', 'Understand why Black women''s experiences cannot be understood by simply combining race and gender analyses.', 'video', 'https://example.com/videos/why-add-gender-fails.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:51.436527+00', '2025-11-09 12:07:51.436527+00', NULL, 'f8f226f8-e08e-464a-beed-f847c28926bf', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('28d229dc-bf43-40d2-86d6-ea639e060007', '8171b79b-869b-45d7-8c5c-340507244da3', 'The Data: Black Women in the Canadian Workforce', 'black-women-data', 'Review employment, pay, and advancement statistics for Black women in Canada.', 'video', 'https://example.com/videos/black-women-data.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:07:51.60167+00', '2025-11-09 12:07:51.60167+00', NULL, '00254c49-3851-459e-a00f-22bbaa4771d2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4f14013c-beb2-4feb-8922-7f5776184112', '8171b79b-869b-45d7-8c5c-340507244da3', 'Stereotypes and Microaggressions', 'stereotypes-microaggressions', 'Identify specific stereotypes targeting Black women (angry, strong, sassy, etc.) and their impacts.', 'video', 'https://example.com/videos/stereotypes-microaggressions.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:51.646368+00', '2025-11-09 12:07:51.646368+00', NULL, '00254c49-3851-459e-a00f-22bbaa4771d2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('463c0b1f-49fa-4088-9f2d-eed2815833d9', '8171b79b-869b-45d7-8c5c-340507244da3', 'Black Women and Leadership', 'black-women-leadership', 'Examine barriers to advancement and what authentic support looks like.', 'video', 'https://example.com/videos/black-women-leadership.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:51.703839+00', '2025-11-09 12:07:51.703839+00', NULL, '00254c49-3851-459e-a00f-22bbaa4771d2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('acc66594-c429-4493-ae57-adcf5eb5e268', '8171b79b-869b-45d7-8c5c-340507244da3', 'Hair Discrimination and Professional Standards', 'hair-discrimination', 'Understand how "professional appearance" policies target Black women and what needs to change.', 'video', 'https://example.com/videos/hair-discrimination.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:07:51.763222+00', '2025-11-09 12:07:51.763222+00', NULL, '00254c49-3851-459e-a00f-22bbaa4771d2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b896861a-fe66-4e9f-85ee-1850a1a81bd3', '8171b79b-869b-45d7-8c5c-340507244da3', 'What Black Women Need (And What They Don''t)', 'what-black-women-need', 'Understand what genuine support and allyship look like.', 'video', 'https://example.com/videos/what-black-women-need.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:07:51.901246+00', '2025-11-09 12:07:51.901246+00', NULL, 'ad6d4960-8e79-4869-8ecb-cb760ef42b66', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ce96ffd4-9b9a-4898-96ce-55cc9165af11', '8171b79b-869b-45d7-8c5c-340507244da3', 'Interrupting Bias and Stereotypes', 'interrupting-bias-stereotypes', 'Practice strategies for calling out harmful stereotypes and biases.', 'video', 'https://example.com/videos/interrupting-bias-stereotypes.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:51.994082+00', '2025-11-09 12:07:51.994082+00', NULL, 'ad6d4960-8e79-4869-8ecb-cb760ef42b66', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7fb40d44-5c74-4c4e-9f06-feb2c5a338cd', '8171b79b-869b-45d7-8c5c-340507244da3', 'Sponsorship and Advocacy', 'sponsorship-advocacy', 'Move beyond mentorship to active sponsorship and career advancement.', 'video', 'https://example.com/videos/sponsorship-advocacy.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:52.043459+00', '2025-11-09 12:07:52.043459+00', NULL, 'ad6d4960-8e79-4869-8ecb-cb760ef42b66', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0a51f04b-f1b2-4fa4-ae2c-2b2dff0fefab', '8171b79b-869b-45d7-8c5c-340507244da3', 'Final Assessment', 'final-assessment-black-women', 'Comprehensive assessment of intersectionality and workplace inclusion.', 'quiz', NULL, '{"questions": [{"options": ["A framework that recognizes overlapping identities create unique experiences that cannot be understood by examining each identity separately", "A way to rank different forms of oppression", "The belief that all forms of discrimination are the same", "A diversity training technique"], "question": "What is intersectionality?", "explanation": "Intersectionality, coined by Kimberlé Crenshaw, recognizes that identities like race, gender, class, and sexuality overlap to create unique experiences of privilege and oppression. A Black woman''s experience is not simply \"racism + sexism\"—the intersection creates distinct challenges that cannot be understood by looking at race or gender alone.", "correct_answer": 0}, {"options": ["Black women earn the same as white women when education is controlled", "Black women face a \"double disadvantage\" earning less than white women and Black men", "Black women are overrepresented in senior leadership", "Black women face fewer barriers than Black men"], "question": "What does research show about Black women in Canadian workplaces?", "explanation": "Data consistently show Black women face compounded disadvantages. They earn less than both white women (facing racial disparities) and Black men (facing gender disparities), are underrepresented in leadership, experience higher unemployment, and report more discrimination and microaggressions. This is intersectionality in action—not just racism, not just sexism, but unique barriers at the intersection.", "correct_answer": 1}, {"options": ["An accurate description of how Black women behave", "A harmful stereotype that pathologizes Black women''s legitimate expressions of emotion or assertiveness", "A compliment to Black women''s strength", "Something that only affects Black women outside the workplace"], "question": "What is the \"angry Black woman\" stereotype and why does it matter?", "explanation": "The \"angry Black woman\" stereotype falsely characterizes Black women as hostile, aggressive, or difficult. When Black women express normal assertiveness, disagreement, or justified frustration, they are more likely to be labeled \"angry\" or \"difficult\" than white women expressing the same behaviors. This stereotype is used to silence, dismiss, and penalize Black women in workplaces.", "correct_answer": 1}, {"options": ["There is no difference—the terms are interchangeable", "Mentorship provides advice; sponsorship involves actively advocating for advancement and using your influence on their behalf", "Sponsorship is only for entry-level employees", "Mentorship is more valuable than sponsorship"], "question": "What is the difference between mentorship and sponsorship for Black women?", "explanation": "While mentorship (advice, guidance, support) is valuable, sponsorship is critical for advancement. A sponsor actively advocates for a Black woman in rooms where decisions are made, nominates her for opportunities, uses their influence to advance her career, and takes risks on her behalf. Black women are often over-mentored but under-sponsored—they receive advice but not the advocacy needed to break through barriers.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:07:52.093405+00', '2025-11-09 12:07:52.093405+00', NULL, 'ad6d4960-8e79-4869-8ecb-cb760ef42b66', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('032b1391-cd1e-49fe-b872-a8363483628f', 'd4df555c-60ec-4a39-8db6-98f595018473', 'What is a Racial Equity Audit?', 'what-is-equity-audit', 'Define equity audits and understand their role in organizational change.', 'video', 'https://example.com/videos/what-is-equity-audit.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:07:52.261534+00', '2025-11-09 12:07:52.261534+00', NULL, '783590c3-4897-48c8-af9c-277169747a6b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ca16fbff-ebcf-4626-b7ff-35464dc85c19', 'd4df555c-60ec-4a39-8db6-98f595018473', 'When and Why to Conduct an Audit', 'when-why-audit', 'Identify the right timing and organizational readiness for an equity audit.', 'video', 'https://example.com/videos/when-why-audit.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:52.310881+00', '2025-11-09 12:07:52.310881+00', NULL, '783590c3-4897-48c8-af9c-277169747a6b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('656d9e6b-0688-4a79-9eb2-4f00d8fd7091', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Building Internal Buy-In', 'building-buy-in', 'Secure leadership support and staff engagement for the audit process.', 'video', 'https://example.com/videos/building-buy-in.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:52.389312+00', '2025-11-09 12:07:52.389312+00', NULL, '783590c3-4897-48c8-af9c-277169747a6b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d1dccbc7-906a-4456-8577-86499ace7640', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Designing Your Audit Framework', 'designing-framework', 'Create a comprehensive framework covering all organizational systems.', 'video', 'https://example.com/videos/designing-framework.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:07:52.484237+00', '2025-11-09 12:07:52.484237+00', NULL, '5a3da97f-a44f-4e68-bafd-e5cb4db752d4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('63cdf67b-d2d9-48ba-a706-71054762ac68', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Quantitative Data Collection', 'quantitative-data', 'Gather and analyze demographic and outcome data.', 'video', 'https://example.com/videos/quantitative-data.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:52.543862+00', '2025-11-09 12:07:52.543862+00', NULL, '5a3da97f-a44f-4e68-bafd-e5cb4db752d4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b0a4deb5-7a18-4294-87a5-a546a68113b1', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Qualitative Data Collection', 'qualitative-data', 'Conduct interviews, focus groups, and surveys to understand lived experiences.', 'video', 'https://example.com/videos/qualitative-data.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:52.59456+00', '2025-11-09 12:07:52.59456+00', NULL, '5a3da97f-a44f-4e68-bafd-e5cb4db752d4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a02043d2-2c53-456f-8bbb-89bdbad5525f', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Policy and Practice Review', 'policy-practice-review', 'Examine organizational policies, procedures, and practices for equity impacts.', 'video', 'https://example.com/videos/policy-practice-review.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:07:52.64608+00', '2025-11-09 12:07:52.64608+00', NULL, '5a3da97f-a44f-4e68-bafd-e5cb4db752d4', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('43edf2fc-a34a-44c1-9342-9112cf784903', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Identifying Patterns and Disparities', 'identifying-patterns', 'Analyze data to surface meaningful patterns of inequity.', 'video', 'https://example.com/videos/identifying-patterns.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:07:52.738602+00', '2025-11-09 12:07:52.738602+00', NULL, '439b5b73-2f44-4260-867b-30888c398d95', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2c0183bf-6c01-44b4-8d26-be76d4789c37', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Root Cause Analysis', 'root-cause-analysis', 'Move beyond symptoms to identify underlying causes of disparities.', 'video', 'https://example.com/videos/root-cause-analysis.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:52.781862+00', '2025-11-09 12:07:52.781862+00', NULL, '439b5b73-2f44-4260-867b-30888c398d95', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('acf86eca-ed79-48c4-847c-9cdd491fe23d', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Prioritizing Findings', 'prioritizing-findings', 'Determine which issues to address first based on impact and feasibility.', 'video', 'https://example.com/videos/prioritizing-findings.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:52.841125+00', '2025-11-09 12:07:52.841125+00', NULL, '439b5b73-2f44-4260-867b-30888c398d95', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9aa02803-ae04-40ea-a177-9543f1284d45', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Writing the Equity Audit Report', 'writing-report', 'Create clear, compelling reports that drive action.', 'video', 'https://example.com/videos/writing-report.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:07:52.988377+00', '2025-11-09 12:07:52.988377+00', NULL, 'e7cae5a3-68a2-46b4-9b5a-fd3e86746561', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a6608a7c-154c-47c7-89e8-549be350d592', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Developing Recommendations', 'developing-recommendations', 'Craft specific, actionable recommendations tied to root causes.', 'video', 'https://example.com/videos/developing-recommendations.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:07:53.082005+00', '2025-11-09 12:07:53.082005+00', NULL, 'e7cae5a3-68a2-46b4-9b5a-fd3e86746561', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('10c24324-ed3d-46a6-baab-6f32d8ea04fe', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Creating Implementation Plans', 'implementation-plans', 'Turn recommendations into concrete action plans with timelines and accountability.', 'video', 'https://example.com/videos/implementation-plans.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:07:53.13335+00', '2025-11-09 12:07:53.13335+00', NULL, 'e7cae5a3-68a2-46b4-9b5a-fd3e86746561', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('60758217-bf21-423a-9888-a5292103d34a', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Final Assessment', 'final-assessment-equity-audits', 'Comprehensive assessment of equity audit knowledge and skills.', 'quiz', NULL, '{"questions": [{"options": ["To comply with legal requirements", "To systematically identify racial disparities and their root causes to inform action", "To prove the organization is not racist", "To satisfy employee demands"], "question": "What is the primary purpose of a racial equity audit?", "explanation": "A racial equity audit is a systematic examination of organizational policies, practices, and outcomes to identify racial disparities, understand their root causes, and develop evidence-based recommendations for change. The goal is action and improvement, not compliance or public relations. An audit should surface uncomfortable truths and drive meaningful transformation.", "correct_answer": 1}, {"options": ["Only quantitative demographic data", "Only employee survey responses", "Quantitative data on demographics and outcomes, qualitative data from lived experiences, and policy/practice reviews", "Whatever data is easiest to collect"], "question": "What types of data should a comprehensive equity audit include?", "explanation": "Comprehensive audits require multiple data sources: quantitative data (demographics, hiring, promotions, pay, retention, discipline) show what disparities exist; qualitative data (interviews, focus groups, surveys) explain why and how people experience the organization; policy reviews identify formal and informal practices that create or perpetuate disparities. All three are necessary for complete understanding.", "correct_answer": 2}, {"options": ["Identifying who is responsible for disparities", "Examining underlying systems, policies, and practices that create and maintain disparities rather than just documenting the disparities themselves", "Finding individual instances of discrimination", "Blaming leadership for problems"], "question": "What is root cause analysis in an equity audit?", "explanation": "Root cause analysis moves beyond describing disparities (e.g., \"Black employees are promoted less\") to understanding why (e.g., \"Promotion decisions rely on informal networks and subjective assessments; Black employees lack access to senior sponsors; criteria emphasize cultural fit over skills\"). This allows you to address causes rather than symptoms, leading to more effective interventions.", "correct_answer": 1}, {"options": ["It sounds good and uses the right language", "It is specific, tied to root causes, includes who will do what by when, and has clear success metrics", "It is easy to implement", "It makes everyone feel comfortable"], "question": "What makes an equity audit recommendation actionable?", "explanation": "Actionable recommendations are specific (not vague like \"improve culture\"), address identified root causes, assign clear responsibility, include timelines, define success metrics, and identify needed resources. Vague recommendations like \"increase diversity\" or \"provide more training\" rarely lead to change. Effective recommendations name concrete actions with accountability.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:07:53.184148+00', '2025-11-09 12:07:53.184148+00', NULL, 'e7cae5a3-68a2-46b4-9b5a-fd3e86746561', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6293d90b-0c15-4f3e-bb06-dd36eb88d861', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Introduction: Why Solidarity Matters', 'why-solidarity-matters', 'Understand the importance and potential of Indigenous-Black solidarity.', 'video', 'https://example.com/videos/why-solidarity-matters.mp4', '{}', 480, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:18:53.526585+00', '2025-11-09 12:18:53.526585+00', NULL, '008ceade-824d-4548-867f-072d69b014d7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c75b7842-27b7-460c-b864-bbe63a170ee2', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Interconnected Systems of Oppression', 'interconnected-oppression', 'Examine how colonialism, slavery, and white supremacy are linked.', 'video', 'https://example.com/videos/interconnected-oppression.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:18:53.58425+00', '2025-11-09 12:18:53.58425+00', NULL, '008ceade-824d-4548-867f-072d69b014d7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5d904692-a280-4744-bbed-01641f6c20bc', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Historical Examples of Indigenous-Black Solidarity', 'historical-solidarity', 'Learn from Maroon communities, underground railroad cooperation, and shared resistance movements.', 'video', 'https://example.com/videos/historical-solidarity.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:18:53.666314+00', '2025-11-09 12:18:53.666314+00', NULL, '008ceade-824d-4548-867f-072d69b014d7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('705fc8e1-ca24-4de7-8246-12d0b3cdd4b0', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Land, Sovereignty, and Displacement', 'land-sovereignty', 'Understand Indigenous relationship to land and sovereignty claims.', 'video', 'https://example.com/videos/land-sovereignty.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:18:53.802485+00', '2025-11-09 12:18:53.802485+00', NULL, '1bb4a5e0-e4f5-4e35-bd10-70cd471d647c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d417c2f3-8231-43d8-935f-3a743c591eb8', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Chattel Slavery and Diaspora', 'slavery-diaspora', 'Understand Black experiences of forced migration, slavery, and diaspora.', 'video', 'https://example.com/videos/slavery-diaspora.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:18:53.862481+00', '2025-11-09 12:18:53.862481+00', NULL, '1bb4a5e0-e4f5-4e35-bd10-70cd471d647c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5f6f2da6-f203-4ee6-a54b-a88942994669', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Avoiding Appropriation and Erasure', 'avoiding-appropriation', 'Learn how to honor both communities without erasing differences or appropriating struggles.', 'video', 'https://example.com/videos/avoiding-appropriation.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:18:53.946627+00', '2025-11-09 12:18:53.946627+00', NULL, '1bb4a5e0-e4f5-4e35-bd10-70cd471d647c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d6e4cd71-9216-48f3-b70a-ccc97529900a', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Anti-Blackness in Indigenous Communities', 'anti-blackness-indigenous', 'Address anti-Blackness within Indigenous spaces honestly.', 'video', 'https://example.com/videos/anti-blackness-indigenous.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:18:54.038558+00', '2025-11-09 12:18:54.038558+00', NULL, '1bb4a5e0-e4f5-4e35-bd10-70cd471d647c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d732667a-4ab2-4489-84f3-f2e657505c20', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Anti-Indigeneity in Black Communities', 'anti-indigeneity-black', 'Address anti-Indigenous attitudes within Black spaces honestly.', 'video', 'https://example.com/videos/anti-indigeneity-black.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 5, 5, true, false, '[]', NULL, '2025-11-09 12:18:54.121046+00', '2025-11-09 12:18:54.121046+00', NULL, '1bb4a5e0-e4f5-4e35-bd10-70cd471d647c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('649a5358-a57a-4541-a006-02c442c92716', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Principles of Solidarity Work', 'principles-solidarity', 'Establish foundational principles for cross-community organizing.', 'video', 'https://example.com/videos/principles-solidarity.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:18:54.252193+00', '2025-11-09 12:18:54.252193+00', NULL, '110b73ee-3e41-4d13-950a-b476003d5589', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3c7e5303-4a18-45ff-945d-ebddb409b6c5', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Coalition Building Best Practices', 'coalition-building', 'Learn from successful coalitions and common pitfalls to avoid.', 'video', 'https://example.com/videos/coalition-building.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:18:54.31613+00', '2025-11-09 12:18:54.31613+00', NULL, '110b73ee-3e41-4d13-950a-b476003d5589', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('be95324c-726b-40e9-8f08-499039d3b907', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Case Studies: Successful Solidarity Movements', 'case-studies-solidarity', 'Examine contemporary examples of Indigenous-Black solidarity in action.', 'video', 'https://example.com/videos/case-studies-solidarity.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:18:54.384798+00', '2025-11-09 12:18:54.384798+00', NULL, '110b73ee-3e41-4d13-950a-b476003d5589', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e3cd486e-ff8e-4179-a5f2-429bbec11b9f', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Final Assessment', 'final-assessment-solidarity', 'Comprehensive assessment of solidarity knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Assuming both experiences are identical", "Recognizing shared oppression while honoring distinct experiences and avoiding appropriation", "Focusing only on what is shared", "Competing for resources and attention"], "question": "What is the foundation of authentic Indigenous-Black solidarity?", "explanation": "Authentic solidarity requires recognizing both commonalities (shared experiences of white supremacy, colonialism, resistance) and distinctions (Indigenous relationship to land and sovereignty vs. Black experiences of forced migration and diaspora). We must honor both without erasing differences or appropriating struggles that are not our own.", "correct_answer": 1}, {"options": ["They are completely separate with no relationship", "Both are systems of white supremacy that relied on dehumanization, exploitation, and violence to extract value from racialized bodies and lands", "Only colonialism is a system of white supremacy", "They happened in different time periods"], "question": "How are colonialism and slavery interconnected systems?", "explanation": "Colonialism (theft of Indigenous lands, genocide, forced assimilation) and chattel slavery (theft of Black people, forced labor, commodification) are interconnected systems of white supremacy. Both relied on dehumanization, violence, and extraction. They operated simultaneously in Canada and reinforced each other—settler colonialism required displacing Indigenous peoples to create plantation economies that exploited enslaved Black labor.", "correct_answer": 1}, {"options": ["Never mention the other community''s struggles", "Understand and speak to another community''s struggles without claiming them as your own or using them for personal gain", "Only focus on your own community", "Copy the other community''s strategies exactly"], "question": "What does it mean to avoid appropriation in solidarity work?", "explanation": "Avoiding appropriation means we can learn from, support, and show solidarity with another community''s struggles without claiming them as our own. For example, Black people should not claim Indigenous identity or speak over Indigenous voices on land and sovereignty. Indigenous people should not claim Black identity or speak over Black voices on slavery and diaspora. We stand with, not as, each other.", "correct_answer": 1}, {"options": ["It''s not important—focus only on solidarity", "Authentic solidarity requires accountability; we cannot build genuine relationships while perpetuating harm against each other", "To prove we''re better than the other community", "Only white people need to address racism"], "question": "Why is it important to address anti-Blackness and anti-Indigeneity within our own communities?", "explanation": "Solidarity requires accountability. Anti-Blackness exists in some Indigenous communities (e.g., exclusion, stereotypes, colorism). Anti-Indigeneity exists in some Black communities (e.g., invisibilizing Indigenous peoples, benefiting from settlement). We must address these within our own communities, not to shame but to build authentic relationships based on mutual respect and support, not replication of colonial harm.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:18:54.468368+00', '2025-11-09 12:18:54.468368+00', NULL, '110b73ee-3e41-4d13-950a-b476003d5589', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('47f63e49-f451-4480-aae4-126f750b0aa7', '89412866-31d7-46e9-80eb-b5579b9648b1', 'What is Performative Allyship?', 'what-is-performative-allyship', 'Understand the characteristics and harms of performative allyship.', 'video', 'https://example.com/videos/what-is-performative-allyship.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:18:54.656615+00', '2025-11-09 12:18:54.656615+00', NULL, '4358c54a-6e4c-403d-9f09-1c0e9389894f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4f23a2bb-09b0-43a3-ab70-3ac8d139510b', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Tokenism: What It Is and Why It Hurts', 'tokenism', 'Recognize tokenism in hiring, panels, marketing, and decision-making.', 'video', 'https://example.com/videos/tokenism.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:18:54.712877+00', '2025-11-09 12:18:54.712877+00', NULL, '4358c54a-6e4c-403d-9f09-1c0e9389894f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('48432055-ff08-4c99-8a6e-0d66d89924eb', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Optical Allyship and Corporate Virtue Signaling', 'optical-allyship', 'Examine how organizations perform allyship for public relations without real change.', 'video', 'https://example.com/videos/optical-allyship.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:18:54.768993+00', '2025-11-09 12:18:54.768993+00', NULL, '4358c54a-6e4c-403d-9f09-1c0e9389894f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('25e1d1ed-9f40-49ea-93da-255b6e15f587', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Self-Examination: Are You Performing?', 'self-examination-performing', 'Reflect on your own motivations and behaviors as an ally.', 'video', 'https://example.com/videos/self-examination-performing.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:18:54.812166+00', '2025-11-09 12:18:54.812166+00', NULL, '4358c54a-6e4c-403d-9f09-1c0e9389894f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('cdbbe92e-79d7-4da2-bac0-74b9a09517ee', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Accountability Over Comfort', 'accountability-over-comfort', 'Prioritize being accountable to Black communities over your own comfort.', 'video', 'https://example.com/videos/accountability-over-comfort.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:18:54.923178+00', '2025-11-09 12:18:54.923178+00', NULL, 'd35bbbd4-55d1-4482-acfd-e3fc4aa4081b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('934dcc2e-85a9-4893-9cab-e6e1cfcc9cce', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Using Privilege Strategically', 'using-privilege', 'Learn to leverage privilege for anti-racist outcomes without centering yourself.', 'video', 'https://example.com/videos/using-privilege.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:18:54.987597+00', '2025-11-09 12:18:54.987597+00', NULL, 'd35bbbd4-55d1-4482-acfd-e3fc4aa4081b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d006d39e-51c8-454b-a770-122c619d1117', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Taking Risks and Accepting Consequences', 'taking-risks', 'Understand that genuine allyship sometimes requires sacrifice and discomfort.', 'video', 'https://example.com/videos/taking-risks.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:18:55.096388+00', '2025-11-09 12:18:55.096388+00', NULL, 'd35bbbd4-55d1-4482-acfd-e3fc4aa4081b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2709fd33-78d5-4acb-a413-00d0bbe39ced', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Building Authentic Relationships', 'authentic-relationships', 'Move beyond transactional allyship to genuine relationships and accountability.', 'video', 'https://example.com/videos/authentic-relationships.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:18:55.147228+00', '2025-11-09 12:18:55.147228+00', NULL, 'd35bbbd4-55d1-4482-acfd-e3fc4aa4081b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('87857a5c-eb9b-4b43-aa6f-6a9953069767', '89412866-31d7-46e9-80eb-b5579b9648b1', 'When You Make Mistakes', 'when-mistakes', 'Learn to receive feedback, apologize meaningfully, and repair harm.', 'video', 'https://example.com/videos/when-mistakes.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:18:55.273551+00', '2025-11-09 12:18:55.273551+00', NULL, 'eb5885d8-1b9a-4098-985c-e82cbf414e43', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7c47aa59-b226-4e3d-89c9-da004c2f31b1', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Sustaining Commitment Beyond Moments', 'sustaining-commitment', 'Maintain anti-racist action beyond viral moments and trending topics.', 'video', 'https://example.com/videos/sustaining-commitment.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:18:55.323431+00', '2025-11-09 12:18:55.323431+00', NULL, 'eb5885d8-1b9a-4098-985c-e82cbf414e43', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9b30c20d-88e8-4e8a-a587-30bb83d92fe5', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Final Assessment', 'final-assessment-allyship', 'Comprehensive assessment of allyship principles.', 'quiz', NULL, '{"questions": [{"options": ["Any public support for racial justice", "Actions taken primarily for personal benefit, social approval, or organizational image rather than genuine commitment to change", "Attending protests or posting on social media", "Making mistakes as an ally"], "question": "What is performative allyship?", "explanation": "Performative allyship is action taken primarily for appearance, social credit, or personal benefit rather than genuine commitment to anti-racist change. It often centers the ally rather than those experiencing racism, stops at symbolic gestures without structural change, and disappears when no longer trending. Genuine allyship centers those harmed, takes risks, sustains over time, and prioritizes accountability over comfort.", "correct_answer": 1}, {"options": ["Including any Black people in your organization", "Including minimal representation of Black people to appear diverse without addressing systemic barriers or sharing power", "Celebrating Black History Month", "Hiring based on qualifications"], "question": "What is tokenism?", "explanation": "Tokenism is minimal inclusion for appearance without structural change. Examples: the one Black person on panels, in marketing, or in leadership while systemic barriers remain; asking Black employees to represent all Black people; diversifying optics without diversifying power or decision-making. Tokenism harms by extracting labor, exposing people to hostile environments, and creating illusion of progress without actual equity.", "correct_answer": 1}, {"options": ["Remind everyone you have privilege", "Leverage access, credibility, and resources to advance anti-racist outcomes without centering yourself", "Feel guilty about privilege", "Give up all privilege"], "question": "What does it mean to use privilege strategically as an ally?", "explanation": "Strategic use of privilege means leveraging your access, credibility, and resources for anti-racist outcomes. Examples: amplifying Black voices in rooms they''re excluded from; using financial resources to fund Black-led organizations; interrupting racism in white spaces; taking professional risks to advocate for equity. Key: center those experiencing harm, not your allyship. Don''t announce \"I''m using my privilege\"—just do it.", "correct_answer": 1}, {"options": ["Defend yourself and explain your intentions", "Listen to feedback, apologize without centering your feelings, and commit to changed behavior", "Give up on being an ally", "Explain why it wasn''t really a mistake"], "question": "When you make a mistake as an ally, what should you do?", "explanation": "When you harm (and you will): Listen without defensiveness. Apologize specifically for the harm caused, not just for \"offense taken.\" Don''t center your guilt, intentions, or feelings. Don''t demand reassurance or emotional labor. Commit to learning and changed behavior. Follow through. Making mistakes is inevitable; how you respond determines whether you''re genuinely accountable or just performing allyship.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:18:55.39784+00', '2025-11-09 12:18:55.39784+00', NULL, 'eb5885d8-1b9a-4098-985c-e82cbf414e43', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('aff45d77-2ea3-431d-b176-d5c3f89beff1', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Introduction: Why Anti-Racist Education Matters', 'why-anti-racist-education', 'Understand the urgency and impact of anti-racist educational practices.', 'video', 'https://example.com/videos/why-anti-racist-education.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:26:53.283835+00', '2025-11-09 12:26:53.283835+00', NULL, 'cc223a93-918d-4887-963c-79ab8ecab856', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('30e5d92f-4663-413f-9b88-7dca39aadf1e', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Conducting a Curriculum Audit', 'curriculum-audit', 'Use frameworks to identify bias, erasure, and harmful narratives in curriculum.', 'video', 'https://example.com/videos/curriculum-audit.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:53.358974+00', '2025-11-09 12:26:53.358974+00', NULL, 'cc223a93-918d-4887-963c-79ab8ecab856', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('aeb868ff-f90b-45d8-8cbd-98114e4b940e', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Decolonizing Canadian History Curriculum', 'decolonizing-history', 'Move beyond sanitized narratives to teach honest Canadian history.', 'video', 'https://example.com/videos/decolonizing-history.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:53.439503+00', '2025-11-09 12:26:53.439503+00', NULL, 'cc223a93-918d-4887-963c-79ab8ecab856', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bc2e4f39-bacf-443b-801d-ee301858bd83', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Centering Black Voices and Contributions', 'centering-black-voices', 'Go beyond tokenism to authentically center Black perspectives and contributions.', 'video', 'https://example.com/videos/centering-black-voices.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:26:53.512519+00', '2025-11-09 12:26:53.512519+00', NULL, 'cc223a93-918d-4887-963c-79ab8ecab856', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b1ae30c6-a350-4cf0-9b47-6f4d8ce9c12b', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Building Classroom Community Across Difference', 'classroom-community', 'Create belonging for all students while addressing power and privilege.', 'video', 'https://example.com/videos/classroom-community.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:26:53.656604+00', '2025-11-09 12:26:53.656604+00', NULL, '676b939f-f8eb-404a-80c5-6ca8bd12fd5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5d8e66d6-ff53-4537-8f2f-a965158baf73', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Addressing Racist Incidents in Real Time', 'addressing-incidents', 'Respond effectively when racism occurs in your classroom.', 'video', 'https://example.com/videos/addressing-incidents.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:53.726667+00', '2025-11-09 12:26:53.726667+00', NULL, '676b939f-f8eb-404a-80c5-6ca8bd12fd5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('feb6cafd-6b37-47ff-affb-022951e895ff', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Culturally Sustaining Pedagogy', 'culturally-sustaining-pedagogy', 'Move beyond cultural competence to practices that sustain and affirm Black students.', 'video', 'https://example.com/videos/culturally-sustaining-pedagogy.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:53.80305+00', '2025-11-09 12:26:53.80305+00', NULL, '676b939f-f8eb-404a-80c5-6ca8bd12fd5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('80fb54e7-398d-4536-bd97-cee3668649ed', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Examining Your Own Biases as an Educator', 'examining-educator-biases', 'Reflect on how your own biases impact Black students.', 'video', 'https://example.com/videos/examining-educator-biases.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:26:53.889039+00', '2025-11-09 12:26:53.889039+00', NULL, '676b939f-f8eb-404a-80c5-6ca8bd12fd5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('efca1ef2-950e-4966-80c0-e7fb69e856ee', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'The Data: Discipline Disparities in Canadian Schools', 'discipline-disparities-data', 'Review Canadian data on suspensions, expulsions, and streaming.', 'video', 'https://example.com/videos/discipline-disparities-data.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:26:54.038926+00', '2025-11-09 12:26:54.038926+00', NULL, 'dd5492d1-a1c7-4172-839e-01afe3fafe7c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('957c8d37-4711-4378-88a8-93c80a7ef856', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Implicit Bias in Behavior Interpretation', 'bias-behavior-interpretation', 'Understand how bias shapes perception of Black students'' behavior.', 'video', 'https://example.com/videos/bias-behavior-interpretation.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:54.112105+00', '2025-11-09 12:26:54.112105+00', NULL, 'dd5492d1-a1c7-4172-839e-01afe3fafe7c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('40f35575-226f-4974-8f61-10769a1e0b36', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Restorative and Transformative Justice', 'restorative-justice', 'Implement alternatives to punitive discipline that address harm and build community.', 'video', 'https://example.com/videos/restorative-justice.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:54.187059+00', '2025-11-09 12:26:54.187059+00', NULL, 'dd5492d1-a1c7-4172-839e-01afe3fafe7c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('21cd3895-4d80-4f34-a456-c4cd88a72df6', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Understanding Barriers to Engagement', 'barriers-engagement', 'Recognize how schools create barriers for Black families.', 'video', 'https://example.com/videos/barriers-engagement.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:26:54.34356+00', '2025-11-09 12:26:54.34356+00', NULL, 'a9207e0a-a4b2-4032-9cd6-a991d68bc20e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('81f5ac20-13f0-43d0-8801-8949f0bd897b', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Building Trust with Black Families', 'building-trust-families', 'Move beyond deficit narratives to see families as assets and partners.', 'video', 'https://example.com/videos/building-trust-families.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:54.407471+00', '2025-11-09 12:26:54.407471+00', NULL, 'a9207e0a-a4b2-4032-9cd6-a991d68bc20e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('eecc8d75-8af9-477f-a3b0-239f6b53a0f8', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Community-Based Education Models', 'community-education-models', 'Learn from Afrocentric schools and community-led education initiatives.', 'video', 'https://example.com/videos/community-education-models.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:54.485825+00', '2025-11-09 12:26:54.485825+00', NULL, 'a9207e0a-a4b2-4032-9cd6-a991d68bc20e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('df839e88-c627-4352-9df3-e9ec8048fdc5', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Final Assessment', 'final-assessment-educators', 'Comprehensive assessment of anti-racist education practices.', 'quiz', NULL, '{"questions": [{"options": ["Add a few lessons about Indigenous or Black people", "Critically examine whose knowledge is centered, whose is erased, and fundamentally restructure curriculum to challenge colonial narratives", "Remove all Canadian history", "Only teach about oppression"], "question": "What does it mean to decolonize curriculum?", "explanation": "Decolonizing curriculum means fundamentally examining and challenging whose knowledge, perspectives, and narratives are centered as \"truth\" and whose are marginalized or erased. It requires moving beyond additive approaches (adding a Black History Month lesson) to transformative change: centering Indigenous and Black voices, teaching honest history including genocide and slavery, examining power structures, and recognizing multiple ways of knowing beyond Eurocentric frameworks.", "correct_answer": 1}, {"options": ["Black students are disciplined at equal rates to white students", "Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students even when behaviors are similar", "Discipline disparities only exist in the United States", "Black students misbehave more than other students"], "question": "What do Canadian data show about discipline disparities?", "explanation": "Canadian data consistently show Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students. Studies show they are disciplined more harshly for the same behaviors, are more likely to be labeled \"defiant\" or \"aggressive,\" and face school-based police involvement at higher rates. This is not about behavior differences—it''s about how Black students'' behavior is interpreted and responded to through biased lenses.", "correct_answer": 1}, {"options": ["Celebrating cultural holidays", "Teaching practices that sustain and affirm students'' cultural identities, languages, and ways of knowing as assets", "Treating all students exactly the same", "Learning about different cultures"], "question": "What is culturally sustaining pedagogy?", "explanation": "Culturally sustaining pedagogy (Django Paris) goes beyond cultural competence to actively sustain and affirm students'' cultural identities, languages, histories, and ways of knowing. It positions culture as an asset, not a deficit. For Black students, this means affirming Black language practices, centering Black history and contributions, connecting curriculum to Black community experiences, and recognizing diverse Black identities. It''s not additive—it''s transformative.", "correct_answer": 1}, {"options": ["Only contact them when there are problems", "Recognize and dismantle deficit narratives, build trust, share power, and partner with families as educational experts on their children", "Assume they don''t care about education", "Tell them what their children need to do differently"], "question": "How should educators engage Black families?", "explanation": "Black families often face deficit narratives that blame them for systemic failures. Authentic engagement requires: examining your own biases, recognizing barriers schools create, building trust through consistent positive contact, seeing families as assets and experts on their children, sharing power in decision-making, and addressing systemic issues rather than focusing on \"fixing\" families. When schools fail Black students, examine the school—not the family.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:26:54.557194+00', '2025-11-09 12:26:54.557194+00', NULL, 'a9207e0a-a4b2-4032-9cd6-a991d68bc20e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8bd4a337-a0e8-4710-83da-e55e1b962a1f', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Introduction: Policing and Anti-Black Racism', 'intro-policing-racism', 'Understand the scope of anti-Black racism in Canadian policing systems.', 'video', 'https://example.com/videos/intro-policing-racism.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:26:54.818574+00', '2025-11-09 12:26:54.818574+00', NULL, '44bb9d9c-de90-438a-a44f-77a975c40194', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8037ffe5-63f9-4224-93f5-6809220cb0f4', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Carding and Street Checks', 'carding-street-checks', 'Examine the practice, data, and impact of carding on Black communities.', 'video', 'https://example.com/videos/carding-street-checks.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:54.86338+00', '2025-11-09 12:26:54.86338+00', NULL, '44bb9d9c-de90-438a-a44f-77a975c40194', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8e2b8d42-9435-4ec0-ab8f-244ecd421b9b', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Police Violence Against Black Canadians', 'police-violence', 'Review cases, data, and patterns of police violence targeting Black people.', 'video', 'https://example.com/videos/police-violence.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:55.002089+00', '2025-11-09 12:26:55.002089+00', NULL, '44bb9d9c-de90-438a-a44f-77a975c40194', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('15e2c43b-6726-41b4-93d7-b07dff6c92e5', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Use of Force and De-escalation Failures', 'use-of-force', 'Understand racial disparities in use of force and deadly force.', 'video', 'https://example.com/videos/use-of-force.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:26:55.105195+00', '2025-11-09 12:26:55.105195+00', NULL, '44bb9d9c-de90-438a-a44f-77a975c40194', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('214e4b64-1f19-4268-a12d-c85726cba4c5', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Over-Policing and Over-Incarceration', 'over-policing-incarceration', 'Understand patterns of over-surveillance and over-incarceration of Black people.', 'video', 'https://example.com/videos/over-policing-incarceration.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:26:55.218281+00', '2025-11-09 12:26:55.218281+00', NULL, 'd7b0fe04-1c65-4b3d-9251-864473968b99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('52da1fb3-f5e4-47af-9a49-7638afdf427c', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Bail and Pre-Trial Detention', 'bail-pretrial', 'Examine racial disparities in bail decisions and pre-trial detention.', 'video', 'https://example.com/videos/bail-pretrial.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:55.285626+00', '2025-11-09 12:26:55.285626+00', NULL, 'd7b0fe04-1c65-4b3d-9251-864473968b99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b3fb71f9-31e1-4986-a143-c49ae88f8c5d', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Sentencing Disparities', 'sentencing-disparities', 'Understand how Black defendants receive harsher sentences for similar offenses.', 'video', 'https://example.com/videos/sentencing-disparities.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:55.345941+00', '2025-11-09 12:26:55.345941+00', NULL, 'd7b0fe04-1c65-4b3d-9251-864473968b99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('17227fe8-f396-462c-9d5c-82a4006e98be', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Conditions in Canadian Prisons', 'prison-conditions', 'Examine the experiences of Black people in federal and provincial institutions.', 'video', 'https://example.com/videos/prison-conditions.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:26:55.396589+00', '2025-11-09 12:26:55.396589+00', NULL, 'd7b0fe04-1c65-4b3d-9251-864473968b99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1cf3f66c-53d1-4e8b-8661-c9b5fb6b61c6', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'What is Community Safety?', 'what-is-community-safety', 'Redefine safety from a community perspective rather than a policing perspective.', 'video', 'https://example.com/videos/what-is-community-safety.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:26:55.524776+00', '2025-11-09 12:26:55.524776+00', NULL, '65bf016b-ab4d-4230-9805-db712c0076b7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8c9718b8-734c-4e3c-a32b-20a34df96234', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Community-Based Crisis Response', 'community-crisis-response', 'Learn from models that send community responders instead of police for mental health, housing, and other crises.', 'video', 'https://example.com/videos/community-crisis-response.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:55.579833+00', '2025-11-09 12:26:55.579833+00', NULL, '65bf016b-ab4d-4230-9805-db712c0076b7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f74d1226-436f-408e-b83f-a2f98e195e53', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Restorative and Transformative Justice', 'restorative-transformative-justice', 'Explore justice models that address harm and root causes rather than punishment.', 'video', 'https://example.com/videos/restorative-transformative-justice.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:55.63999+00', '2025-11-09 12:26:55.63999+00', NULL, '65bf016b-ab4d-4230-9805-db712c0076b7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8816f8b4-c5d4-4cbb-88ff-37d6b3c6a68c', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Current Accountability Gaps', 'accountability-gaps', 'Understand why current oversight mechanisms fail to create accountability.', 'video', 'https://example.com/videos/accountability-gaps.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:26:55.737315+00', '2025-11-09 12:26:55.737315+00', NULL, '83f78218-6312-4e72-bec7-40a3a5890edc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('929f68c7-0c16-4bae-be2f-1a44aa481e71', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Community Oversight Models', 'community-oversight', 'Learn about community-controlled oversight and accountability structures.', 'video', 'https://example.com/videos/community-oversight.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:26:55.80705+00', '2025-11-09 12:26:55.80705+00', NULL, '83f78218-6312-4e72-bec7-40a3a5890edc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6fabfc46-bf8c-428d-921c-219c4d2f8b6d', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Defunding and Reinvesting', 'defunding-reinvesting', 'Understand the case for defunding police and reinvesting in community resources.', 'video', 'https://example.com/videos/defunding-reinvesting.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:26:55.868844+00', '2025-11-09 12:26:55.868844+00', NULL, '83f78218-6312-4e72-bec7-40a3a5890edc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('76b3a887-4bae-46fe-bb56-d649ce31b383', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Final Assessment', 'final-assessment-policing', 'Comprehensive assessment of policing and justice reform knowledge.', 'quiz', NULL, '{"questions": [{"options": ["A normal police practice with no racial bias", "The practice of randomly stopping, questioning, and documenting people, disproportionately targeting Black people", "Only happens in the United States", "An effective crime prevention strategy"], "question": "What is carding (street checks)?", "explanation": "Carding (street checks) is the practice of police randomly stopping, questioning, and documenting individuals not suspected of any crime. Toronto data showed Black people were 3 times more likely to be carded than white people. It created databases of tens of thousands of Black residents, many never charged with anything. Carding violates rights, erodes trust, and reinforces criminalization of Black communities. Many jurisdictions have restricted or banned the practice.", "correct_answer": 1}, {"options": ["Police use force equally across all racial groups", "Black people are significantly overrepresented in police shootings and use of force incidents", "Police violence is not a problem in Canada", "Data is not collected on race and police violence"], "question": "What do data show about police use of force against Black Canadians?", "explanation": "Data show Black Canadians are vastly overrepresented in police shootings. In Toronto, Black people are 8.8% of population but 37% of people shot by police (20 times the rate). Similar patterns exist across Canada. Black people are also overrepresented in use of force reports, wellness checks gone deadly, and deaths in custody. This is not about behavior—it''s about how police perceive and respond to Black people.", "correct_answer": 1}, {"options": ["There are no alternatives to police", "Community-led responses to crises, needs, and harms that prioritize care, support, and addressing root causes rather than criminalization", "Just hiring more police officers", "Private security companies"], "question": "What are community-based alternatives to policing?", "explanation": "Community-based alternatives send trained community responders (not police) to mental health crises, housing issues, substance use, youth conflicts, etc. Examples include crisis intervention teams, mobile crisis units, street outreach workers, violence interruption programs, and restorative justice circles. These approaches prioritize care, de-escalation, connection to resources, and addressing root causes—resulting in better outcomes and lower costs than police responses.", "correct_answer": 1}, {"options": ["Eliminate all law enforcement immediately", "Reduce bloated police budgets and reinvest in community resources (housing, mental health, education) that actually create safety", "Stop paying police officers", "Increase crime"], "question": "What does \"defund the police\" mean?", "explanation": "\"Defund the police\" means reducing over-inflated police budgets (often 30-50% of municipal budgets) and reinvesting in community resources that address root causes of harm: affordable housing, mental health services, education, youth programs, addiction support. Police don''t prevent crime—addressing poverty, trauma, and lack of resources does. Defunding recognizes police cannot solve social problems and redirects funds to what actually creates safety.", "correct_answer": 1}], "passing_score": 80, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:26:55.945844+00', '2025-11-09 12:26:55.945844+00', NULL, '83f78218-6312-4e72-bec7-40a3a5890edc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f79b413e-7cec-4b0b-937a-f320395295b7', 'bec54d11-cb40-43da-aace-1177501111af', 'Introduction: What is Environmental Racism?', 'what-is-environmental-racism', 'Define environmental racism and understand its scope in Canada.', 'video', 'https://example.com/videos/what-is-environmental-racism.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:28:31.485254+00', '2025-11-09 12:28:31.485254+00', NULL, '64e49ca3-3f19-4902-93c7-09a8d12623d5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c18d45d9-71db-4af3-8189-9c620e5778e8', 'bec54d11-cb40-43da-aace-1177501111af', 'Case Studies: Africville, Nova Scotia', 'africville-case-study', 'Learn about the destruction of Africville and environmental racism in Nova Scotia.', 'video', 'https://example.com/videos/africville-case-study.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:31.561384+00', '2025-11-09 12:28:31.561384+00', NULL, '64e49ca3-3f19-4902-93c7-09a8d12623d5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('44eda668-a588-46ef-83aa-395939d17032', 'bec54d11-cb40-43da-aace-1177501111af', 'Case Studies: North Preston and Residential Proximity', 'north-preston-case-study', 'Examine landfills, sewage treatment, and industrial facilities near Black communities.', 'video', 'https://example.com/videos/north-preston-case-study.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:31.634778+00', '2025-11-09 12:28:31.634778+00', NULL, '64e49ca3-3f19-4902-93c7-09a8d12623d5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d7967847-6f62-4bba-af81-ca61f9982409', 'bec54d11-cb40-43da-aace-1177501111af', 'Intersections with Indigenous Environmental Justice', 'indigenous-environmental-justice', 'Understand connections between Black and Indigenous environmental struggles.', 'video', 'https://example.com/videos/indigenous-environmental-justice.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:28:31.69072+00', '2025-11-09 12:28:31.69072+00', NULL, '64e49ca3-3f19-4902-93c7-09a8d12623d5', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6a326e5a-e81f-4730-9e6b-0986109e8a5d', 'bec54d11-cb40-43da-aace-1177501111af', 'Air Quality and Respiratory Health', 'air-quality-health', 'Understand how poor air quality disproportionately affects Black neighborhoods.', 'video', 'https://example.com/videos/air-quality-health.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:28:31.828632+00', '2025-11-09 12:28:31.828632+00', NULL, '49fafd83-d071-476a-b730-a226c91d5613', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3528f7d9-6eef-4c8d-b800-c0bf92fb5d55', 'bec54d11-cb40-43da-aace-1177501111af', 'Water Contamination and Access', 'water-contamination', 'Examine water quality issues in Black and racialized communities.', 'video', 'https://example.com/videos/water-contamination.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:31.90252+00', '2025-11-09 12:28:31.90252+00', NULL, '49fafd83-d071-476a-b730-a226c91d5613', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5ed45c13-9001-49ee-ba25-0cafdc4a98a3', 'bec54d11-cb40-43da-aace-1177501111af', 'Toxic Exposure and Cancer Clusters', 'toxic-exposure', 'Understand proximity to industrial pollution and health outcomes.', 'video', 'https://example.com/videos/toxic-exposure.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:31.968176+00', '2025-11-09 12:28:31.968176+00', NULL, '49fafd83-d071-476a-b730-a226c91d5613', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ef92dd23-5b3f-4085-89c8-459feb7b6e10', 'bec54d11-cb40-43da-aace-1177501111af', 'Climate Change and Vulnerable Communities', 'climate-change-vulnerability', 'Explore how climate change disproportionately harms Black communities.', 'video', 'https://example.com/videos/climate-change-vulnerability.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:28:32.055449+00', '2025-11-09 12:28:32.055449+00', NULL, '49fafd83-d071-476a-b730-a226c91d5613', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0a47177e-c13b-4173-b636-59829af68dff', 'bec54d11-cb40-43da-aace-1177501111af', 'Black-Led Environmental Justice Movements', 'black-led-movements', 'Learn from community organizers fighting environmental racism.', 'video', 'https://example.com/videos/black-led-movements.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:28:32.217597+00', '2025-11-09 12:28:32.217597+00', NULL, '40bf1f0f-367f-4088-8f11-c15795cc87ee', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0cec60c3-db12-44c3-ac6b-32b14aaeb7ab', 'bec54d11-cb40-43da-aace-1177501111af', 'Policy Solutions and Accountability', 'policy-solutions', 'Explore policy changes needed to address environmental racism.', 'video', 'https://example.com/videos/policy-solutions.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:32.293421+00', '2025-11-09 12:28:32.293421+00', NULL, '40bf1f0f-367f-4088-8f11-c15795cc87ee', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ebaa7239-55f9-4655-b71e-37b1032c08a4', 'bec54d11-cb40-43da-aace-1177501111af', 'Final Assessment', 'final-assessment-environmental', 'Comprehensive assessment of environmental racism knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Racism that happens outdoors", "The disproportionate exposure of Black and racialized communities to environmental hazards like pollution, toxins, and contaminated land/water", "Individual prejudice about environmental issues", "A term only used in the United States"], "question": "What is environmental racism?", "explanation": "Environmental racism is the systemic pattern where Black, Indigenous, and racialized communities are disproportionately exposed to environmental hazards: landfills, industrial facilities, contaminated sites, poor air/water quality, etc. This is not random—it results from discriminatory zoning, housing policies, and land use decisions that locate environmental harms near communities with less political power. Africville (Halifax) is a Canadian example: a thriving Black community destroyed and used for sewage, dump sites, and industrial facilities.", "correct_answer": 1}, {"options": ["A Black community prospered with city support", "A thriving Black community was systematically destroyed through environmental racism, refused basic services, then demolished to make way for industrial development", "Nothing significant", "The community voluntarily relocated"], "question": "What happened in Africville, Nova Scotia?", "explanation": "Africville was a thriving Black community in Halifax founded in the 1840s. The city systematically refused basic services (water, sewage, paved roads) while locating environmental hazards there: infectious disease hospital, city dump, slaughterhouse, etc. In the 1960s, residents were forcibly relocated and homes demolished—supposedly for \"urban renewal\" but really to make way for industrial development. Africville is a stark example of environmental racism: a Black community deliberately subjected to environmental harms then destroyed.", "correct_answer": 1}, {"options": ["It doesn''t affect health", "Black communities near pollution face higher rates of asthma, cancer, respiratory disease, and other health problems", "Health impacts are the same for all communities", "Only affects mental health"], "question": "How does environmental racism impact health?", "explanation": "Environmental racism has severe health consequences. Black communities near industrial pollution, highways, and waste facilities face higher rates of asthma (especially children), cancer, cardiovascular disease, birth complications, and reduced life expectancy. Poor air quality, water contamination, and toxic exposure create health disparities. For example, Black children in polluted neighborhoods have asthma rates 2-3 times higher than white children. This is environmental injustice—communities harmed by decisions made without their consent.", "correct_answer": 1}, {"options": ["Tell individuals to recycle more", "Community-led organizing, policy changes mandating environmental equity assessments, holding polluters accountable, and investing in Black community health", "Ignore the problem", "Move Black communities away without addressing root causes"], "question": "What are solutions to environmental racism?", "explanation": "Solutions require systemic change, not individual actions. This includes: community-led organizing for environmental justice, policy requiring environmental equity assessments before siting hazards, holding corporations accountable for pollution, investing in Black community health and infrastructure, meaningful community consultation with veto power, reparations for communities harmed (like Africville), and climate justice policies centering vulnerable communities. Black communities must lead solutions—not be told what''s \"best\" for them.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:32.372092+00', '2025-11-09 12:28:32.372092+00', NULL, '40bf1f0f-367f-4088-8f11-c15795cc87ee', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b72d064a-e4ef-4fd6-a9e5-f649d61efff4', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Introduction: Why Traditional Recruiting Fails', 'why-recruiting-fails', 'Understand how traditional recruiting perpetuates exclusion.', 'video', 'https://example.com/videos/why-recruiting-fails.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:28:32.559779+00', '2025-11-09 12:28:32.559779+00', NULL, '68fd1c3d-d236-434a-803f-3075e495f27b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4c9b1105-a505-4704-be63-165aa90c7283', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Building Relationships, Not Transactions', 'building-relationships', 'Create ongoing relationships with Black communities and institutions.', 'video', 'https://example.com/videos/building-relationships.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:32.613409+00', '2025-11-09 12:28:32.613409+00', NULL, '68fd1c3d-d236-434a-803f-3075e495f27b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f5c08671-acc2-4d1d-b138-57a977dd7f44', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Examining Biased Job Descriptions', 'biased-job-descriptions', 'Identify and remove coded language and unnecessary barriers in job postings.', 'video', 'https://example.com/videos/biased-job-descriptions.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:32.666292+00', '2025-11-09 12:28:32.666292+00', NULL, '68fd1c3d-d236-434a-803f-3075e495f27b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('682e133f-1a75-4e69-a1c5-7941445525cb', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Expanding Where You Look', 'expanding-recruiting-channels', 'Move beyond traditional networks that exclude Black candidates.', 'video', 'https://example.com/videos/expanding-recruiting-channels.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:28:32.761147+00', '2025-11-09 12:28:32.761147+00', NULL, '68fd1c3d-d236-434a-803f-3075e495f27b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b58e0d69-8717-4f97-9ea1-ac4ecc5fda92', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Bias in Interviews: Common Patterns', 'bias-in-interviews', 'Recognize how bias shapes perception of Black candidates.', 'video', 'https://example.com/videos/bias-in-interviews.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:28:32.887212+00', '2025-11-09 12:28:32.887212+00', NULL, 'b98aa008-bee2-4068-a0c6-6fe8e6e10da0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('84eb9d49-88ba-48ac-95e8-c0b39afbeb29', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Structured Interviews and Blind Review', 'structured-interviews', 'Implement processes that reduce subjective bias.', 'video', 'https://example.com/videos/structured-interviews.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:32.949791+00', '2025-11-09 12:28:32.949791+00', NULL, 'b98aa008-bee2-4068-a0c6-6fe8e6e10da0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('83ac4af6-e15c-4f5a-9d1f-0ab94f120cbb', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Assessing "Culture Fit" vs Culture Add', 'culture-fit-vs-add', 'Move beyond homogeneous culture fit to value diverse perspectives.', 'video', 'https://example.com/videos/culture-fit-vs-add.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:33.005211+00', '2025-11-09 12:28:33.005211+00', NULL, 'b98aa008-bee2-4068-a0c6-6fe8e6e10da0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f382acfe-1ad5-41bd-9796-5fc8b956ac75', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Diverse Interview Panels', 'diverse-panels', 'Ensure Black candidates see themselves reflected in your organization.', 'video', 'https://example.com/videos/diverse-panels.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:28:33.06924+00', '2025-11-09 12:28:33.06924+00', NULL, 'b98aa008-bee2-4068-a0c6-6fe8e6e10da0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a12e837a-8905-4f27-900f-b337de9d7709', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Why Onboarding Matters for Equity', 'why-onboarding-matters', 'Understand how onboarding can reinforce or disrupt inequity.', 'video', 'https://example.com/videos/why-onboarding-matters.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:28:33.204099+00', '2025-11-09 12:28:33.204099+00', NULL, '4c5f6c1b-e9bb-4509-8b38-a8a40dabeda6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8a31941f-2459-426b-9961-efed7b9bd597', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Access to Networks and Sponsorship', 'access-networks-sponsorship', 'Ensure Black employees have equal access to informal networks and sponsors.', 'video', 'https://example.com/videos/access-networks-sponsorship.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:33.271298+00', '2025-11-09 12:28:33.271298+00', NULL, '4c5f6c1b-e9bb-4509-8b38-a8a40dabeda6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('79f9fad9-0f62-4313-a28e-dd1d1461d599', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Setting Clear Expectations and Support', 'clear-expectations-support', 'Provide clarity, resources, and support for success.', 'video', 'https://example.com/videos/clear-expectations-support.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:33.320842+00', '2025-11-09 12:28:33.320842+00', NULL, '4c5f6c1b-e9bb-4509-8b38-a8a40dabeda6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('10fdd8bc-cac8-4087-9dff-16df19127ca0', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Why Black Employees Leave', 'why-employees-leave', 'Understand the systemic barriers driving Black employees out.', 'video', 'https://example.com/videos/why-employees-leave.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:28:33.415268+00', '2025-11-09 12:28:33.415268+00', NULL, '47b1c483-3ade-45bc-8c27-5327f3844b93', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('55119abf-0924-4c26-9bbb-413be69dafa2', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Creating Psychologically Safe Environments', 'psychological-safety', 'Build workplaces where Black employees can bring their full selves.', 'video', 'https://example.com/videos/psychological-safety.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:28:33.459203+00', '2025-11-09 12:28:33.459203+00', NULL, '47b1c483-3ade-45bc-8c27-5327f3844b93', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('225ba9ac-68bc-4ce0-b4c0-c8df4ff5f047', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Equitable Performance Evaluation and Advancement', 'equitable-evaluation', 'Address bias in performance reviews and promotion decisions.', 'video', 'https://example.com/videos/equitable-evaluation.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:28:33.521179+00', '2025-11-09 12:28:33.521179+00', NULL, '47b1c483-3ade-45bc-8c27-5327f3844b93', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a8e45647-a680-4d88-9c4f-38eb928c01d4', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Accountability for Retention Outcomes', 'accountability-retention', 'Measure, track, and hold leadership accountable for retention.', 'video', 'https://example.com/videos/accountability-retention.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:28:33.574563+00', '2025-11-09 12:28:33.574563+00', NULL, '47b1c483-3ade-45bc-8c27-5327f3844b93', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2a36b03c-3761-4218-ab49-628d7662ea65', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Final Assessment', 'final-assessment-recruitment', 'Comprehensive assessment of recruitment and retention best practices.', 'quiz', NULL, '{"questions": [{"options": ["Nothing, they work fine", "They rely on homogeneous networks, biased job descriptions, and transactional relationships that exclude Black candidates", "They are too inclusive", "They only need minor tweaks"], "question": "What is wrong with traditional recruitment approaches?", "explanation": "Traditional recruiting perpetuates exclusion by: relying on homogeneous networks (\"who do we know?\"), using coded language in job descriptions (e.g., \"culture fit,\" \"polish\"), requiring unnecessary credentials that screen out qualified candidates, taking transactional approaches (showing up only when hiring), and failing to examine bias in screening. To recruit Black talent authentically, build ongoing relationships with Black communities/institutions, remove barriers, expand networks, and demonstrate genuine commitment.", "correct_answer": 1}, {"options": ["There is no problem with culture fit", "It is often code for \"people like us\" and screens out Black candidates who would bring valuable different perspectives", "It ensures team cohesion", "It helps with retention"], "question": "What is the problem with \"culture fit\"?", "explanation": "\"Culture fit\" sounds neutral but is often code for hiring people similar to existing (often white) staff. It screens out Black candidates who don''t match the dominant culture, reinforcing homogeneity. Research shows candidates who \"fit\" are often those who look, talk, and think like existing employees. Instead, prioritize \"culture add\"—hiring people who bring different perspectives, challenge assumptions, and expand your culture. Diversity strengthens teams; homogeneity creates blind spots.", "correct_answer": 1}, {"options": ["They are not committed", "Due to systemic barriers: microaggressions, exclusion from networks, biased evaluations, lack of advancement, hostile environments, and emotional exhaustion", "Better pay elsewhere", "Personal reasons unrelated to workplace"], "question": "Why do Black employees leave organizations?", "explanation": "Black employees leave due to hostile work environments: constant microaggressions, being the \"only one,\" exclusion from informal networks/opportunities, biased performance evaluations, glass ceilings blocking advancement, lack of psychological safety, emotional labor of educating colleagues, and watching organizations fail to act on stated DEI commitments. The issue is not individual \"fit\"—it''s systemic barriers. Exit interviews often reveal patterns organizations ignore. Retention requires addressing root causes, not surface-level perks.", "correct_answer": 1}, {"options": ["The same onboarding for everyone", "Intentional access to networks, clear expectations, sponsorship, resources, and addressing barriers Black employees face", "A welcome email and desk", "Diversity training on day one"], "question": "What does equitable onboarding require?", "explanation": "Equitable onboarding requires more than generic orientation. Black employees need: intentional access to informal networks (not just formal org charts), sponsors (not just mentors) who advocate for them, clear expectations and success metrics, resources and support, education for existing staff on inclusive behaviors, and acknowledgment of barriers they may face. Don''t assume everyone has equal access—white employees benefit from homogeneous networks. Equitable onboarding proactively creates access and support.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 5, 5, true, false, '[]', NULL, '2025-11-09 12:28:33.634602+00', '2025-11-09 12:28:33.634602+00', NULL, '47b1c483-3ade-45bc-8c27-5327f3844b93', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('361866ed-3f77-48f0-8129-d83d63abf5d2', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Introduction: Anti-Racism in Legal Systems', 'intro-anti-racism-legal', 'Understand the scope of anti-Black racism in Canadian legal systems.', 'video', 'https://example.com/videos/intro-anti-racism-legal.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:35:04.257446+00', '2025-11-09 12:35:04.257446+00', NULL, 'e851d8a0-153a-4db5-b5be-281c055ff8a7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('576c6967-4433-4bfb-a0a8-876e19626e85', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Barriers in Legal Education', 'barriers-legal-education', 'Examine systemic barriers Black students face in law school admission and success.', 'video', 'https://example.com/videos/barriers-legal-education.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:04.329763+00', '2025-11-09 12:35:04.329763+00', NULL, 'e851d8a0-153a-4db5-b5be-281c055ff8a7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b437e066-21b2-4c30-916e-7e16fb287125', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'The "Pipeline Problem" Myth', 'pipeline-problem-myth', 'Challenge deficit narratives about Black representation in legal profession.', 'video', 'https://example.com/videos/pipeline-problem-myth.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:04.450083+00', '2025-11-09 12:35:04.450083+00', NULL, 'e851d8a0-153a-4db5-b5be-281c055ff8a7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9877965d-a8a5-4611-9236-3ff3958f565c', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Bias in Law Firm Hiring and Advancement', 'bias-firm-hiring', 'Recognize how bias shapes hiring, evaluation, and partnership decisions.', 'video', 'https://example.com/videos/bias-firm-hiring.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:35:04.538549+00', '2025-11-09 12:35:04.538549+00', NULL, 'e851d8a0-153a-4db5-b5be-281c055ff8a7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a250cc58-e0a2-44ae-924d-9c7f838aedac', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Implicit Bias in Judges and Juries', 'judicial-implicit-bias', 'Understand how implicit bias affects judicial and jury decision-making.', 'video', 'https://example.com/videos/judicial-implicit-bias.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:35:04.670012+00', '2025-11-09 12:35:04.670012+00', NULL, 'a7ca7c09-9be1-400b-aa36-49e08c26aa78', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0e06c2db-bca3-4984-843c-5c0b129d8269', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Sentencing Disparities in Canadian Courts', 'sentencing-disparities-courts', 'Review Canadian data on racial disparities in sentencing.', 'video', 'https://example.com/videos/sentencing-disparities-courts.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:04.728188+00', '2025-11-09 12:35:04.728188+00', NULL, 'a7ca7c09-9be1-400b-aa36-49e08c26aa78', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f4670c8a-362c-4f1a-a7e8-59708f687cdb', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Jury Selection and Challenges for Cause', 'jury-selection-bias', 'Examine racial bias in jury composition and selection processes.', 'video', 'https://example.com/videos/jury-selection-bias.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:04.790797+00', '2025-11-09 12:35:04.790797+00', NULL, 'a7ca7c09-9be1-400b-aa36-49e08c26aa78', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6eab4dfb-2d82-4ee3-89dd-667abfc3d5d5', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Victim Impact and Credibility Bias', 'victim-credibility-bias', 'Understand how Black victims are treated differently in legal proceedings.', 'video', 'https://example.com/videos/victim-credibility-bias.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:35:04.880816+00', '2025-11-09 12:35:04.880816+00', NULL, 'a7ca7c09-9be1-400b-aa36-49e08c26aa78', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4c0a18e6-6cc1-43d9-beba-7575d152cad1', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'The Cost of Justice: Financial Barriers', 'cost-justice-barriers', 'Examine how legal costs create barriers to justice for Black communities.', 'video', 'https://example.com/videos/cost-justice-barriers.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:35:05.091505+00', '2025-11-09 12:35:05.091505+00', NULL, 'b2777560-172b-456f-ae10-896107fea3f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('95e29ccf-91b5-4ecc-84f8-680692ab878a', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Legal Aid and Public Defense Inadequacy', 'legal-aid-inadequacy', 'Understand failures in legal aid systems serving Black defendants.', 'video', 'https://example.com/videos/legal-aid-inadequacy.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:05.170802+00', '2025-11-09 12:35:05.170802+00', NULL, 'b2777560-172b-456f-ae10-896107fea3f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9e5de3eb-971b-4df4-80b6-8d5bc9c09ad3', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Community Legal Clinics and Alternatives', 'community-legal-clinics', 'Learn from community-led models for legal access.', 'video', 'https://example.com/videos/community-legal-clinics.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:05.225413+00', '2025-11-09 12:35:05.225413+00', NULL, 'b2777560-172b-456f-ae10-896107fea3f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8a7d3651-8aaf-4016-9ec9-27d34c675eab', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Client-Centered Representation', 'client-centered-representation', 'Center Black clients'' voices, experiences, and self-determination.', 'video', 'https://example.com/videos/client-centered-representation.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:35:05.374124+00', '2025-11-09 12:35:05.374124+00', NULL, '1eb64225-b879-4ba2-b2c3-5cf02576df99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('298201b1-5fbf-402b-b095-33a052cb884a', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Challenging Bias in Legal Proceedings', 'challenging-bias-proceedings', 'Strategies for identifying and challenging bias in court.', 'video', 'https://example.com/videos/challenging-bias-proceedings.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:05.433142+00', '2025-11-09 12:35:05.433142+00', NULL, '1eb64225-b879-4ba2-b2c3-5cf02576df99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9fee08d6-61e9-4ceb-9cbc-b61f3e7c1685', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Pro Bono and Impact Litigation', 'pro-bono-impact-litigation', 'Use legal skills to advance racial justice through strategic litigation.', 'video', 'https://example.com/videos/pro-bono-impact-litigation.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:05.520076+00', '2025-11-09 12:35:05.520076+00', NULL, '1eb64225-b879-4ba2-b2c3-5cf02576df99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d41628cb-3b91-4389-8200-5e40696a99c8', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Final Assessment', 'final-assessment-legal', 'Comprehensive assessment of anti-racism in legal practice.', 'quiz', NULL, '{"questions": [{"options": ["There genuinely are not enough qualified Black candidates", "The claim that lack of Black lawyers is due to pipeline rather than systemic barriers in hiring, retention, and advancement", "Black students do not want to pursue law", "Law schools have done enough to address diversity"], "question": "What is the \"pipeline problem\" myth in legal profession?", "explanation": "The \"pipeline problem\" narrative blames lack of Black representation on insufficient candidates rather than examining systemic barriers. In reality, Black law graduates face bias in hiring (coded language, \"culture fit\" screening), biased performance evaluations, exclusion from informal networks, microaggressions, glass ceilings blocking partnership, and hostile environments driving them out. The issue is not pipeline—it''s what happens after graduation. Focusing on pipeline allows firms to avoid accountability for retention and advancement failures.", "correct_answer": 1}, {"options": ["Black and white defendants receive equal sentences", "Black defendants receive harsher sentences than white defendants for similar offenses, even controlling for criminal history", "Judges are completely objective", "Sentencing disparities only exist in the United States"], "question": "What do Canadian data show about sentencing disparities?", "explanation": "Canadian data show Black defendants receive harsher sentences than white defendants for similar offenses, even after controlling for criminal history and offense severity. Black defendants are more likely to be denied bail, receive custodial sentences rather than alternatives, and get longer prison terms. This reflects implicit bias in how judges perceive Black defendants (more dangerous, less remorseful, greater flight risk) and systemic racism in sentencing guidelines and judicial discretion.", "correct_answer": 1}, {"options": ["Black people do not want lawyers", "High costs, inadequate legal aid, mistrust of legal system, lack of culturally competent representation, and systemic barriers to access", "There are no barriers", "Only financial barriers matter"], "question": "What are barriers to legal representation for Black communities?", "explanation": "Black communities face multiple barriers to legal representation: high legal costs (hourly rates exclude many), chronically underfunded legal aid systems, lack of lawyers who understand anti-Black racism, mistrust of legal systems that have historically harmed Black people, geographic barriers (legal deserts in Black neighborhoods), language and cultural barriers, and fear of system involvement. These barriers mean Black people often navigate legal issues without adequate representation, perpetuating injustice.", "correct_answer": 1}, {"options": ["Treating all clients exactly the same", "Centering Black clients'' voices, challenging bias in proceedings, using legal skills for justice, and examining your own biases", "Avoiding discussion of race", "Following standard procedures without question"], "question": "What does anti-racist legal practice require?", "explanation": "Anti-racist legal practice requires: centering Black clients as experts on their own lives, actively identifying and challenging bias in legal proceedings (voir dire, sentencing submissions), using legal skills strategically for racial justice (pro bono, impact litigation, policy advocacy), building trust with Black communities, examining your own biases and how they shape legal strategy, and advocating for systemic change beyond individual cases. Treating everyone \"the same\" ignores how racism operates and perpetuates inequity.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:35:05.56896+00', '2025-11-09 12:35:05.56896+00', NULL, '1eb64225-b879-4ba2-b2c3-5cf02576df99', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('24c9807d-f27c-45de-bab1-a6a98a71e02a', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Introduction: Technology is Not Neutral', 'tech-not-neutral', 'Challenge the myth of neutral, objective technology.', 'video', 'https://example.com/videos/tech-not-neutral.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:35:05.793846+00', '2025-11-09 12:35:05.793846+00', NULL, '566225e5-8748-46ea-8022-3b377866b449', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('66ed80d1-a9d4-404c-ac69-f7a33f11a87c', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'What is Algorithmic Bias?', 'what-is-algorithmic-bias', 'Define algorithmic bias and understand how it operates.', 'video', 'https://example.com/videos/what-is-algorithmic-bias.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:05.858665+00', '2025-11-09 12:35:05.858665+00', NULL, '566225e5-8748-46ea-8022-3b377866b449', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0214acd1-5af1-492d-a46a-a9c1ea65d5c6', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Training Data and Historical Bias', 'training-data-bias', 'Understand how biased historical data creates biased algorithms.', 'video', 'https://example.com/videos/training-data-bias.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:05.914441+00', '2025-11-09 12:35:05.914441+00', NULL, '566225e5-8748-46ea-8022-3b377866b449', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('542be7b0-7bac-4b4f-ab38-1b93f72d1d58', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Facial Recognition and Surveillance Technology', 'facial-recognition-surveillance', 'Examine racial bias in facial recognition and surveillance systems.', 'video', 'https://example.com/videos/facial-recognition-surveillance.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:35:05.96413+00', '2025-11-09 12:35:05.96413+00', NULL, '566225e5-8748-46ea-8022-3b377866b449', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d2de02e9-0d4d-47f2-8add-2f8f084b6a0d', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Predictive Policing and Risk Assessment', 'predictive-policing-risk', 'Understand how algorithms perpetuate over-policing of Black communities.', 'video', 'https://example.com/videos/predictive-policing-risk.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:35:06.104497+00', '2025-11-09 12:35:06.104497+00', NULL, 'fc6b61b0-3844-4054-aaaf-fbdd02f88859', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c7c4df55-0648-48da-81a0-f10ee50c84b1', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Algorithmic Hiring and Resume Screening', 'algorithmic-hiring', 'Examine bias in AI-powered hiring tools that screen out Black candidates.', 'video', 'https://example.com/videos/algorithmic-hiring.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:06.220762+00', '2025-11-09 12:35:06.220762+00', NULL, 'fc6b61b0-3844-4054-aaaf-fbdd02f88859', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e9962423-4013-4ada-a69c-8368e3852d31', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Healthcare Algorithms and Diagnostic Bias', 'healthcare-algorithmic-bias', 'Understand racial bias in medical algorithms and health tech.', 'video', 'https://example.com/videos/healthcare-algorithmic-bias.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:06.434651+00', '2025-11-09 12:35:06.434651+00', NULL, 'fc6b61b0-3844-4054-aaaf-fbdd02f88859', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c44c2a1b-9312-45cd-aff1-96d723764851', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Credit Scoring and Financial Algorithms', 'credit-scoring-bias', 'Examine how algorithms perpetuate financial discrimination.', 'video', 'https://example.com/videos/credit-scoring-bias.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:35:06.48578+00', '2025-11-09 12:35:06.48578+00', NULL, 'fc6b61b0-3844-4054-aaaf-fbdd02f88859', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d613c685-11fe-498a-9007-875cc996fa8b', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'The Myth of Meritocracy in Tech', 'meritocracy-myth-tech', 'Challenge narratives that blame Black underrepresentation on merit.', 'video', 'https://example.com/videos/meritocracy-myth-tech.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:35:06.590954+00', '2025-11-09 12:35:06.590954+00', NULL, 'b9acfd29-0e8d-467d-b83a-f2a3324609f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bc789fe3-5ce1-469a-a65a-0b81ccd5c0e4', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Hostile Work Environments in Tech', 'hostile-tech-environments', 'Understand experiences of Black tech workers facing discrimination.', 'video', 'https://example.com/videos/hostile-tech-environments.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:06.662637+00', '2025-11-09 12:35:06.662637+00', NULL, 'b9acfd29-0e8d-467d-b83a-f2a3324609f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4029671d-07e3-4643-9c77-1338aade8a39', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'The Digital Divide and Access Inequality', 'digital-divide', 'Examine how technology access gaps perpetuate racial inequality.', 'video', 'https://example.com/videos/digital-divide.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:06.716025+00', '2025-11-09 12:35:06.716025+00', NULL, 'b9acfd29-0e8d-467d-b83a-f2a3324609f9', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a191a5a9-0ee5-48ef-8c8a-31c0ac03eba0', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Principles of Ethical AI Development', 'ethical-ai-principles', 'Learn frameworks for developing AI that does not perpetuate racism.', 'video', 'https://example.com/videos/ethical-ai-principles.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:35:06.807743+00', '2025-11-09 12:35:06.807743+00', NULL, 'edb7595e-a085-414e-adbb-f4462d88e49c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('847403af-6042-4fa4-91c8-700e1d90a81b', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Algorithmic Impact Assessments', 'algorithmic-impact-assessments', 'Implement processes to assess algorithmic bias before deployment.', 'video', 'https://example.com/videos/algorithmic-impact-assessments.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:35:06.84988+00', '2025-11-09 12:35:06.84988+00', NULL, 'edb7595e-a085-414e-adbb-f4462d88e49c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2e48dea2-1d94-49bb-ba86-59e99fafa625', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Advocating for Tech Justice', 'tech-justice-advocacy', 'Build movements for algorithmic accountability and tech regulation.', 'video', 'https://example.com/videos/tech-justice-advocacy.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:35:06.906121+00', '2025-11-09 12:35:06.906121+00', NULL, 'edb7595e-a085-414e-adbb-f4462d88e49c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8b4f132a-3abd-41ec-bc53-38c8baf2c314', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Final Assessment', 'final-assessment-tech', 'Comprehensive assessment of algorithmic justice knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Technology is completely objective and neutral", "Technology is designed by people with biases, trained on biased data, and deployed in biased systems—reflecting and amplifying existing inequalities", "Only certain technologies are biased", "Bias can be easily removed from technology"], "question": "Why is technology not neutral?", "explanation": "Technology is not neutral because: it''s designed by people (often homogeneous tech teams) whose biases shape design choices, it''s trained on historical data reflecting societal racism, algorithms optimize for patterns that include discriminatory patterns, deployment contexts are inequitable, and tech lacks transparency/accountability. The \"neutral tech\" myth allows companies to disclaim responsibility. In reality, facial recognition misidentifies Black faces, hiring algorithms screen out Black candidates, and predictive policing targets Black neighborhoods—by design, not accident.", "correct_answer": 1}, {"options": ["They accurately predict crime", "They are trained on biased policing data and create feedback loops that over-police Black communities", "They reduce bias in policing", "They are only used in the United States"], "question": "What is the problem with predictive policing algorithms?", "explanation": "Predictive policing algorithms are trained on historical arrest data—which reflects biased policing, not actual crime patterns. If police historically over-policed Black neighborhoods (they did), algorithms \"predict\" crime there and send more police, leading to more arrests, which \"confirms\" the prediction. This creates a feedback loop amplifying existing bias. Algorithms don''t predict crime—they predict where police have been. They legitimize discriminatory policing under the guise of \"objective\" data, making racism harder to challenge.", "correct_answer": 1}, {"options": ["They do not discriminate", "They are trained on past hiring data reflecting bias, use proxies for race, and penalize candidates from Black neighborhoods or schools", "They increase diversity", "Human recruiters are more biased than algorithms"], "question": "How do hiring algorithms discriminate against Black candidates?", "explanation": "Hiring algorithms perpetuate discrimination by: being trained on historical hiring data (which reflected bias against Black candidates), using proxies for race (names, zip codes, schools, speech patterns), penalizing resume gaps common in marginalized communities, optimizing for \"culture fit\" (code for homogeneity), and lacking transparency. Amazon''s algorithm penalized resumes mentioning \"women''s\" organizations. Similar patterns affect Black candidates. Algorithms don''t eliminate bias—they scale and legitimize it under claims of \"objectivity.\"", "correct_answer": 1}, {"options": ["Just testing for accuracy", "Diverse development teams, bias audits, impact assessments, transparency, accountability mechanisms, and centering affected communities", "Faster processing speeds", "More data collection"], "question": "What do ethical AI practices require?", "explanation": "Ethical AI requires: diverse development teams (not just white/Asian men), rigorous bias audits across racial groups, algorithmic impact assessments before deployment, transparency about how algorithms work, accountability when harm occurs, participatory design centering affected communities, ongoing monitoring for disparate impacts, and willingness to NOT deploy when harm cannot be mitigated. \"Moving fast and breaking things\" breaks people. Ethical AI prioritizes justice over profit.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:35:06.960627+00', '2025-11-09 12:35:06.960627+00', NULL, 'edb7595e-a085-414e-adbb-f4462d88e49c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('19d9b165-8c9d-4de8-9cfc-562128dbbc77', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Introduction: Anti-Black Racism in Financial Systems', 'intro-finance-racism', 'Understand systemic racism in Canadian financial services.', 'video', 'https://example.com/videos/intro-finance-racism.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:41:50.416894+00', '2025-11-09 12:41:50.416894+00', NULL, 'af93b6ea-ffe8-4308-9cc3-f2fca45e446b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('61ff1823-a1dd-427e-990a-340b1f311900', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Banking Deserts and Access Barriers', 'banking-deserts', 'Examine how Black communities lack access to banking services.', 'video', 'https://example.com/videos/banking-deserts.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:50.568108+00', '2025-11-09 12:41:50.568108+00', NULL, 'af93b6ea-ffe8-4308-9cc3-f2fca45e446b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2bb6dc8f-3454-4a71-aa4f-6125183d265c', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Discriminatory Lending Practices', 'discriminatory-lending', 'Understand bias in loan approval and interest rates.', 'video', 'https://example.com/videos/discriminatory-lending.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:50.639381+00', '2025-11-09 12:41:50.639381+00', NULL, 'af93b6ea-ffe8-4308-9cc3-f2fca45e446b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('cbf0a793-1264-4c73-9b45-4560a2d911ad', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Predatory Lending and Payday Loans', 'predatory-lending', 'Examine exploitation through predatory financial products.', 'video', 'https://example.com/videos/predatory-lending.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:41:50.741676+00', '2025-11-09 12:41:50.741676+00', NULL, 'af93b6ea-ffe8-4308-9cc3-f2fca45e446b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1c84179c-cebe-41f6-aff9-4206ad25ef8d', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Credit Scoring Bias', 'credit-scoring-bias-finance', 'Examine how credit systems discriminate against Black borrowers.', 'video', 'https://example.com/videos/credit-scoring-bias-finance.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:41:50.854381+00', '2025-11-09 12:41:50.854381+00', NULL, 'c59dd2f1-3e3a-4171-9709-01d03ffa5027', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('aeab3886-c45f-413b-bf99-0f0a53a62231', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Student Debt Disparities', 'student-debt-disparities', 'Understand why Black students graduate with more debt.', 'video', 'https://example.com/videos/student-debt-disparities.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:50.906114+00', '2025-11-09 12:41:50.906114+00', NULL, 'c59dd2f1-3e3a-4171-9709-01d03ffa5027', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('14057196-5c6a-4fcf-970d-2b5cca7bd438', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Consumer Debt and Collections', 'consumer-debt-collections', 'Examine disproportionate debt collection targeting Black communities.', 'video', 'https://example.com/videos/consumer-debt-collections.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:51.007379+00', '2025-11-09 12:41:51.007379+00', NULL, 'c59dd2f1-3e3a-4171-9709-01d03ffa5027', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('95fafb38-4cf6-4332-bfa4-b7b626f9057a', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Mortgage Discrimination', 'mortgage-discrimination', 'Understand bias in mortgage approval and rates.', 'video', 'https://example.com/videos/mortgage-discrimination.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:41:51.183492+00', '2025-11-09 12:41:51.183492+00', NULL, '040a39ea-f623-4b86-bd0c-58cea4a369f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c1bb193d-1f5f-450d-8564-5f38fbdf3463', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Property Appraisal Bias', 'property-appraisal-bias', 'Examine how appraisers undervalue Black-owned homes.', 'video', 'https://example.com/videos/property-appraisal-bias.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:51.243688+00', '2025-11-09 12:41:51.243688+00', NULL, '040a39ea-f623-4b86-bd0c-58cea4a369f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4fd01937-e27b-484c-9e12-92df51312e21', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Gentrification and Displacement', 'gentrification-displacement', 'Understand how development displaces Black communities.', 'video', 'https://example.com/videos/gentrification-displacement.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:51.333511+00', '2025-11-09 12:41:51.333511+00', NULL, '040a39ea-f623-4b86-bd0c-58cea4a369f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6ed74e23-4cd0-4980-b63c-01a713463ca4', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'The Racial Wealth Gap', 'racial-wealth-gap', 'Examine causes and consequences of wealth inequality.', 'video', 'https://example.com/videos/racial-wealth-gap.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:41:51.416588+00', '2025-11-09 12:41:51.416588+00', NULL, '040a39ea-f623-4b86-bd0c-58cea4a369f2', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4b98eb0f-4d69-4714-834b-12531d496452', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Community Development Financial Institutions', 'community-development-finance', 'Learn from Black-led financial institutions and alternatives.', 'video', 'https://example.com/videos/community-development-finance.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:41:51.582578+00', '2025-11-09 12:41:51.582578+00', NULL, '6b89e446-97fb-4558-8a97-3f4739c99974', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('34189b6b-fc76-4f0c-9116-879fe20bcfd8', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Policy Solutions for Financial Equity', 'policy-financial-equity', 'Advocate for policies that address financial discrimination.', 'video', 'https://example.com/videos/policy-financial-equity.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:51.660203+00', '2025-11-09 12:41:51.660203+00', NULL, '6b89e446-97fb-4558-8a97-3f4739c99974', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9aaa397d-a922-4a81-939d-d8560c4c1a18', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Final Assessment', 'final-assessment-finance', 'Comprehensive assessment of financial justice knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Areas with too many banks", "Geographic areas, often Black neighborhoods, where residents lack access to banking services and face barriers to financial inclusion", "Only a problem in rural areas", "Not a real issue in Canada"], "question": "What are banking deserts?", "explanation": "Banking deserts are areas where residents lack access to bank branches and ATMs, forcing reliance on predatory alternatives like payday lenders and check-cashing stores with exorbitant fees. Black neighborhoods are disproportionately banking deserts due to redlining legacy, bank branch closures, and discriminatory business decisions. Without banking access, residents pay more for financial services, cannot build credit or savings, and face barriers to loans and homeownership—perpetuating wealth inequality.", "correct_answer": 1}, {"options": ["It does not affect homeownership", "Black applicants are denied mortgages at higher rates than white applicants with similar financial profiles and receive higher interest rates when approved", "Banks treat all applicants equally", "Only income matters for mortgage approval"], "question": "How does mortgage discrimination affect Black homeownership?", "explanation": "Studies show Black mortgage applicants are denied at significantly higher rates than white applicants with similar credit scores, income, and debt-to-income ratios. When approved, Black borrowers often receive higher interest rates, costing thousands more over loan lifetime. This reflects both explicit bias (discriminatory lending practices) and systemic factors (lower appraisals of Black neighborhoods, exclusion from informal networks providing better rates). Mortgage discrimination is a primary driver of the racial wealth gap.", "correct_answer": 1}, {"options": ["Appraisers are completely objective", "Homes in Black neighborhoods and Black-owned homes are systematically undervalued compared to comparable white-owned homes", "Property values are determined only by square footage", "Appraisal bias does not exist"], "question": "What is property appraisal bias?", "explanation": "Research shows homes in Black neighborhoods are systematically undervalued by tens of thousands of dollars compared to similar homes in white neighborhoods. Black homeowners report appraisals increasing when they remove family photos, have white friends \"stand in\" as owners, or hide indicators of Black occupancy. This appraisal bias reduces Black wealth (home equity), makes refinancing harder, and perpetuates neighborhood disinvestment. It reflects both individual appraiser bias and systemic undervaluation of Black communities.", "correct_answer": 1}, {"options": ["Predatory lenders", "Black-led or mission-driven financial institutions that provide banking, lending, and financial services in underserved communities", "Government welfare programs", "Only exist in the United States"], "question": "What are Community Development Financial Institutions (CDFIs)?", "explanation": "CDFIs are financial institutions (credit unions, community banks, loan funds) that prioritize serving communities excluded from mainstream banking. Many are Black-led and focus on Black communities. They provide affordable loans, banking access, financial education, and business capital without exploitative terms. CDFIs challenge the banking desert problem by bringing services where mainstream banks refuse to operate. They demonstrate that serving Black communities is viable—mainstream banks choose not to. Supporting CDFIs is one strategy for financial justice.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:51.736367+00', '2025-11-09 12:41:51.736367+00', NULL, '6b89e446-97fb-4558-8a97-3f4739c99974', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('45db2943-f980-4fc0-814b-b3e389ba58e6', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Introduction: Anti-Racism in Nonprofit Sector', 'intro-nonprofit-antiracism', 'Examine anti-Black racism in nonprofit and advocacy work.', 'video', 'https://example.com/videos/intro-nonprofit-antiracism.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:41:51.900153+00', '2025-11-09 12:41:51.900153+00', NULL, '2d0627dc-5ae8-430e-b6fc-41ba1a489a34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6f2e89f2-71f5-4a73-a9d8-7343751af78a', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'White Saviorism and Paternalism', 'white-saviorism-paternalism', 'Recognize harmful savior narratives in social change work.', 'video', 'https://example.com/videos/white-saviorism-paternalism.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:51.941813+00', '2025-11-09 12:41:51.941813+00', NULL, '2d0627dc-5ae8-430e-b6fc-41ba1a489a34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('cefefacc-87ae-430d-a98c-df78091e18ab', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'The Nonprofit Industrial Complex', 'nonprofit-industrial-complex', 'Understand how nonprofit structures can limit radical change.', 'video', 'https://example.com/videos/nonprofit-industrial-complex.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:51.98824+00', '2025-11-09 12:41:51.98824+00', NULL, '2d0627dc-5ae8-430e-b6fc-41ba1a489a34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('00451a1a-af79-4025-8dfe-b15c74d7342c', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Power, Privilege, and Positionality', 'power-privilege-positionality', 'Examine your own position in nonprofit power structures.', 'video', 'https://example.com/videos/power-privilege-positionality.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:41:52.050239+00', '2025-11-09 12:41:52.050239+00', NULL, '2d0627dc-5ae8-430e-b6fc-41ba1a489a34', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e37dc1bf-5946-4484-9195-7ad1d9a24857', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Nothing About Us Without Us', 'nothing-about-us-without-us', 'Center Black community voices in decisions affecting them.', 'video', 'https://example.com/videos/nothing-about-us-without-us.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:41:52.187187+00', '2025-11-09 12:41:52.187187+00', NULL, '9b43c1c6-6724-4633-9c12-e474936a587b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('002de389-d433-4148-b17a-93525481c80f', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Supporting vs Leading: Knowing Your Role', 'supporting-vs-leading', 'Understand when to lead, support, or step back.', 'video', 'https://example.com/videos/supporting-vs-leading.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:52.259976+00', '2025-11-09 12:41:52.259976+00', NULL, '9b43c1c6-6724-4633-9c12-e474936a587b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('19495b7e-3e83-4299-bbfc-cb8f81945974', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Authentic Community Partnerships', 'authentic-partnerships', 'Build partnerships based on shared power, not extraction.', 'video', 'https://example.com/videos/authentic-partnerships.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:52.336376+00', '2025-11-09 12:41:52.336376+00', NULL, '9b43c1c6-6724-4633-9c12-e474936a587b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bfa46b06-2392-4c02-b450-0987907e8e04', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Funding Inequities: The Data', 'funding-inequities-data', 'Understand how Black-led organizations receive less funding.', 'video', 'https://example.com/videos/funding-inequities-data.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:41:52.539096+00', '2025-11-09 12:41:52.539096+00', NULL, 'a8ac637a-1a27-4558-beb7-275e7df0225f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0bf4f8a9-aa89-424c-9d22-76f77dd3ea26', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Trust-Based Philanthropy', 'trust-based-philanthropy', 'Move from restrictive to trust-based funding practices.', 'video', 'https://example.com/videos/trust-based-philanthropy.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:41:52.587373+00', '2025-11-09 12:41:52.587373+00', NULL, 'a8ac637a-1a27-4558-beb7-275e7df0225f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6c48b5ea-f834-47e8-bc97-f06f84c974df', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Participatory Grantmaking', 'participatory-grantmaking', 'Share decision-making power with communities receiving funding.', 'video', 'https://example.com/videos/participatory-grantmaking.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:41:52.636245+00', '2025-11-09 12:41:52.636245+00', NULL, 'a8ac637a-1a27-4558-beb7-275e7df0225f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d584857f-7197-4aee-9706-a0d0dd1fbfa7', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Final Assessment', 'final-assessment-nonprofit', 'Comprehensive assessment of nonprofit anti-racism knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Helping people is always good", "The harmful pattern where white people position themselves as rescuers of Black communities, centering their own goodness rather than community self-determination", "Any white person working in nonprofits", "Only happens internationally"], "question": "What is white saviorism in nonprofit work?", "explanation": "White saviorism is the harmful pattern where white people (individuals or organizations) position themselves as rescuers of Black/racialized communities while centering their own benevolence, moral superiority, and comfort. It assumes communities need saving rather than resources and power. White saviorism perpetuates paternalism (we know what''s best for you), extraction (using community stories for fundraising), and maintains power imbalances. Anti-racist work requires stepping back, supporting Black leadership, sharing power—not claiming credit for \"saving\" anyone.", "correct_answer": 1}, {"options": ["Black people should handle all Black issues alone", "Decisions, programs, and policies affecting Black communities must center Black voices, leadership, and self-determination—not be made for them", "Everyone should be included in all decisions", "Only Black people can work on anti-racism"], "question": "What does \"Nothing About Us Without Us\" mean?", "explanation": "\"Nothing About Us Without Us\" means Black communities must lead decisions affecting them. Too often, white-led organizations design programs \"for\" Black communities without meaningful input, then wonder why initiatives fail. This perpetuates harm by: ignoring community expertise, imposing outside solutions, extracting stories/data without benefit, and maintaining power with funders/decision-makers. Authentic partnership requires: centering Black leadership, sharing decision-making power, resourcing community-led solutions, and being accountable to those most impacted—not doing things \"for\" them.", "correct_answer": 1}, {"options": ["Funding is distributed equitably", "Black-led organizations receive significantly less funding than white-led organizations, often with more restrictions and less unrestricted support", "Black organizations receive too much funding", "Race does not affect funding decisions"], "question": "What do data show about philanthropic funding?", "explanation": "Data consistently show Black-led organizations receive far less philanthropic funding (often <2% of foundation grants), are more likely to receive small/restricted grants vs large/unrestricted gifts, face more burdensome reporting requirements, and have less access to funder networks. This reflects systemic racism in philanthropy: biased perceptions of credibility, risk aversion, homogeneous funder networks, and preference for white-led \"neutral\" organizations over Black-led community organizations. Funding inequity perpetuates power imbalances and under-resources those closest to problems.", "correct_answer": 1}, {"options": ["Trusting organizations will waste money", "Funding practices that provide unrestricted support, reduce burdens, share power, and trust community organizations as experts", "Not requiring any accountability", "Only for large established organizations"], "question": "What is trust-based philanthropy?", "explanation": "Trust-based philanthropy shifts from extractive, controlling funding to practices that trust community organizations: providing unrestricted/general operating support (not just project funding), multi-year commitments (not one-year grants), streamlined applications/reporting (not 50-page proposals), participatory decision-making, and building relationships beyond transactions. It recognizes organizations closest to communities are experts—not problems to be managed. Trust-based approaches resource Black-led organizations equitably and acknowledge that restrictive funding perpetuates white institutional control.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:41:52.678601+00', '2025-11-09 12:41:52.678601+00', NULL, 'a8ac637a-1a27-4558-beb7-275e7df0225f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('66c234f1-242a-4213-b5c9-321e2c9fa5e2', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Introduction: Media and Anti-Black Racism', 'intro-media-racism', 'Understand media''s role in shaping public perceptions of Black communities.', 'video', 'https://example.com/videos/intro-media-racism.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:42:24.676516+00', '2025-11-09 12:42:24.676516+00', NULL, 'cfe37ca4-0eb4-4fd8-adcb-df60326438d6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9dc484c6-785b-4521-b354-4bfa3027f96d', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Crime Coverage and Dehumanization', 'crime-coverage-dehumanization', 'Examine how crime reporting perpetuates anti-Black stereotypes.', 'video', 'https://example.com/videos/crime-coverage-dehumanization.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:24.726997+00', '2025-11-09 12:42:24.726997+00', NULL, 'cfe37ca4-0eb4-4fd8-adcb-df60326438d6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7d7f2014-fd70-4f42-ae7c-860d213e2a2a', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Deficit Narratives and Invisibility', 'deficit-narratives-invisibility', 'Understand how media focuses on problems while ignoring contributions.', 'video', 'https://example.com/videos/deficit-narratives-invisibility.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:24.781936+00', '2025-11-09 12:42:24.781936+00', NULL, 'cfe37ca4-0eb4-4fd8-adcb-df60326438d6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b771a748-e153-4020-9b90-abe418e1c7eb', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Language Choices and Framing', 'language-choices-framing', 'Examine how word choice perpetuates bias in reporting.', 'video', 'https://example.com/videos/language-choices-framing.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:42:24.832439+00', '2025-11-09 12:42:24.832439+00', NULL, 'cfe37ca4-0eb4-4fd8-adcb-df60326438d6', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('068791c1-5f6d-4aca-8c86-77c1662400c4', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Centering Black Voices and Expertise', 'centering-black-voices-media', 'Move beyond tokenism to authentic representation.', 'video', 'https://example.com/videos/centering-black-voices-media.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:42:24.94807+00', '2025-11-09 12:42:24.94807+00', NULL, 'f43f6d8d-f8f5-4b88-82b6-fece34b5888b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7bb4e408-2b1c-4f82-a917-2d8a756955ff', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Avoiding Exploitative Storytelling', 'avoiding-exploitative-storytelling', 'Report with dignity, not trauma porn.', 'video', 'https://example.com/videos/avoiding-exploitative-storytelling.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:24.991073+00', '2025-11-09 12:42:24.991073+00', NULL, 'f43f6d8d-f8f5-4b88-82b6-fece34b5888b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('81079340-9655-4ae3-bc96-fe350ecf3d59', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Context and Root Causes, Not Just Incidents', 'context-root-causes', 'Report systemic issues, not just individual events.', 'video', 'https://example.com/videos/context-root-causes.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:25.046729+00', '2025-11-09 12:42:25.046729+00', NULL, 'f43f6d8d-f8f5-4b88-82b6-fece34b5888b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4735af54-5467-468e-8c8a-2fb2b30c3f05', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Fact-Checking Your Own Bias', 'fact-checking-bias', 'Interrogate assumptions before publishing.', 'video', 'https://example.com/videos/fact-checking-bias.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:42:25.189925+00', '2025-11-09 12:42:25.189925+00', NULL, 'f43f6d8d-f8f5-4b88-82b6-fece34b5888b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7637fa12-dc47-4fd6-9458-64283add193d', '17767e69-30e3-4c0b-aa13-a8990502b002', 'The Whiteness of Canadian Newsrooms', 'whiteness-canadian-newsrooms', 'Examine lack of Black journalists and editors in Canadian media.', 'video', 'https://example.com/videos/whiteness-canadian-newsrooms.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:42:25.265228+00', '2025-11-09 12:42:25.265228+00', NULL, 'e70aa0b4-78d6-4b1e-b589-4d49a711d07d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e120ee9e-3eea-4a2f-b650-a5cc2b73e883', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Hiring, Retention, and Advancement', 'hiring-retention-advancement-media', 'Move beyond "pipeline problem" narratives to address retention.', 'video', 'https://example.com/videos/hiring-retention-advancement-media.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:25.321711+00', '2025-11-09 12:42:25.321711+00', NULL, 'e70aa0b4-78d6-4b1e-b589-4d49a711d07d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4cb46894-e195-4e64-a54c-d84f6a21dd25', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Editorial Decision-Making Power', 'editorial-decision-making', 'Who decides what stories matter? Address power in newsrooms.', 'video', 'https://example.com/videos/editorial-decision-making.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:25.358845+00', '2025-11-09 12:42:25.358845+00', NULL, 'e70aa0b4-78d6-4b1e-b589-4d49a711d07d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('96283c52-6124-4221-97fa-677cc44e7bb1', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Public Editors and Accountability Mechanisms', 'accountability-mechanisms', 'Create systems for addressing harm in reporting.', 'video', 'https://example.com/videos/accountability-mechanisms.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:42:25.455859+00', '2025-11-09 12:42:25.455859+00', NULL, 'acf2d5b3-de74-4b7c-bef5-6068160d2465', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a0eef90a-1ed7-4d8b-9e8c-c1e3eb6500ed', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Corrections, Apologies, and Repair', 'corrections-apologies-repair', 'Address past harm with meaningful action, not just words.', 'video', 'https://example.com/videos/corrections-apologies-repair.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:25.508858+00', '2025-11-09 12:42:25.508858+00', NULL, 'acf2d5b3-de74-4b7c-bef5-6068160d2465', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7c851668-d971-4c78-9115-4972eb461519', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Final Assessment', 'final-assessment-media', 'Comprehensive assessment of ethical storytelling knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Crime reporting is always objective", "Media disproportionately associates Black people with crime, uses dehumanizing language, and omits context while over-reporting white perpetrators as anomalies", "Crime should not be reported", "All crime coverage is racist"], "question": "How does crime coverage perpetuate anti-Black racism?", "explanation": "Studies show media disproportionately depicts Black people as criminals relative to actual crime data, uses dehumanizing language (\"thug,\" \"gang member\") more often for Black suspects, publishes mugshots of Black accused more frequently, and frames Black crime as inherent while white crime is contextualized as anomaly. This perpetuates stereotypes linking Blackness with criminality, influences public perception and policy, and dehumanizes victims when they are Black. Ethical reporting requires: equal treatment, humanizing language, systemic context, and interrogating editorial choices.", "correct_answer": 1}, {"options": ["Reporting on community challenges", "Media patterns that focus only on problems, pathology, and deficits in Black communities while ignoring contributions, resilience, and systemic causes", "Balanced reporting", "Only positive stories should be told"], "question": "What are deficit narratives in media?", "explanation": "Deficit narratives frame Black communities solely through problems—poverty, crime, broken families—without context, systemic analysis, or stories of achievement, culture, joy, and resistance. This creates false perception that issues are inherent to Blackness rather than products of racism. Ethical reporting requires: centering Black voices and expertise, reporting systemic causes not just symptoms, including stories of contribution/resilience, and avoiding trauma porn. Balance does not mean ignoring problems—it means contextualizing them within larger realities of community strength and systemic oppression.", "correct_answer": 1}, {"options": ["For appearances only", "Diverse newsrooms including Black journalists shape what stories are covered, how they are framed, what sources are consulted, and what is considered newsworthy", "Only for reporting on Black communities", "Diversity does not affect journalism quality"], "question": "Why does newsroom diversity matter?", "explanation": "Homogeneous (white) newsrooms perpetuate bias through: what stories are deemed important, how issues are framed, which sources are considered credible, what language is used, and what is scrutinized vs accepted. Black journalists bring lived experience, community connections, and critical lens that challenges dominant narratives. However, diversity alone is insufficient—Black journalists must have decision-making power (not just hired to cover \"Black issues\"), supportive environments, and pathways to leadership. Newsroom diversity is about power: who decides what the public hears?", "correct_answer": 1}, {"options": ["Never admitting mistakes", "Systems for community feedback, transparent corrections processes, meaningful apologies, material repair for harm, and ongoing relationship with affected communities", "Only issuing corrections when sued", "Accountability is not necessary for media"], "question": "What does ethical accountability in media require?", "explanation": "Ethical accountability goes beyond legal requirements to include: accessible mechanisms for community feedback (not just comment sections), transparent processes for investigating concerns, prominent corrections (not buried), meaningful apologies acknowledging specific harm, material repair (not just words), and ongoing accountability relationships with Black communities. One-off corrections are insufficient—accountability requires systemic change: examining patterns of harm, changing editorial practices, involving communities in decision-making, and demonstrating change over time. Media must earn trust through consistent action, not performative diversity statements.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:25.561243+00', '2025-11-09 12:42:25.561243+00', NULL, 'acf2d5b3-de74-4b7c-bef5-6068160d2465', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e6d15f74-44f4-431a-a465-832e07948e10', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Introduction: Policy and Racial Equity', 'intro-policy-equity', 'Understand how policy shapes racial inequity in Canada.', 'video', 'https://example.com/videos/intro-policy-equity.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:42:25.74581+00', '2025-11-09 12:42:25.74581+00', NULL, '5a8e2c75-23cd-4f2b-b86e-1b203796cbbb', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2b6d1daa-b260-4c09-ab47-951bba7e238c', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Racial Equity Impact Assessments', 'racial-equity-impact-assessments', 'Learn to conduct assessments examining policy impacts on Black communities.', 'video', 'https://example.com/videos/racial-equity-impact-assessments.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:25.790301+00', '2025-11-09 12:42:25.790301+00', NULL, '5a8e2c75-23cd-4f2b-b86e-1b203796cbbb', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2eef8279-487e-43af-b3b1-695930855262', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Facially Neutral Policies with Racist Outcomes', 'neutral-policies-racist-outcomes', 'Identify policies that do not mention race but harm Black communities.', 'video', 'https://example.com/videos/neutral-policies-racist-outcomes.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:25.824548+00', '2025-11-09 12:42:25.824548+00', NULL, '5a8e2c75-23cd-4f2b-b86e-1b203796cbbb', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('dc920fd4-35d3-4725-9e65-30576fabcf47', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Disaggregating Data by Race', 'disaggregating-data-race', 'Understand why race-based data is essential for equity policy.', 'video', 'https://example.com/videos/disaggregating-data-race.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:42:25.878113+00', '2025-11-09 12:42:25.878113+00', NULL, '5a8e2c75-23cd-4f2b-b86e-1b203796cbbb', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('401aacee-eae0-4d3c-a743-7c6afa5db7ee', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Mapping Power: Who Makes Policy Decisions?', 'mapping-power', 'Identify key decision-makers and influence points.', 'video', 'https://example.com/videos/mapping-power.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:42:25.964979+00', '2025-11-09 12:42:25.964979+00', NULL, 'f82c93e2-b483-4683-8c6a-4286bd399497', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b71eab3a-1485-4825-8555-e23383320fbe', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Building Evidence-Based Cases for Change', 'evidence-based-cases', 'Combine data, narrative, and community voice for advocacy.', 'video', 'https://example.com/videos/evidence-based-cases.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:26.011612+00', '2025-11-09 12:42:26.011612+00', NULL, 'f82c93e2-b483-4683-8c6a-4286bd399497', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bb4596c0-f692-46bb-b803-9808b79af3f6', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Engaging Elected Officials and Bureaucrats', 'engaging-officials', 'Effective strategies for working with policymakers.', 'video', 'https://example.com/videos/engaging-officials.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:26.063107+00', '2025-11-09 12:42:26.063107+00', NULL, 'f82c93e2-b483-4683-8c6a-4286bd399497', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('388e783c-834d-4daa-9d65-c51dac156e45', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Media Advocacy and Public Opinion', 'media-advocacy', 'Use media strategically to build support for policy change.', 'video', 'https://example.com/videos/media-advocacy.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:42:26.099021+00', '2025-11-09 12:42:26.099021+00', NULL, 'f82c93e2-b483-4683-8c6a-4286bd399497', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2ae931dd-60da-40c2-9a1d-ac0c6e4cc4fc', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Building Cross-Sector Coalitions', 'cross-sector-coalitions', 'Unite diverse organizations around shared policy goals.', 'video', 'https://example.com/videos/cross-sector-coalitions.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:42:26.192784+00', '2025-11-09 12:42:26.192784+00', NULL, '22cf8157-85f3-4aa5-8351-e7b83e47c914', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9ee5adcd-a47d-43bb-be07-bd79827909e5', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Grassroots Organizing and Community Power', 'grassroots-organizing', 'Build power from community up, not top-down.', 'video', 'https://example.com/videos/grassroots-organizing.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:26.231364+00', '2025-11-09 12:42:26.231364+00', NULL, '22cf8157-85f3-4aa5-8351-e7b83e47c914', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e71fe0e8-2d7d-49e8-9e89-a16ab6ad9e75', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Sustaining Movements Beyond Single Campaigns', 'sustaining-movements', 'Build long-term power, not just win one policy fight.', 'video', 'https://example.com/videos/sustaining-movements.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:26.270278+00', '2025-11-09 12:42:26.270278+00', NULL, '22cf8157-85f3-4aa5-8351-e7b83e47c914', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d99777d2-b8ce-47a3-890d-e0de625b8323', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'From Policy to Practice: Implementation Matters', 'policy-implementation', 'Monitor how policies are actually implemented on the ground.', 'video', 'https://example.com/videos/policy-implementation.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:42:26.428029+00', '2025-11-09 12:42:26.428029+00', NULL, '45a399cf-8c6a-44bd-ac74-39d9f31e337c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0f3f07b7-771c-4126-8227-bab054080571', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Accountability Mechanisms and Oversight', 'accountability-oversight', 'Build systems to ensure ongoing compliance and equity outcomes.', 'video', 'https://example.com/videos/accountability-oversight.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:42:26.478532+00', '2025-11-09 12:42:26.478532+00', NULL, '45a399cf-8c6a-44bd-ac74-39d9f31e337c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2c8f78e4-999a-4fd9-901a-6323fa9debc2', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'When Advocacy Fails: Next Steps', 'when-advocacy-fails', 'Strategies when policy advocacy does not succeed.', 'video', 'https://example.com/videos/when-advocacy-fails.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:42:26.554298+00', '2025-11-09 12:42:26.554298+00', NULL, '45a399cf-8c6a-44bd-ac74-39d9f31e337c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('57d4110b-fdbc-45ba-b23b-b9fad210499c', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Final Assessment', 'final-assessment-policy', 'Comprehensive assessment of policy advocacy knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Only for policies that mention race", "A systematic examination of how proposed policies will affect racial equity, identifying disparate impacts before implementation", "Not necessary for policy-making", "Only retrospective analysis"], "question": "What is a Racial Equity Impact Assessment (REIA)?", "explanation": "A Racial Equity Impact Assessment (REIA) is a systematic process conducted before policy implementation to: identify how policy will affect different racial groups, predict disparate impacts using data and community input, examine whether policy addresses or perpetuates inequity, and propose modifications to advance equity. REIAs are critical because facially neutral policies often have racist outcomes when historical context and current disparities are ignored. They require disaggregated data, community engagement, and commitment to modify/reject policies that harm Black communities—not just documenting harm.", "correct_answer": 1}, {"options": ["Policies that do not mention race cannot be racist", "Policies that do not explicitly mention race but perpetuate racial inequity through disparate impacts, often due to historical context", "All neutral policies are fair", "Only explicitly racist policies cause harm"], "question": "What are facially neutral policies with racist outcomes?", "explanation": "Facially neutral policies do not mention race but perpetuate inequity due to historical context and current disparities. Examples: minimum sentencing laws (appear neutral but disproportionately incarcerate Black people due to biased policing), school funding based on property taxes (perpetuates segregation and under-resourcing in Black neighborhoods), credit score requirements (reflect historical discrimination in lending). These policies maintain systemic racism precisely because they ignore racial context. Colorblindness in policy is not neutral—it perpetuates existing inequity by refusing to address it.", "correct_answer": 1}, {"options": ["Collecting race data is divisive", "Without data showing how policies affect different racial groups, it is impossible to identify disparities, measure progress, or hold systems accountable", "Colorblind policies are better", "Data is not important for policy"], "question": "Why is disaggregated race-based data essential for equity policy?", "explanation": "Race-based data is essential because: you cannot address what you do not measure, aggregate data hides disparities (averaging Black and white outcomes makes racism invisible), policy claims about equity cannot be verified without tracking outcomes by race, and systems cannot be held accountable without evidence. Arguments against collecting race data (\"divisive,\" \"creates division\") perpetuate racism by making inequity invisible. Disaggregated data reveals disparate impacts and forces acknowledgment of systemic racism—that is why it is resisted. Evidence-based equity policy is impossible without race data.", "correct_answer": 1}, {"options": ["Assuming policies work as intended", "Tracking outcomes by race, community feedback, enforcement data, ongoing adjustments, and accountability for failing to achieve equity goals", "Just passing the policy is enough", "Implementation does not matter"], "question": "What does effective policy implementation monitoring require?", "explanation": "Policy wins mean nothing if implementation fails or perpetuates inequity. Effective monitoring requires: disaggregated outcome data (are racial disparities closing?), community feedback from those most impacted, enforcement/compliance data (is policy being implemented?), identification of barriers and unintended consequences, ongoing adjustments based on evidence, and accountability consequences when systems fail to achieve equity. Too often, \"equity policies\" are passed but never funded, enforced, or monitored—allowing systems to claim progress without change. Advocates must stay engaged beyond policy passage to ensure real implementation and impact.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:42:26.604107+00', '2025-11-09 12:42:26.604107+00', NULL, '45a399cf-8c6a-44bd-ac74-39d9f31e337c', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('88521a82-51e6-434c-9055-d3b3d936cb29', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Introduction: Racism as Public Health Crisis', 'intro-racism-mental-health', 'Understand racism as trauma and public health issue.', 'video', 'https://example.com/videos/intro-racism-mental-health.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:54:27.010711+00', '2025-11-09 12:54:27.010711+00', NULL, '7b7297d8-3af4-4e80-9910-43ebc9e44e39', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0e1af1da-99b7-46c8-a68b-7256ec401b84', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Racial Trauma and Its Manifestations', 'racial-trauma-manifestations', 'Learn how racial trauma presents in Black communities.', 'video', 'https://example.com/videos/racial-trauma-manifestations.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:27.118896+00', '2025-11-09 12:54:27.118896+00', NULL, '7b7297d8-3af4-4e80-9910-43ebc9e44e39', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('58675b1e-8e9c-46ac-a8a7-b8fccbc98305', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Intergenerational Trauma', 'intergenerational-trauma', 'Understand how trauma passes across generations.', 'video', 'https://example.com/videos/intergenerational-trauma.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:27.199989+00', '2025-11-09 12:54:27.199989+00', NULL, '7b7297d8-3af4-4e80-9910-43ebc9e44e39', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('076a2c66-1d55-48aa-8b19-40ff421e3d0c', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Weathering and Chronic Stress', 'weathering-chronic-stress', 'Examine cumulative impact of racism on physical and mental health.', 'video', 'https://example.com/videos/weathering-chronic-stress.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:54:27.276663+00', '2025-11-09 12:54:27.276663+00', NULL, '7b7297d8-3af4-4e80-9910-43ebc9e44e39', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e0ca6305-d5cb-4cde-b753-b478de7cc424', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Diagnostic Bias and Misdiagnosis', 'diagnostic-bias-misdiagnosis', 'Understand how Black patients are misdiagnosed.', 'video', 'https://example.com/videos/diagnostic-bias-misdiagnosis.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:54:27.432791+00', '2025-11-09 12:54:27.432791+00', NULL, 'd1fa6a20-702c-4fe0-8ef0-66f43e88433f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('811356fc-ec5b-4248-a94d-ce95da459355', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Overdiagnosis of Severe Mental Illness', 'overdiagnosis-severe-illness', 'Examine why Black patients are disproportionately diagnosed with schizophrenia.', 'video', 'https://example.com/videos/overdiagnosis-severe-illness.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:27.508269+00', '2025-11-09 12:54:27.508269+00', NULL, 'd1fa6a20-702c-4fe0-8ef0-66f43e88433f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('89b64936-41b5-45fd-8e66-e0556bcc673e', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Treatment Disparities', 'treatment-disparities', 'Understand inequitable access to therapy and evidence-based treatments.', 'video', 'https://example.com/videos/treatment-disparities.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:27.60357+00', '2025-11-09 12:54:27.60357+00', NULL, 'd1fa6a20-702c-4fe0-8ef0-66f43e88433f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('171e2578-c6e1-48b5-b385-40c47c9b5a46', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Coercion and Involuntary Treatment', 'coercion-involuntary-treatment', 'Examine higher rates of involuntary hospitalization for Black patients.', 'video', 'https://example.com/videos/coercion-involuntary-treatment.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:54:27.683271+00', '2025-11-09 12:54:27.683271+00', NULL, 'd1fa6a20-702c-4fe0-8ef0-66f43e88433f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c90b3125-110e-46dc-a56b-98a37053cee7', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'The Mental Health "Pipeline Problem" Myth', 'mental-health-pipeline-myth', 'Challenge narratives about Black representation in mental health professions.', 'video', 'https://example.com/videos/mental-health-pipeline-myth.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:54:27.85059+00', '2025-11-09 12:54:27.85059+00', NULL, 'c149cb6c-6399-4b19-be3e-a38942684dd7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('54d9cbf6-4bb4-4fd6-84d7-2548c0e8e139', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Stigma and Cultural Mistrust', 'stigma-cultural-mistrust', 'Understand historical reasons for mistrust of mental health systems.', 'video', 'https://example.com/videos/stigma-cultural-mistrust.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:27.899959+00', '2025-11-09 12:54:27.899959+00', NULL, 'c149cb6c-6399-4b19-be3e-a38942684dd7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c6cfb060-724f-4fab-8f35-a78598640e99', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Cost and Insurance Barriers', 'cost-insurance-barriers', 'Examine financial barriers to accessing therapy and treatment.', 'video', 'https://example.com/videos/cost-insurance-barriers.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:27.977356+00', '2025-11-09 12:54:27.977356+00', NULL, 'c149cb6c-6399-4b19-be3e-a38942684dd7', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8ff98632-1782-4212-a7c2-6860ed01daa3', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Cultural Humility vs Cultural Competence', 'cultural-humility', 'Move beyond competence to ongoing learning and humility.', 'video', 'https://example.com/videos/cultural-humility.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:54:28.119487+00', '2025-11-09 12:54:28.119487+00', NULL, 'dedebe6d-6011-4f86-a9ea-17a4b34739fc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('aa4018a9-a3f0-4ec9-a993-cd8e8267be0c', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Addressing Racism in Therapy Rooms', 'addressing-racism-therapy', 'Name and address racism when it arises in clinical practice.', 'video', 'https://example.com/videos/addressing-racism-therapy.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:28.195416+00', '2025-11-09 12:54:28.195416+00', NULL, 'dedebe6d-6011-4f86-a9ea-17a4b34739fc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8811a4dd-35e6-4f00-b46a-d3460d3e334c', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Community-Based and Healing-Centered Approaches', 'community-healing-approaches', 'Learn from Black-led mental health and wellness models.', 'video', 'https://example.com/videos/community-healing-approaches.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:28.254268+00', '2025-11-09 12:54:28.254268+00', NULL, 'dedebe6d-6011-4f86-a9ea-17a4b34739fc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e8962adb-cde7-4553-8dc6-42fdf369dfd6', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Final Assessment', 'final-assessment-mental-health', 'Comprehensive assessment of anti-racist mental health knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Only happens with direct violence", "The cumulative psychological and emotional harm caused by experiences of racism, including discrimination, microaggressions, and systemic oppression", "Not a real clinical issue", "Only affects children"], "question": "What is racial trauma?", "explanation": "Racial trauma (race-based traumatic stress) is real psychological harm caused by experiences of racism. It includes: direct discrimination, microaggressions, witnessing violence against Black people, systemic oppression, and fear for safety. Symptoms mirror PTSD: hypervigilance, anxiety, depression, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It affects people across the lifespan and is intergenerational. Mental health providers must recognize racial trauma as legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not dismiss it or pathologize natural responses to oppression.", "correct_answer": 1}, {"options": ["Clinicians treat all patients equally", "Black patients are overdiagnosed with schizophrenia and severe mental illness while trauma, depression, and anxiety are underdiagnosed or dismissed", "Diagnosis is completely objective", "Only explicit racism causes misdiagnosis"], "question": "How does diagnostic bias manifest in mental health?", "explanation": "Research shows Black patients are disproportionately diagnosed with schizophrenia and bipolar disorder even when presenting with same symptoms as white patients diagnosed with depression or PTSD. This reflects: implicit bias (associating Blackness with danger/aggression), historical stereotypes (dangerous Black body trope), lack of cultural understanding (misinterpreting cultural expressions as pathology), and systemic racism in diagnostic criteria development. Consequences include: inappropriate medication, stigma, coercive treatment, and missed trauma/depression treatment. Addressing diagnostic bias requires examining implicit biases and cultural assumptions in assessment.", "correct_answer": 1}, {"options": ["Only about individual choices", "Systemic barriers including cost, lack of Black therapists, cultural mistrust from historical abuse, stigma, and inadequate insurance coverage", "Services are equally accessible to all", "Black communities do not need mental health services"], "question": "Why do Black communities face barriers accessing mental health services?", "explanation": "Black communities face multiple barriers: Cost (therapy expensive, insurance inadequate), Lack of representation (few Black mental health providers, cultural mismatch with white therapists), Historical mistrust (legacy of medical abuse, forced sterilization, unethical research), Stigma (mental health stigmatized in many communities due to survival necessity of \"strength\"), Systemic failures (services in white neighborhoods, culturally inappropriate treatment models). These are not individual failures but systemic barriers. Addressing them requires: investing in Black mental health professionals, culturally responsive services, community-based models, and affordable/accessible care.", "correct_answer": 1}, {"options": ["Same as cultural competence", "Ongoing commitment to self-reflection, recognizing power imbalances, learning from clients as experts on their own culture, and addressing systemic inequities", "Learning facts about cultures", "Not necessary for good practice"], "question": "What is cultural humility in mental health practice?", "explanation": "Cultural humility moves beyond \"cultural competence\" (implies mastery, checklist approach). It requires: Self-reflection on own biases and positionality, Recognizing power imbalances in therapist-client relationship, Centering client as expert on their own cultural experience, Ongoing learning and openness to being wrong, Addressing systemic inequities not just individual cultural differences. Cultural humility acknowledges you will never \"master\" someone else''s culture—you commit to listening, learning, and interrogating power. For anti-racist practice, this means naming racism, examining white supremacy in therapy models, and challenging clinical assumptions rooted in white norms.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:54:28.349136+00', '2025-11-09 12:54:28.349136+00', NULL, 'dedebe6d-6011-4f86-a9ea-17a4b34739fc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('59a9752d-6d18-44c9-8c76-7aaeb456eb8b', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Introduction: Decolonization and Anti-Racism', 'intro-decolonization-antiracism', 'Understand connections between colonial and anti-Black oppression.', 'video', 'https://example.com/videos/intro-decolonization-antiracism.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:54:28.5423+00', '2025-11-09 12:54:28.5423+00', NULL, 'd9bcceb8-508c-4718-80c5-e9da6a06c74b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0965398a-1c0b-4fa0-bbbb-60efaa61a19e', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Settler Colonialism in Canada', 'settler-colonialism-canada', 'Understand ongoing colonial dispossession of Indigenous peoples.', 'video', 'https://example.com/videos/settler-colonialism-canada.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:28.597716+00', '2025-11-09 12:54:28.597716+00', NULL, 'd9bcceb8-508c-4718-80c5-e9da6a06c74b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3e127658-71fc-44cd-a825-472950ae3f42', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Anti-Blackness and Slavery in Colonial Canada', 'antiblackness-slavery-colonial', 'Examine Black enslavement and anti-Blackness in Canadian colonialism.', 'video', 'https://example.com/videos/antiblackness-slavery-colonial.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:28.6553+00', '2025-11-09 12:54:28.6553+00', NULL, 'd9bcceb8-508c-4718-80c5-e9da6a06c74b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3da4d50b-8576-4bab-a339-4cdba5b2bfae', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'White Supremacy as Colonial Project', 'white-supremacy-colonial-project', 'Understand white supremacy as tool of colonial power.', 'video', 'https://example.com/videos/white-supremacy-colonial-project.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:54:28.705383+00', '2025-11-09 12:54:28.705383+00', NULL, 'd9bcceb8-508c-4718-80c5-e9da6a06c74b', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f9caebff-40aa-45be-860f-8bccc96b64e9', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Historical Indigenous-Black Alliances', 'historical-indigenous-black-alliances', 'Learn from historical solidarity and mutual aid.', 'video', 'https://example.com/videos/historical-indigenous-black-alliances.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:54:28.808475+00', '2025-11-09 12:54:28.808475+00', NULL, 'ae49c19d-c498-4b28-be94-959bfe4e0c13', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('22f9c4ba-5f97-46e8-9d86-4af25b251574', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Anti-Blackness in Indigenous Communities', 'antiblackness-indigenous-communities', 'Address anti-Black racism within Indigenous spaces.', 'video', 'https://example.com/videos/antiblackness-indigenous-communities.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:28.855696+00', '2025-11-09 12:54:28.855696+00', NULL, 'ae49c19d-c498-4b28-be94-959bfe4e0c13', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d5f12c1f-904c-4839-977d-0945f07a8ab5', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Black Indigenous Peoples', 'black-indigenous-peoples', 'Center experiences of people who are both Black and Indigenous.', 'video', 'https://example.com/videos/black-indigenous-peoples.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:28.896836+00', '2025-11-09 12:54:28.896836+00', NULL, 'ae49c19d-c498-4b28-be94-959bfe4e0c13', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a1c19002-7386-485f-9bd0-44f1c1daf08d', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Building Authentic Solidarity', 'building-authentic-solidarity', 'Practice solidarity that does not erase differences or oppressions.', 'video', 'https://example.com/videos/building-authentic-solidarity.mp4', '{}', 540, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:54:28.960587+00', '2025-11-09 12:54:28.960587+00', NULL, 'ae49c19d-c498-4b28-be94-959bfe4e0c13', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('07cf1ac3-c2b9-4941-af22-c191f5b5a852', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Challenging Eurocentric Knowledge Systems', 'challenging-eurocentric-knowledge', 'Question whose knowledge is centered and valued.', 'video', 'https://example.com/videos/challenging-eurocentric-knowledge.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:54:29.059132+00', '2025-11-09 12:54:29.059132+00', NULL, '890abc75-4ca6-4c71-a366-e455087c128a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1922530f-49d4-4d91-987d-591f6e0a72af', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Land, Sovereignty, and Anti-Racism', 'land-sovereignty-antiracism', 'Understand connections between land justice and racial justice.', 'video', 'https://example.com/videos/land-sovereignty-antiracism.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:29.108501+00', '2025-11-09 12:54:29.108501+00', NULL, '890abc75-4ca6-4c71-a366-e455087c128a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c8417dc2-d273-4e4a-bf3d-fd2511f3b85a', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Decolonization is Not a Metaphor', 'decolonization-not-metaphor', 'Understand literal decolonization vs metaphorical appropriation.', 'video', 'https://example.com/videos/decolonization-not-metaphor.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:29.16649+00', '2025-11-09 12:54:29.16649+00', NULL, '890abc75-4ca6-4c71-a366-e455087c128a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('208b2b70-5cea-4af9-bec4-58a2a0b78506', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'When "Decolonize" Erases Anti-Blackness', 'decolonize-erases-antiblackness', 'Examine how decolonization framing can exclude Black struggles.', 'video', 'https://example.com/videos/decolonize-erases-antiblackness.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:54:29.288816+00', '2025-11-09 12:54:29.288816+00', NULL, '3a9dd469-315f-4694-9988-42a3e806762d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e50ae254-c001-43f2-bd6e-79d879614729', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Afro-pessimism and Its Critiques', 'afropessimism-critiques', 'Engage with debates about Black positionality in decolonial thought.', 'video', 'https://example.com/videos/afropessimism-critiques.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:54:29.342029+00', '2025-11-09 12:54:29.342029+00', NULL, '3a9dd469-315f-4694-9988-42a3e806762d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4b2a785d-15fe-4dcb-a719-0e6bfb57daad', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Final Assessment', 'final-assessment-decolonizing', 'Comprehensive assessment of decolonizing anti-racism knowledge.', 'quiz', NULL, '{"questions": [{"options": ["They are completely separate issues", "Both are systems of white supremacy—colonialism dispossesses Indigenous lands while anti-Blackness dehumanizes and exploits Black labor and bodies", "Only colonialism is about white supremacy", "Anti-Black racism has nothing to do with colonialism"], "question": "How are settler colonialism and anti-Black racism connected?", "explanation": "Settler colonialism and anti-Black racism are interconnected white supremacist systems. Colonialism: dispossesses Indigenous peoples from land, establishes white settler states, exploits resources. Anti-Black racism: enslaves and dehumanizes Black people, extracts labor, positions Black people as property not people. Both rely on white supremacy as justification. In Canadian context, Black enslavement helped build colonial economy while Indigenous dispossession created \"Canada\" as settler state. Understanding this connection is essential—you cannot address one without the other. Decolonial anti-racism recognizes shared roots in white supremacy while respecting distinct struggles.", "correct_answer": 1}, {"options": ["Decolonization can mean anything", "Decolonization must be literal—returning land, sovereignty, and self-determination to Indigenous peoples—not just diversity or \"decolonizing your mind\"", "Metaphors are bad", "Decolonization is only about changing language"], "question": "What does \"Decolonization is not a metaphor\" mean?", "explanation": "This critical phrase from Tuck and Yang means: decolonization is literal repatriation of Indigenous land and sovereignty, not metaphor for diversity, inclusion, or personal \"decolonizing.\" When institutions say \"decolonize the curriculum\" without addressing land theft or Indigenous governance, they appropriate and defang decolonization. True decolonization requires settlers giving up land, power, resources—uncomfortable unsettling of colonial order. For anti-racism work: do not co-opt \"decolonize\" to mean anti-racism or equity work. Respect specificity of Indigenous decolonial struggles while doing anti-Black racism work in solidarity—they are related but distinct.", "correct_answer": 1}, {"options": ["Does not exist", "Anti-Black racism that can exist within Indigenous communities, shaped by colonial white supremacy and requiring accountability and solidarity-building", "Only settlers can be anti-Black", "Discussing it divides movements"], "question": "What is anti-Blackness in Indigenous communities?", "explanation": "Anti-Blackness can exist in Indigenous communities, shaped by: colonial imposition of anti-Black racism (residential schools taught white supremacy), divide-and-conquer tactics pitting communities against each other, proximity to whiteness as survival strategy, and internalized hierarchies from colonialism. Examples: excluding Black Indigenous people, repeating anti-Black stereotypes, accessing resources while Black people cannot. Acknowledging this is not attacking Indigenous people—it is recognizing colonialism''s reach and building genuine solidarity. Black and Indigenous peoples must address anti-Blackness while respecting Indigenous sovereignty and working together against white supremacy. Solidarity requires accountability, not erasure.", "correct_answer": 1}, {"options": ["Black people should not engage with decolonization", "Black people can support Indigenous decolonization while centering anti-Black racism, recognizing overlapping but distinct struggles under white supremacy", "Decolonization and anti-racism are the same thing", "Black people are settlers"], "question": "How should Black people approach decolonization discourse?", "explanation": "Black people''s relationship to decolonization is complex. Most Black Canadians are not settlers (did not benefit from land theft, many descended from enslaved people or refugees fleeing oppression). Black people can support Indigenous land return and sovereignty while also addressing anti-Black racism—these are distinct but related struggles against white supremacy. Mistakes to avoid: conflating decolonization with anti-racism (they overlap but are not same), erasing Black presence when discussing decolonization, or claiming Black people are settlers equivalent to white colonizers. Approach: build solidarity recognizing distinct oppressions, center Indigenous voices on land/sovereignty, and continue anti-Black racism work without appropriating decolonization language.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:54:29.397375+00', '2025-11-09 12:54:29.397375+00', NULL, '3a9dd469-315f-4694-9988-42a3e806762d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('5aa3a28f-9858-4a32-868a-fc21d4666c66', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Introduction: What is Intersectionality?', 'intro-intersectionality', 'Learn Kimberlé Crenshaw''s foundational theory.', 'video', 'https://example.com/videos/intro-intersectionality.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:57:00.551853+00', '2025-11-09 12:57:00.551853+00', NULL, '4526b52a-d6ff-4c4a-a956-6eec6563b10a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('698c6e0a-c3d8-4de5-bbb5-06335044d6b9', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Black Feminist Origins of Intersectionality', 'black-feminist-origins', 'Understand Black feminist thought from Combahee River Collective to present.', 'video', 'https://example.com/videos/black-feminist-origins.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:00.612918+00', '2025-11-09 12:57:00.612918+00', NULL, '4526b52a-d6ff-4c4a-a956-6eec6563b10a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a6e5e318-6b99-49a7-b356-b271ac11a51f', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Beyond "Adding Identities": Multiplicative Oppression', 'multiplicative-oppression', 'Understand why oppression is not additive but multiplicative.', 'video', 'https://example.com/videos/multiplicative-oppression.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:00.677602+00', '2025-11-09 12:57:00.677602+00', NULL, '4526b52a-d6ff-4c4a-a956-6eec6563b10a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ce3276e5-9ad1-4394-8705-4ca75f915d13', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Appropriation and Depoliticization of Intersectionality', 'appropriation-depoliticization', 'Examine how intersectionality gets co-opted and defanged.', 'video', 'https://example.com/videos/appropriation-depoliticization.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:57:00.732727+00', '2025-11-09 12:57:00.732727+00', NULL, '4526b52a-d6ff-4c4a-a956-6eec6563b10a', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('667f3e8f-fe15-45c6-bd8b-3652cd827fc6', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Defining Misogynoir', 'defining-misogynoir', 'Learn Moya Bailey''s concept of anti-Black misogyny.', 'video', 'https://example.com/videos/defining-misogynoir.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:57:00.834058+00', '2025-11-09 12:57:00.834058+00', NULL, 'b5b626eb-b4bd-4c25-9eae-5432df446b6f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6115241a-e17b-4adc-ade8-bd847d653e61', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Violence Against Black Women in Canada', 'violence-black-women-canada', 'Examine intimate partner violence, sexual violence, and systemic violence.', 'video', 'https://example.com/videos/violence-black-women-canada.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:00.878119+00', '2025-11-09 12:57:00.878119+00', NULL, 'b5b626eb-b4bd-4c25-9eae-5432df446b6f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b6e8d434-b088-4790-92e3-ebcbdf0ffc71', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Criminalizing Black Motherhood', 'criminalizing-black-motherhood', 'Understand child welfare surveillance and removal of Black children.', 'video', 'https://example.com/videos/criminalizing-black-motherhood.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:00.930183+00', '2025-11-09 12:57:00.930183+00', NULL, 'b5b626eb-b4bd-4c25-9eae-5432df446b6f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('570ee41c-233e-46c5-8923-c8268f3f2df1', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Black Women and Girls in Education', 'black-women-girls-education', 'Examine adultification, discipline disparities, and pushout.', 'video', 'https://example.com/videos/black-women-girls-education.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:57:00.995548+00', '2025-11-09 12:57:00.995548+00', NULL, 'b5b626eb-b4bd-4c25-9eae-5432df446b6f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('2499e96a-17e4-470c-9d76-431408e85e91', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Wealth Gap and Economic Inequality', 'wealth-gap-inequality', 'Examine racialized economic disparities in Canada.', 'video', 'https://example.com/videos/wealth-gap-inequality.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:57:01.089225+00', '2025-11-09 12:57:01.089225+00', NULL, '9473bc49-6f39-4ab2-ad73-3b8b986f1dd3', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bcc3dc78-5542-45b0-b20c-876565a95cc3', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Labor Exploitation and Precarious Work', 'labor-exploitation-precarious', 'Understand how Black workers are overrepresented in low-wage, precarious jobs.', 'video', 'https://example.com/videos/labor-exploitation-precarious.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:01.15859+00', '2025-11-09 12:57:01.15859+00', NULL, '9473bc49-6f39-4ab2-ad73-3b8b986f1dd3', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4ba1bad7-5673-4e26-8c8c-e09259a10444', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Myth of the "Black Middle Class"', 'myth-black-middle-class', 'Examine fragility of Black economic mobility.', 'video', 'https://example.com/videos/myth-black-middle-class.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:01.271134+00', '2025-11-09 12:57:01.271134+00', NULL, '9473bc49-6f39-4ab2-ad73-3b8b986f1dd3', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('26631f02-49c4-4965-886c-fcdc1cf180aa', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Racism in Disability Justice Movements', 'racism-disability-justice', 'Examine whiteness in disability advocacy and exclusion of Black disabled people.', 'video', 'https://example.com/videos/racism-disability-justice.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:57:01.449659+00', '2025-11-09 12:57:01.449659+00', NULL, '5840a97b-9250-4300-a24d-212cacc6ddfc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('23ae46ff-e654-4677-80a1-7f41d153bdd3', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Police Violence Against Black Disabled People', 'police-violence-disabled', 'Understand deadly intersection of ableism and anti-Black racism in policing.', 'video', 'https://example.com/videos/police-violence-disabled.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:01.489388+00', '2025-11-09 12:57:01.489388+00', NULL, '5840a97b-9250-4300-a24d-212cacc6ddfc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('68ce6a1a-b6a1-4298-83c3-d9abc207b1be', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Barriers to Healthcare and Services', 'barriers-healthcare-services', 'Examine compounded discrimination in accessing disability supports.', 'video', 'https://example.com/videos/barriers-healthcare-services.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:01.538918+00', '2025-11-09 12:57:01.538918+00', NULL, '5840a97b-9250-4300-a24d-212cacc6ddfc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1a2f93b6-8be4-4336-b3f3-04bf169c472c', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Final Assessment', 'final-assessment-intersectionality', 'Comprehensive assessment of intersectionality knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Just adding up different identities", "A framework from Black feminist thought showing how race, gender, class, and other systems of oppression interact and create unique experiences of discrimination", "Only about gender and race", "A buzzword with no real meaning"], "question": "What is intersectionality?", "explanation": "Intersectionality, coined by Kimberlé Crenshaw, describes how systems of oppression (racism, sexism, classism, ableism, homophobia, transphobia) intersect and create unique experiences of marginalization. It is not additive (Black + woman = double oppression) but multiplicative (Black women face unique oppression called misogynoir that is neither just racism nor just sexism). Originated in Black feminist thought (Combahee River Collective, Audre Lorde, bell hooks) to address erasure of Black women in both anti-racist and feminist movements. Intersectionality requires examining structural power, not just individual identities, and centering most marginalized experiences.", "correct_answer": 1}, {"options": ["Same as regular misogyny", "Anti-Black misogyny—the unique hatred, stereotyping, and violence targeting Black women and girls specifically", "Not a real concept", "Only about interpersonal interactions"], "question": "What is misogynoir?", "explanation": "Misogynoir (coined by Moya Bailey) is anti-Black misogyny—the specific hatred and violence targeting Black women and girls that is distinct from misogyny targeting white women or racism targeting Black men. Examples: hypersexualization and dehumanization of Black women, \"angry Black woman\" stereotype, higher rates of intimate partner violence and sexual assault, criminalizing Black motherhood, denial of pain and credibility in healthcare, pushout from schools, exclusion from beauty standards and femininity. Misogynoir is structural (in laws, policies, institutions) not just interpersonal. Addressing misogynoir requires centering Black women''s experiences and safety, not just adding women to anti-racism or Black people to feminism.", "correct_answer": 1}, {"options": ["Class does not matter if you face racism", "Black people face economic oppression through labor exploitation, wealth gap, precarious work, and denial of economic mobility—class does not erase racism and racism shapes class position", "Wealthy Black people face no racism", "Class and race are completely separate"], "question": "How does class intersect with anti-Black racism?", "explanation": "Class and race are intertwined. Black people in Canada: face wealth gap (lower median income, less homeownership, less intergenerational wealth), are overrepresented in low-wage precarious work, experience labor exploitation (from slavery to contemporary gig economy), face barriers to entrepreneurship and business ownership, and have fragile economic mobility easily disrupted by racism. Wealthy Black people still face racism (carding, discrimination in stores, workplace racism) AND face \"Black tax\" (expected to support extended family/community, less intergenerational wealth transfer). Working-class Black people face compounded oppression. Addressing economic justice requires tackling racist barriers to wealth-building and employment equity, not just \"diversity.\"", "correct_answer": 1}, {"options": ["Disabled Black people face same issues as white disabled people", "Black disabled people face compounded discrimination—more likely to be killed by police, excluded from disability justice movements, denied healthcare, and pathologized", "Ableism only affects white people", "Anti-racism automatically includes disability justice"], "question": "What is the intersection of ableism and anti-Black racism?", "explanation": "Black disabled people face unique oppression: Police violence (Black disabled people more likely to be killed during mental health crises or due to not responding to commands), Healthcare discrimination (pain dismissed, needs ignored, experimented on historically and contemporarily), Disability justice exclusion (white-dominated disability movements often ignore race, center white experiences), Pathologization (Black children overdiagnosed with behavioral disabilities, Black adults'' trauma misdiagnosed as mental illness), Barriers to services (poverty, systemic racism, lack of culturally appropriate supports). Addressing this requires: centering Black disabled voices, police abolition, healthcare reform, and building disability justice movements that do not replicate anti-Black racism.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:57:01.603094+00', '2025-11-09 12:57:01.603094+00', NULL, '5840a97b-9250-4300-a24d-212cacc6ddfc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a2ffc298-dd96-49c8-a73c-58d33059d05c', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Introduction: White Supremacy Culture Framework', 'intro-white-supremacy-culture', 'Understand Tema Okun''s framework on organizational characteristics.', 'video', 'https://example.com/videos/intro-white-supremacy-culture.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:57:01.759189+00', '2025-11-09 12:57:01.759189+00', NULL, 'd61e5a15-96b6-4102-bac0-aaf1092e90f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('15c6e3c6-dde0-482a-9c11-a70e86cb15c0', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Perfectionism and Fear of Failure', 'perfectionism-fear-failure', 'Examine how perfectionism culture harms Black employees.', 'video', 'https://example.com/videos/perfectionism-fear-failure.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:01.822044+00', '2025-11-09 12:57:01.822044+00', NULL, 'd61e5a15-96b6-4102-bac0-aaf1092e90f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('44557954-23d4-4259-843e-b4f7a9330575', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Sense of Urgency and Quantity Over Quality', 'urgency-quantity', 'Understand how urgency culture prevents meaningful change.', 'video', 'https://example.com/videos/urgency-quantity.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:01.872556+00', '2025-11-09 12:57:01.872556+00', NULL, 'd61e5a15-96b6-4102-bac0-aaf1092e90f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('560a1c17-6445-4cbb-ab06-eeafd74d4b81', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Worship of the Written Word and Objectivity', 'written-word-objectivity', 'Examine how "objectivity" upholds white ways of knowing.', 'video', 'https://example.com/videos/written-word-objectivity.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:57:01.910537+00', '2025-11-09 12:57:01.910537+00', NULL, 'd61e5a15-96b6-4102-bac0-aaf1092e90f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('29fcd8ce-5c8e-4d2d-b84c-4738e4062315', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Individualism and Right to Comfort', 'individualism-right-comfort', 'Understand how individualism prevents collective accountability.', 'video', 'https://example.com/videos/individualism-right-comfort.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:57:01.995779+00', '2025-11-09 12:57:01.995779+00', NULL, '6bbeeaed-987a-44aa-a876-024b1987fd68', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('ec4167df-ae11-4a04-aa47-7bb018a59dba', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Fear of Open Conflict and Power Hoarding', 'fear-conflict-power-hoarding', 'Examine how conflict avoidance maintains white comfort and power.', 'video', 'https://example.com/videos/fear-conflict-power-hoarding.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:02.043021+00', '2025-11-09 12:57:02.043021+00', NULL, '6bbeeaed-987a-44aa-a876-024b1987fd68', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1d08eafc-858a-437a-b993-feac3e17eb9c', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Paternalism and Defensiveness', 'paternalism-defensiveness', 'Understand how defensiveness shuts down feedback and learning.', 'video', 'https://example.com/videos/paternalism-defensiveness.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:02.081868+00', '2025-11-09 12:57:02.081868+00', NULL, '6bbeeaed-987a-44aa-a876-024b1987fd68', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bb267791-2820-4a5d-8c9d-790a63cd33e2', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Tokenism and Exploitation of Black Labor', 'tokenism-exploitation', 'Understand how Black employees are tokenized and overworked.', 'video', 'https://example.com/videos/tokenism-exploitation.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:57:02.174429+00', '2025-11-09 12:57:02.174429+00', NULL, '4fbba9f2-9e7b-4487-8c51-e089a3faf0f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b3ae2482-149d-4aca-b0cb-6eeaa5f2871b', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Gaslighting and Silencing', 'gaslighting-silencing', 'Examine how Black employees are dismissed when naming racism.', 'video', 'https://example.com/videos/gaslighting-silencing.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:02.237569+00', '2025-11-09 12:57:02.237569+00', NULL, '4fbba9f2-9e7b-4487-8c51-e089a3faf0f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a0323734-2abd-4eb6-bb18-93401b852a65', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Mental Health Impacts and Burnout', 'mental-health-burnout', 'Understand the psychological toll of working in white supremacist cultures.', 'video', 'https://example.com/videos/mental-health-burnout.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:02.32341+00', '2025-11-09 12:57:02.32341+00', NULL, '4fbba9f2-9e7b-4487-8c51-e089a3faf0f0', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6b176aab-70ca-43ed-b863-ccd084076e5a', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Naming and Interrupting White Supremacy Culture', 'naming-interrupting', 'Learn how to identify and call out these patterns.', 'video', 'https://example.com/videos/naming-interrupting.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:57:02.425137+00', '2025-11-09 12:57:02.425137+00', NULL, 'a09e2f64-ceba-4219-a272-0f53c551f0ef', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('119b892e-cfa7-42a1-9174-ec22fe07dcfc', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Building Anti-Racist Organizational Culture', 'building-antiracist-culture', 'Create alternatives rooted in collective care and accountability.', 'video', 'https://example.com/videos/building-antiracist-culture.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:57:02.494909+00', '2025-11-09 12:57:02.494909+00', NULL, 'a09e2f64-ceba-4219-a272-0f53c551f0ef', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('0080347d-7754-46e5-adf8-6633b39e1bf2', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Addressing Resistance and Backlash', 'addressing-resistance-backlash', 'Navigate white fragility and organizational resistance to change.', 'video', 'https://example.com/videos/addressing-resistance-backlash.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:57:02.56067+00', '2025-11-09 12:57:02.56067+00', NULL, 'a09e2f64-ceba-4219-a272-0f53c551f0ef', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('08d96571-0cb7-40ad-ab99-cdba4da456e6', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Final Assessment', 'final-assessment-white-supremacy', 'Comprehensive assessment of white supremacy culture knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Only about explicit white supremacist groups", "The ways that white dominant culture is embedded in organizational structures, norms, and practices—including perfectionism, urgency, individualism, and defensiveness", "Not a real thing in workplaces", "Only about individual racist people"], "question": "What is white supremacy culture in organizations?", "explanation": "White supremacy culture refers to the characteristics and norms of white dominant culture that are embedded in organizational structures, practices, and values—often seen as \"normal\" or \"professional\" but actually uphold white ways of being and harm Black people and other racialized groups. Tema Okun identified characteristics including: perfectionism, sense of urgency, defensiveness, quantity over quality, worship of written word, paternalism, individualism, right to comfort, fear of open conflict, and power hoarding. These are not just individual behaviors but systemic norms that privilege whiteness, punish difference, and maintain power imbalances. Understanding this helps identify root causes of organizational racism beyond individual bias.", "correct_answer": 1}, {"options": ["Perfectionism is just about high standards", "Perfectionism culture punishes mistakes harshly, allows no room for learning, holds Black employees to higher standards, and prioritizes image over substance", "Having high standards is good for everyone", "Black employees benefit from perfectionism"], "question": "How does perfectionism function as white supremacy culture?", "explanation": "Perfectionism in white supremacy culture: Little appreciation for work process or learning from mistakes (only perfect outcomes matter), Black employees held to higher standards while white employees'' mistakes excused, Fear of failure prevents innovation and risk-taking, Blame culture when things go wrong, Defensive when criticized or when mistakes pointed out. For Black employees this means: constant scrutiny and nitpicking, no grace for mistakes white colleagues receive, hypervisibility and higher standards, and exhaustion from needing to be \"twice as good.\" Alternative: build learning culture, normalize mistakes as growth, apply consistent standards, appreciate process not just outcome, and give grace especially to those facing systemic barriers.", "correct_answer": 1}, {"options": ["Working quickly is always good", "Urgency culture prioritizes speed over quality, prevents meaningful planning and relationships, and uses \"urgency\" to dismiss concerns about equity and inclusion", "Deadlines are white supremacy", "Black people do not value timeliness"], "question": "What is \"sense of urgency\" as white supremacy culture characteristic?", "explanation": "Sense of urgency as white supremacy culture: Creates artificial urgency that prevents thoughtful planning, Uses \"we do not have time\" to dismiss equity concerns, Sacrifices quality for speed, Prevents relationship-building and trust necessary for real change, Values quick action over sustainable transformation. Impact on Black employees: Equity work deprioritized as \"too slow,\" Concerns dismissed as \"slowing down progress,\" Burnout from constant urgency, Meaningful change prevented in favor of performative quick wins. Alternative: Differentiate between real and manufactured urgency, Build in time for relationship and trust, Recognize that meaningful change takes time, Slow down to do it right rather than fast to check box.", "correct_answer": 1}, {"options": ["Just hire more diverse people", "Name and interrupt these patterns, build anti-racist alternatives rooted in collective care, center Black voices and leadership, and commit to sustained systemic change", "It cannot be changed", "Ignore it and it will go away"], "question": "How can organizations dismantle white supremacy culture?", "explanation": "Dismantling white supremacy culture requires: Naming it—Educate about these characteristics, make visible what was normalized, Call it out when it happens, Build awareness without shaming. Interrupt it—Challenge perfectionism, urgency, defensiveness when they arise, Support making mistakes and learning, Create space for conflict and discomfort, Share power and decision-making. Build alternatives—Develop anti-racist norms and practices, Center collective care and sustainability, Value diverse ways of being and knowing, Create accountability structures. Sustain it—Long-term commitment not one-time training, Center Black leadership and voices, Address resistance and backlash with clarity, Transform systems not just individuals. This is ongoing work requiring humility, accountability, and willingness to be uncomfortable.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:57:02.611292+00', '2025-11-09 12:57:02.611292+00', NULL, 'a09e2f64-ceba-4219-a272-0f53c551f0ef', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('14106ab6-e960-4788-aa4c-9ad14fa79aa2', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Introduction: What is Racial Trauma?', 'intro-racial-trauma', 'Understand race-based traumatic stress and its legitimacy.', 'video', 'https://example.com/videos/intro-racial-trauma.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:58:57.258225+00', '2025-11-09 12:58:57.258225+00', NULL, 'e26218ef-585f-4682-9aef-b26c66860efc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('e97ad2dd-42d9-41e7-bfbf-0bc3b04f2e39', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Individual and Collective Trauma', 'individual-collective-trauma', 'Distinguish between personal experiences and community-wide trauma.', 'video', 'https://example.com/videos/individual-collective-trauma.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:57.328362+00', '2025-11-09 12:58:57.328362+00', NULL, 'e26218ef-585f-4682-9aef-b26c66860efc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('260de2dc-be8a-4c6d-b983-50a3923d06e5', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Historical and Intergenerational Trauma', 'historical-intergenerational', 'Understand trauma passed through generations.', 'video', 'https://example.com/videos/historical-intergenerational.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:57.38139+00', '2025-11-09 12:58:57.38139+00', NULL, 'e26218ef-585f-4682-9aef-b26c66860efc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d5e7f77e-cc5a-43d3-81b9-317bcb44d2ff', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Symptoms and Manifestations', 'symptoms-manifestations', 'Recognize how racial trauma presents physically and psychologically.', 'video', 'https://example.com/videos/symptoms-manifestations.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:57.447612+00', '2025-11-09 12:58:57.447612+00', NULL, 'e26218ef-585f-4682-9aef-b26c66860efc', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('1a6dbaa9-820d-4371-8247-0a9475770ee1', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Safety: Physical and Psychological', 'safety-physical-psychological', 'Create environments where Black people feel safe.', 'video', 'https://example.com/videos/safety-physical-psychological.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:58:57.579683+00', '2025-11-09 12:58:57.579683+00', NULL, '82c7e855-6dea-4ced-b7da-580c537b7985', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('f162f306-ed17-46fc-b053-879b5eb5f9bc', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Trustworthiness and Transparency', 'trustworthiness-transparency', 'Build trust through accountability and honesty about racism.', 'video', 'https://example.com/videos/trustworthiness-transparency.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:57.651977+00', '2025-11-09 12:58:57.651977+00', NULL, '82c7e855-6dea-4ced-b7da-580c537b7985', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('73bf41f9-4362-44ad-bd5a-947d485d92a5', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Choice, Collaboration, and Empowerment', 'choice-collaboration-empowerment', 'Center Black agency and self-determination.', 'video', 'https://example.com/videos/choice-collaboration-empowerment.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:57.705134+00', '2025-11-09 12:58:57.705134+00', NULL, '82c7e855-6dea-4ced-b7da-580c537b7985', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4abb116b-c2a3-45b3-bc99-9874fc07f2d1', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Recognizing and Preventing Institutional Betrayal', 'institutional-betrayal', 'Understand how institutions re-traumatize through broken trust.', 'video', 'https://example.com/videos/institutional-betrayal.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:58:57.835405+00', '2025-11-09 12:58:57.835405+00', NULL, 'ba103d75-796c-41f1-995a-d9f9412c8266', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('38f1f644-dd54-4a8e-af39-1994de336c52', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Addressing Microaggressions and Daily Assaults', 'microaggressions-daily-assaults', 'Interrupt the cumulative impact of "minor" racist incidents.', 'video', 'https://example.com/videos/microaggressions-daily-assaults.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:57.88444+00', '2025-11-09 12:58:57.88444+00', NULL, 'ba103d75-796c-41f1-995a-d9f9412c8266', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('3da46116-4044-4f23-a109-cfa676dc5615', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Healing Justice and Community Care', 'healing-justice-community-care', 'Learn from Black-led healing and wellness models.', 'video', 'https://example.com/videos/healing-justice-community-care.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:57.929652+00', '2025-11-09 12:58:57.929652+00', NULL, 'ba103d75-796c-41f1-995a-d9f9412c8266', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('14ac4a0d-6f88-4fd6-b7f1-1a8bf0a96583', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Final Assessment', 'final-assessment-trauma', 'Comprehensive assessment of trauma-informed care knowledge.', 'quiz', NULL, '{"questions": [{"options": ["Not a legitimate clinical issue", "Race-based traumatic stress from experiencing racism—including discrimination, violence, microaggressions, and systemic oppression—that causes psychological and physical harm", "Only happens with extreme violence", "Same as general trauma"], "question": "What is racial trauma?", "explanation": "Racial trauma (race-based traumatic stress) is the psychological and physical harm caused by experiences of racism. It includes: direct discrimination and violence, witnessing violence against other Black people, microaggressions and daily assaults, systemic oppression and marginalization, fear for safety due to racism. Symptoms mirror PTSD: hypervigilance, anxiety, depression, anger, physical health impacts, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It is intergenerational—passed through families and communities. It is legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not pathologizing natural responses to oppression.", "correct_answer": 1}, {"options": ["Trauma-informed care is enough without addressing racism", "Apply principles of safety, trustworthiness, choice, collaboration, and empowerment while naming and addressing racism as source of trauma", "Ignore race and focus only on trauma", "Trauma-informed care is only for clinical settings"], "question": "How do you apply trauma-informed principles in anti-racist context?", "explanation": "Trauma-informed care in anti-racist context requires: Safety—Create physical and psychological safety, recognize racism as safety threat, address racist policies and practices. Trustworthiness—Be transparent about institutional racism, acknowledge harm, build trust through accountability. Choice and collaboration—Center Black agency and self-determination, recognize resilience and resistance not just victimhood. Empowerment—Support Black leadership, validate experiences of racism, provide resources and tools. Cultural responsiveness—Understand cultural context of trauma, work with community healers, avoid pathologizing cultural coping. Critical difference: mainstream trauma-informed care often ignores racism as trauma source—anti-racist approach names and addresses racism directly.", "correct_answer": 1}, {"options": ["Re-traumatization does not happen in helping professions", "Re-traumatization occurs when systems and services cause additional harm—prevent it by addressing racism, building trust, avoiding power-over dynamics, and centering safety", "Only about reminding people of past trauma", "Cannot be prevented"], "question": "What is re-traumatization and how can it be prevented?", "explanation": "Re-traumatization happens when systems/services meant to help cause additional harm. For Black people, this includes: Being disbelieved or dismissed when reporting racism, Facing racism from providers meant to help, Institutional betrayal (organization ignores or covers up harm), Coercive practices removing choice and autonomy, Microaggressions and stereotyping, Culturally inappropriate or harmful interventions. Preventing re-traumatization: Address systemic racism in your institution, Build accountability for racist harm, Create genuine safety not just physical but psychological, Respect Black people''s autonomy and choices, Hire and support Black providers, Listen and believe when Black people name racism, Avoid power-over dynamics, Center healing and restoration not punishment.", "correct_answer": 1}, {"options": ["Not real—practitioners should just be tougher", "The emotional and psychological impact of repeatedly witnessing or addressing racism and trauma—requires self-care, supervision, and organizational support", "Only affects weak people", "Same for everyone regardless of race"], "question": "What is vicarious trauma for anti-racism practitioners?", "explanation": "Vicarious trauma (secondary traumatic stress, compassion fatigue) affects people doing anti-racism work, especially Black practitioners: Repeatedly hearing/witnessing racist harm, Carrying others'' racial trauma, Working in racist institutions while addressing racism, Experiencing own racism while supporting others, Emotional labor of educating and managing white fragility. Symptoms: burnout, cynicism, hopelessness, anxiety, physical health issues, numbing. For Black practitioners: compounded by own experiences of racism, higher expectations and scrutiny, less institutional support. Addressing it requires: Organizational responsibility (not just individual self-care), Supervision and peer support, Rest and boundaries, Healing-centered approaches, Addressing root causes (institutional racism) not just symptoms. Self-care is not bubble baths—it is systemic change.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:57.974635+00', '2025-11-09 12:58:57.974635+00', NULL, 'ba103d75-796c-41f1-995a-d9f9412c8266', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('328481a3-e9cc-4309-a0f2-ace20348a2f4', '48531317-4d90-4ad7-87f0-06fff0120925', 'Introduction: What is an Anti-Racist Organization?', 'intro-antiracist-org', 'Define characteristics of truly anti-racist organizations.', 'video', 'https://example.com/videos/intro-antiracist-org.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, true, true, '[]', NULL, '2025-11-09 12:58:58.163274+00', '2025-11-09 12:58:58.163274+00', NULL, '4223759c-5387-481e-819f-01c30334ca5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9aa41546-3361-4a5c-8d35-1baad82aaf1c', '48531317-4d90-4ad7-87f0-06fff0120925', 'Data Collection and Analysis', 'data-collection-analysis', 'Gather comprehensive data on representation, experiences, and outcomes.', 'video', 'https://example.com/videos/data-collection-analysis.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 1, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:58.24148+00', '2025-11-09 12:58:58.24148+00', NULL, '4223759c-5387-481e-819f-01c30334ca5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8405fe18-17d5-4b16-a4d6-3408f8cba08d', '48531317-4d90-4ad7-87f0-06fff0120925', 'Assessing Policies and Practices', 'assessing-policies-practices', 'Review organizational policies for racist impacts.', 'video', 'https://example.com/videos/assessing-policies-practices.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 1, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:58.307071+00', '2025-11-09 12:58:58.307071+00', NULL, '4223759c-5387-481e-819f-01c30334ca5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('401503fc-936e-4cc2-9133-f05f819cd9c3', '48531317-4d90-4ad7-87f0-06fff0120925', 'Workplace Climate Assessment', 'workplace-climate-assessment', 'Understand experiences of Black employees through surveys and listening.', 'video', 'https://example.com/videos/workplace-climate-assessment.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 1, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:58.35597+00', '2025-11-09 12:58:58.35597+00', NULL, '4223759c-5387-481e-819f-01c30334ca5e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('71668ec3-2841-4b7f-8704-48012d587631', '48531317-4d90-4ad7-87f0-06fff0120925', 'Setting Meaningful Goals and Metrics', 'setting-goals-metrics', 'Move beyond vague commitments to specific, measurable goals.', 'video', 'https://example.com/videos/setting-goals-metrics.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 1, 1, true, false, '[]', NULL, '2025-11-09 12:58:58.435525+00', '2025-11-09 12:58:58.435525+00', NULL, '2601bcbd-bb76-491c-9333-0d69b7ecb30f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('c9918c1f-d4d2-4b50-a91b-7b58545a3b30', '48531317-4d90-4ad7-87f0-06fff0120925', 'Resource Allocation and Budget', 'resource-allocation-budget', 'Commit financial resources proportional to anti-racism goals.', 'video', 'https://example.com/videos/resource-allocation-budget.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 2, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:58.480655+00', '2025-11-09 12:58:58.480655+00', NULL, '2601bcbd-bb76-491c-9333-0d69b7ecb30f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('bfa84672-d55a-404a-9b88-73ed607d5a01', '48531317-4d90-4ad7-87f0-06fff0120925', 'Timeline and Phased Approach', 'timeline-phased-approach', 'Create realistic timelines balancing urgency with sustainability.', 'video', 'https://example.com/videos/timeline-phased-approach.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 2, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:58.520709+00', '2025-11-09 12:58:58.520709+00', NULL, '2601bcbd-bb76-491c-9333-0d69b7ecb30f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('20650cde-25cf-442f-81d1-1559e7edefba', '48531317-4d90-4ad7-87f0-06fff0120925', 'Centering Black Leadership', 'centering-black-leadership', 'Ensure Black people lead anti-racism strategy not just advise.', 'video', 'https://example.com/videos/centering-black-leadership.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 2, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:58.562974+00', '2025-11-09 12:58:58.562974+00', NULL, '2601bcbd-bb76-491c-9333-0d69b7ecb30f', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('4486a3a7-30da-4d1e-9236-6e8f696b5c3d', '48531317-4d90-4ad7-87f0-06fff0120925', 'Anti-Racism Committees and Working Groups', 'committees-working-groups', 'Structure, power, and resources for anti-racism bodies.', 'video', 'https://example.com/videos/committees-working-groups.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 1, 1, true, false, '[]', NULL, '2025-11-09 12:58:58.663078+00', '2025-11-09 12:58:58.663078+00', NULL, '4663b82d-ccc0-403c-9868-64bcdb695d7d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('19c1c5ed-0c04-4cb5-a57b-fb594f3ad755', '48531317-4d90-4ad7-87f0-06fff0120925', 'Reporting and Transparency', 'reporting-transparency', 'Public reporting on progress, setbacks, and next steps.', 'video', 'https://example.com/videos/reporting-transparency.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 3, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:58.708284+00', '2025-11-09 12:58:58.708284+00', NULL, '4663b82d-ccc0-403c-9868-64bcdb695d7d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('7b8cfe66-8562-4a96-95ad-f5b868e7f5cc', '48531317-4d90-4ad7-87f0-06fff0120925', 'Consequences for Racist Harm', 'consequences-racist-harm', 'Develop clear processes for addressing racism and misconduct.', 'video', 'https://example.com/videos/consequences-racist-harm.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 3, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:58.76203+00', '2025-11-09 12:58:58.76203+00', NULL, '4663b82d-ccc0-403c-9868-64bcdb695d7d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('372a6c48-685b-479b-9596-7597a8d4eea2', '48531317-4d90-4ad7-87f0-06fff0120925', 'Accountability to Black Communities', 'accountability-black-communities', 'Build relationships and accountability beyond your organization.', 'video', 'https://example.com/videos/accountability-black-communities.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 3, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:58.806488+00', '2025-11-09 12:58:58.806488+00', NULL, '4663b82d-ccc0-403c-9868-64bcdb695d7d', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('9b955478-140c-4832-807b-ac43538e92b8', '48531317-4d90-4ad7-87f0-06fff0120925', 'Anti-Racist Recruitment and Hiring', 'antiracist-recruitment-hiring', 'Build authentic pipelines and equitable processes.', 'video', 'https://example.com/videos/antiracist-recruitment-hiring.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 1, 1, true, false, '[]', NULL, '2025-11-09 12:58:58.892929+00', '2025-11-09 12:58:58.892929+00', NULL, 'c47b8adb-7600-4464-b5bc-e19c498c8c7e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('8ac3140b-b86f-4de5-8c18-c1990b4aa0ae', '48531317-4d90-4ad7-87f0-06fff0120925', 'Equitable Compensation and Benefits', 'equitable-compensation-benefits', 'Address pay equity and benefits that support Black employees.', 'video', 'https://example.com/videos/equitable-compensation-benefits.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 4, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:58.957729+00', '2025-11-09 12:58:58.957729+00', NULL, 'c47b8adb-7600-4464-b5bc-e19c498c8c7e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('6f0a3a61-1101-486a-9176-668e8f070634', '48531317-4d90-4ad7-87f0-06fff0120925', 'Performance Management and Advancement', 'performance-advancement', 'Create equitable evaluation and promotion processes.', 'video', 'https://example.com/videos/performance-advancement.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 4, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:59.007899+00', '2025-11-09 12:58:59.007899+00', NULL, 'c47b8adb-7600-4464-b5bc-e19c498c8c7e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('a132bfa7-fd78-4794-8010-b18db98271b5', '48531317-4d90-4ad7-87f0-06fff0120925', 'Support Systems and Employee Resource Groups', 'support-systems-ergs', 'Properly resource Black employee support with real power.', 'video', 'https://example.com/videos/support-systems-ergs.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 4, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:59.048729+00', '2025-11-09 12:58:59.048729+00', NULL, 'c47b8adb-7600-4464-b5bc-e19c498c8c7e', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('b2ccc4be-9bcf-490a-9640-906e5caa97b9', '48531317-4d90-4ad7-87f0-06fff0120925', 'Beyond Performative Statements', 'beyond-performative-statements', 'Match actions to words with sustained commitment.', 'video', 'https://example.com/videos/beyond-performative-statements.mp4', '{}', 660, NULL, NULL, NULL, NULL, NULL, 5, 1, 1, true, false, '[]', NULL, '2025-11-09 12:58:59.137867+00', '2025-11-09 12:58:59.137867+00', NULL, '51328e0d-7054-4afe-9e58-f9c321badf26', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('07ec3710-33d9-493f-bd0a-93f6d46709be', '48531317-4d90-4ad7-87f0-06fff0120925', 'Leadership Accountability', 'leadership-accountability', 'Hold executives and board accountable for anti-racism progress.', 'video', 'https://example.com/videos/leadership-accountability.mp4', '{}', 720, NULL, NULL, NULL, NULL, NULL, 5, 2, 2, true, false, '[]', NULL, '2025-11-09 12:58:59.177792+00', '2025-11-09 12:58:59.177792+00', NULL, '51328e0d-7054-4afe-9e58-f9c321badf26', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('408de90d-383a-4c03-ad6f-e95f8b5f6f87', '48531317-4d90-4ad7-87f0-06fff0120925', 'Navigating Backlash and Resistance', 'navigating-backlash-resistance', 'Maintain commitment when facing pushback.', 'video', 'https://example.com/videos/navigating-backlash-resistance.mp4', '{}', 600, NULL, NULL, NULL, NULL, NULL, 5, 3, 3, true, false, '[]', NULL, '2025-11-09 12:58:59.232311+00', '2025-11-09 12:58:59.232311+00', NULL, '51328e0d-7054-4afe-9e58-f9c321badf26', NULL, NULL, NULL, NULL, 0.0, NULL, true, false),
	('d980bd9e-a37a-45df-9267-76bf69886ed5', '48531317-4d90-4ad7-87f0-06fff0120925', 'Final Assessment', 'final-assessment-building-orgs', 'Comprehensive assessment of building anti-racist organizations.', 'quiz', NULL, '{"questions": [{"options": ["Hiring diverse employees", "Systemic commitment to identifying and dismantling racism in policies, practices, culture, and outcomes with accountability and sustained action", "Diversity training once a year", "Saying \"Black Lives Matter\""], "question": "What makes an organization truly anti-racist?", "explanation": "Anti-racist organizations go beyond diversity and inclusion to actively dismantle systemic racism. Characteristics: Leadership commitment with accountability and consequences, Comprehensive audit of policies for racist impacts, Equitable representation at all levels especially leadership, Pay equity and wealth redistribution, Anti-racist culture not just diverse faces, Meaningful power-sharing and Black leadership, Accountability structures with transparency and reporting, Resource allocation proportional to goals, Addressing harm with consequences not excuses, Community accountability beyond organization. It is not performative statements or one-time trainings—it is sustained systemic transformation with resources, power-sharing, and accountability. Measurement includes outcomes not just intentions.", "correct_answer": 1}, {"options": ["Just counting diverse employees", "Comprehensive assessment of demographics, policies, pay equity, workplace climate, promotion/retention, complaints/discipline, and community impact", "Only what looks good publicly", "Audits are not necessary"], "question": "What should be included in an organizational anti-racism audit?", "explanation": "Comprehensive anti-racism audit includes: Demographics—Representation at all levels, pay by race, promotions by race, retention/turnover. Policies—Review hiring, evaluation, discipline, benefits for racist impacts. Workplace climate—Survey Black employees on experiences, safety, belonging, barriers. Complaints and discipline—Analyze who reports, who is believed, who faces consequences. Community impact—Examine who organization serves, harms, excludes. Procurement—Who gets contracts, whose businesses supported. Board and leadership—Who holds power and makes decisions. The audit must be honest about current state not defensive. Share findings transparently with Black employees and communities. Use data to develop targeted action plan with measurable goals and timelines.", "correct_answer": 1}, {"options": ["Trust that people will do the right thing", "Build structures with clear goals, regular reporting, consequences for inaction, Black leadership, and community accountability", "Accountability is not possible", "Just make public statements"], "question": "How do you create accountability for anti-racism commitments?", "explanation": "Accountability structures require: Clear measurable goals with specific timelines, Anti-racism committee with power and resources (not just advisory), Black leadership at decision-making levels, Regular public reporting on progress and setbacks, Consequences for leaders who fail to meet goals (tied to evaluation and compensation), Process for addressing racist harm with real consequences, Community accountability (not just internal), Budget allocation matching stated priorities, Transparency about challenges and failures not just wins. Accountability is not voluntary goodwill—it is built-in expectations with consequences. Leaders must be held responsible for anti-racism progress or lack thereof. Black employees and communities must have power to hold organization accountable, not just provide feedback.", "correct_answer": 1}, {"options": ["Post on social media", "Embed anti-racism in organizational DNA through policies, budget, leadership accountability, ongoing learning, and community relationships", "Wait for next racial justice movement moment", "Sustainability is impossible"], "question": "How do you sustain anti-racism work beyond performative moments?", "explanation": "Sustaining anti-racism requires: Structural embedding—Anti-racism in mission, values, strategic plan, not separate \"initiative.\" Budget commitment—Ongoing funding not one-time allocation, resourced positions not volunteer labor. Leadership accountability—Anti-racism tied to executive evaluations and board governance. Ongoing education—Not one training but continuous learning and development. Policy integration—Anti-racism lens applied to all decisions not siloed in HR/diversity. Black leadership—Not just advisors but decision-makers with power. Long-term planning—Multi-year commitment not reactive to current events. Community relationships—Sustained partnerships not transactional. Addressing backlash—Clear stance when facing pushback, not abandoning commitment. Celebrate progress while continuing work—Acknowledge wins without declaring victory. Anti-racism is not project with end date—it is fundamental organizational practice requiring sustained commitment.", "correct_answer": 1}], "passing_score": 75, "time_limit_minutes": 15}', NULL, NULL, NULL, NULL, NULL, NULL, 5, 4, 4, true, false, '[]', NULL, '2025-11-09 12:58:59.275372+00', '2025-11-09 12:58:59.275372+00', NULL, '51328e0d-7054-4afe-9e58-f9c321badf26', NULL, NULL, NULL, NULL, 0.0, NULL, true, false);


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."quizzes" ("id", "lesson_id", "course_id", "title", "description", "passing_score_percentage", "time_limit_minutes", "max_attempts", "randomize_questions", "show_correct_answers", "questions", "created_at", "updated_at", "is_published", "available_from", "available_until") VALUES
	('90910129-a0a9-4670-b22a-0e9a263b0f39', '9b30c20d-88e8-4e8a-a587-30bb83d92fe5', '89412866-31d7-46e9-80eb-b5579b9648b1', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:54.354174+00', '2025-11-09 13:21:54.354174+00', false, NULL, NULL),
	('191f953b-b1fd-4b1a-bc43-ea81a48fa663', 'df839e88-c627-4352-9df3-e9ec8048fdc5', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:54.750334+00', '2025-11-09 13:21:54.750334+00', false, NULL, NULL),
	('b5b498b4-a08f-4c22-9eea-67394d404453', 'd41628cb-3b91-4389-8200-5e40696a99c8', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:55.172247+00', '2025-11-09 13:21:55.172247+00', false, NULL, NULL),
	('da7c0814-f186-4087-8fed-d52e69a1814d', 'e8962adb-cde7-4553-8dc6-42fdf369dfd6', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:55.550252+00', '2025-11-09 13:21:55.550252+00', false, NULL, NULL),
	('805cb457-b696-4051-934b-23b2b28496a0', '2d0935a7-cae6-4785-967d-7a1369ce4759', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:21:55.91144+00', '2025-11-09 13:21:55.91144+00', false, NULL, NULL),
	('d1324f94-57fd-4cdc-b057-35d9050dc029', '824d10e1-e0c7-4e35-9207-5cc725a1e478', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Quiz: Early History', 'Assessment for Quiz: Early History', 75, 10, 3, false, true, '[]', '2025-11-09 13:21:56.194141+00', '2025-11-09 13:21:56.194141+00', false, NULL, NULL),
	('b25ee3f8-b358-494c-b29e-b150bec60550', '7ca79a87-ef50-44ca-a77e-6edfa042424b', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Quiz: Segregation Era', 'Assessment for Quiz: Segregation Era', 75, 10, 3, false, true, '[]', '2025-11-09 13:21:56.360835+00', '2025-11-09 13:21:56.360835+00', false, NULL, NULL),
	('2127beaa-1ce3-482d-b3c4-14e8d8645865', 'd2abe63b-2bbb-4126-8f1d-7c24c0880737', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'Final Assessment', 'Assessment for Final Assessment', 80, 20, 3, false, true, '[]', '2025-11-09 13:21:56.513543+00', '2025-11-09 13:21:56.513543+00', false, NULL, NULL),
	('3f810986-6c03-4730-b7a4-83b671f92192', 'd980bd9e-a37a-45df-9267-76bf69886ed5', '48531317-4d90-4ad7-87f0-06fff0120925', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:56.787835+00', '2025-11-09 13:21:56.787835+00', false, NULL, NULL),
	('ca38d485-3cff-46e2-99f7-6a075ba32025', '2f0212f1-ae41-480b-8ffb-434614efdc69', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Quiz: Federal Human Rights', 'Assessment for Quiz: Federal Human Rights', 75, 10, 3, false, true, '[]', '2025-11-09 13:21:57.071648+00', '2025-11-09 13:21:57.071648+00', false, NULL, NULL),
	('64d2cfb3-fb59-4795-895f-e82601d6461e', 'db775eef-fb60-4f1d-9cd0-4c36f2c4d605', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'Final Assessment', 'Assessment for Final Assessment', 80, 20, 3, false, true, '[]', '2025-11-09 13:21:57.255228+00', '2025-11-09 13:21:57.255228+00', false, NULL, NULL),
	('fdc479d8-3cde-4562-82ed-02edead2c83c', '60758217-bf21-423a-9888-a5292103d34a', 'd4df555c-60ec-4a39-8db6-98f595018473', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:21:57.575061+00', '2025-11-09 13:21:57.575061+00', false, NULL, NULL),
	('d2fe75f7-3a37-4704-b7cf-1a19a47a1cce', '4b2a785d-15fe-4dcb-a719-0e6bfb57daad', '12337701-48ae-41b1-a2ae-3cf85339ec66', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:57.910207+00', '2025-11-09 13:21:57.910207+00', false, NULL, NULL),
	('9933e320-e6dc-49b6-b268-d59103eadcb9', 'fec66fe5-9dbc-4be7-9830-a797f9b7d8de', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Quiz: Preparation & Mindset', 'Assessment for Quiz: Preparation & Mindset', 75, 10, 3, false, true, '[]', '2025-11-09 13:21:58.253357+00', '2025-11-09 13:21:58.253357+00', false, NULL, NULL),
	('6cf51c3c-7606-4d71-8dc6-de02aafadad1', '7affc9b4-39b0-4d2e-a04a-0cc1f7637b1a', '4648b980-da55-42c9-bce0-16de3e2366c3', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:21:58.425842+00', '2025-11-09 13:21:58.425842+00', false, NULL, NULL),
	('fe067e4e-32bf-45af-800e-c5537bc1a8c6', '08d96571-0cb7-40ad-ab99-cdba4da456e6', 'e7e447be-5171-4710-82c0-32c1979d5581', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:58.743272+00', '2025-11-09 13:21:58.743272+00', false, NULL, NULL),
	('2c06214c-81b8-41c5-a4d1-90b5c15488b1', 'ebaa7239-55f9-4655-b71e-37b1032c08a4', 'bec54d11-cb40-43da-aace-1177501111af', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:59.033021+00', '2025-11-09 13:21:59.033021+00', false, NULL, NULL),
	('cdb71704-04f8-4d04-97f2-e421fa5fa197', '9aaa397d-a922-4a81-939d-d8560c4c1a18', 'b691d971-42b1-4039-abc0-4df213fff8d1', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:21:59.37716+00', '2025-11-09 13:21:59.37716+00', false, NULL, NULL),
	('1416aa01-8709-4078-9d64-5535178339e3', '14730db2-e188-48f4-b4bc-8f7c5e6ec870', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:21:59.885248+00', '2025-11-09 13:21:59.885248+00', false, NULL, NULL),
	('fbc3d7e0-65c1-431b-a901-441f5dbce861', '7a62f7f4-16e9-4b32-9c5b-f6d2582e3987', '514051fa-5b31-40cc-b88f-ac4dde373eb1', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:22:00.387935+00', '2025-11-09 13:22:00.387935+00', false, NULL, NULL),
	('b56afcd9-29af-41c5-aaaa-223818e9aaba', 'e3cd486e-ff8e-4179-a5f2-429bbec11b9f', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:00.724918+00', '2025-11-09 13:22:00.724918+00', false, NULL, NULL),
	('7b53b7df-f0c9-4f3c-8a5a-8ad40334512e', '0a51f04b-f1b2-4fa4-ae2c-2b2dff0fefab', '8171b79b-869b-45d7-8c5c-340507244da3', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:01.073275+00', '2025-11-09 13:22:01.073275+00', false, NULL, NULL),
	('3d14462c-455b-4649-be10-8bd571585eaa', '1a2f93b6-8be4-4336-b3f3-04bf169c472c', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:01.451959+00', '2025-11-09 13:22:01.451959+00', false, NULL, NULL),
	('f4f766a4-4a85-4f6a-9dae-72a1b8507f04', '75fff04f-b082-4a09-a0e0-6c71cdab1d4a', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Knowledge Check: Foundations', 'Assessment for Knowledge Check: Foundations', 80, 15, 3, false, true, '[]', '2025-11-09 13:22:01.764342+00', '2025-11-09 13:22:01.764342+00', false, NULL, NULL),
	('35e0c543-054f-4a46-b4aa-5231cb65a37d', 'c32b5722-a9e8-4296-b842-4e0d454f2136', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Knowledge Check: Contemporary Issues', 'Assessment for Knowledge Check: Contemporary Issues', 75, 10, 3, false, true, '[]', '2025-11-09 13:22:02.017126+00', '2025-11-09 13:22:02.017126+00', false, NULL, NULL),
	('c46b6de5-df51-43ef-958e-28e573475bab', 'b86dc4cd-169c-48d8-a4ed-d6b9700d77d9', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'Final Assessment', 'Assessment for Final Assessment', 85, 20, 3, false, true, '[]', '2025-11-09 13:22:02.249305+00', '2025-11-09 13:22:02.249305+00', false, NULL, NULL),
	('6e512818-cf8a-4869-995a-3035d4f755a8', '80392fe5-ac8b-46d6-a2a3-e99e99679efd', '896de482-9231-4d59-8a5a-047b95926a1a', 'Quiz: Policy Development', 'Assessment for Quiz: Policy Development', 75, 10, 3, false, true, '[]', '2025-11-09 13:22:02.564304+00', '2025-11-09 13:22:02.564304+00', false, NULL, NULL),
	('42296a6b-b1d6-4a1a-ae70-db99ea4e20c0', '3a083131-09a1-4d5c-94af-03e914206645', '896de482-9231-4d59-8a5a-047b95926a1a', 'Final Assessment', 'Assessment for Final Assessment', 80, 20, 3, false, true, '[]', '2025-11-09 13:22:02.722006+00', '2025-11-09 13:22:02.722006+00', false, NULL, NULL),
	('40f68e7f-8ae6-466e-a4c0-acfaa8c77465', '796afe76-8244-49b9-b688-f5fae40a1cf6', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Quiz: Equity Metrics', 'Assessment for Quiz: Equity Metrics', 75, 10, 3, false, true, '[]', '2025-11-09 13:22:03.014645+00', '2025-11-09 13:22:03.014645+00', false, NULL, NULL),
	('558589df-011b-4132-8b07-6d80211b5b6e', '5c27ecc1-4a37-455f-910a-4d4cf5db1cb2', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:22:03.271193+00', '2025-11-09 13:22:03.271193+00', false, NULL, NULL),
	('5fd777ee-67ec-4ab2-a083-5104a19588cd', '7c851668-d971-4c78-9115-4972eb461519', '17767e69-30e3-4c0b-aa13-a8990502b002', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:03.648631+00', '2025-11-09 13:22:03.648631+00', false, NULL, NULL),
	('21c90adb-5427-4b4c-b888-1093f09d57ac', 'd584857f-7197-4aee-9706-a0d0dd1fbfa7', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:04.012374+00', '2025-11-09 13:22:04.012374+00', false, NULL, NULL),
	('444b2769-f94f-4a75-b403-33a6f6a3e786', '76b3a887-4bae-46fe-bb56-d649ce31b383', '9ae5f595-d13c-4880-86b3-1233c42bfce7', 'Final Assessment', 'Assessment for Final Assessment', 80, 15, 3, false, true, '[]', '2025-11-09 13:22:04.404578+00', '2025-11-09 13:22:04.404578+00', false, NULL, NULL),
	('e6006d79-be5b-4963-bcb8-09b2bacc477a', '57d4110b-fdbc-45ba-b23b-b9fad210499c', '4c324c34-15c9-452c-be1f-b57a8a6deb39', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:04.712145+00', '2025-11-09 13:22:04.712145+00', false, NULL, NULL),
	('6470e49e-5ec7-472e-abc5-1922f74de573', '97d83f4f-50ff-44e1-a9de-32bccc9d6983', '21493075-7bbf-41cd-a938-0119007db4d2', 'Quiz: Microaggressions', 'Assessment for Quiz: Microaggressions', 75, 10, 3, false, true, '[]', '2025-11-09 13:22:05.020154+00', '2025-11-09 13:22:05.020154+00', false, NULL, NULL),
	('a5d830d2-d34c-474f-8289-78f087d06dca', '2a36b03c-3761-4218-ab49-628d7662ea65', 'de3eee9b-630c-4aec-a014-0849353d411c', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:05.291203+00', '2025-11-09 13:22:05.291203+00', false, NULL, NULL),
	('f4b0baaa-b728-4b0c-9029-1b51c22e1b7d', '8b4f132a-3abd-41ec-bc53-38c8baf2c314', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:05.60631+00', '2025-11-09 13:22:05.60631+00', false, NULL, NULL),
	('d9777ee6-2c12-4955-bdbf-5ca5a73a1910', '14ac4a0d-6f88-4fd6-b7f1-1a8bf0a96583', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', 'Final Assessment', 'Assessment for Final Assessment', 75, 15, 3, false, true, '[]', '2025-11-09 13:22:05.927259+00', '2025-11-09 13:22:05.927259+00', false, NULL, NULL);


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: classification_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: compliance_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: content_quality_checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_achievement_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."course_achievement_categories" ("id", "name", "slug", "description", "icon", "color", "sort_order", "is_active", "created_at", "updated_at") VALUES
	('4c360326-3e6a-46a8-b38d-29f3cce59738', 'Course Completion', 'course-completion', 'Complete courses to earn these badges', '🎓', '#4CAF50', 1, true, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('9611b2ec-d719-4644-a3ad-a1d9da644a6c', 'Skill Mastery', 'skill-mastery', 'Master specific skills and topics', '⚡', '#2196F3', 2, true, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('bad76be5-248b-4f50-abd2-9cd7b392c9c0', 'Engagement', 'engagement', 'Active participation and contribution', '💬', '#FF9800', 3, true, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('e4c3bed0-85ae-4628-9634-2c360adb0db7', 'Streak', 'streak', 'Consistent learning habits', '🔥', '#F44336', 4, true, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('52f017ae-27c5-405f-8d34-9df4d8a614ba', 'Speed', 'speed', 'Fast completion with quality', '⚡', '#9C27B0', 5, true, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('e2632b07-446f-4db3-bc64-b310be8a65d7', 'Perfection', 'perfection', 'Perfect scores and flawless execution', '💎', '#FFD700', 6, true, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00');


--
-- Data for Name: course_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."course_achievements" ("id", "category_id", "name", "slug", "description", "icon", "tier", "requirement_type", "requirement_config", "points_awarded", "badge_image_url", "is_secret", "is_active", "display_order", "created_at", "updated_at") VALUES
	('05966fb0-ab6a-4c59-8266-9c08f792552d', '4c360326-3e6a-46a8-b38d-29f3cce59738', 'First Steps', 'first-course', 'Complete your first course', '🎯', 'bronze', 'course_completion', '{"count": 1}', 50, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('77078633-c836-4fa1-b9ad-080af126d7d2', '4c360326-3e6a-46a8-b38d-29f3cce59738', 'Learning Explorer', 'five-courses', 'Complete 5 courses', '🗺️', 'silver', 'course_completion', '{"count": 5}', 250, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('338ae02a-2355-47f6-b12e-ef6df6a4165f', '4c360326-3e6a-46a8-b38d-29f3cce59738', 'Knowledge Seeker', 'ten-courses', 'Complete 10 courses', '📚', 'gold', 'course_completion', '{"count": 10}', 500, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('a6520b6d-7221-4c27-8c86-992025c7e292', '4c360326-3e6a-46a8-b38d-29f3cce59738', 'Master Learner', 'twenty-courses', 'Complete 20 courses', '🏆', 'platinum', 'course_completion', '{"count": 20}', 1000, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('99e6ca6b-0fc5-4c12-873a-ba95a507d04a', '4c360326-3e6a-46a8-b38d-29f3cce59738', 'Elite Scholar', 'fifty-courses', 'Complete 50 courses', '👑', 'diamond', 'course_completion', '{"count": 50}', 2500, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('d3da45c1-7ae4-449f-865e-7a4d66bcd401', '9611b2ec-d719-4644-a3ad-a1d9da644a6c', 'Skill Apprentice', 'skill-bronze', 'Achieve mastery in one skill', '🥉', 'bronze', 'skill_mastery', '{"skills": 1, "mastery_level": 80}', 100, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('91ca060c-520a-4240-b10f-5de9f24f5433', '9611b2ec-d719-4644-a3ad-a1d9da644a6c', 'Skill Expert', 'skill-silver', 'Achieve mastery in 3 skills', '🥈', 'silver', 'skill_mastery', '{"skills": 3, "mastery_level": 80}', 300, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('407897a8-ba20-4691-9a2d-18fc6bf62d92', '9611b2ec-d719-4644-a3ad-a1d9da644a6c', 'Skill Master', 'skill-gold', 'Achieve mastery in 5 skills', '🥇', 'gold', 'skill_mastery', '{"skills": 5, "mastery_level": 80}', 600, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('408d7536-9b1d-4ff7-8313-b1cb4a81d027', '9611b2ec-d719-4644-a3ad-a1d9da644a6c', 'Polymath', 'skill-platinum', 'Achieve mastery in 10 skills', '🌟', 'platinum', 'skill_mastery', '{"skills": 10, "mastery_level": 80}', 1200, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('979fb48d-4e80-4ad9-9d17-831770ee9968', 'bad76be5-248b-4f50-abd2-9cd7b392c9c0', 'Helpful Hand', 'helpful-bronze', 'Help 5 fellow learners', '🤝', 'bronze', 'engagement', '{"helps": 5}', 75, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('99f661f9-c9d9-4331-acda-ef9b1270107e', 'bad76be5-248b-4f50-abd2-9cd7b392c9c0', 'Community Champion', 'helpful-silver', 'Help 25 fellow learners', '💪', 'silver', 'engagement', '{"helps": 25}', 200, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('ca5f4527-260a-4814-816f-6290ed6c4ced', 'bad76be5-248b-4f50-abd2-9cd7b392c9c0', 'Mentor', 'helpful-gold', 'Help 50 fellow learners', '🎖️', 'gold', 'engagement', '{"helps": 50}', 400, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('a0317a0c-eccf-410e-a1ab-614efdbbf46b', 'bad76be5-248b-4f50-abd2-9cd7b392c9c0', 'Discussion Leader', 'discussions-platinum', 'Start 20 meaningful discussions', '💡', 'platinum', 'engagement', '{"discussions": 20, "min_replies": 5}', 800, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('29018493-3972-42b6-922b-a05b68360304', 'e4c3bed0-85ae-4628-9634-2c360adb0db7', 'Week Warrior', 'streak-7', 'Maintain a 7-day learning streak', '🔥', 'bronze', 'streak', '{"days": 7}', 100, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('8097c202-7f89-410f-82ca-352dca76421d', 'e4c3bed0-85ae-4628-9634-2c360adb0db7', 'Month Master', 'streak-30', 'Maintain a 30-day learning streak', '💥', 'silver', 'streak', '{"days": 30}', 400, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('455dce37-38cd-423d-91ca-87e6497f1dc9', 'e4c3bed0-85ae-4628-9634-2c360adb0db7', 'Consistency King', 'streak-90', 'Maintain a 90-day learning streak', '⚡', 'gold', 'streak', '{"days": 90}', 1000, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('1720c157-f0a5-4ad2-862d-17caa221d991', 'e4c3bed0-85ae-4628-9634-2c360adb0db7', 'Unstoppable', 'streak-365', 'Maintain a 365-day learning streak', '🏆', 'platinum', 'streak', '{"days": 365}', 5000, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('44f4cb37-09e9-4f85-8137-a8c1a4e939a3', '52f017ae-27c5-405f-8d34-9df4d8a614ba', 'Quick Learner', 'speed-bronze', 'Complete a course in 50% of average time', '⚡', 'bronze', 'speed', '{"percentage": 50}', 150, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('8a842175-9a25-4c04-879f-d7d09ace2c12', '52f017ae-27c5-405f-8d34-9df4d8a614ba', 'Speed Demon', 'speed-silver', 'Complete 5 courses in 50% of average time', '🚀', 'silver', 'speed', '{"count": 5, "percentage": 50}', 500, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('6f84304e-3008-46c2-b03c-7094415c794d', '52f017ae-27c5-405f-8d34-9df4d8a614ba', 'Lightning Fast', 'speed-gold', 'Complete 10 courses in 40% of average time', '⚡', 'gold', 'speed', '{"count": 10, "percentage": 40}', 1000, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('c4e6c15c-e563-4c60-a7f1-c3c47c157661', 'e2632b07-446f-4db3-bc64-b310be8a65d7', 'Perfect Score', 'perfect-one', 'Achieve 100% on a course assessment', '💎', 'bronze', 'perfection', '{"count": 1, "score": 100}', 200, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('28de5cf8-5132-43ad-8a87-cce3305ef581', 'e2632b07-446f-4db3-bc64-b310be8a65d7', 'Perfectionist', 'perfect-five', 'Achieve 100% on 5 assessments', '🌟', 'silver', 'perfection', '{"count": 5, "score": 100}', 750, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00'),
	('2f855f6f-2ab8-4943-8d5e-9d316843cd0a', 'e2632b07-446f-4db3-bc64-b310be8a65d7', 'Flawless', 'perfect-ten', 'Achieve 100% on 10 assessments', '👑', 'gold', 'perfection', '{"count": 10, "score": 100}', 1500, NULL, false, true, 0, '2025-11-08 21:12:17.05741+00', '2025-11-08 21:12:17.05741+00');


--
-- Data for Name: course_achievement_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_study_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_group_challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_challenge_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_discussions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_embeddings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: instructor_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_leaderboards; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_leaderboard_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_peer_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_points_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."course_points_sources" ("id", "name", "slug", "description", "points_amount", "category", "max_daily_occurrences", "cooldown_minutes", "is_active", "created_at") VALUES
	('dfebe19b-bc03-4926-a6d0-6ab2bc4c3898', 'Course Completion', 'course-complete', 'Complete a full course', 500, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('26155f9d-cc4b-45c4-842c-0a40b665acdc', 'Module Completion', 'module-complete', 'Complete a course module', 50, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('de5ea497-1f23-4ff0-9b1b-a4d660f23370', 'Lesson Completion', 'lesson-complete', 'Complete a lesson', 10, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('661b4636-16d0-4508-b71e-82fea4fcd739', 'Quiz Pass', 'quiz-pass', 'Pass a quiz (70%+)', 25, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('8dd20f04-4367-4251-b593-42afb603be74', 'Quiz Excellence', 'quiz-excellent', 'Score 90%+ on a quiz', 50, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('c6fcfe14-7022-4a62-81fb-db404ffd2882', 'Quiz Perfect', 'quiz-perfect', 'Score 100% on a quiz', 100, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('4b417b1f-2e7f-4cda-b7fa-b6a8b53866c7', 'First Attempt Success', 'first-try', 'Pass quiz on first attempt', 30, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('0a0dff0d-e2d8-4760-9d85-39cc1ba2b74d', 'Fast Completion', 'fast-complete', 'Complete module faster than average', 40, 'learning', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('74fe4317-8399-4486-bcf0-a3a5bd2b61f4', 'Daily Login', 'daily-login', 'Log in and engage with learning', 5, 'social', 1, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('fae78c82-35f2-4e18-9b86-4c28de507d62', 'Study Buddy Match', 'study-buddy', 'Connect with a study buddy', 20, 'social', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('a34f530a-1471-457c-afc4-a70f76d57e48', 'Help Peer', 'help-peer', 'Help a fellow learner', 15, 'social', 5, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('985d88bc-d7f8-4558-bb48-2edd42255bad', 'Discussion Post', 'discussion-post', 'Start a discussion', 10, 'social', 3, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('78cf9883-8759-4615-abfb-25cdbd00fb93', 'Discussion Reply', 'discussion-reply', 'Reply to a discussion', 5, 'social', 10, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('90ea47d0-3a6a-40bc-90e2-22b6c0cd1ba9', 'Helpful Vote', 'helpful-vote', 'Receive a helpful vote', 3, 'social', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('ddfdf4a2-d1da-4147-b939-da16080b3cc1', 'Group Challenge Join', 'challenge-join', 'Join a group challenge', 25, 'social', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('16ef72f8-ee5d-4ada-97cd-4d27e0a06e4d', 'Group Challenge Win', 'challenge-win', 'Win a group challenge', 200, 'social', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('2f573281-f1e3-4e28-a690-c1174c97d85c', 'Achievement Unlock', 'achievement', 'Unlock an achievement', 0, 'achievement', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('900b9d01-a464-44ad-861b-2d10baeffed5', 'Streak Milestone', 'streak-milestone', 'Reach a streak milestone', 50, 'achievement', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('cec8c63a-a773-4a64-b86a-f4e795dc2c64', 'Level Up', 'level-up', 'Reach a new level', 100, 'achievement', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('91b12c51-e498-42ee-98bc-ddd49d97b46e', 'Content Review', 'content-review', 'Review course content', 30, 'contribution', 2, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('46668e9d-2944-4841-a4ad-c707558025a1', 'Bug Report', 'bug-report', 'Report a bug or issue', 50, 'contribution', NULL, NULL, true, '2025-11-08 21:12:17.05741+00'),
	('23b5a2ff-a1f7-49f1-af89-eca72a26fd88', 'Feature Suggestion', 'feature-suggest', 'Suggest a feature', 25, 'contribution', NULL, NULL, true, '2025-11-08 21:12:17.05741+00');


--
-- Data for Name: course_points_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."skills" ("id", "name", "slug", "description", "category", "subcategory", "parent_skill_id", "regulatory_body", "difficulty_level", "importance_weight", "min_quiz_score", "min_practice_attempts", "expiry_months", "icon", "color", "order_index", "is_active", "metadata", "created_at", "updated_at") VALUES
	('1a91e014-852f-4890-ada4-1289d9ff0179', 'Anti-Money Laundering Fundamentals', 'aml-fundamentals', 'Understanding AML regulations and detection techniques', 'Compliance', 'AML', NULL, NULL, 'beginner', 1.00, 70, 1, 24, NULL, '#ef4444', 1, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('aaa3fdd0-7aa1-40b4-a4ae-8db531ac31f1', 'Know Your Client Requirements', 'kyc-requirements', 'Client identification and verification procedures', 'Compliance', 'KYC', NULL, NULL, 'intermediate', 1.00, 75, 1, 24, NULL, '#f59e0b', 2, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('87ae1fa0-5763-46c7-836d-f7fa8487be78', 'Mutual Fund Products', 'mutual-fund-products', 'Understanding mutual fund structures and features', 'Products', 'Investment Products', NULL, NULL, 'intermediate', 1.00, 70, 1, NULL, NULL, '#3b82f6', 3, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('e9ebb71e-be3a-4897-89d4-caa60a0e7338', 'Risk Assessment', 'risk-assessment', 'Evaluating client risk profiles and suitability', 'Analysis', 'Risk Management', NULL, NULL, 'advanced', 1.00, 80, 1, 12, NULL, '#8b5cf6', 4, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('5fde32da-b396-48f5-aaf2-4d813866cad1', 'Ethical Conduct', 'ethical-conduct', 'Professional ethics and conduct standards', 'Ethics', 'Professional Standards', NULL, NULL, 'beginner', 1.00, 70, 1, 36, NULL, '#10b981', 5, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('2d45288a-531e-4354-9bfc-b8e79813b1f9', 'Portfolio Construction', 'portfolio-construction', 'Building diversified investment portfolios', 'Analysis', 'Asset Allocation', NULL, NULL, 'advanced', 1.00, 75, 1, NULL, NULL, '#06b6d4', 6, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('23bb0634-e7cc-4c62-ac04-c81282eb3a25', 'Regulatory Reporting', 'regulatory-reporting', 'Regulatory filing and reporting requirements', 'Compliance', 'Reporting', NULL, NULL, 'intermediate', 1.00, 75, 1, 24, NULL, '#f97316', 7, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00'),
	('cfbaef13-5b4b-442e-af70-cce339ccd756', 'Client Communication', 'client-communication', 'Effective client interaction and disclosure', 'Soft Skills', 'Communication', NULL, NULL, 'beginner', 1.00, 65, 1, NULL, NULL, '#ec4899', 8, true, '{}', '2025-11-08 21:12:18.033871+00', '2025-11-08 21:12:18.033871+00');


--
-- Data for Name: course_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_study_group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_user_follows; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_user_streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_workflow_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: course_workflow_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: digital_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: discussion_forums; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: embedding_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: enterprise_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: forum_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: group_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: identity_provider_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ingestion_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: tribunal_cases_raw; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ingestion_errors; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: instructor_analytics; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: instructor_communications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: instructor_earnings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: leaderboards; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: leaderboard_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: learning_path_enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: learning_streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lesson_embeddings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lesson_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: lesson_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: outcome_predictions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: permission_cache; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."permissions" ("id", "name", "slug", "resource", "action", "description", "is_system", "created_at", "updated_at") VALUES
	('7c565f11-271b-42fd-9c54-87677c825994', 'Create Users', 'users:create', 'users', 'create', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('b1d977fd-540e-44da-a99e-eb2121d09219', 'Read Users', 'users:read', 'users', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('23f841fa-b31d-4bba-a092-91910f07bf88', 'Update Users', 'users:update', 'users', 'update', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('6fedd4c4-f51a-49f1-8a09-6b2ba492a4eb', 'Delete Users', 'users:delete', 'users', 'delete', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('bbefee82-2a29-4769-9d37-e64b2f990ac6', 'Create Courses', 'courses:create', 'courses', 'create', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('943f0e2a-a013-46a5-8a81-0221da50ce8c', 'Read Courses', 'courses:read', 'courses', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('8c94ccf8-d098-418a-9120-59d5f0bb32f4', 'Update Courses', 'courses:update', 'courses', 'update', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('ee45a887-2a14-41ec-b571-833ac00edf38', 'Delete Courses', 'courses:delete', 'courses', 'delete', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('eb470f0f-14c3-4d28-8bb3-35c7355a6125', 'Publish Courses', 'courses:publish', 'courses', 'publish', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('3728de4d-3802-4b7b-bca8-0415dd1b67eb', 'Create Cases', 'cases:create', 'cases', 'create', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('40e29c3f-9e64-48b6-8b84-6b067e306198', 'Read Cases', 'cases:read', 'cases', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('6744650a-e95c-4136-885b-377071fd9b48', 'Update Cases', 'cases:update', 'cases', 'update', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('b2e73316-419b-4785-aebd-71f981624392', 'Delete Cases', 'cases:delete', 'cases', 'delete', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('6faa3bc9-bfbe-4dbd-8bbe-57971a3b7350', 'Read Analytics', 'analytics:read', 'analytics', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('25e9b6b0-f789-4541-afa0-eb27ebf83878', 'Export Analytics', 'analytics:export', 'analytics', 'export', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('40f0a4d5-3df1-42b3-a7ea-5a299582b5ab', 'Read Organization', 'organization:read', 'organization', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('eb57b65d-2087-4ca8-9f56-7699895f1bef', 'Update Organization', 'organization:update', 'organization', 'update', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('cbd228be-7bdb-4cfa-9947-89fbe3e984ff', 'Manage Billing', 'billing:manage', 'billing', 'manage', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('f6de9320-583a-4cc5-ab70-9b986a6ee608', 'Assign Roles', 'roles:assign', 'roles', 'assign', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('b83ed4ad-9c16-4d3f-813e-cf6fe2a6d0f1', 'Read Roles', 'roles:read', 'roles', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('f8ab9a06-b6af-44e7-8dbe-98b665075c4d', 'Read Audit Logs', 'audit_logs:read', 'audit_logs', 'read', NULL, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00');


--
-- Data for Name: permission_overrides; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: points_sources; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: points_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: question_pools; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."questions" ("id", "course_id", "lesson_id", "question_type", "difficulty_level", "question_text", "question_html", "explanation", "points", "time_limit_seconds", "order_index", "tags", "metadata", "is_active", "created_at", "updated_at", "created_by") VALUES
	('9bb103b2-ce49-45f0-9589-0d2f431209ca', '89412866-31d7-46e9-80eb-b5579b9648b1', '9b30c20d-88e8-4e8a-a587-30bb83d92fe5', 'multiple_choice', 'intermediate', 'What is performative allyship?', NULL, 'Performative allyship is action taken primarily for appearance, social credit, or personal benefit rather than genuine commitment to anti-racist change. It often centers the ally rather than those experiencing racism, stops at symbolic gestures without structural change, and disappears when no longer trending. Genuine allyship centers those harmed, takes risks, sustains over time, and prioritizes accountability over comfort.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:04.316334+00', '2025-11-09 13:23:04.316334+00', NULL),
	('23f33151-99f3-4a97-9f05-6206c3442b86', '89412866-31d7-46e9-80eb-b5579b9648b1', '9b30c20d-88e8-4e8a-a587-30bb83d92fe5', 'multiple_choice', 'intermediate', 'What is tokenism?', NULL, 'Tokenism is minimal inclusion for appearance without structural change. Examples: the one Black person on panels, in marketing, or in leadership while systemic barriers remain; asking Black employees to represent all Black people; diversifying optics without diversifying power or decision-making. Tokenism harms by extracting labor, exposing people to hostile environments, and creating illusion of progress without actual equity.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:04.715152+00', '2025-11-09 13:23:04.715152+00', NULL),
	('def3ce75-a00a-4df7-aca1-85431c9ceec8', '89412866-31d7-46e9-80eb-b5579b9648b1', '9b30c20d-88e8-4e8a-a587-30bb83d92fe5', 'multiple_choice', 'intermediate', 'What does it mean to use privilege strategically as an ally?', NULL, 'Strategic use of privilege means leveraging your access, credibility, and resources for anti-racist outcomes. Examples: amplifying Black voices in rooms they''re excluded from; using financial resources to fund Black-led organizations; interrupting racism in white spaces; taking professional risks to advocate for equity. Key: center those experiencing harm, not your allyship. Don''t announce "I''m using my privilege"—just do it.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:05.155656+00', '2025-11-09 13:23:05.155656+00', NULL),
	('298907a3-c26f-4dd2-9826-87ed1287b71e', '89412866-31d7-46e9-80eb-b5579b9648b1', '9b30c20d-88e8-4e8a-a587-30bb83d92fe5', 'multiple_choice', 'intermediate', 'When you make a mistake as an ally, what should you do?', NULL, 'When you harm (and you will): Listen without defensiveness. Apologize specifically for the harm caused, not just for "offense taken." Don''t center your guilt, intentions, or feelings. Don''t demand reassurance or emotional labor. Commit to learning and changed behavior. Follow through. Making mistakes is inevitable; how you respond determines whether you''re genuinely accountable or just performing allyship.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:05.534513+00', '2025-11-09 13:23:05.534513+00', NULL),
	('b70b2ff4-7688-4ae5-b580-3f1aefa13764', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'df839e88-c627-4352-9df3-e9ec8048fdc5', 'multiple_choice', 'intermediate', 'What does it mean to decolonize curriculum?', NULL, 'Decolonizing curriculum means fundamentally examining and challenging whose knowledge, perspectives, and narratives are centered as "truth" and whose are marginalized or erased. It requires moving beyond additive approaches (adding a Black History Month lesson) to transformative change: centering Indigenous and Black voices, teaching honest history including genocide and slavery, examining power structures, and recognizing multiple ways of knowing beyond Eurocentric frameworks.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:06.080821+00', '2025-11-09 13:23:06.080821+00', NULL),
	('4c348b55-e3f4-4f80-b02f-6827b93592e2', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'df839e88-c627-4352-9df3-e9ec8048fdc5', 'multiple_choice', 'intermediate', 'What do Canadian data show about discipline disparities?', NULL, 'Canadian data consistently show Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students. Studies show they are disciplined more harshly for the same behaviors, are more likely to be labeled "defiant" or "aggressive," and face school-based police involvement at higher rates. This is not about behavior differences—it''s about how Black students'' behavior is interpreted and responded to through biased lenses.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:06.434822+00', '2025-11-09 13:23:06.434822+00', NULL),
	('ceca8c66-ad69-4176-bb6e-13cb9044195f', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'df839e88-c627-4352-9df3-e9ec8048fdc5', 'multiple_choice', 'intermediate', 'What is culturally sustaining pedagogy?', NULL, 'Culturally sustaining pedagogy (Django Paris) goes beyond cultural competence to actively sustain and affirm students'' cultural identities, languages, histories, and ways of knowing. It positions culture as an asset, not a deficit. For Black students, this means affirming Black language practices, centering Black history and contributions, connecting curriculum to Black community experiences, and recognizing diverse Black identities. It''s not additive—it''s transformative.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:06.818516+00', '2025-11-09 13:23:06.818516+00', NULL),
	('1887e377-e69a-47e4-bf60-b396d1947ab5', '61b1e4e2-98c7-48b1-8875-733f28d25be6', 'df839e88-c627-4352-9df3-e9ec8048fdc5', 'multiple_choice', 'intermediate', 'How should educators engage Black families?', NULL, 'Black families often face deficit narratives that blame them for systemic failures. Authentic engagement requires: examining your own biases, recognizing barriers schools create, building trust through consistent positive contact, seeing families as assets and experts on their children, sharing power in decision-making, and addressing systemic issues rather than focusing on "fixing" families. When schools fail Black students, examine the school—not the family.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:07.178718+00', '2025-11-09 13:23:07.178718+00', NULL),
	('959f01d6-a8f5-4e8d-bb44-9da069e5f09e', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'd41628cb-3b91-4389-8200-5e40696a99c8', 'multiple_choice', 'intermediate', 'What is the "pipeline problem" myth in legal profession?', NULL, 'The "pipeline problem" narrative blames lack of Black representation on insufficient candidates rather than examining systemic barriers. In reality, Black law graduates face bias in hiring (coded language, "culture fit" screening), biased performance evaluations, exclusion from informal networks, microaggressions, glass ceilings blocking partnership, and hostile environments driving them out. The issue is not pipeline—it''s what happens after graduation. Focusing on pipeline allows firms to avoid accountability for retention and advancement failures.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:07.636386+00', '2025-11-09 13:23:07.636386+00', NULL),
	('6a0d2d46-5304-411c-9c44-f1c7dff28c5f', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'd41628cb-3b91-4389-8200-5e40696a99c8', 'multiple_choice', 'intermediate', 'What do Canadian data show about sentencing disparities?', NULL, 'Canadian data show Black defendants receive harsher sentences than white defendants for similar offenses, even after controlling for criminal history and offense severity. Black defendants are more likely to be denied bail, receive custodial sentences rather than alternatives, and get longer prison terms. This reflects implicit bias in how judges perceive Black defendants (more dangerous, less remorseful, greater flight risk) and systemic racism in sentencing guidelines and judicial discretion.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:08.006934+00', '2025-11-09 13:23:08.006934+00', NULL),
	('4a37ec91-47ca-4099-aef9-5fb3bfc8afff', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'd41628cb-3b91-4389-8200-5e40696a99c8', 'multiple_choice', 'intermediate', 'What are barriers to legal representation for Black communities?', NULL, 'Black communities face multiple barriers to legal representation: high legal costs (hourly rates exclude many), chronically underfunded legal aid systems, lack of lawyers who understand anti-Black racism, mistrust of legal systems that have historically harmed Black people, geographic barriers (legal deserts in Black neighborhoods), language and cultural barriers, and fear of system involvement. These barriers mean Black people often navigate legal issues without adequate representation, perpetuating injustice.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:08.348162+00', '2025-11-09 13:23:08.348162+00', NULL),
	('87e3217f-65a7-4c2e-978e-a9867f687ad7', 'd9156258-e223-4c2e-9313-99dfcaabfbed', 'd41628cb-3b91-4389-8200-5e40696a99c8', 'multiple_choice', 'intermediate', 'What does anti-racist legal practice require?', NULL, 'Anti-racist legal practice requires: centering Black clients as experts on their own lives, actively identifying and challenging bias in legal proceedings (voir dire, sentencing submissions), using legal skills strategically for racial justice (pro bono, impact litigation, policy advocacy), building trust with Black communities, examining your own biases and how they shape legal strategy, and advocating for systemic change beyond individual cases. Treating everyone "the same" ignores how racism operates and perpetuates inequity.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:08.814868+00', '2025-11-09 13:23:08.814868+00', NULL),
	('11df4b6e-ba1d-4516-a4e6-1e237422ad99', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'e8962adb-cde7-4553-8dc6-42fdf369dfd6', 'multiple_choice', 'intermediate', 'What is racial trauma?', NULL, 'Racial trauma (race-based traumatic stress) is real psychological harm caused by experiences of racism. It includes: direct discrimination, microaggressions, witnessing violence against Black people, systemic oppression, and fear for safety. Symptoms mirror PTSD: hypervigilance, anxiety, depression, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It affects people across the lifespan and is intergenerational. Mental health providers must recognize racial trauma as legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not dismiss it or pathologize natural responses to oppression.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:09.494927+00', '2025-11-09 13:23:09.494927+00', NULL),
	('dcdc1d5c-30f4-4abe-8fa8-4247039a3c74', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'e8962adb-cde7-4553-8dc6-42fdf369dfd6', 'multiple_choice', 'intermediate', 'How does diagnostic bias manifest in mental health?', NULL, 'Research shows Black patients are disproportionately diagnosed with schizophrenia and bipolar disorder even when presenting with same symptoms as white patients diagnosed with depression or PTSD. This reflects: implicit bias (associating Blackness with danger/aggression), historical stereotypes (dangerous Black body trope), lack of cultural understanding (misinterpreting cultural expressions as pathology), and systemic racism in diagnostic criteria development. Consequences include: inappropriate medication, stigma, coercive treatment, and missed trauma/depression treatment. Addressing diagnostic bias requires examining implicit biases and cultural assumptions in assessment.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:09.826625+00', '2025-11-09 13:23:09.826625+00', NULL),
	('2f91fdf7-60a5-4d0e-846c-85d978df7b43', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'e8962adb-cde7-4553-8dc6-42fdf369dfd6', 'multiple_choice', 'intermediate', 'Why do Black communities face barriers accessing mental health services?', NULL, 'Black communities face multiple barriers: Cost (therapy expensive, insurance inadequate), Lack of representation (few Black mental health providers, cultural mismatch with white therapists), Historical mistrust (legacy of medical abuse, forced sterilization, unethical research), Stigma (mental health stigmatized in many communities due to survival necessity of "strength"), Systemic failures (services in white neighborhoods, culturally inappropriate treatment models). These are not individual failures but systemic barriers. Addressing them requires: investing in Black mental health professionals, culturally responsive services, community-based models, and affordable/accessible care.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:10.226858+00', '2025-11-09 13:23:10.226858+00', NULL),
	('bb517f18-1247-47cd-a3e7-8d4ebfe83876', '6633d3bf-cfe7-4927-8336-03248c1068ce', 'e8962adb-cde7-4553-8dc6-42fdf369dfd6', 'multiple_choice', 'intermediate', 'What is cultural humility in mental health practice?', NULL, 'Cultural humility moves beyond "cultural competence" (implies mastery, checklist approach). It requires: Self-reflection on own biases and positionality, Recognizing power imbalances in therapist-client relationship, Centering client as expert on their own cultural experience, Ongoing learning and openness to being wrong, Addressing systemic inequities not just individual cultural differences. Cultural humility acknowledges you will never "master" someone else''s culture—you commit to listening, learning, and interrogating power. For anti-racist practice, this means naming racism, examining white supremacy in therapy models, and challenging clinical assumptions rooted in white norms.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:10.539521+00', '2025-11-09 13:23:10.539521+00', NULL),
	('e7feaecb-b8e2-4610-a0fe-a8bc37680db8', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', '2d0935a7-cae6-4785-967d-7a1369ce4759', 'multiple_choice', 'intermediate', 'The difference between an ally and an accomplice is:', NULL, 'Accomplices go beyond comfortable support to take risks, make sacrifices, and work in solidarity with Black communities.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:10.988824+00', '2025-11-09 13:23:10.988824+00', NULL),
	('623d9d9b-7c65-430b-a06c-0c6383d565ba', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', '2d0935a7-cae6-4785-967d-7a1369ce4759', 'multiple_choice', 'intermediate', 'When amplifying Black voices, you should:', NULL, 'Always explicitly credit Black voices and direct people to learn directly from them, not through you.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:11.32196+00', '2025-11-09 13:23:11.32196+00', NULL),
	('11cd9bfe-5a09-431f-9c2c-318a750f8d8f', 'd894a5d2-03f4-41d2-82ca-49780b57f05c', '2d0935a7-cae6-4785-967d-7a1369ce4759', 'multiple_choice', 'intermediate', 'If you make a mistake in your allyship work, you should:', NULL, 'Mistakes are inevitable. Acknowledge harm, learn from it, and continue doing better. Growth requires staying engaged even when it''s hard.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:11.65087+00', '2025-11-09 13:23:11.65087+00', NULL),
	('6be03fcf-687f-455e-a062-cae4e2ac75a1', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', '824d10e1-e0c7-4e35-9207-5cc725a1e478', 'multiple_choice', 'intermediate', 'What is the historical reality of slavery in Canada?', NULL, 'Slavery was legal and practiced in what would become Canada from the early 1600s until the British Empire abolished it in 1834. Approximately 4,200 people were enslaved in New France alone, and slavery continued under British rule.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:12.030387+00', '2025-11-09 13:23:12.030387+00', NULL),
	('420a7478-7430-4ed2-96a7-4e7b5a8ef8a0', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', '824d10e1-e0c7-4e35-9207-5cc725a1e478', 'multiple_choice', 'intermediate', 'What did Upper Canada''s 1793 Gradual Abolition Act actually do?', NULL, 'The Act did NOT immediately free anyone. Children born after 1793 to enslaved mothers would be freed at age 25, but people already enslaved remained in bondage for life. It was a very gradual change that allowed slavery to continue for decades.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:12.358298+00', '2025-11-09 13:23:12.358298+00', NULL),
	('5c97feb3-2f09-467a-a8b5-512a0f50bef2', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', '824d10e1-e0c7-4e35-9207-5cc725a1e478', 'multiple_choice', 'intermediate', 'What did Black freedom-seekers actually experience when they arrived in Canada via the Underground Railroad?', NULL, 'While Canada offered legal freedom (after 1834) and people couldn''t be returned to slavery, Black arrivals faced severe discrimination, segregated schools and public spaces, limited economic opportunities, violence, and harassment. Canada was safer than the U.S. but not a paradise.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:12.711457+00', '2025-11-09 13:23:12.711457+00', NULL),
	('457e0ba9-bdf8-4853-9150-62ced9353b05', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', '7ca79a87-ef50-44ca-a77e-6edfa042424b', 'multiple_choice', 'intermediate', 'When did the last racially segregated school close in Canada?', NULL, 'The last legally segregated schools in Ontario closed in 1965 in Merlin and North Colchester. Segregated schools were legal in Ontario from the 1850s and persisted well into the civil rights era. Nova Scotia also had segregated schools into the 1960s.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:13.050799+00', '2025-11-09 13:23:13.050799+00', NULL),
	('4bf17ff1-30b5-4daa-920d-0e16a854d1d2', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', '7ca79a87-ef50-44ca-a77e-6edfa042424b', 'multiple_choice', 'intermediate', 'What happened to Viola Desmond in 1946?', NULL, 'Viola Desmond, a Nova Scotia businesswoman, was arrested, jailed, and fined for refusing to leave the whites-only section of a movie theatre. She fought her conviction but lost. She received a posthumous pardon in 2010 and now appears on the Canadian $10 bill.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:13.348111+00', '2025-11-09 13:23:13.348111+00', NULL),
	('e195091a-18fa-45cd-809b-bb849439a5c1', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', '7ca79a87-ef50-44ca-a77e-6edfa042424b', 'multiple_choice', 'intermediate', 'What were restrictive covenants in Canadian property deeds?', NULL, 'Restrictive covenants were legal clauses in property deeds explicitly preventing sale, rental, or transfer to people based on race (Black, Jewish, Asian, etc.). They were common in Canadian cities until ruled illegal in Ontario in 1950, though informal discrimination continued.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:13.630067+00', '2025-11-09 13:23:13.630067+00', NULL),
	('41a3fb01-0ba5-4a95-8f05-1b1c42af5a18', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'd2abe63b-2bbb-4126-8f1d-7c24c0880737', 'multiple_choice', 'intermediate', 'What is the primary lesson of Black Canadian history for understanding contemporary racism?', NULL, 'Black Canadian history shows over 400 years of systemic exclusion (slavery, segregation, immigration restrictions, discrimination) that created and perpetuated inequality. Current disparities in wealth, employment, criminal justice, etc. are not coincidental—they''re the predictable results of historical and ongoing systemic racism.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:14.032429+00', '2025-11-09 13:23:14.032429+00', NULL),
	('9606e085-a595-41a2-9e69-ec03171c535b', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'd2abe63b-2bbb-4126-8f1d-7c24c0880737', 'multiple_choice', 'intermediate', 'How should we understand Canada''s relationship to anti-Black racism historically?', NULL, 'Canada practiced slavery for over 200 years, had legally segregated schools until 1965, used restrictive covenants to enforce housing segregation, and maintained explicitly racist immigration policies until 1967. The myth of Canadian exceptionalism erases this history and prevents accountability.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:14.40211+00', '2025-11-09 13:23:14.40211+00', NULL),
	('8211021f-6c72-4171-8e25-b850aac93323', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'd2abe63b-2bbb-4126-8f1d-7c24c0880737', 'multiple_choice', 'intermediate', 'What does current data show about anti-Black racism in Canada?', NULL, 'Contemporary data shows Black Canadians are overpoliced, earn less, experience higher unemployment, face education streaming, have worse health outcomes, are overrepresented in child welfare and incarceration, and underrepresented in leadership. These aren''t cultural—they''re systemic.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:14.735507+00', '2025-11-09 13:23:14.735507+00', NULL),
	('ed1773fe-a164-426b-a69d-49e57b066331', 'fbf4957f-92aa-4c7f-9a63-1b09089b46d0', 'd2abe63b-2bbb-4126-8f1d-7c24c0880737', 'multiple_choice', 'intermediate', 'Throughout this history, how have Black Canadians responded to racism?', NULL, 'At every period, Black Canadians resisted: escaping slavery, building communities despite hostility, organizing politically (National Unity Association, Negro Citizenship Association), legal challenges (Viola Desmond, restrictive covenants), media activism, and contemporary movements like BLM-TO. Resistance is central to Black Canadian history.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:15.059245+00', '2025-11-09 13:23:15.059245+00', NULL),
	('9285aae1-d227-4791-a25b-1a2c96306a3f', '48531317-4d90-4ad7-87f0-06fff0120925', 'd980bd9e-a37a-45df-9267-76bf69886ed5', 'multiple_choice', 'intermediate', 'What makes an organization truly anti-racist?', NULL, 'Anti-racist organizations go beyond diversity and inclusion to actively dismantle systemic racism. Characteristics: Leadership commitment with accountability and consequences, Comprehensive audit of policies for racist impacts, Equitable representation at all levels especially leadership, Pay equity and wealth redistribution, Anti-racist culture not just diverse faces, Meaningful power-sharing and Black leadership, Accountability structures with transparency and reporting, Resource allocation proportional to goals, Addressing harm with consequences not excuses, Community accountability beyond organization. It is not performative statements or one-time trainings—it is sustained systemic transformation with resources, power-sharing, and accountability. Measurement includes outcomes not just intentions.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:15.540278+00', '2025-11-09 13:23:15.540278+00', NULL),
	('9c9854d5-0110-44e1-8a60-aece45dbdab7', '48531317-4d90-4ad7-87f0-06fff0120925', 'd980bd9e-a37a-45df-9267-76bf69886ed5', 'multiple_choice', 'intermediate', 'What should be included in an organizational anti-racism audit?', NULL, 'Comprehensive anti-racism audit includes: Demographics—Representation at all levels, pay by race, promotions by race, retention/turnover. Policies—Review hiring, evaluation, discipline, benefits for racist impacts. Workplace climate—Survey Black employees on experiences, safety, belonging, barriers. Complaints and discipline—Analyze who reports, who is believed, who faces consequences. Community impact—Examine who organization serves, harms, excludes. Procurement—Who gets contracts, whose businesses supported. Board and leadership—Who holds power and makes decisions. The audit must be honest about current state not defensive. Share findings transparently with Black employees and communities. Use data to develop targeted action plan with measurable goals and timelines.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:15.965062+00', '2025-11-09 13:23:15.965062+00', NULL),
	('3bca78fa-a4f5-462a-8e1e-6b762d101cb2', '48531317-4d90-4ad7-87f0-06fff0120925', 'd980bd9e-a37a-45df-9267-76bf69886ed5', 'multiple_choice', 'intermediate', 'How do you create accountability for anti-racism commitments?', NULL, 'Accountability structures require: Clear measurable goals with specific timelines, Anti-racism committee with power and resources (not just advisory), Black leadership at decision-making levels, Regular public reporting on progress and setbacks, Consequences for leaders who fail to meet goals (tied to evaluation and compensation), Process for addressing racist harm with real consequences, Community accountability (not just internal), Budget allocation matching stated priorities, Transparency about challenges and failures not just wins. Accountability is not voluntary goodwill—it is built-in expectations with consequences. Leaders must be held responsible for anti-racism progress or lack thereof. Black employees and communities must have power to hold organization accountable, not just provide feedback.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:16.332501+00', '2025-11-09 13:23:16.332501+00', NULL),
	('2ab1f0ad-0697-48cc-89f6-19bc341da715', '48531317-4d90-4ad7-87f0-06fff0120925', 'd980bd9e-a37a-45df-9267-76bf69886ed5', 'multiple_choice', 'intermediate', 'How do you sustain anti-racism work beyond performative moments?', NULL, 'Sustaining anti-racism requires: Structural embedding—Anti-racism in mission, values, strategic plan, not separate "initiative." Budget commitment—Ongoing funding not one-time allocation, resourced positions not volunteer labor. Leadership accountability—Anti-racism tied to executive evaluations and board governance. Ongoing education—Not one training but continuous learning and development. Policy integration—Anti-racism lens applied to all decisions not siloed in HR/diversity. Black leadership—Not just advisors but decision-makers with power. Long-term planning—Multi-year commitment not reactive to current events. Community relationships—Sustained partnerships not transactional. Addressing backlash—Clear stance when facing pushback, not abandoning commitment. Celebrate progress while continuing work—Acknowledge wins without declaring victory. Anti-racism is not project with end date—it is fundamental organizational practice requiring sustained commitment.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:16.709105+00', '2025-11-09 13:23:16.709105+00', NULL),
	('1b8e6384-47d8-4abf-8598-56f6e1fb19d5', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', '2f0212f1-ae41-480b-8ffb-434614efdc69', 'multiple_choice', 'intermediate', 'The Canadian Human Rights Act applies to:', NULL, 'The CHRA applies to federal government departments/agencies and federally-regulated sectors like banks, telecom, and transportation. Provincial human rights codes cover other employers.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:17.185058+00', '2025-11-09 13:23:17.185058+00', NULL),
	('f03b09db-b1c5-4f95-a840-0b70cd067716', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', '2f0212f1-ae41-480b-8ffb-434614efdc69', 'multiple_choice', 'intermediate', 'What is the time limit for filing a federal human rights complaint?', NULL, 'You must file a complaint within 1 year of the discriminatory incident, though exceptions may apply in certain circumstances.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:17.481416+00', '2025-11-09 13:23:17.481416+00', NULL),
	('055a147e-2388-4220-aafc-2ead3888e9ef', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', '2f0212f1-ae41-480b-8ffb-434614efdc69', 'multiple_choice', 'intermediate', 'Maximum compensation for pain and suffering in CHRC cases is:', NULL, 'The Canadian Human Rights Act sets a cap of $20,000 for pain and suffering, plus up to $20,000 additional for willful or reckless discrimination.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:17.913285+00', '2025-11-09 13:23:17.913285+00', NULL),
	('b1fdbfc9-2a8e-49db-b9c0-8ee0e87039ee', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'db775eef-fb60-4f1d-9cd0-4c36f2c4d605', 'multiple_choice', 'intermediate', 'Which document provides constitutional protection against discrimination by government?', NULL, 'The Charter of Rights and Freedoms (particularly Section 15) provides constitutional protection against government discrimination.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:18.338038+00', '2025-11-09 13:23:18.338038+00', NULL),
	('bbfd73f7-45aa-4a5d-b246-287cca1968c6', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'db775eef-fb60-4f1d-9cd0-4c36f2c4d605', 'multiple_choice', 'intermediate', 'Substantive equality means:', NULL, 'Substantive equality recognizes that treating everyone identically may perpetuate inequality. It focuses on eliminating disadvantage and accommodating differences.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:18.645377+00', '2025-11-09 13:23:18.645377+00', NULL),
	('fda19254-ae76-4779-9447-4a7d86d26217', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'db775eef-fb60-4f1d-9cd0-4c36f2c4d605', 'multiple_choice', 'intermediate', 'A federally-regulated bank employee experiencing racial discrimination should file a complaint with:', NULL, 'Federal employees and those in federally-regulated industries fall under the Canadian Human Rights Act and should file with the CHRC.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:19.089939+00', '2025-11-09 13:23:19.089939+00', NULL),
	('2abfd7a8-bdc4-48e9-b1d3-a1d008249540', 'b2f9a9fc-cf9e-408c-a042-0d190718d6e5', 'db775eef-fb60-4f1d-9cd0-4c36f2c4d605', 'multiple_choice', 'intermediate', 'In Ontario, a unionized employee experiencing discrimination:', NULL, 'Ontario allows unionized employees to file at HRTO even if the issue is covered by their collective agreement, though the tribunal may defer to arbitration.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:19.475071+00', '2025-11-09 13:23:19.475071+00', NULL),
	('67669516-6228-4372-97a7-4ddf606c76a0', '4648b980-da55-42c9-bce0-16de3e2366c3', '7affc9b4-39b0-4d2e-a04a-0cc1f7637b1a', 'multiple_choice', 'intermediate', 'When someone says "Not all white people..." or "I have Black friends," what are they doing?', NULL, 'This is a defensive move to position themselves as "one of the good ones" and thus not implicated in racism. It centers them and their identity rather than focusing on systemic issues and impacts. The conversation becomes about their feelings rather than racism.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:24.882551+00', '2025-11-09 13:23:24.882551+00', NULL),
	('04e3d9ce-1880-4e42-b9b2-edd74e118530', 'd4df555c-60ec-4a39-8db6-98f595018473', '60758217-bf21-423a-9888-a5292103d34a', 'multiple_choice', 'intermediate', 'What is the primary purpose of a racial equity audit?', NULL, 'A racial equity audit is a systematic examination of organizational policies, practices, and outcomes to identify racial disparities, understand their root causes, and develop evidence-based recommendations for change. The goal is action and improvement, not compliance or public relations. An audit should surface uncomfortable truths and drive meaningful transformation.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:19.949234+00', '2025-11-09 13:23:19.949234+00', NULL),
	('c271f0d0-b77d-44b5-a9b0-df4f8b1c61cb', 'd4df555c-60ec-4a39-8db6-98f595018473', '60758217-bf21-423a-9888-a5292103d34a', 'multiple_choice', 'intermediate', 'What types of data should a comprehensive equity audit include?', NULL, 'Comprehensive audits require multiple data sources: quantitative data (demographics, hiring, promotions, pay, retention, discipline) show what disparities exist; qualitative data (interviews, focus groups, surveys) explain why and how people experience the organization; policy reviews identify formal and informal practices that create or perpetuate disparities. All three are necessary for complete understanding.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:20.472591+00', '2025-11-09 13:23:20.472591+00', NULL),
	('7fe5dfbb-dd6f-4bdf-9c6e-8122dadd1d91', 'd4df555c-60ec-4a39-8db6-98f595018473', '60758217-bf21-423a-9888-a5292103d34a', 'multiple_choice', 'intermediate', 'What is root cause analysis in an equity audit?', NULL, 'Root cause analysis moves beyond describing disparities (e.g., "Black employees are promoted less") to understanding why (e.g., "Promotion decisions rely on informal networks and subjective assessments; Black employees lack access to senior sponsors; criteria emphasize cultural fit over skills"). This allows you to address causes rather than symptoms, leading to more effective interventions.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:20.842892+00', '2025-11-09 13:23:20.842892+00', NULL),
	('fd7ca207-ecac-412d-9739-407e5bde2053', 'd4df555c-60ec-4a39-8db6-98f595018473', '60758217-bf21-423a-9888-a5292103d34a', 'multiple_choice', 'intermediate', 'What makes an equity audit recommendation actionable?', NULL, 'Actionable recommendations are specific (not vague like "improve culture"), address identified root causes, assign clear responsibility, include timelines, define success metrics, and identify needed resources. Vague recommendations like "increase diversity" or "provide more training" rarely lead to change. Effective recommendations name concrete actions with accountability.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:21.279364+00', '2025-11-09 13:23:21.279364+00', NULL),
	('3dde0658-5ae4-4ebe-9196-c6929c2aa164', '12337701-48ae-41b1-a2ae-3cf85339ec66', '4b2a785d-15fe-4dcb-a719-0e6bfb57daad', 'multiple_choice', 'intermediate', 'How are settler colonialism and anti-Black racism connected?', NULL, 'Settler colonialism and anti-Black racism are interconnected white supremacist systems. Colonialism: dispossesses Indigenous peoples from land, establishes white settler states, exploits resources. Anti-Black racism: enslaves and dehumanizes Black people, extracts labor, positions Black people as property not people. Both rely on white supremacy as justification. In Canadian context, Black enslavement helped build colonial economy while Indigenous dispossession created "Canada" as settler state. Understanding this connection is essential—you cannot address one without the other. Decolonial anti-racism recognizes shared roots in white supremacy while respecting distinct struggles.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:21.695512+00', '2025-11-09 13:23:21.695512+00', NULL),
	('20e3a2dd-bfb1-40c1-9d21-de08f068f7aa', '12337701-48ae-41b1-a2ae-3cf85339ec66', '4b2a785d-15fe-4dcb-a719-0e6bfb57daad', 'multiple_choice', 'intermediate', 'What does "Decolonization is not a metaphor" mean?', NULL, 'This critical phrase from Tuck and Yang means: decolonization is literal repatriation of Indigenous land and sovereignty, not metaphor for diversity, inclusion, or personal "decolonizing." When institutions say "decolonize the curriculum" without addressing land theft or Indigenous governance, they appropriate and defang decolonization. True decolonization requires settlers giving up land, power, resources—uncomfortable unsettling of colonial order. For anti-racism work: do not co-opt "decolonize" to mean anti-racism or equity work. Respect specificity of Indigenous decolonial struggles while doing anti-Black racism work in solidarity—they are related but distinct.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:22.004574+00', '2025-11-09 13:23:22.004574+00', NULL),
	('f84cd90a-2cb4-42e1-b7e6-c2f748fac77a', '12337701-48ae-41b1-a2ae-3cf85339ec66', '4b2a785d-15fe-4dcb-a719-0e6bfb57daad', 'multiple_choice', 'intermediate', 'What is anti-Blackness in Indigenous communities?', NULL, 'Anti-Blackness can exist in Indigenous communities, shaped by: colonial imposition of anti-Black racism (residential schools taught white supremacy), divide-and-conquer tactics pitting communities against each other, proximity to whiteness as survival strategy, and internalized hierarchies from colonialism. Examples: excluding Black Indigenous people, repeating anti-Black stereotypes, accessing resources while Black people cannot. Acknowledging this is not attacking Indigenous people—it is recognizing colonialism''s reach and building genuine solidarity. Black and Indigenous peoples must address anti-Blackness while respecting Indigenous sovereignty and working together against white supremacy. Solidarity requires accountability, not erasure.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:22.327983+00', '2025-11-09 13:23:22.327983+00', NULL),
	('1596d821-1330-404a-94bf-84f681f6d68b', '12337701-48ae-41b1-a2ae-3cf85339ec66', '4b2a785d-15fe-4dcb-a719-0e6bfb57daad', 'multiple_choice', 'intermediate', 'How should Black people approach decolonization discourse?', NULL, 'Black people''s relationship to decolonization is complex. Most Black Canadians are not settlers (did not benefit from land theft, many descended from enslaved people or refugees fleeing oppression). Black people can support Indigenous land return and sovereignty while also addressing anti-Black racism—these are distinct but related struggles against white supremacy. Mistakes to avoid: conflating decolonization with anti-racism (they overlap but are not same), erasing Black presence when discussing decolonization, or claiming Black people are settlers equivalent to white colonizers. Approach: build solidarity recognizing distinct oppressions, center Indigenous voices on land/sovereignty, and continue anti-Black racism work without appropriating decolonization language.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:22.61124+00', '2025-11-09 13:23:22.61124+00', NULL),
	('e78309a5-874f-4ff5-b94d-013012057c0b', '4648b980-da55-42c9-bce0-16de3e2366c3', 'fec66fe5-9dbc-4be7-9830-a797f9b7d8de', 'multiple_choice', 'intermediate', 'Why is self-awareness important before difficult racial conversations?', NULL, 'Self-awareness helps you recognize when you''re becoming defensive so you can pause, breathe, and respond thoughtfully rather than reactively. This keeps the conversation productive.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:23.044173+00', '2025-11-09 13:23:23.044173+00', NULL),
	('6d3f92ed-2e80-44e0-92ec-026f02e14266', '4648b980-da55-42c9-bce0-16de3e2366c3', 'fec66fe5-9dbc-4be7-9830-a797f9b7d8de', 'multiple_choice', 'intermediate', 'What is "tone policing" and why is it problematic?', NULL, 'Tone policing prioritizes the listener''s comfort over justice. It silences legitimate anger and makes the conversation about how something is said rather than what is being said. Anger is a rational response to injustice.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:23.40995+00', '2025-11-09 13:23:23.40995+00', NULL),
	('67b2fe10-dac6-4475-bbd2-89a3b9f56a55', '4648b980-da55-42c9-bce0-16de3e2366c3', 'fec66fe5-9dbc-4be7-9830-a797f9b7d8de', 'multiple_choice', 'intermediate', 'When you feel defensive during a racial conversation, what should you do first?', NULL, 'When activated, pause and breathe to reset your nervous system. Notice your reactions (tight jaw, racing heart, urge to defend). This creates space to respond thoughtfully rather than reactively.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:23.768155+00', '2025-11-09 13:23:23.768155+00', NULL),
	('15198842-ada8-4f7c-ae2c-316e9efd9a3b', '4648b980-da55-42c9-bce0-16de3e2366c3', '7affc9b4-39b0-4d2e-a04a-0cc1f7637b1a', 'multiple_choice', 'intermediate', 'In the LARA framework, why must you Listen and Affirm before Adding information?', NULL, 'People are unable to process new information when they don''t feel heard. Listening and affirming creates the psychological foundation for productive exchange. If you skip to adding information, they''ll still be defending rather than listening.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:24.190249+00', '2025-11-09 13:23:24.190249+00', NULL),
	('257914f7-0d80-4ffb-b796-672eebf8e47f', '4648b980-da55-42c9-bce0-16de3e2366c3', '7affc9b4-39b0-4d2e-a04a-0cc1f7637b1a', 'multiple_choice', 'intermediate', 'What is "tone policing" and why is it a form of resistance?', NULL, 'Tone policing prioritizes the listener''s comfort over justice. It says "I''ll only listen if you''re calm" and silences legitimate anger. It''s a form of resistance because it derails the conversation from content to delivery.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:24.513673+00', '2025-11-09 13:23:24.513673+00', NULL),
	('84a7d3f0-5c97-436e-b406-1daad2eb5cc5', '4648b980-da55-42c9-bce0-16de3e2366c3', '7affc9b4-39b0-4d2e-a04a-0cc1f7637b1a', 'multiple_choice', 'intermediate', 'What should you do when you feel defensive during a racial conversation?', NULL, 'Defensiveness is normal but doesn''t have to dictate your response. Pausing allows you to reset your nervous system and respond thoughtfully rather than reactively. This keeps the conversation productive.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:25.374006+00', '2025-11-09 13:23:25.374006+00', NULL),
	('0d2125e5-05ce-4aa3-bed5-05e162b05013', 'e7e447be-5171-4710-82c0-32c1979d5581', '08d96571-0cb7-40ad-ab99-cdba4da456e6', 'multiple_choice', 'intermediate', 'What is white supremacy culture in organizations?', NULL, 'White supremacy culture refers to the characteristics and norms of white dominant culture that are embedded in organizational structures, practices, and values—often seen as "normal" or "professional" but actually uphold white ways of being and harm Black people and other racialized groups. Tema Okun identified characteristics including: perfectionism, sense of urgency, defensiveness, quantity over quality, worship of written word, paternalism, individualism, right to comfort, fear of open conflict, and power hoarding. These are not just individual behaviors but systemic norms that privilege whiteness, punish difference, and maintain power imbalances. Understanding this helps identify root causes of organizational racism beyond individual bias.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:25.797873+00', '2025-11-09 13:23:25.797873+00', NULL),
	('301cf478-3b29-41ba-a72a-cce7d612a2b8', 'e7e447be-5171-4710-82c0-32c1979d5581', '08d96571-0cb7-40ad-ab99-cdba4da456e6', 'multiple_choice', 'intermediate', 'How does perfectionism function as white supremacy culture?', NULL, 'Perfectionism in white supremacy culture: Little appreciation for work process or learning from mistakes (only perfect outcomes matter), Black employees held to higher standards while white employees'' mistakes excused, Fear of failure prevents innovation and risk-taking, Blame culture when things go wrong, Defensive when criticized or when mistakes pointed out. For Black employees this means: constant scrutiny and nitpicking, no grace for mistakes white colleagues receive, hypervisibility and higher standards, and exhaustion from needing to be "twice as good." Alternative: build learning culture, normalize mistakes as growth, apply consistent standards, appreciate process not just outcome, and give grace especially to those facing systemic barriers.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:26.102636+00', '2025-11-09 13:23:26.102636+00', NULL),
	('f0c7f8bc-8650-4fa0-9d45-7dbf43c38c09', 'e7e447be-5171-4710-82c0-32c1979d5581', '08d96571-0cb7-40ad-ab99-cdba4da456e6', 'multiple_choice', 'intermediate', 'What is "sense of urgency" as white supremacy culture characteristic?', NULL, 'Sense of urgency as white supremacy culture: Creates artificial urgency that prevents thoughtful planning, Uses "we do not have time" to dismiss equity concerns, Sacrifices quality for speed, Prevents relationship-building and trust necessary for real change, Values quick action over sustainable transformation. Impact on Black employees: Equity work deprioritized as "too slow," Concerns dismissed as "slowing down progress," Burnout from constant urgency, Meaningful change prevented in favor of performative quick wins. Alternative: Differentiate between real and manufactured urgency, Build in time for relationship and trust, Recognize that meaningful change takes time, Slow down to do it right rather than fast to check box.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:26.402801+00', '2025-11-09 13:23:26.402801+00', NULL),
	('44e1df80-a713-4afc-867f-e1e29c1ce34e', 'e7e447be-5171-4710-82c0-32c1979d5581', '08d96571-0cb7-40ad-ab99-cdba4da456e6', 'multiple_choice', 'intermediate', 'How can organizations dismantle white supremacy culture?', NULL, 'Dismantling white supremacy culture requires: Naming it—Educate about these characteristics, make visible what was normalized, Call it out when it happens, Build awareness without shaming. Interrupt it—Challenge perfectionism, urgency, defensiveness when they arise, Support making mistakes and learning, Create space for conflict and discomfort, Share power and decision-making. Build alternatives—Develop anti-racist norms and practices, Center collective care and sustainability, Value diverse ways of being and knowing, Create accountability structures. Sustain it—Long-term commitment not one-time training, Center Black leadership and voices, Address resistance and backlash with clarity, Transform systems not just individuals. This is ongoing work requiring humility, accountability, and willingness to be uncomfortable.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:26.791768+00', '2025-11-09 13:23:26.791768+00', NULL),
	('61d89412-eca2-46b6-9ac1-5f13a452133e', 'bec54d11-cb40-43da-aace-1177501111af', 'ebaa7239-55f9-4655-b71e-37b1032c08a4', 'multiple_choice', 'intermediate', 'What is environmental racism?', NULL, 'Environmental racism is the systemic pattern where Black, Indigenous, and racialized communities are disproportionately exposed to environmental hazards: landfills, industrial facilities, contaminated sites, poor air/water quality, etc. This is not random—it results from discriminatory zoning, housing policies, and land use decisions that locate environmental harms near communities with less political power. Africville (Halifax) is a Canadian example: a thriving Black community destroyed and used for sewage, dump sites, and industrial facilities.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:27.257843+00', '2025-11-09 13:23:27.257843+00', NULL),
	('b67bc05b-8836-4d9c-8bac-a2b431d60748', 'bec54d11-cb40-43da-aace-1177501111af', 'ebaa7239-55f9-4655-b71e-37b1032c08a4', 'multiple_choice', 'intermediate', 'What happened in Africville, Nova Scotia?', NULL, 'Africville was a thriving Black community in Halifax founded in the 1840s. The city systematically refused basic services (water, sewage, paved roads) while locating environmental hazards there: infectious disease hospital, city dump, slaughterhouse, etc. In the 1960s, residents were forcibly relocated and homes demolished—supposedly for "urban renewal" but really to make way for industrial development. Africville is a stark example of environmental racism: a Black community deliberately subjected to environmental harms then destroyed.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:27.630909+00', '2025-11-09 13:23:27.630909+00', NULL),
	('069a89d8-3ef7-45c2-9cc4-35bf38476a9f', 'bec54d11-cb40-43da-aace-1177501111af', 'ebaa7239-55f9-4655-b71e-37b1032c08a4', 'multiple_choice', 'intermediate', 'How does environmental racism impact health?', NULL, 'Environmental racism has severe health consequences. Black communities near industrial pollution, highways, and waste facilities face higher rates of asthma (especially children), cancer, cardiovascular disease, birth complications, and reduced life expectancy. Poor air quality, water contamination, and toxic exposure create health disparities. For example, Black children in polluted neighborhoods have asthma rates 2-3 times higher than white children. This is environmental injustice—communities harmed by decisions made without their consent.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:27.932949+00', '2025-11-09 13:23:27.932949+00', NULL),
	('52dc30e6-a35e-4d9d-9fc9-7ca4342d11fc', 'bec54d11-cb40-43da-aace-1177501111af', 'ebaa7239-55f9-4655-b71e-37b1032c08a4', 'multiple_choice', 'intermediate', 'What are solutions to environmental racism?', NULL, 'Solutions require systemic change, not individual actions. This includes: community-led organizing for environmental justice, policy requiring environmental equity assessments before siting hazards, holding corporations accountable for pollution, investing in Black community health and infrastructure, meaningful community consultation with veto power, reparations for communities harmed (like Africville), and climate justice policies centering vulnerable communities. Black communities must lead solutions—not be told what''s "best" for them.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:28.21209+00', '2025-11-09 13:23:28.21209+00', NULL),
	('070b54af-075d-4440-8cc9-2dc11e7e68df', 'b691d971-42b1-4039-abc0-4df213fff8d1', '9aaa397d-a922-4a81-939d-d8560c4c1a18', 'multiple_choice', 'intermediate', 'What are banking deserts?', NULL, 'Banking deserts are areas where residents lack access to bank branches and ATMs, forcing reliance on predatory alternatives like payday lenders and check-cashing stores with exorbitant fees. Black neighborhoods are disproportionately banking deserts due to redlining legacy, bank branch closures, and discriminatory business decisions. Without banking access, residents pay more for financial services, cannot build credit or savings, and face barriers to loans and homeownership—perpetuating wealth inequality.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:28.602225+00', '2025-11-09 13:23:28.602225+00', NULL),
	('938f017c-9613-4cc3-9d64-3a627dd3615d', 'b691d971-42b1-4039-abc0-4df213fff8d1', '9aaa397d-a922-4a81-939d-d8560c4c1a18', 'multiple_choice', 'intermediate', 'How does mortgage discrimination affect Black homeownership?', NULL, 'Studies show Black mortgage applicants are denied at significantly higher rates than white applicants with similar credit scores, income, and debt-to-income ratios. When approved, Black borrowers often receive higher interest rates, costing thousands more over loan lifetime. This reflects both explicit bias (discriminatory lending practices) and systemic factors (lower appraisals of Black neighborhoods, exclusion from informal networks providing better rates). Mortgage discrimination is a primary driver of the racial wealth gap.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:28.887972+00', '2025-11-09 13:23:28.887972+00', NULL),
	('0ec4ab10-8045-43ae-b120-f8c53ea3d6ac', 'b691d971-42b1-4039-abc0-4df213fff8d1', '9aaa397d-a922-4a81-939d-d8560c4c1a18', 'multiple_choice', 'intermediate', 'What is property appraisal bias?', NULL, 'Research shows homes in Black neighborhoods are systematically undervalued by tens of thousands of dollars compared to similar homes in white neighborhoods. Black homeowners report appraisals increasing when they remove family photos, have white friends "stand in" as owners, or hide indicators of Black occupancy. This appraisal bias reduces Black wealth (home equity), makes refinancing harder, and perpetuates neighborhood disinvestment. It reflects both individual appraiser bias and systemic undervaluation of Black communities.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:29.218713+00', '2025-11-09 13:23:29.218713+00', NULL),
	('4058e42b-6f61-4fce-8cbb-ae841bb7197e', 'b691d971-42b1-4039-abc0-4df213fff8d1', '9aaa397d-a922-4a81-939d-d8560c4c1a18', 'multiple_choice', 'intermediate', 'What are Community Development Financial Institutions (CDFIs)?', NULL, 'CDFIs are financial institutions (credit unions, community banks, loan funds) that prioritize serving communities excluded from mainstream banking. Many are Black-led and focus on Black communities. They provide affordable loans, banking access, financial education, and business capital without exploitative terms. CDFIs challenge the banking desert problem by bringing services where mainstream banks refuse to operate. They demonstrate that serving Black communities is viable—mainstream banks choose not to. Supporting CDFIs is one strategy for financial justice.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:29.604377+00', '2025-11-09 13:23:29.604377+00', NULL),
	('7d73811d-d860-4b47-80b4-738999138614', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', '14730db2-e188-48f4-b4bc-8f7c5e6ec870', 'multiple_choice', 'intermediate', 'What is the "pain gap" in healthcare?', NULL, 'The "pain gap" refers to the well-documented phenomenon where Black patients'' pain is systematically under-assessed and under-treated compared to white patients. Research shows many healthcare providers hold false beliefs about biological differences (e.g., that Black people have thicker skin or higher pain tolerance), leading to inadequate pain management.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:30.108499+00', '2025-11-09 13:23:30.108499+00', NULL),
	('d2aace40-7111-4289-9dae-14d3fa183f8b', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', '14730db2-e188-48f4-b4bc-8f7c5e6ec870', 'multiple_choice', 'intermediate', 'What do Canadian data show about Black maternal health outcomes?', NULL, 'Canadian data show that Black women, particularly Black immigrants and refugees, experience significantly higher rates of severe maternal morbidity and complications compared to white women. Studies also indicate higher risks of preterm birth, low birth weight, and pregnancy-related complications even when controlling for socioeconomic factors.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:30.400662+00', '2025-11-09 13:23:30.400662+00', NULL),
	('55122dc1-ca87-4b65-9384-a570f73da9bc', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', '14730db2-e188-48f4-b4bc-8f7c5e6ec870', 'multiple_choice', 'intermediate', 'Why is trust often lower between Black patients and healthcare providers?', NULL, 'Lower trust is a rational response to both historical harms (forced sterilization, unethical experimentation) and ongoing experiences of discrimination, dismissal of symptoms, and differential treatment. When patients consistently report not being believed or receiving substandard care, trust erodes. This isn''t about culture or literacy—it''s about justified wariness based on experience.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:30.775256+00', '2025-11-09 13:23:30.775256+00', NULL),
	('d7f2cd90-fea3-4c0e-92b5-38ec81136f14', '7ecf26eb-d2e6-4e24-a5c0-dc84bd35e9c0', '14730db2-e188-48f4-b4bc-8f7c5e6ec870', 'multiple_choice', 'intermediate', 'What is the most effective approach to reducing healthcare disparities?', NULL, 'While individual education matters, sustainable change requires systemic approaches: collecting and analyzing race-based outcome data, revising clinical protocols to reduce bias, increasing workforce diversity at all levels, removing barriers to access, and creating accountability for equitable outcomes. Training alone, without structural change, has limited impact.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:31.103832+00', '2025-11-09 13:23:31.103832+00', NULL),
	('6b7f5714-2f3e-45c7-9b88-cbec8603a3df', '514051fa-5b31-40cc-b88f-ac4dde373eb1', '7a62f7f4-16e9-4b32-9c5b-f6d2582e3987', 'multiple_choice', 'intermediate', 'When conducting a discrimination investigation, what is the most important principle?', NULL, 'While protecting the organization matters, the most important principle is conducting a fair, thorough, and objective investigation. This means treating all parties with respect, gathering all relevant evidence, and making findings based on facts, not assumptions. A well-conducted investigation protects everyone involved and reduces legal risk.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:31.568375+00', '2025-11-09 13:23:31.568375+00', NULL),
	('41b72555-dfd3-4965-b8c6-1351b4a362d3', '514051fa-5b31-40cc-b88f-ac4dde373eb1', '7a62f7f4-16e9-4b32-9c5b-f6d2582e3987', 'multiple_choice', 'intermediate', 'What is the purpose of the federal Employment Equity Act?', NULL, 'The EEA aims to achieve equality by identifying and removing barriers that disadvantage four designated groups (women, Indigenous peoples, persons with disabilities, and visible minorities, including Black Canadians). It requires proactive measures like representation goals, not quotas, to correct historical and systemic disadvantage.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:31.864545+00', '2025-11-09 13:23:31.864545+00', NULL),
	('4c21bfc9-bc1c-418a-ae3d-d32cb808f422', '514051fa-5b31-40cc-b88f-ac4dde373eb1', '7a62f7f4-16e9-4b32-9c5b-f6d2582e3987', 'multiple_choice', 'intermediate', 'Why is structured interviewing important for reducing bias?', NULL, 'Structured interviewing reduces bias by ensuring consistency. When all candidates answer the same questions evaluated using predetermined criteria, hiring decisions are based on job-relevant factors rather than subjective impressions or rapport. Research shows structured interviews significantly reduce racial bias compared to unstructured conversations.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:32.192137+00', '2025-11-09 13:23:32.192137+00', NULL),
	('8ad3a071-7344-4787-b691-409693ac8e5e', '514051fa-5b31-40cc-b88f-ac4dde373eb1', '7a62f7f4-16e9-4b32-9c5b-f6d2582e3987', 'multiple_choice', 'intermediate', 'What is the most effective way to hold leaders accountable for equity?', NULL, 'Accountability requires consequences. When equity outcomes are part of how leaders are evaluated and compensated, they prioritize it. This might include metrics like representation in hiring/promotions, retention rates, employee feedback, and demonstrated leadership actions. Without accountability mechanisms, equity remains aspirational rather than actual.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:32.47915+00', '2025-11-09 13:23:32.47915+00', NULL),
	('254c19ca-77ef-430c-8745-d1dfdff85b88', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'e3cd486e-ff8e-4179-a5f2-429bbec11b9f', 'multiple_choice', 'intermediate', 'What is the foundation of authentic Indigenous-Black solidarity?', NULL, 'Authentic solidarity requires recognizing both commonalities (shared experiences of white supremacy, colonialism, resistance) and distinctions (Indigenous relationship to land and sovereignty vs. Black experiences of forced migration and diaspora). We must honor both without erasing differences or appropriating struggles that are not our own.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:32.917313+00', '2025-11-09 13:23:32.917313+00', NULL),
	('df961da5-0fce-46ea-afe0-5a0e55caa908', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'e3cd486e-ff8e-4179-a5f2-429bbec11b9f', 'multiple_choice', 'intermediate', 'How are colonialism and slavery interconnected systems?', NULL, 'Colonialism (theft of Indigenous lands, genocide, forced assimilation) and chattel slavery (theft of Black people, forced labor, commodification) are interconnected systems of white supremacy. Both relied on dehumanization, violence, and extraction. They operated simultaneously in Canada and reinforced each other—settler colonialism required displacing Indigenous peoples to create plantation economies that exploited enslaved Black labor.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:33.199245+00', '2025-11-09 13:23:33.199245+00', NULL),
	('617b2e84-f3b7-432d-8f9a-a4f81b5c7989', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'e3cd486e-ff8e-4179-a5f2-429bbec11b9f', 'multiple_choice', 'intermediate', 'What does it mean to avoid appropriation in solidarity work?', NULL, 'Avoiding appropriation means we can learn from, support, and show solidarity with another community''s struggles without claiming them as our own. For example, Black people should not claim Indigenous identity or speak over Indigenous voices on land and sovereignty. Indigenous people should not claim Black identity or speak over Black voices on slavery and diaspora. We stand with, not as, each other.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:33.509874+00', '2025-11-09 13:23:33.509874+00', NULL),
	('d3f3bccc-3a1a-4d2d-bd23-99e7e6ef18d3', 'aa090c61-23a5-42d0-a63f-15adb8ae14d4', 'e3cd486e-ff8e-4179-a5f2-429bbec11b9f', 'multiple_choice', 'intermediate', 'Why is it important to address anti-Blackness and anti-Indigeneity within our own communities?', NULL, 'Solidarity requires accountability. Anti-Blackness exists in some Indigenous communities (e.g., exclusion, stereotypes, colorism). Anti-Indigeneity exists in some Black communities (e.g., invisibilizing Indigenous peoples, benefiting from settlement). We must address these within our own communities, not to shame but to build authentic relationships based on mutual respect and support, not replication of colonial harm.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:33.792187+00', '2025-11-09 13:23:33.792187+00', NULL),
	('4f5a8533-8dcb-4e0b-ae8f-36ef642fd089', '8171b79b-869b-45d7-8c5c-340507244da3', '0a51f04b-f1b2-4fa4-ae2c-2b2dff0fefab', 'multiple_choice', 'intermediate', 'What is intersectionality?', NULL, 'Intersectionality, coined by Kimberlé Crenshaw, recognizes that identities like race, gender, class, and sexuality overlap to create unique experiences of privilege and oppression. A Black woman''s experience is not simply "racism + sexism"—the intersection creates distinct challenges that cannot be understood by looking at race or gender alone.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:34.269739+00', '2025-11-09 13:23:34.269739+00', NULL),
	('10a798d3-ab17-4ea7-8109-3d60db980f16', '8171b79b-869b-45d7-8c5c-340507244da3', '0a51f04b-f1b2-4fa4-ae2c-2b2dff0fefab', 'multiple_choice', 'intermediate', 'What does research show about Black women in Canadian workplaces?', NULL, 'Data consistently show Black women face compounded disadvantages. They earn less than both white women (facing racial disparities) and Black men (facing gender disparities), are underrepresented in leadership, experience higher unemployment, and report more discrimination and microaggressions. This is intersectionality in action—not just racism, not just sexism, but unique barriers at the intersection.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:34.589017+00', '2025-11-09 13:23:34.589017+00', NULL),
	('8d2594c4-71d6-4437-8456-6c6bb21acc60', '8171b79b-869b-45d7-8c5c-340507244da3', '0a51f04b-f1b2-4fa4-ae2c-2b2dff0fefab', 'multiple_choice', 'intermediate', 'What is the "angry Black woman" stereotype and why does it matter?', NULL, 'The "angry Black woman" stereotype falsely characterizes Black women as hostile, aggressive, or difficult. When Black women express normal assertiveness, disagreement, or justified frustration, they are more likely to be labeled "angry" or "difficult" than white women expressing the same behaviors. This stereotype is used to silence, dismiss, and penalize Black women in workplaces.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:34.96822+00', '2025-11-09 13:23:34.96822+00', NULL),
	('68075fe7-83c0-486d-bd72-7d3c4d3916d5', '8171b79b-869b-45d7-8c5c-340507244da3', '0a51f04b-f1b2-4fa4-ae2c-2b2dff0fefab', 'multiple_choice', 'intermediate', 'What is the difference between mentorship and sponsorship for Black women?', NULL, 'While mentorship (advice, guidance, support) is valuable, sponsorship is critical for advancement. A sponsor actively advocates for a Black woman in rooms where decisions are made, nominates her for opportunities, uses their influence to advance her career, and takes risks on her behalf. Black women are often over-mentored but under-sponsored—they receive advice but not the advocacy needed to break through barriers.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:35.371372+00', '2025-11-09 13:23:35.371372+00', NULL),
	('a0e95724-d6ef-443a-a4eb-cdeaee75f50e', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', '1a2f93b6-8be4-4336-b3f3-04bf169c472c', 'multiple_choice', 'intermediate', 'What is intersectionality?', NULL, 'Intersectionality, coined by Kimberlé Crenshaw, describes how systems of oppression (racism, sexism, classism, ableism, homophobia, transphobia) intersect and create unique experiences of marginalization. It is not additive (Black + woman = double oppression) but multiplicative (Black women face unique oppression called misogynoir that is neither just racism nor just sexism). Originated in Black feminist thought (Combahee River Collective, Audre Lorde, bell hooks) to address erasure of Black women in both anti-racist and feminist movements. Intersectionality requires examining structural power, not just individual identities, and centering most marginalized experiences.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:35.753668+00', '2025-11-09 13:23:35.753668+00', NULL),
	('af780b40-9fd1-4159-9a30-a247772191cf', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', '1a2f93b6-8be4-4336-b3f3-04bf169c472c', 'multiple_choice', 'intermediate', 'What is misogynoir?', NULL, 'Misogynoir (coined by Moya Bailey) is anti-Black misogyny—the specific hatred and violence targeting Black women and girls that is distinct from misogyny targeting white women or racism targeting Black men. Examples: hypersexualization and dehumanization of Black women, "angry Black woman" stereotype, higher rates of intimate partner violence and sexual assault, criminalizing Black motherhood, denial of pain and credibility in healthcare, pushout from schools, exclusion from beauty standards and femininity. Misogynoir is structural (in laws, policies, institutions) not just interpersonal. Addressing misogynoir requires centering Black women''s experiences and safety, not just adding women to anti-racism or Black people to feminism.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:36.166091+00', '2025-11-09 13:23:36.166091+00', NULL),
	('7c032198-b0e3-4cd3-868a-c05040d07210', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', '1a2f93b6-8be4-4336-b3f3-04bf169c472c', 'multiple_choice', 'intermediate', 'How does class intersect with anti-Black racism?', NULL, 'Class and race are intertwined. Black people in Canada: face wealth gap (lower median income, less homeownership, less intergenerational wealth), are overrepresented in low-wage precarious work, experience labor exploitation (from slavery to contemporary gig economy), face barriers to entrepreneurship and business ownership, and have fragile economic mobility easily disrupted by racism. Wealthy Black people still face racism (carding, discrimination in stores, workplace racism) AND face "Black tax" (expected to support extended family/community, less intergenerational wealth transfer). Working-class Black people face compounded oppression. Addressing economic justice requires tackling racist barriers to wealth-building and employment equity, not just "diversity."', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:36.46765+00', '2025-11-09 13:23:36.46765+00', NULL),
	('a0f570d1-8802-425c-98a9-ed94a0fcc88c', '5b87f81d-5bea-464d-a8b1-a38751f18b6d', '1a2f93b6-8be4-4336-b3f3-04bf169c472c', 'multiple_choice', 'intermediate', 'What is the intersection of ableism and anti-Black racism?', NULL, 'Black disabled people face unique oppression: Police violence (Black disabled people more likely to be killed during mental health crises or due to not responding to commands), Healthcare discrimination (pain dismissed, needs ignored, experimented on historically and contemporarily), Disability justice exclusion (white-dominated disability movements often ignore race, center white experiences), Pathologization (Black children overdiagnosed with behavioral disabilities, Black adults'' trauma misdiagnosed as mental illness), Barriers to services (poverty, systemic racism, lack of culturally appropriate supports). Addressing this requires: centering Black disabled voices, police abolition, healthcare reform, and building disability justice movements that do not replicate anti-Black racism.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:36.799508+00', '2025-11-09 13:23:36.799508+00', NULL),
	('a3bd0fc1-ab78-43ef-9b58-743749ca0e63', '47fb1e63-ebc4-4976-84a4-d678e0370017', '75fff04f-b082-4a09-a0e0-6c71cdab1d4a', 'multiple_choice', 'intermediate', 'Anti-Black racism refers to:', NULL, 'Anti-Black racism is the specific prejudice, attitudes, beliefs, stereotyping, and discrimination directed at people of African descent, rooted in their unique history and experience.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:37.236732+00', '2025-11-09 13:23:37.236732+00', NULL),
	('a67313f4-8568-44a1-8c51-aad2b04ba80e', '47fb1e63-ebc4-4976-84a4-d678e0370017', '75fff04f-b082-4a09-a0e0-6c71cdab1d4a', 'multiple_choice', 'intermediate', 'Slavery in Canada was abolished in:', NULL, 'Slavery was abolished throughout the British Empire, including Canada, in 1834. However, this was not the end of anti-Black discrimination.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:37.507699+00', '2025-11-09 13:23:37.507699+00', NULL),
	('707e48a6-e212-4f5f-919a-acbe3723ac99', '47fb1e63-ebc4-4976-84a4-d678e0370017', '75fff04f-b082-4a09-a0e0-6c71cdab1d4a', 'multiple_choice', 'intermediate', 'Systemic racism differs from individual racism because it:', NULL, 'Systemic racism is embedded in the policies, practices, and procedures of institutions and systems, creating barriers for racialized groups regardless of individual intentions.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:38.007243+00', '2025-11-09 13:23:38.007243+00', NULL),
	('13043711-554f-41c3-b6c1-8c8598cd285d', '47fb1e63-ebc4-4976-84a4-d678e0370017', '75fff04f-b082-4a09-a0e0-6c71cdab1d4a', 'multiple_choice', 'intermediate', 'Which Canadian province had legally segregated schools until 1965?', NULL, 'Nova Scotia maintained legally segregated schools for Black students until 1965, demonstrating the persistence of formal discrimination in Canada.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:38.438349+00', '2025-11-09 13:23:38.438349+00', NULL),
	('7a70e679-470b-4c00-b686-b7dd663d108e', '47fb1e63-ebc4-4976-84a4-d678e0370017', '75fff04f-b082-4a09-a0e0-6c71cdab1d4a', 'multiple_choice', 'intermediate', 'The concept of "Canadian exceptionalism" regarding racism refers to:', NULL, 'Canadian exceptionalism is the myth that Canada is inherently more tolerant than other countries (especially the US), which obscures our own history and present reality of anti-Black racism.', 1, NULL, 4, NULL, '{}', true, '2025-11-09 13:23:38.761115+00', '2025-11-09 13:23:38.761115+00', NULL),
	('92128a41-2f85-411b-865a-3b1fde6b006d', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'c32b5722-a9e8-4296-b842-4e0d454f2136', 'multiple_choice', 'intermediate', 'Academic streaming disproportionately affects Black students by:', NULL, 'Streaming places Black students disproportionately in applied or basic level courses, limiting access to university and career opportunities despite ability.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:39.191301+00', '2025-11-09 13:23:39.191301+00', NULL),
	('4042bcce-bf07-4142-83f7-942a2a5b6427', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'c32b5722-a9e8-4296-b842-4e0d454f2136', 'multiple_choice', 'intermediate', 'The term "carding" refers to:', NULL, 'Carding (or street checks) is the practice of police arbitrarily stopping, questioning, and documenting individuals. Data shows Black people are disproportionately carded.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:39.522437+00', '2025-11-09 13:23:39.522437+00', NULL),
	('3e16e289-c7e6-42a9-932d-51aa7e875bf9', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'c32b5722-a9e8-4296-b842-4e0d454f2136', 'multiple_choice', 'intermediate', 'Black students in Ontario are approximately how many times more likely to be suspended than white students?', NULL, 'Research shows Black students in Ontario are approximately 3 times more likely to be suspended, even for similar behaviors, indicating bias in discipline.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:39.95984+00', '2025-11-09 13:23:39.95984+00', NULL),
	('e52e46f9-9334-414d-80de-a84b8b3890c4', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'b86dc4cd-169c-48d8-a4ed-d6b9700d77d9', 'multiple_choice', 'intermediate', 'Unconscious bias:', NULL, 'Unconscious bias affects everyone due to societal conditioning. Recognizing and actively working to counter these biases is an ongoing process.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:40.302078+00', '2025-11-09 13:23:40.302078+00', NULL),
	('47dbc192-0bcd-473a-be36-8e8dea7e66ca', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'b86dc4cd-169c-48d8-a4ed-d6b9700d77d9', 'multiple_choice', 'intermediate', 'When witnessing anti-Black racism, the most important consideration is:', NULL, 'The safety and preferences of the person experiencing racism should guide your intervention. Sometimes direct intervention can escalate harm.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:40.670871+00', '2025-11-09 13:23:40.670871+00', NULL),
	('efb790f0-1cd9-454b-adb5-8e452ce6503d', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'b86dc4cd-169c-48d8-a4ed-d6b9700d77d9', 'multiple_choice', 'intermediate', 'Which statement reflects accountability after making a racist mistake?', NULL, 'True accountability involves acknowledging harm without defensiveness, taking responsibility, and committing to change without burdening the harmed person with your education.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:41.02395+00', '2025-11-09 13:23:41.02395+00', NULL),
	('59e81924-a2dc-400c-8b0a-415d318c6444', '47fb1e63-ebc4-4976-84a4-d678e0370017', 'b86dc4cd-169c-48d8-a4ed-d6b9700d77d9', 'multiple_choice', 'intermediate', 'Anti-racism work is:', NULL, 'Anti-racism is ongoing work that requires continuous learning, unlearning, and action. It is never "complete" because society and we ourselves are always evolving.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:41.638542+00', '2025-11-09 13:23:41.638542+00', NULL),
	('362677f6-0d7f-4b4c-90dc-d31c86c14767', '896de482-9231-4d59-8a5a-047b95926a1a', '80392fe5-ac8b-46d6-a2a3-e99e99679efd', 'multiple_choice', 'intermediate', 'What is the key difference between equality and equity in policy development?', NULL, 'Equality treats everyone the same, which may not address different needs or barriers. Equity recognizes that people start from different places and provides what each person needs to achieve fair outcomes.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:42.025806+00', '2025-11-09 13:23:42.025806+00', NULL),
	('7b826932-3083-45a5-add1-d2f0c7b57a36', '896de482-9231-4d59-8a5a-047b95926a1a', '80392fe5-ac8b-46d6-a2a3-e99e99679efd', 'multiple_choice', 'intermediate', 'Which of the following is a red flag in a workplace policy?', NULL, 'Subjective terms like "professional appearance" can be interpreted through cultural biases and enforced discriminately. Policies should use objective, clearly defined criteria.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:42.310991+00', '2025-11-09 13:23:42.310991+00', NULL),
	('ebe71863-ce64-42e8-b85c-5aacbc664bbf', '896de482-9231-4d59-8a5a-047b95926a1a', '80392fe5-ac8b-46d6-a2a3-e99e99679efd', 'multiple_choice', 'intermediate', 'Why should Black employees be involved in policy development?', NULL, 'Black employees have lived experience with racism and can identify issues that others might overlook. Their input helps create more effective policies and demonstrates genuine commitment to equity.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:42.569992+00', '2025-11-09 13:23:42.569992+00', NULL),
	('b81a7191-7b06-4766-953f-eb216ea293f4', '896de482-9231-4d59-8a5a-047b95926a1a', '3a083131-09a1-4d5c-94af-03e914206645', 'multiple_choice', 'intermediate', 'What is the key limitation of focusing only on diversity without inclusion?', NULL, 'Diversity (representation) without inclusion means Black employees may be hired but face barriers to advancement, belonging, and success. True equity requires both diverse representation and inclusive culture.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:42.890355+00', '2025-11-09 13:23:42.890355+00', NULL),
	('a3c2518d-e5d7-49dc-ab49-17401b723437', '896de482-9231-4d59-8a5a-047b95926a1a', '3a083131-09a1-4d5c-94af-03e914206645', 'multiple_choice', 'intermediate', 'Which approach demonstrates genuine leadership commitment to racial equity?', NULL, 'Genuine commitment involves assessing current state, being transparent about findings, and taking concrete action. Statements and one-time events without systemic change are performative.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:43.206968+00', '2025-11-09 13:23:43.206968+00', NULL),
	('cd4e7e2a-a732-4549-94e2-2f5c76528189', '896de482-9231-4d59-8a5a-047b95926a1a', '3a083131-09a1-4d5c-94af-03e914206645', 'multiple_choice', 'intermediate', 'What is a key principle for writing inclusive policies?', NULL, 'Inclusive policies should use clear, specific, objective language that reduces bias. Subjective terms can be interpreted through cultural biases and enforced discriminately.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:43.472176+00', '2025-11-09 13:23:43.472176+00', NULL),
	('6d96b9d9-ab80-43b4-94e6-ee0a3154336b', '896de482-9231-4d59-8a5a-047b95926a1a', '3a083131-09a1-4d5c-94af-03e914206645', 'multiple_choice', 'intermediate', 'How can leaders measure whether culture is truly inclusive for Black employees?', NULL, 'Measuring inclusive culture requires multiple indicators: quantitative metrics (retention, promotion, pay equity), qualitative data (employee feedback, exit interviews), and behavioral observations. Hiring alone doesn''t reflect inclusion.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:43.830578+00', '2025-11-09 13:23:43.830578+00', NULL),
	('c9a3c484-b49c-401c-a8cf-017553e186b8', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '796afe76-8244-49b9-b688-f5fae40a1cf6', 'multiple_choice', 'intermediate', 'Why is it important to track representation by level, not just overall?', NULL, 'Overall representation can mask inequity. An organization might have good overall representation but if Black employees are concentrated at entry level and absent from leadership, that indicates barriers to advancement.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:44.148243+00', '2025-11-09 13:23:44.148243+00', NULL),
	('d99cf7b8-e4fe-4c05-b571-702137e3da20', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '796afe76-8244-49b9-b688-f5fae40a1cf6', 'multiple_choice', 'intermediate', 'What does high voluntary turnover among Black employees typically indicate?', NULL, 'High voluntary turnover among Black employees often signals issues with inclusion, belonging, advancement opportunities, or experiencing discrimination. It''s a red flag that requires investigation.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:44.484842+00', '2025-11-09 13:23:44.484842+00', NULL),
	('0b4cc460-5ed8-4415-a711-428ad15de6e5', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '796afe76-8244-49b9-b688-f5fae40a1cf6', 'multiple_choice', 'intermediate', 'When analyzing pay equity, why is it important to compare employees in the same role and level?', NULL, 'Pay equity analysis must compare like-to-like (same role, level, location, experience) to determine if there are unexplained gaps based on race. Comparing across different roles doesn''t reveal pay discrimination.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:44.753376+00', '2025-11-09 13:23:44.753376+00', NULL),
	('c37dc8ed-cab0-4d84-80a9-ff992ac910b2', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '5c27ecc1-4a37-455f-910a-4d4cf5db1cb2', 'multiple_choice', 'intermediate', 'What is the most important reason to collect demographic data?', NULL, 'While some data collection may be legally required, the primary purpose should be to identify where disparities exist, track whether interventions are working, and hold the organization accountable for progress.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:45.068451+00', '2025-11-09 13:23:45.068451+00', NULL),
	('e34759f0-84c0-4641-a3a4-73beafe8a4c7', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '5c27ecc1-4a37-455f-910a-4d4cf5db1cb2', 'multiple_choice', 'intermediate', 'What is a key principle for collecting race data ethically?', NULL, 'Ethical data collection requires transparency about why you''re collecting and how it will be used, voluntary participation with option to decline, and strong confidentiality protections. Building trust is essential.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:45.349852+00', '2025-11-09 13:23:45.349852+00', NULL),
	('f1b3b5f9-59ca-4242-9b62-b7e1fe2d1a0c', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '5c27ecc1-4a37-455f-910a-4d4cf5db1cb2', 'multiple_choice', 'intermediate', 'Why is transparency about equity data important?', NULL, 'Transparency builds trust with employees and stakeholders, creates accountability for progress, allows comparison with other organizations, and demonstrates genuine commitment beyond words.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:45.584493+00', '2025-11-09 13:23:45.584493+00', NULL),
	('50bbd472-5067-4342-945c-c28445d3cf3f', 'cc7c278f-a135-4edc-b47a-2ff09e86f308', '5c27ecc1-4a37-455f-910a-4d4cf5db1cb2', 'multiple_choice', 'intermediate', 'When sharing data that shows significant disparities, what is the most important element to include?', NULL, 'While context and acknowledgment matter, the most critical element is explaining what concrete actions you''re taking to address disparities, with specific timelines and clear accountability. Data without action is meaningless.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:45.829835+00', '2025-11-09 13:23:45.829835+00', NULL),
	('ac3bf6a9-a8a5-4b72-8a15-7ef9c37cdf5a', '17767e69-30e3-4c0b-aa13-a8990502b002', '7c851668-d971-4c78-9115-4972eb461519', 'multiple_choice', 'intermediate', 'How does crime coverage perpetuate anti-Black racism?', NULL, 'Studies show media disproportionately depicts Black people as criminals relative to actual crime data, uses dehumanizing language ("thug," "gang member") more often for Black suspects, publishes mugshots of Black accused more frequently, and frames Black crime as inherent while white crime is contextualized as anomaly. This perpetuates stereotypes linking Blackness with criminality, influences public perception and policy, and dehumanizes victims when they are Black. Ethical reporting requires: equal treatment, humanizing language, systemic context, and interrogating editorial choices.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:46.20875+00', '2025-11-09 13:23:46.20875+00', NULL),
	('8cbcd47e-05a5-4a41-b1a9-f9ad6243751d', '17767e69-30e3-4c0b-aa13-a8990502b002', '7c851668-d971-4c78-9115-4972eb461519', 'multiple_choice', 'intermediate', 'What are deficit narratives in media?', NULL, 'Deficit narratives frame Black communities solely through problems—poverty, crime, broken families—without context, systemic analysis, or stories of achievement, culture, joy, and resistance. This creates false perception that issues are inherent to Blackness rather than products of racism. Ethical reporting requires: centering Black voices and expertise, reporting systemic causes not just symptoms, including stories of contribution/resilience, and avoiding trauma porn. Balance does not mean ignoring problems—it means contextualizing them within larger realities of community strength and systemic oppression.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:46.519778+00', '2025-11-09 13:23:46.519778+00', NULL),
	('75821f65-24d4-4dbe-ba4e-a2c05f05d0d4', '17767e69-30e3-4c0b-aa13-a8990502b002', '7c851668-d971-4c78-9115-4972eb461519', 'multiple_choice', 'intermediate', 'Why does newsroom diversity matter?', NULL, 'Homogeneous (white) newsrooms perpetuate bias through: what stories are deemed important, how issues are framed, which sources are considered credible, what language is used, and what is scrutinized vs accepted. Black journalists bring lived experience, community connections, and critical lens that challenges dominant narratives. However, diversity alone is insufficient—Black journalists must have decision-making power (not just hired to cover "Black issues"), supportive environments, and pathways to leadership. Newsroom diversity is about power: who decides what the public hears?', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:46.774769+00', '2025-11-09 13:23:46.774769+00', NULL),
	('28a6f7f1-5037-42f4-8c04-035a944cd3fd', '17767e69-30e3-4c0b-aa13-a8990502b002', '7c851668-d971-4c78-9115-4972eb461519', 'multiple_choice', 'intermediate', 'What does ethical accountability in media require?', NULL, 'Ethical accountability goes beyond legal requirements to include: accessible mechanisms for community feedback (not just comment sections), transparent processes for investigating concerns, prominent corrections (not buried), meaningful apologies acknowledging specific harm, material repair (not just words), and ongoing accountability relationships with Black communities. One-off corrections are insufficient—accountability requires systemic change: examining patterns of harm, changing editorial practices, involving communities in decision-making, and demonstrating change over time. Media must earn trust through consistent action, not performative diversity statements.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:47.057892+00', '2025-11-09 13:23:47.057892+00', NULL),
	('f965eb15-9d1c-486f-a93b-2faacbb5ffe0', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'd584857f-7197-4aee-9706-a0d0dd1fbfa7', 'multiple_choice', 'intermediate', 'What is white saviorism in nonprofit work?', NULL, 'White saviorism is the harmful pattern where white people (individuals or organizations) position themselves as rescuers of Black/racialized communities while centering their own benevolence, moral superiority, and comfort. It assumes communities need saving rather than resources and power. White saviorism perpetuates paternalism (we know what''s best for you), extraction (using community stories for fundraising), and maintains power imbalances. Anti-racist work requires stepping back, supporting Black leadership, sharing power—not claiming credit for "saving" anyone.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:47.403966+00', '2025-11-09 13:23:47.403966+00', NULL),
	('0fd17c04-5ce6-48b6-b980-9c6f96c29b5b', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'd584857f-7197-4aee-9706-a0d0dd1fbfa7', 'multiple_choice', 'intermediate', 'What does "Nothing About Us Without Us" mean?', NULL, '"Nothing About Us Without Us" means Black communities must lead decisions affecting them. Too often, white-led organizations design programs "for" Black communities without meaningful input, then wonder why initiatives fail. This perpetuates harm by: ignoring community expertise, imposing outside solutions, extracting stories/data without benefit, and maintaining power with funders/decision-makers. Authentic partnership requires: centering Black leadership, sharing decision-making power, resourcing community-led solutions, and being accountable to those most impacted—not doing things "for" them.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:47.649831+00', '2025-11-09 13:23:47.649831+00', NULL),
	('d00c9599-a3a6-4b35-b130-6a2f85e781aa', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'd584857f-7197-4aee-9706-a0d0dd1fbfa7', 'multiple_choice', 'intermediate', 'What do data show about philanthropic funding?', NULL, 'Data consistently show Black-led organizations receive far less philanthropic funding (often <2% of foundation grants), are more likely to receive small/restricted grants vs large/unrestricted gifts, face more burdensome reporting requirements, and have less access to funder networks. This reflects systemic racism in philanthropy: biased perceptions of credibility, risk aversion, homogeneous funder networks, and preference for white-led "neutral" organizations over Black-led community organizations. Funding inequity perpetuates power imbalances and under-resources those closest to problems.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:47.90319+00', '2025-11-09 13:23:47.90319+00', NULL),
	('9dd9406c-bcba-4786-a434-c907b8335369', '1c958ee2-370f-403b-a70f-a668e8c51cb7', 'd584857f-7197-4aee-9706-a0d0dd1fbfa7', 'multiple_choice', 'intermediate', 'What is trust-based philanthropy?', NULL, 'Trust-based philanthropy shifts from extractive, controlling funding to practices that trust community organizations: providing unrestricted/general operating support (not just project funding), multi-year commitments (not one-year grants), streamlined applications/reporting (not 50-page proposals), participatory decision-making, and building relationships beyond transactions. It recognizes organizations closest to communities are experts—not problems to be managed. Trust-based approaches resource Black-led organizations equitably and acknowledge that restrictive funding perpetuates white institutional control.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:48.24006+00', '2025-11-09 13:23:48.24006+00', NULL),
	('c899f1c1-b720-476b-a8e3-f32d1a4ce055', '9ae5f595-d13c-4880-86b3-1233c42bfce7', '76b3a887-4bae-46fe-bb56-d649ce31b383', 'multiple_choice', 'intermediate', 'What is carding (street checks)?', NULL, 'Carding (street checks) is the practice of police randomly stopping, questioning, and documenting individuals not suspected of any crime. Toronto data showed Black people were 3 times more likely to be carded than white people. It created databases of tens of thousands of Black residents, many never charged with anything. Carding violates rights, erodes trust, and reinforces criminalization of Black communities. Many jurisdictions have restricted or banned the practice.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:48.668751+00', '2025-11-09 13:23:48.668751+00', NULL),
	('31246125-6f14-4049-8c40-3e95da5c12d6', '9ae5f595-d13c-4880-86b3-1233c42bfce7', '76b3a887-4bae-46fe-bb56-d649ce31b383', 'multiple_choice', 'intermediate', 'What do data show about police use of force against Black Canadians?', NULL, 'Data show Black Canadians are vastly overrepresented in police shootings. In Toronto, Black people are 8.8% of population but 37% of people shot by police (20 times the rate). Similar patterns exist across Canada. Black people are also overrepresented in use of force reports, wellness checks gone deadly, and deaths in custody. This is not about behavior—it''s about how police perceive and respond to Black people.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:48.950146+00', '2025-11-09 13:23:48.950146+00', NULL),
	('9145959a-6524-4b3e-938f-d6e09a47a95d', '9ae5f595-d13c-4880-86b3-1233c42bfce7', '76b3a887-4bae-46fe-bb56-d649ce31b383', 'multiple_choice', 'intermediate', 'What are community-based alternatives to policing?', NULL, 'Community-based alternatives send trained community responders (not police) to mental health crises, housing issues, substance use, youth conflicts, etc. Examples include crisis intervention teams, mobile crisis units, street outreach workers, violence interruption programs, and restorative justice circles. These approaches prioritize care, de-escalation, connection to resources, and addressing root causes—resulting in better outcomes and lower costs than police responses.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:49.235634+00', '2025-11-09 13:23:49.235634+00', NULL),
	('6220783a-3737-4fc4-88b2-0094b1493dae', '9ae5f595-d13c-4880-86b3-1233c42bfce7', '76b3a887-4bae-46fe-bb56-d649ce31b383', 'multiple_choice', 'intermediate', 'What does "defund the police" mean?', NULL, '"Defund the police" means reducing over-inflated police budgets (often 30-50% of municipal budgets) and reinvesting in community resources that address root causes of harm: affordable housing, mental health services, education, youth programs, addiction support. Police don''t prevent crime—addressing poverty, trauma, and lack of resources does. Defunding recognizes police cannot solve social problems and redirects funds to what actually creates safety.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:49.567257+00', '2025-11-09 13:23:49.567257+00', NULL),
	('50c3d4a0-a73c-4037-93c4-8f31ebda838a', '4c324c34-15c9-452c-be1f-b57a8a6deb39', '57d4110b-fdbc-45ba-b23b-b9fad210499c', 'multiple_choice', 'intermediate', 'What is a Racial Equity Impact Assessment (REIA)?', NULL, 'A Racial Equity Impact Assessment (REIA) is a systematic process conducted before policy implementation to: identify how policy will affect different racial groups, predict disparate impacts using data and community input, examine whether policy addresses or perpetuates inequity, and propose modifications to advance equity. REIAs are critical because facially neutral policies often have racist outcomes when historical context and current disparities are ignored. They require disaggregated data, community engagement, and commitment to modify/reject policies that harm Black communities—not just documenting harm.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:49.937295+00', '2025-11-09 13:23:49.937295+00', NULL),
	('f7d21f5c-e6ab-43a5-b8f7-826092c9e16a', '4c324c34-15c9-452c-be1f-b57a8a6deb39', '57d4110b-fdbc-45ba-b23b-b9fad210499c', 'multiple_choice', 'intermediate', 'What are facially neutral policies with racist outcomes?', NULL, 'Facially neutral policies do not mention race but perpetuate inequity due to historical context and current disparities. Examples: minimum sentencing laws (appear neutral but disproportionately incarcerate Black people due to biased policing), school funding based on property taxes (perpetuates segregation and under-resourcing in Black neighborhoods), credit score requirements (reflect historical discrimination in lending). These policies maintain systemic racism precisely because they ignore racial context. Colorblindness in policy is not neutral—it perpetuates existing inequity by refusing to address it.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:50.284688+00', '2025-11-09 13:23:50.284688+00', NULL),
	('410b8991-d7e3-47ed-9759-6b28dc87d102', '4c324c34-15c9-452c-be1f-b57a8a6deb39', '57d4110b-fdbc-45ba-b23b-b9fad210499c', 'multiple_choice', 'intermediate', 'Why is disaggregated race-based data essential for equity policy?', NULL, 'Race-based data is essential because: you cannot address what you do not measure, aggregate data hides disparities (averaging Black and white outcomes makes racism invisible), policy claims about equity cannot be verified without tracking outcomes by race, and systems cannot be held accountable without evidence. Arguments against collecting race data ("divisive," "creates division") perpetuate racism by making inequity invisible. Disaggregated data reveals disparate impacts and forces acknowledgment of systemic racism—that is why it is resisted. Evidence-based equity policy is impossible without race data.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:50.57485+00', '2025-11-09 13:23:50.57485+00', NULL),
	('c4792a9e-3d31-4dce-9f1e-2d8cbfc7a25c', '4c324c34-15c9-452c-be1f-b57a8a6deb39', '57d4110b-fdbc-45ba-b23b-b9fad210499c', 'multiple_choice', 'intermediate', 'What does effective policy implementation monitoring require?', NULL, 'Policy wins mean nothing if implementation fails or perpetuates inequity. Effective monitoring requires: disaggregated outcome data (are racial disparities closing?), community feedback from those most impacted, enforcement/compliance data (is policy being implemented?), identification of barriers and unintended consequences, ongoing adjustments based on evidence, and accountability consequences when systems fail to achieve equity. Too often, "equity policies" are passed but never funded, enforced, or monitored—allowing systems to claim progress without change. Advocates must stay engaged beyond policy passage to ensure real implementation and impact.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:50.818086+00', '2025-11-09 13:23:50.818086+00', NULL),
	('9e1ed1e9-362f-467d-973b-b71b8cf720a6', '21493075-7bbf-41cd-a938-0119007db4d2', '97d83f4f-50ff-44e1-a9de-32bccc9d6983', 'multiple_choice', 'intermediate', 'Which statement is a microaggression?', NULL, '"I don''t see color" invalidates the lived experience of racism and suggests being Black is something to be overlooked rather than respected.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:51.159085+00', '2025-11-09 13:23:51.159085+00', NULL),
	('0a88ac16-f301-406c-bd0f-5df012ccac1d', '21493075-7bbf-41cd-a938-0119007db4d2', '97d83f4f-50ff-44e1-a9de-32bccc9d6983', 'multiple_choice', 'intermediate', 'If someone says you committed a microaggression, the best first response is:', NULL, 'Thank the person for telling you and apologize for the harm caused. Intent doesn''t negate impact.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:51.41474+00', '2025-11-09 13:23:51.41474+00', NULL),
	('8f8c769b-8d52-4fda-a5b0-ab892abae3bb', '21493075-7bbf-41cd-a938-0119007db4d2', '97d83f4f-50ff-44e1-a9de-32bccc9d6983', 'multiple_choice', 'intermediate', 'Microaggressions are called "micro" because:', NULL, 'The "micro" refers to individual incidents, but the cumulative effect is significant. Many prefer the term "everyday racism."', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:51.668674+00', '2025-11-09 13:23:51.668674+00', NULL),
	('9e1ea0b4-4f14-451b-a680-ca695feadecc', 'de3eee9b-630c-4aec-a014-0849353d411c', '2a36b03c-3761-4218-ab49-628d7662ea65', 'multiple_choice', 'intermediate', 'What is wrong with traditional recruitment approaches?', NULL, 'Traditional recruiting perpetuates exclusion by: relying on homogeneous networks ("who do we know?"), using coded language in job descriptions (e.g., "culture fit," "polish"), requiring unnecessary credentials that screen out qualified candidates, taking transactional approaches (showing up only when hiring), and failing to examine bias in screening. To recruit Black talent authentically, build ongoing relationships with Black communities/institutions, remove barriers, expand networks, and demonstrate genuine commitment.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:52.044265+00', '2025-11-09 13:23:52.044265+00', NULL),
	('2737d772-e0c7-47f5-a9b3-adaf8bc1cd3b', 'de3eee9b-630c-4aec-a014-0849353d411c', '2a36b03c-3761-4218-ab49-628d7662ea65', 'multiple_choice', 'intermediate', 'What is the problem with "culture fit"?', NULL, '"Culture fit" sounds neutral but is often code for hiring people similar to existing (often white) staff. It screens out Black candidates who don''t match the dominant culture, reinforcing homogeneity. Research shows candidates who "fit" are often those who look, talk, and think like existing employees. Instead, prioritize "culture add"—hiring people who bring different perspectives, challenge assumptions, and expand your culture. Diversity strengthens teams; homogeneity creates blind spots.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:52.358437+00', '2025-11-09 13:23:52.358437+00', NULL),
	('5a35fe81-b9f9-4b46-a90c-cc4622e3f61b', 'de3eee9b-630c-4aec-a014-0849353d411c', '2a36b03c-3761-4218-ab49-628d7662ea65', 'multiple_choice', 'intermediate', 'Why do Black employees leave organizations?', NULL, 'Black employees leave due to hostile work environments: constant microaggressions, being the "only one," exclusion from informal networks/opportunities, biased performance evaluations, glass ceilings blocking advancement, lack of psychological safety, emotional labor of educating colleagues, and watching organizations fail to act on stated DEI commitments. The issue is not individual "fit"—it''s systemic barriers. Exit interviews often reveal patterns organizations ignore. Retention requires addressing root causes, not surface-level perks.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:52.660824+00', '2025-11-09 13:23:52.660824+00', NULL),
	('687fbf9a-498f-4b37-a654-1faef1c2c118', 'de3eee9b-630c-4aec-a014-0849353d411c', '2a36b03c-3761-4218-ab49-628d7662ea65', 'multiple_choice', 'intermediate', 'What does equitable onboarding require?', NULL, 'Equitable onboarding requires more than generic orientation. Black employees need: intentional access to informal networks (not just formal org charts), sponsors (not just mentors) who advocate for them, clear expectations and success metrics, resources and support, education for existing staff on inclusive behaviors, and acknowledgment of barriers they may face. Don''t assume everyone has equal access—white employees benefit from homogeneous networks. Equitable onboarding proactively creates access and support.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:52.948348+00', '2025-11-09 13:23:52.948348+00', NULL),
	('9421818f-d455-4c8c-a4dd-b2419c51bb5e', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', '8b4f132a-3abd-41ec-bc53-38c8baf2c314', 'multiple_choice', 'intermediate', 'Why is technology not neutral?', NULL, 'Technology is not neutral because: it''s designed by people (often homogeneous tech teams) whose biases shape design choices, it''s trained on historical data reflecting societal racism, algorithms optimize for patterns that include discriminatory patterns, deployment contexts are inequitable, and tech lacks transparency/accountability. The "neutral tech" myth allows companies to disclaim responsibility. In reality, facial recognition misidentifies Black faces, hiring algorithms screen out Black candidates, and predictive policing targets Black neighborhoods—by design, not accident.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:53.376091+00', '2025-11-09 13:23:53.376091+00', NULL),
	('c490f284-c657-4fef-8c67-591edd83c4aa', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', '8b4f132a-3abd-41ec-bc53-38c8baf2c314', 'multiple_choice', 'intermediate', 'What is the problem with predictive policing algorithms?', NULL, 'Predictive policing algorithms are trained on historical arrest data—which reflects biased policing, not actual crime patterns. If police historically over-policed Black neighborhoods (they did), algorithms "predict" crime there and send more police, leading to more arrests, which "confirms" the prediction. This creates a feedback loop amplifying existing bias. Algorithms don''t predict crime—they predict where police have been. They legitimize discriminatory policing under the guise of "objective" data, making racism harder to challenge.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:53.705579+00', '2025-11-09 13:23:53.705579+00', NULL),
	('030abd3c-3760-4be5-9255-35a4ed802bfa', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', '8b4f132a-3abd-41ec-bc53-38c8baf2c314', 'multiple_choice', 'intermediate', 'How do hiring algorithms discriminate against Black candidates?', NULL, 'Hiring algorithms perpetuate discrimination by: being trained on historical hiring data (which reflected bias against Black candidates), using proxies for race (names, zip codes, schools, speech patterns), penalizing resume gaps common in marginalized communities, optimizing for "culture fit" (code for homogeneity), and lacking transparency. Amazon''s algorithm penalized resumes mentioning "women''s" organizations. Similar patterns affect Black candidates. Algorithms don''t eliminate bias—they scale and legitimize it under claims of "objectivity."', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:54.041007+00', '2025-11-09 13:23:54.041007+00', NULL),
	('6b395d02-91ad-410f-b0ff-33d20cba1dd0', '65d1dbcd-b550-46b5-ad39-ff23cc8f14b2', '8b4f132a-3abd-41ec-bc53-38c8baf2c314', 'multiple_choice', 'intermediate', 'What do ethical AI practices require?', NULL, 'Ethical AI requires: diverse development teams (not just white/Asian men), rigorous bias audits across racial groups, algorithmic impact assessments before deployment, transparency about how algorithms work, accountability when harm occurs, participatory design centering affected communities, ongoing monitoring for disparate impacts, and willingness to NOT deploy when harm cannot be mitigated. "Moving fast and breaking things" breaks people. Ethical AI prioritizes justice over profit.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:54.33399+00', '2025-11-09 13:23:54.33399+00', NULL),
	('d99a47b0-7ad9-46ff-86b7-e00aea0b520f', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', '14ac4a0d-6f88-4fd6-b7f1-1a8bf0a96583', 'multiple_choice', 'intermediate', 'What is racial trauma?', NULL, 'Racial trauma (race-based traumatic stress) is the psychological and physical harm caused by experiences of racism. It includes: direct discrimination and violence, witnessing violence against other Black people, microaggressions and daily assaults, systemic oppression and marginalization, fear for safety due to racism. Symptoms mirror PTSD: hypervigilance, anxiety, depression, anger, physical health impacts, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It is intergenerational—passed through families and communities. It is legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not pathologizing natural responses to oppression.', 1, NULL, 0, NULL, '{}', true, '2025-11-09 13:23:54.803003+00', '2025-11-09 13:23:54.803003+00', NULL),
	('11bc50a7-2d41-4a81-9dd8-5698ba0e3c70', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', '14ac4a0d-6f88-4fd6-b7f1-1a8bf0a96583', 'multiple_choice', 'intermediate', 'How do you apply trauma-informed principles in anti-racist context?', NULL, 'Trauma-informed care in anti-racist context requires: Safety—Create physical and psychological safety, recognize racism as safety threat, address racist policies and practices. Trustworthiness—Be transparent about institutional racism, acknowledge harm, build trust through accountability. Choice and collaboration—Center Black agency and self-determination, recognize resilience and resistance not just victimhood. Empowerment—Support Black leadership, validate experiences of racism, provide resources and tools. Cultural responsiveness—Understand cultural context of trauma, work with community healers, avoid pathologizing cultural coping. Critical difference: mainstream trauma-informed care often ignores racism as trauma source—anti-racist approach names and addresses racism directly.', 1, NULL, 1, NULL, '{}', true, '2025-11-09 13:23:55.094892+00', '2025-11-09 13:23:55.094892+00', NULL),
	('7c305960-1af6-4483-af18-c7ebf4c488a6', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', '14ac4a0d-6f88-4fd6-b7f1-1a8bf0a96583', 'multiple_choice', 'intermediate', 'What is re-traumatization and how can it be prevented?', NULL, 'Re-traumatization happens when systems/services meant to help cause additional harm. For Black people, this includes: Being disbelieved or dismissed when reporting racism, Facing racism from providers meant to help, Institutional betrayal (organization ignores or covers up harm), Coercive practices removing choice and autonomy, Microaggressions and stereotyping, Culturally inappropriate or harmful interventions. Preventing re-traumatization: Address systemic racism in your institution, Build accountability for racist harm, Create genuine safety not just physical but psychological, Respect Black people''s autonomy and choices, Hire and support Black providers, Listen and believe when Black people name racism, Avoid power-over dynamics, Center healing and restoration not punishment.', 1, NULL, 2, NULL, '{}', true, '2025-11-09 13:23:55.376784+00', '2025-11-09 13:23:55.376784+00', NULL),
	('7be35117-05e8-4314-b304-3ae57404df51', 'e1bc05c2-dca5-4e22-a326-236823a9e09c', '14ac4a0d-6f88-4fd6-b7f1-1a8bf0a96583', 'multiple_choice', 'intermediate', 'What is vicarious trauma for anti-racism practitioners?', NULL, 'Vicarious trauma (secondary traumatic stress, compassion fatigue) affects people doing anti-racism work, especially Black practitioners: Repeatedly hearing/witnessing racist harm, Carrying others'' racial trauma, Working in racist institutions while addressing racism, Experiencing own racism while supporting others, Emotional labor of educating and managing white fragility. Symptoms: burnout, cynicism, hopelessness, anxiety, physical health issues, numbing. For Black practitioners: compounded by own experiences of racism, higher expectations and scrutiny, less institutional support. Addressing it requires: Organizational responsibility (not just individual self-care), Supervision and peer support, Rest and boundaries, Healing-centered approaches, Addressing root causes (institutional racism) not just symptoms. Self-care is not bubble baths—it is systemic change.', 1, NULL, 3, NULL, '{}', true, '2025-11-09 13:23:55.674708+00', '2025-11-09 13:23:55.674708+00', NULL);


--
-- Data for Name: pool_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: prediction_models; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: question_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."question_options" ("id", "question_id", "option_text", "option_html", "is_correct", "feedback", "order_index", "metadata", "created_at") VALUES
	('db4e94d7-bdc7-403f-9aaf-77a2f70337bc', '9bb103b2-ce49-45f0-9589-0d2f431209ca', 'Any public support for racial justice', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:04.403231+00'),
	('172a3af4-a431-4ccc-baa1-67f9bc0a3638', '9bb103b2-ce49-45f0-9589-0d2f431209ca', 'Actions taken primarily for personal benefit, social approval, or organizational image rather than genuine commitment to change', NULL, true, 'Performative allyship is action taken primarily for appearance, social credit, or personal benefit rather than genuine commitment to anti-racist change. It often centers the ally rather than those experiencing racism, stops at symbolic gestures without structural change, and disappears when no longer trending. Genuine allyship centers those harmed, takes risks, sustains over time, and prioritizes accountability over comfort.', 1, '{}', '2025-11-09 13:23:04.483789+00'),
	('32a98137-05fa-460d-9a88-c791b98d0075', '9bb103b2-ce49-45f0-9589-0d2f431209ca', 'Attending protests or posting on social media', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:04.524139+00'),
	('90643fe9-29d6-46fd-80ae-ff104b641a4f', '9bb103b2-ce49-45f0-9589-0d2f431209ca', 'Making mistakes as an ally', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:04.586366+00'),
	('beb81443-65ab-4943-82c3-b446c08780d2', '23f33151-99f3-4a97-9f05-6206c3442b86', 'Including any Black people in your organization', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:04.789591+00'),
	('8c228cc8-d838-48f5-8402-29a58070ef04', '23f33151-99f3-4a97-9f05-6206c3442b86', 'Including minimal representation of Black people to appear diverse without addressing systemic barriers or sharing power', NULL, true, 'Tokenism is minimal inclusion for appearance without structural change. Examples: the one Black person on panels, in marketing, or in leadership while systemic barriers remain; asking Black employees to represent all Black people; diversifying optics without diversifying power or decision-making. Tokenism harms by extracting labor, exposing people to hostile environments, and creating illusion of progress without actual equity.', 1, '{}', '2025-11-09 13:23:04.853612+00'),
	('5ecaef90-8668-43f9-9123-b1e8a81f09e0', '23f33151-99f3-4a97-9f05-6206c3442b86', 'Celebrating Black History Month', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:04.9238+00'),
	('ec717ae4-e687-4b61-b38a-869e0cb21fc9', '23f33151-99f3-4a97-9f05-6206c3442b86', 'Hiring based on qualifications', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:05.013949+00'),
	('e8f6f5c1-f880-4a96-b8cb-cd6bbd6718eb', 'def3ce75-a00a-4df7-aca1-85431c9ceec8', 'Remind everyone you have privilege', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:05.204139+00'),
	('a6f940f6-cac6-4a1a-885f-b2204dc8b828', 'def3ce75-a00a-4df7-aca1-85431c9ceec8', 'Leverage access, credibility, and resources to advance anti-racist outcomes without centering yourself', NULL, true, 'Strategic use of privilege means leveraging your access, credibility, and resources for anti-racist outcomes. Examples: amplifying Black voices in rooms they''re excluded from; using financial resources to fund Black-led organizations; interrupting racism in white spaces; taking professional risks to advocate for equity. Key: center those experiencing harm, not your allyship. Don''t announce "I''m using my privilege"—just do it.', 1, '{}', '2025-11-09 13:23:05.249256+00'),
	('d19270f4-4e86-48f2-8174-77d85622d40b', 'def3ce75-a00a-4df7-aca1-85431c9ceec8', 'Feel guilty about privilege', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:05.315862+00'),
	('116eb8cc-442c-4542-ba9a-adf534a01c3c', 'def3ce75-a00a-4df7-aca1-85431c9ceec8', 'Give up all privilege', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:05.386035+00'),
	('e8725093-8c5b-4401-ad34-19445be99be6', '298907a3-c26f-4dd2-9826-87ed1287b71e', 'Defend yourself and explain your intentions', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:05.623786+00'),
	('8b5278f7-1f35-4efb-9268-33e149f23849', '298907a3-c26f-4dd2-9826-87ed1287b71e', 'Listen to feedback, apologize without centering your feelings, and commit to changed behavior', NULL, true, 'When you harm (and you will): Listen without defensiveness. Apologize specifically for the harm caused, not just for "offense taken." Don''t center your guilt, intentions, or feelings. Don''t demand reassurance or emotional labor. Commit to learning and changed behavior. Follow through. Making mistakes is inevitable; how you respond determines whether you''re genuinely accountable or just performing allyship.', 1, '{}', '2025-11-09 13:23:05.694148+00'),
	('ee346ae9-1e1a-4c8c-bedf-d4fafafe0849', '298907a3-c26f-4dd2-9826-87ed1287b71e', 'Give up on being an ally', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:05.7596+00'),
	('68bbbb7a-9e7e-44e3-82a0-096f2f020cca', '298907a3-c26f-4dd2-9826-87ed1287b71e', 'Explain why it wasn''t really a mistake', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:05.831902+00'),
	('0fcec4e3-37aa-4570-a583-09e4a00c5335', 'b70b2ff4-7688-4ae5-b580-3f1aefa13764', 'Add a few lessons about Indigenous or Black people', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:06.127548+00'),
	('e0afbc1e-8e5c-41f9-b573-321b6e277c39', 'b70b2ff4-7688-4ae5-b580-3f1aefa13764', 'Critically examine whose knowledge is centered, whose is erased, and fundamentally restructure curriculum to challenge colonial narratives', NULL, true, 'Decolonizing curriculum means fundamentally examining and challenging whose knowledge, perspectives, and narratives are centered as "truth" and whose are marginalized or erased. It requires moving beyond additive approaches (adding a Black History Month lesson) to transformative change: centering Indigenous and Black voices, teaching honest history including genocide and slavery, examining power structures, and recognizing multiple ways of knowing beyond Eurocentric frameworks.', 1, '{}', '2025-11-09 13:23:06.181349+00'),
	('e18c83eb-13e8-425f-a1b0-69261ad11756', 'b70b2ff4-7688-4ae5-b580-3f1aefa13764', 'Remove all Canadian history', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:06.238571+00'),
	('37feff7e-6d82-472a-b6b0-05291d69ae34', 'b70b2ff4-7688-4ae5-b580-3f1aefa13764', 'Only teach about oppression', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:06.32083+00'),
	('a8643789-b27a-4329-9bb2-9640eb829587', '4c348b55-e3f4-4f80-b02f-6827b93592e2', 'Black students are disciplined at equal rates to white students', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:06.477261+00'),
	('3cf61d66-3d1e-4278-b987-f9eb0c3d93ed', '4c348b55-e3f4-4f80-b02f-6827b93592e2', 'Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students even when behaviors are similar', NULL, true, 'Canadian data consistently show Black students, particularly Black boys, are suspended and expelled at 2-3 times the rate of white students. Studies show they are disciplined more harshly for the same behaviors, are more likely to be labeled "defiant" or "aggressive," and face school-based police involvement at higher rates. This is not about behavior differences—it''s about how Black students'' behavior is interpreted and responded to through biased lenses.', 1, '{}', '2025-11-09 13:23:06.528169+00'),
	('289ea601-cb1f-45e7-b3bf-3543c50f09eb', '4c348b55-e3f4-4f80-b02f-6827b93592e2', 'Discipline disparities only exist in the United States', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:06.649045+00'),
	('a175fb0a-6a20-4e74-99e5-d0e4d1c5c7cb', '4c348b55-e3f4-4f80-b02f-6827b93592e2', 'Black students misbehave more than other students', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:06.710247+00'),
	('b6b978fd-b3d7-461b-adc6-04f9ee7ab433', 'ceca8c66-ad69-4176-bb6e-13cb9044195f', 'Celebrating cultural holidays', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:06.865837+00'),
	('cff7edc4-6423-42db-94f9-4903b5858c0b', 'ceca8c66-ad69-4176-bb6e-13cb9044195f', 'Teaching practices that sustain and affirm students'' cultural identities, languages, and ways of knowing as assets', NULL, true, 'Culturally sustaining pedagogy (Django Paris) goes beyond cultural competence to actively sustain and affirm students'' cultural identities, languages, histories, and ways of knowing. It positions culture as an asset, not a deficit. For Black students, this means affirming Black language practices, centering Black history and contributions, connecting curriculum to Black community experiences, and recognizing diverse Black identities. It''s not additive—it''s transformative.', 1, '{}', '2025-11-09 13:23:06.915357+00'),
	('a9571bd1-611a-4312-a0a6-1759624e8bae', 'ceca8c66-ad69-4176-bb6e-13cb9044195f', 'Treating all students exactly the same', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:06.964614+00'),
	('c35ca2f8-8362-4691-91b6-a02da6a3754a', 'ceca8c66-ad69-4176-bb6e-13cb9044195f', 'Learning about different cultures', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:07.015531+00'),
	('1fe9b71c-efdd-4679-85c7-a3f1183728ec', '1887e377-e69a-47e4-bf60-b396d1947ab5', 'Only contact them when there are problems', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:07.231172+00'),
	('05e104f0-512f-469f-836f-32466ba53446', 'dcdc1d5c-30f4-4abe-8fa8-4247039a3c74', 'Only explicit racism causes misdiagnosis', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:10.113811+00'),
	('a509bedd-703e-4a9a-81c4-7ae27241bc3c', '2f91fdf7-60a5-4d0e-846c-85d978df7b43', 'Only about individual choices', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:10.280928+00'),
	('334370e2-4959-4185-972e-8f5e3502a277', '04e3d9ce-1880-4e42-b9b2-edd74e118530', 'To satisfy employee demands', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:20.243022+00'),
	('48fbe80d-dfe3-4db4-9850-75cc4fab199f', 'c271f0d0-b77d-44b5-a9b0-df4f8b1c61cb', 'Only quantitative demographic data', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:20.569582+00'),
	('24b7b923-c6ba-4b61-a365-19bae2c1b959', 'c271f0d0-b77d-44b5-a9b0-df4f8b1c61cb', 'Only employee survey responses', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:20.623547+00'),
	('f43da9ba-ef87-4c84-86e2-ff1310f67767', '1887e377-e69a-47e4-bf60-b396d1947ab5', 'Recognize and dismantle deficit narratives, build trust, share power, and partner with families as educational experts on their children', NULL, true, 'Black families often face deficit narratives that blame them for systemic failures. Authentic engagement requires: examining your own biases, recognizing barriers schools create, building trust through consistent positive contact, seeing families as assets and experts on their children, sharing power in decision-making, and addressing systemic issues rather than focusing on "fixing" families. When schools fail Black students, examine the school—not the family.', 1, '{}', '2025-11-09 13:23:07.284197+00'),
	('0cc2c289-c56b-4548-98dc-e87749475a43', '1887e377-e69a-47e4-bf60-b396d1947ab5', 'Assume they don''t care about education', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:07.335897+00'),
	('77c68738-9093-46de-a09a-3e49f771b160', '1887e377-e69a-47e4-bf60-b396d1947ab5', 'Tell them what their children need to do differently', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:07.379712+00'),
	('e255d3f9-0b4e-43e9-9d1c-7fed485cba6f', '959f01d6-a8f5-4e8d-bb44-9da069e5f09e', 'There genuinely are not enough qualified Black candidates', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:07.703313+00'),
	('233abce6-b366-4406-9f9c-41b7ca722a13', '959f01d6-a8f5-4e8d-bb44-9da069e5f09e', 'The claim that lack of Black lawyers is due to pipeline rather than systemic barriers in hiring, retention, and advancement', NULL, true, 'The "pipeline problem" narrative blames lack of Black representation on insufficient candidates rather than examining systemic barriers. In reality, Black law graduates face bias in hiring (coded language, "culture fit" screening), biased performance evaluations, exclusion from informal networks, microaggressions, glass ceilings blocking partnership, and hostile environments driving them out. The issue is not pipeline—it''s what happens after graduation. Focusing on pipeline allows firms to avoid accountability for retention and advancement failures.', 1, '{}', '2025-11-09 13:23:07.786683+00'),
	('a089aefe-33a6-4130-a96f-b14ea8a77cb8', '959f01d6-a8f5-4e8d-bb44-9da069e5f09e', 'Black students do not want to pursue law', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:07.836869+00'),
	('ab5ad747-a463-465e-b240-86a3cc8608b0', '959f01d6-a8f5-4e8d-bb44-9da069e5f09e', 'Law schools have done enough to address diversity', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:07.886826+00'),
	('952b07fc-7abf-4968-ae20-4caa961addaa', '6a0d2d46-5304-411c-9c44-f1c7dff28c5f', 'Black and white defendants receive equal sentences', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:08.051528+00'),
	('6f7a5937-937a-4fa2-9f28-a540f72c34a0', '6a0d2d46-5304-411c-9c44-f1c7dff28c5f', 'Black defendants receive harsher sentences than white defendants for similar offenses, even controlling for criminal history', NULL, true, 'Canadian data show Black defendants receive harsher sentences than white defendants for similar offenses, even after controlling for criminal history and offense severity. Black defendants are more likely to be denied bail, receive custodial sentences rather than alternatives, and get longer prison terms. This reflects implicit bias in how judges perceive Black defendants (more dangerous, less remorseful, greater flight risk) and systemic racism in sentencing guidelines and judicial discretion.', 1, '{}', '2025-11-09 13:23:08.11012+00'),
	('a0c8083a-0353-41a1-9f78-83a695094ca6', '6a0d2d46-5304-411c-9c44-f1c7dff28c5f', 'Judges are completely objective', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:08.178809+00'),
	('96a1201c-32f0-4654-b80b-eca936564662', '6a0d2d46-5304-411c-9c44-f1c7dff28c5f', 'Sentencing disparities only exist in the United States', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:08.222235+00'),
	('992ee34b-c65c-4cab-aa27-9e096e437b9f', '4a37ec91-47ca-4099-aef9-5fb3bfc8afff', 'Black people do not want lawyers', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:08.448986+00'),
	('d20cc258-8fef-4af5-912a-241ba8eeda23', '4a37ec91-47ca-4099-aef9-5fb3bfc8afff', 'High costs, inadequate legal aid, mistrust of legal system, lack of culturally competent representation, and systemic barriers to access', NULL, true, 'Black communities face multiple barriers to legal representation: high legal costs (hourly rates exclude many), chronically underfunded legal aid systems, lack of lawyers who understand anti-Black racism, mistrust of legal systems that have historically harmed Black people, geographic barriers (legal deserts in Black neighborhoods), language and cultural barriers, and fear of system involvement. These barriers mean Black people often navigate legal issues without adequate representation, perpetuating injustice.', 1, '{}', '2025-11-09 13:23:08.512639+00'),
	('1a739aa9-dbcc-42d4-81bf-91ca09e4f070', '4a37ec91-47ca-4099-aef9-5fb3bfc8afff', 'There are no barriers', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:08.589194+00'),
	('7275c25c-6d2f-4bcb-9923-8b4ef6bdad28', '4a37ec91-47ca-4099-aef9-5fb3bfc8afff', 'Only financial barriers matter', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:08.664969+00'),
	('ed58188e-b385-4c06-9057-a3d257eb4c1b', '87e3217f-65a7-4c2e-978e-a9867f687ad7', 'Treating all clients exactly the same', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:08.898864+00'),
	('cc183f2c-8b85-426b-8733-5283e8d6000d', '87e3217f-65a7-4c2e-978e-a9867f687ad7', 'Centering Black clients'' voices, challenging bias in proceedings, using legal skills for justice, and examining your own biases', NULL, true, 'Anti-racist legal practice requires: centering Black clients as experts on their own lives, actively identifying and challenging bias in legal proceedings (voir dire, sentencing submissions), using legal skills strategically for racial justice (pro bono, impact litigation, policy advocacy), building trust with Black communities, examining your own biases and how they shape legal strategy, and advocating for systemic change beyond individual cases. Treating everyone "the same" ignores how racism operates and perpetuates inequity.', 1, '{}', '2025-11-09 13:23:08.96913+00'),
	('8f25e032-5d59-4b5e-ae1f-b8604ed31ea4', '87e3217f-65a7-4c2e-978e-a9867f687ad7', 'Avoiding discussion of race', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:09.015924+00'),
	('0eb01cd7-c0f9-4028-a8d4-09ef0e818434', '87e3217f-65a7-4c2e-978e-a9867f687ad7', 'Following standard procedures without question', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:09.069734+00'),
	('d89ebd10-3941-409e-af2e-1d3c11202bc1', '11df4b6e-ba1d-4516-a4e6-1e237422ad99', 'Only happens with direct violence', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:09.53645+00'),
	('bb6448fc-e86d-478e-a9f0-ec957928da44', '11df4b6e-ba1d-4516-a4e6-1e237422ad99', 'The cumulative psychological and emotional harm caused by experiences of racism, including discrimination, microaggressions, and systemic oppression', NULL, true, 'Racial trauma (race-based traumatic stress) is real psychological harm caused by experiences of racism. It includes: direct discrimination, microaggressions, witnessing violence against Black people, systemic oppression, and fear for safety. Symptoms mirror PTSD: hypervigilance, anxiety, depression, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It affects people across the lifespan and is intergenerational. Mental health providers must recognize racial trauma as legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not dismiss it or pathologize natural responses to oppression.', 1, '{}', '2025-11-09 13:23:09.594149+00'),
	('40bab69c-583d-4ee2-abc3-2dbba6a71b5b', '11df4b6e-ba1d-4516-a4e6-1e237422ad99', 'Not a real clinical issue', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:09.635923+00'),
	('14d12ce9-27bb-4e16-ac23-2fd80dcfe276', '11df4b6e-ba1d-4516-a4e6-1e237422ad99', 'Only affects children', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:09.680106+00'),
	('a0e734ec-8c0a-4204-bafb-3100c354423e', 'dcdc1d5c-30f4-4abe-8fa8-4247039a3c74', 'Clinicians treat all patients equally', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:09.884138+00'),
	('fcb9fae8-8642-4d4f-bc03-5ef7f6161cd5', 'dcdc1d5c-30f4-4abe-8fa8-4247039a3c74', 'Black patients are overdiagnosed with schizophrenia and severe mental illness while trauma, depression, and anxiety are underdiagnosed or dismissed', NULL, true, 'Research shows Black patients are disproportionately diagnosed with schizophrenia and bipolar disorder even when presenting with same symptoms as white patients diagnosed with depression or PTSD. This reflects: implicit bias (associating Blackness with danger/aggression), historical stereotypes (dangerous Black body trope), lack of cultural understanding (misinterpreting cultural expressions as pathology), and systemic racism in diagnostic criteria development. Consequences include: inappropriate medication, stigma, coercive treatment, and missed trauma/depression treatment. Addressing diagnostic bias requires examining implicit biases and cultural assumptions in assessment.', 1, '{}', '2025-11-09 13:23:09.960478+00'),
	('343967dd-41b1-45e9-9e1d-64c3cdd78dc4', 'dcdc1d5c-30f4-4abe-8fa8-4247039a3c74', 'Diagnosis is completely objective', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:10.014745+00'),
	('dd33d856-c82d-4de2-9418-79d7aa3138d3', '2f91fdf7-60a5-4d0e-846c-85d978df7b43', 'Systemic barriers including cost, lack of Black therapists, cultural mistrust from historical abuse, stigma, and inadequate insurance coverage', NULL, true, 'Black communities face multiple barriers: Cost (therapy expensive, insurance inadequate), Lack of representation (few Black mental health providers, cultural mismatch with white therapists), Historical mistrust (legacy of medical abuse, forced sterilization, unethical research), Stigma (mental health stigmatized in many communities due to survival necessity of "strength"), Systemic failures (services in white neighborhoods, culturally inappropriate treatment models). These are not individual failures but systemic barriers. Addressing them requires: investing in Black mental health professionals, culturally responsive services, community-based models, and affordable/accessible care.', 1, '{}', '2025-11-09 13:23:10.332369+00'),
	('aab4863f-b415-4c67-ab9a-6f8fbd16eeb7', '2f91fdf7-60a5-4d0e-846c-85d978df7b43', 'Services are equally accessible to all', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:10.382503+00'),
	('cf8f0fdd-446f-4c0a-8ab9-3ecb21e2c3cf', '2f91fdf7-60a5-4d0e-846c-85d978df7b43', 'Black communities do not need mental health services', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:10.432996+00'),
	('e54bf013-c28d-4fdb-8f40-87c809352643', 'bb517f18-1247-47cd-a3e7-8d4ebfe83876', 'Same as cultural competence', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:10.587616+00'),
	('b2e7c339-5828-4331-8db6-4331209d1de2', 'bb517f18-1247-47cd-a3e7-8d4ebfe83876', 'Ongoing commitment to self-reflection, recognizing power imbalances, learning from clients as experts on their own culture, and addressing systemic inequities', NULL, true, 'Cultural humility moves beyond "cultural competence" (implies mastery, checklist approach). It requires: Self-reflection on own biases and positionality, Recognizing power imbalances in therapist-client relationship, Centering client as expert on their own cultural experience, Ongoing learning and openness to being wrong, Addressing systemic inequities not just individual cultural differences. Cultural humility acknowledges you will never "master" someone else''s culture—you commit to listening, learning, and interrogating power. For anti-racist practice, this means naming racism, examining white supremacy in therapy models, and challenging clinical assumptions rooted in white norms.', 1, '{}', '2025-11-09 13:23:10.657939+00'),
	('fd735eff-4030-470e-9464-5beba586ecaa', 'bb517f18-1247-47cd-a3e7-8d4ebfe83876', 'Learning facts about cultures', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:10.718485+00'),
	('d4262703-c753-4d77-8b10-a731e99736a6', 'bb517f18-1247-47cd-a3e7-8d4ebfe83876', 'Not necessary for good practice', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:10.769072+00'),
	('4dd4c71c-9144-4005-ad2e-ee73eb637944', 'e7feaecb-b8e2-4610-a0fe-a8bc37680db8', 'Nothing, they are the same', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:11.033267+00'),
	('52e104e6-7d97-46ef-923b-68476f76dde5', 'e7feaecb-b8e2-4610-a0fe-a8bc37680db8', 'Accomplices take risks and give up comfort/power', NULL, true, 'Accomplices go beyond comfortable support to take risks, make sacrifices, and work in solidarity with Black communities.', 1, '{}', '2025-11-09 13:23:11.08045+00'),
	('1a2a434d-d502-495c-ae39-9f5637193f7d', 'e7feaecb-b8e2-4610-a0fe-a8bc37680db8', 'Allies are better than accomplices', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:11.131974+00'),
	('191304e0-c145-49af-ab9f-5cbb25490b61', 'e7feaecb-b8e2-4610-a0fe-a8bc37680db8', 'Accomplices only do illegal things', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:11.177895+00'),
	('7404c7ca-63a2-437e-88cd-adefd1b3d94a', '623d9d9b-7c65-430b-a06c-0c6383d565ba', 'Repeat their ideas as your own for more reach', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:11.387158+00'),
	('afc3562c-b1a1-4cb0-bc9c-a239543f3578', '623d9d9b-7c65-430b-a06c-0c6383d565ba', 'Explicitly credit them and direct people to them', NULL, true, 'Always explicitly credit Black voices and direct people to learn directly from them, not through you.', 1, '{}', '2025-11-09 13:23:11.431983+00'),
	('d6d539cc-ccd5-43e5-8294-d791cdc1b224', '623d9d9b-7c65-430b-a06c-0c6383d565ba', 'Add your own perspective to improve the message', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:11.477449+00'),
	('506f338b-a12a-40cc-9ac4-afc730a5d6fb', '623d9d9b-7c65-430b-a06c-0c6383d565ba', 'Summarize so others understand better', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:11.527539+00'),
	('a06413ed-680c-400e-80c2-468ac38c4e7a', '11cd9bfe-5a09-431f-9c2c-318a750f8d8f', 'Give up because you are not cut out for this', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:11.695532+00'),
	('812d123f-6ca2-4043-a102-fdb8d3307cee', '11cd9bfe-5a09-431f-9c2c-318a750f8d8f', 'Apologize, learn, and continue the work', NULL, true, 'Mistakes are inevitable. Acknowledge harm, learn from it, and continue doing better. Growth requires staying engaged even when it''s hard.', 1, '{}', '2025-11-09 13:23:11.737793+00'),
	('41cf35ba-4eab-4d7a-bfdf-e02fe1aef884', '11cd9bfe-5a09-431f-9c2c-318a750f8d8f', 'Explain your intent repeatedly', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:11.78408+00'),
	('3c531aa7-78ca-4968-a9be-511456f2a1dc', '11cd9bfe-5a09-431f-9c2c-318a750f8d8f', 'Stop so you don''t cause more harm', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:11.837611+00'),
	('2b90f08e-7a67-4b4c-ad51-cde4ae935967', '6be03fcf-687f-455e-a062-cae4e2ac75a1', 'Canada never had slavery', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:12.085368+00'),
	('9f559579-b17b-4311-8335-cec518136a29', '6be03fcf-687f-455e-a062-cae4e2ac75a1', 'Slavery existed in Canada for over 200 years, from early 1600s until 1834', NULL, true, 'Slavery was legal and practiced in what would become Canada from the early 1600s until the British Empire abolished it in 1834. Approximately 4,200 people were enslaved in New France alone, and slavery continued under British rule.', 1, '{}', '2025-11-09 13:23:12.129718+00'),
	('8d2af9b0-b602-4f19-a60a-edf10d3b53d4', '6be03fcf-687f-455e-a062-cae4e2ac75a1', 'Only the U.S. had slavery in North America', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:12.173661+00'),
	('1d46cda4-8eeb-4680-ad3a-686339017246', '6be03fcf-687f-455e-a062-cae4e2ac75a1', 'Canada abolished slavery before the American Revolution', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:12.252655+00'),
	('31890497-ed53-472c-a4c5-8a71dd5eb938', '420a7478-7430-4ed2-96a7-4e7b5a8ef8a0', 'Immediately freed all enslaved people', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:12.429417+00'),
	('404953f1-0e06-42f2-9d81-393c6846f0e0', '420a7478-7430-4ed2-96a7-4e7b5a8ef8a0', 'Freed children born to enslaved mothers, but only at age 25, and did not free anyone currently enslaved', NULL, true, 'The Act did NOT immediately free anyone. Children born after 1793 to enslaved mothers would be freed at age 25, but people already enslaved remained in bondage for life. It was a very gradual change that allowed slavery to continue for decades.', 1, '{}', '2025-11-09 13:23:12.499746+00'),
	('7b67e71b-fb6c-40e9-9ddf-2cd9b5721017', '420a7478-7430-4ed2-96a7-4e7b5a8ef8a0', 'Abolished slavery completely in all of Canada', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:12.564234+00'),
	('e51c03b4-b1f4-4b12-af37-5a7ea21b4838', '420a7478-7430-4ed2-96a7-4e7b5a8ef8a0', 'Made slavery illegal across the British Empire', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:12.619906+00'),
	('d9382224-cdf5-4538-b0ac-e59daa5fec66', '5c97feb3-2f09-467a-a8b5-512a0f50bef2', 'Complete equality and acceptance', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:12.76209+00'),
	('cae82d4c-3d6b-4582-8f7c-34d25347e0cf', '5c97feb3-2f09-467a-a8b5-512a0f50bef2', 'A paradise free from all discrimination', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:12.8072+00'),
	('2dfac75c-afee-4f8e-819d-5c779d11ab4e', '5c97feb3-2f09-467a-a8b5-512a0f50bef2', 'Legal freedom but also severe discrimination, segregation, and limited opportunities', NULL, true, 'While Canada offered legal freedom (after 1834) and people couldn''t be returned to slavery, Black arrivals faced severe discrimination, segregated schools and public spaces, limited economic opportunities, violence, and harassment. Canada was safer than the U.S. but not a paradise.', 2, '{}', '2025-11-09 13:23:12.847947+00'),
	('be5b2cfc-926d-474b-9d86-c971398d0652', '5c97feb3-2f09-467a-a8b5-512a0f50bef2', 'Immediate wealth and prosperity', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:12.901646+00'),
	('f6687035-3e8e-4bd4-b232-c589203bee76', '457e0ba9-bdf8-4853-9150-62ced9353b05', '1834, when slavery was abolished', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:13.104983+00'),
	('c3d49ea8-e45d-481a-91d2-49b399e91877', '457e0ba9-bdf8-4853-9150-62ced9353b05', '1867, at Confederation', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:13.148977+00'),
	('0d9e284a-f259-40fb-ba94-b8f0aed96968', '457e0ba9-bdf8-4853-9150-62ced9353b05', '1965, in Ontario', NULL, true, 'The last legally segregated schools in Ontario closed in 1965 in Merlin and North Colchester. Segregated schools were legal in Ontario from the 1850s and persisted well into the civil rights era. Nova Scotia also had segregated schools into the 1960s.', 2, '{}', '2025-11-09 13:23:13.191913+00'),
	('875ad706-2a9e-4a7c-bf4f-13e6fbccd687', '457e0ba9-bdf8-4853-9150-62ced9353b05', 'Canada never had segregated schools', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:13.238353+00'),
	('9b74ba5d-5770-442c-af51-4957da4ecf3c', '4bf17ff1-30b5-4daa-920d-0e16a854d1d2', 'She was celebrated as the first Black movie star', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:13.401976+00'),
	('92207a2d-6508-4528-aacb-d304ce3feeb2', '3bca78fa-a4f5-462a-8e1e-6b762d101cb2', 'Trust that people will do the right thing', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:16.407248+00'),
	('55557e1a-925c-4392-b8bf-fffbc8d85031', '1596d821-1330-404a-94bf-84f681f6d68b', 'Black people are settlers', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:22.830148+00'),
	('33c904e8-776d-479c-9a70-44eaa9463eb2', '4bf17ff1-30b5-4daa-920d-0e16a854d1d2', 'She was arrested and jailed for sitting in the whites-only section of a Nova Scotia theatre', NULL, true, 'Viola Desmond, a Nova Scotia businesswoman, was arrested, jailed, and fined for refusing to leave the whites-only section of a movie theatre. She fought her conviction but lost. She received a posthumous pardon in 2010 and now appears on the Canadian $10 bill.', 1, '{}', '2025-11-09 13:23:13.451183+00'),
	('935dae51-36ec-4265-8b12-13701416494b', '4bf17ff1-30b5-4daa-920d-0e16a854d1d2', 'She became the first Black person elected to Parliament', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:13.491783+00'),
	('c01e5f9f-67bf-4619-ba26-69802a7f95b6', '4bf17ff1-30b5-4daa-920d-0e16a854d1d2', 'She opened Canada''s first integrated restaurant', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:13.529469+00'),
	('55b5e2e4-36be-491b-923a-f77460ef8e36', 'e195091a-18fa-45cd-809b-bb849439a5c1', 'Rules about lawn maintenance', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:13.684704+00'),
	('81ca20ee-18d5-4db6-8815-4a7cc1ee29b8', 'e195091a-18fa-45cd-809b-bb849439a5c1', 'Legal clauses preventing sale of property to Black, Jewish, or Asian people', NULL, true, 'Restrictive covenants were legal clauses in property deeds explicitly preventing sale, rental, or transfer to people based on race (Black, Jewish, Asian, etc.). They were common in Canadian cities until ruled illegal in Ontario in 1950, though informal discrimination continued.', 1, '{}', '2025-11-09 13:23:13.742771+00'),
	('a3e709a7-76ff-42cb-9dc3-db4460eb1d00', 'e195091a-18fa-45cd-809b-bb849439a5c1', 'Guidelines for building heights', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:13.809474+00'),
	('cd2af88b-21de-4396-b7d6-5d17cfc42ae0', 'e195091a-18fa-45cd-809b-bb849439a5c1', 'Requirements for homeowner association membership', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:13.864305+00'),
	('e01c9a37-0e9e-42a0-a934-ca64fda301e8', '41a3fb01-0ba5-4a95-8f05-1b1c42af5a18', 'Canada has always been better than the United States', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:14.076916+00'),
	('004edbab-6d7a-4f2b-8640-262f967ca9ea', '41a3fb01-0ba5-4a95-8f05-1b1c42af5a18', 'Current racial disparities are the result of long-standing systemic exclusion, not culture or individual choices', NULL, true, 'Black Canadian history shows over 400 years of systemic exclusion (slavery, segregation, immigration restrictions, discrimination) that created and perpetuated inequality. Current disparities in wealth, employment, criminal justice, etc. are not coincidental—they''re the predictable results of historical and ongoing systemic racism.', 1, '{}', '2025-11-09 13:23:14.131631+00'),
	('3123ce37-073f-4bfd-8c51-a3be485cd31d', '41a3fb01-0ba5-4a95-8f05-1b1c42af5a18', 'Racism is a thing of the past', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:14.201656+00'),
	('2eee78ef-b2d5-42b0-b902-077f02bcd662', '41a3fb01-0ba5-4a95-8f05-1b1c42af5a18', 'Black people haven''t been in Canada very long', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:14.253524+00'),
	('ee70a5fa-8a2d-4ac2-b153-473a959fc9eb', '9606e085-a595-41a2-9e69-ec03171c535b', 'Canada was always a sanctuary from racism', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:14.479182+00'),
	('d5523d57-1aaa-4248-ab1b-a09d937df67a', '9606e085-a595-41a2-9e69-ec03171c535b', 'Canada had slavery, segregation, and explicit white supremacist policies well into the 20th century', NULL, true, 'Canada practiced slavery for over 200 years, had legally segregated schools until 1965, used restrictive covenants to enforce housing segregation, and maintained explicitly racist immigration policies until 1967. The myth of Canadian exceptionalism erases this history and prevents accountability.', 1, '{}', '2025-11-09 13:23:14.528379+00'),
	('ea131402-db70-48a1-ac72-1537fb199294', '9606e085-a595-41a2-9e69-ec03171c535b', 'Racism only existed in the United States', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:14.57397+00'),
	('3ebebbc0-e518-4d66-988d-37a9643b1520', '9606e085-a595-41a2-9e69-ec03171c535b', 'Canada solved racism with multiculturalism in 1971', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:14.63829+00'),
	('3480b03f-3e20-4825-b8b5-3aaa004bea2b', '8211021f-6c72-4171-8e25-b850aac93323', 'Racial disparities have been eliminated', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:14.782246+00'),
	('6cbda004-5eed-4c48-9672-8d618057ed33', '8211021f-6c72-4171-8e25-b850aac93323', 'Black Canadians face measurable disparities in policing, education, employment, health, and nearly every other indicator', NULL, true, 'Contemporary data shows Black Canadians are overpoliced, earn less, experience higher unemployment, face education streaming, have worse health outcomes, are overrepresented in child welfare and incarceration, and underrepresented in leadership. These aren''t cultural—they''re systemic.', 1, '{}', '2025-11-09 13:23:14.824721+00'),
	('2558c913-423e-40ee-8bbf-fc40c73e347d', '8211021f-6c72-4171-8e25-b850aac93323', 'Any remaining gaps are due to cultural differences', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:14.886429+00'),
	('d1746cc2-4939-4fd9-a56e-56798ee270fc', '8211021f-6c72-4171-8e25-b850aac93323', 'Canada is now perfectly equal', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:14.957737+00'),
	('32cdc4dd-4446-4864-9778-b8a0696fe5b2', 'ed1773fe-a164-426b-a69d-49e57b066331', 'They passively accepted discrimination', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:15.110397+00'),
	('3cc88ea6-7af2-4764-869b-6e7a8c7ff6fc', 'ed1773fe-a164-426b-a69d-49e57b066331', 'They consistently organized, resisted, and fought for justice', NULL, true, 'At every period, Black Canadians resisted: escaping slavery, building communities despite hostility, organizing politically (National Unity Association, Negro Citizenship Association), legal challenges (Viola Desmond, restrictive covenants), media activism, and contemporary movements like BLM-TO. Resistance is central to Black Canadian history.', 1, '{}', '2025-11-09 13:23:15.162301+00'),
	('b584d2d8-e229-4731-b446-3faadadd7ddd', 'ed1773fe-a164-426b-a69d-49e57b066331', 'They left Canada entirely', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:15.225149+00'),
	('20ccf6e3-a11e-43dd-ad3d-e5a02f1d0ab7', 'ed1773fe-a164-426b-a69d-49e57b066331', 'They waited for white people to help them', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:15.296644+00'),
	('a61f446e-c199-4e2e-a002-049c7b3f6f75', '9285aae1-d227-4791-a25b-1a2c96306a3f', 'Hiring diverse employees', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:15.591749+00'),
	('8a717a05-2ed9-46dd-b5f7-ab1e8c564194', '9285aae1-d227-4791-a25b-1a2c96306a3f', 'Systemic commitment to identifying and dismantling racism in policies, practices, culture, and outcomes with accountability and sustained action', NULL, true, 'Anti-racist organizations go beyond diversity and inclusion to actively dismantle systemic racism. Characteristics: Leadership commitment with accountability and consequences, Comprehensive audit of policies for racist impacts, Equitable representation at all levels especially leadership, Pay equity and wealth redistribution, Anti-racist culture not just diverse faces, Meaningful power-sharing and Black leadership, Accountability structures with transparency and reporting, Resource allocation proportional to goals, Addressing harm with consequences not excuses, Community accountability beyond organization. It is not performative statements or one-time trainings—it is sustained systemic transformation with resources, power-sharing, and accountability. Measurement includes outcomes not just intentions.', 1, '{}', '2025-11-09 13:23:15.66643+00'),
	('9818a548-5e1a-4294-8477-1531ea730056', '9285aae1-d227-4791-a25b-1a2c96306a3f', 'Diversity training once a year', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:15.741307+00'),
	('fc533605-1acc-43a0-86f1-da94f920cadf', '9285aae1-d227-4791-a25b-1a2c96306a3f', 'Saying "Black Lives Matter"', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:15.807473+00'),
	('554712c2-a574-476f-9dd1-9c88c22a71f6', '9c9854d5-0110-44e1-8a60-aece45dbdab7', 'Just counting diverse employees', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:16.036769+00'),
	('b52fcd82-86a4-43de-a03a-fda7dbe3eda7', '9c9854d5-0110-44e1-8a60-aece45dbdab7', 'Comprehensive assessment of demographics, policies, pay equity, workplace climate, promotion/retention, complaints/discipline, and community impact', NULL, true, 'Comprehensive anti-racism audit includes: Demographics—Representation at all levels, pay by race, promotions by race, retention/turnover. Policies—Review hiring, evaluation, discipline, benefits for racist impacts. Workplace climate—Survey Black employees on experiences, safety, belonging, barriers. Complaints and discipline—Analyze who reports, who is believed, who faces consequences. Community impact—Examine who organization serves, harms, excludes. Procurement—Who gets contracts, whose businesses supported. Board and leadership—Who holds power and makes decisions. The audit must be honest about current state not defensive. Share findings transparently with Black employees and communities. Use data to develop targeted action plan with measurable goals and timelines.', 1, '{}', '2025-11-09 13:23:16.086541+00'),
	('45299796-d668-46e0-84b6-e5f3f4a1a2f1', '9c9854d5-0110-44e1-8a60-aece45dbdab7', 'Only what looks good publicly', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:16.128336+00'),
	('3f60faaf-6c3d-4662-b70b-de2a354e1b72', '9c9854d5-0110-44e1-8a60-aece45dbdab7', 'Audits are not necessary', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:16.193593+00'),
	('1b5ca00e-2b45-477f-a360-8e4819b56e48', '3bca78fa-a4f5-462a-8e1e-6b762d101cb2', 'Build structures with clear goals, regular reporting, consequences for inaction, Black leadership, and community accountability', NULL, true, 'Accountability structures require: Clear measurable goals with specific timelines, Anti-racism committee with power and resources (not just advisory), Black leadership at decision-making levels, Regular public reporting on progress and setbacks, Consequences for leaders who fail to meet goals (tied to evaluation and compensation), Process for addressing racist harm with real consequences, Community accountability (not just internal), Budget allocation matching stated priorities, Transparency about challenges and failures not just wins. Accountability is not voluntary goodwill—it is built-in expectations with consequences. Leaders must be held responsible for anti-racism progress or lack thereof. Black employees and communities must have power to hold organization accountable, not just provide feedback.', 1, '{}', '2025-11-09 13:23:16.46017+00'),
	('ef52ce7e-9a25-4b44-88ec-bb6bbb0a7528', '3bca78fa-a4f5-462a-8e1e-6b762d101cb2', 'Accountability is not possible', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:16.517488+00'),
	('be01a992-d1c5-4a88-970e-41995e1d2c58', '3bca78fa-a4f5-462a-8e1e-6b762d101cb2', 'Just make public statements', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:16.573391+00'),
	('86d06c29-a1b9-4ac8-9fb1-9058a9c1cb71', '2ab1f0ad-0697-48cc-89f6-19bc341da715', 'Post on social media', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:16.757006+00'),
	('b1990725-7c56-4001-a138-ef448a4c1986', '2ab1f0ad-0697-48cc-89f6-19bc341da715', 'Embed anti-racism in organizational DNA through policies, budget, leadership accountability, ongoing learning, and community relationships', NULL, true, 'Sustaining anti-racism requires: Structural embedding—Anti-racism in mission, values, strategic plan, not separate "initiative." Budget commitment—Ongoing funding not one-time allocation, resourced positions not volunteer labor. Leadership accountability—Anti-racism tied to executive evaluations and board governance. Ongoing education—Not one training but continuous learning and development. Policy integration—Anti-racism lens applied to all decisions not siloed in HR/diversity. Black leadership—Not just advisors but decision-makers with power. Long-term planning—Multi-year commitment not reactive to current events. Community relationships—Sustained partnerships not transactional. Addressing backlash—Clear stance when facing pushback, not abandoning commitment. Celebrate progress while continuing work—Acknowledge wins without declaring victory. Anti-racism is not project with end date—it is fundamental organizational practice requiring sustained commitment.', 1, '{}', '2025-11-09 13:23:16.817586+00'),
	('9aedfa2c-fefa-49e4-bdc7-66d490186fd6', '2ab1f0ad-0697-48cc-89f6-19bc341da715', 'Wait for next racial justice movement moment', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:16.867307+00'),
	('39d4eb9e-045b-4dd3-bf10-c9db6ba0f063', '2ab1f0ad-0697-48cc-89f6-19bc341da715', 'Sustainability is impossible', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:16.929196+00'),
	('43e31776-6831-418f-b7a8-0f5c84a2aa43', '1b8e6384-47d8-4abf-8598-56f6e1fb19d5', 'All employers in Canada', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:17.236849+00'),
	('86932b6d-7aa3-46fa-b9a3-0c09105bfed6', '1b8e6384-47d8-4abf-8598-56f6e1fb19d5', 'Only federal government and federally-regulated industries', NULL, true, 'The CHRA applies to federal government departments/agencies and federally-regulated sectors like banks, telecom, and transportation. Provincial human rights codes cover other employers.', 1, '{}', '2025-11-09 13:23:17.289211+00'),
	('617cc898-f807-4c18-b020-e396fad45b7d', '1b8e6384-47d8-4abf-8598-56f6e1fb19d5', 'Only private companies', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:17.33004+00'),
	('e86e88b5-9abf-43b0-8d36-69cf86bdbfc0', '1b8e6384-47d8-4abf-8598-56f6e1fb19d5', 'Provincial governments', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:17.378231+00'),
	('778d430d-cee8-42c3-9415-5fc2bdf79627', 'f03b09db-b1c5-4f95-a840-0b70cd067716', '30 days', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:17.534981+00'),
	('2f24d027-f9e6-4caa-a7f1-5cf96797e952', 'f03b09db-b1c5-4f95-a840-0b70cd067716', '6 months', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:17.605891+00'),
	('8209a638-6e9d-40b5-b5e7-11a7cb5ed567', 'f03b09db-b1c5-4f95-a840-0b70cd067716', '1 year', NULL, true, 'You must file a complaint within 1 year of the discriminatory incident, though exceptions may apply in certain circumstances.', 2, '{}', '2025-11-09 13:23:17.671379+00'),
	('95d87eed-4372-4abe-9afb-deb58467e966', 'f03b09db-b1c5-4f95-a840-0b70cd067716', 'No time limit', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:17.762295+00'),
	('3ba5491b-8a27-476c-bb9b-315a179432af', '055a147e-2388-4220-aafc-2ead3888e9ef', '$10,000', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:17.966102+00'),
	('f4dd0221-e946-47cb-9711-a9d5882be0aa', '055a147e-2388-4220-aafc-2ead3888e9ef', '$20,000', NULL, true, 'The Canadian Human Rights Act sets a cap of $20,000 for pain and suffering, plus up to $20,000 additional for willful or reckless discrimination.', 1, '{}', '2025-11-09 13:23:18.020667+00'),
	('02f72e8a-1596-4f28-a13b-e66d4f5b9e66', '055a147e-2388-4220-aafc-2ead3888e9ef', '$50,000', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:18.086048+00'),
	('5283d8db-2a88-4112-b20d-a87d91b651a6', '055a147e-2388-4220-aafc-2ead3888e9ef', 'No limit', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:18.134867+00'),
	('b0290919-b067-4986-a66b-af09557410ac', 'b1fdbfc9-2a8e-49db-b9c0-8ee0e87039ee', 'Canadian Human Rights Act', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:18.391183+00'),
	('4eaa9438-cf8c-41b3-a066-8efcc51711e5', 'b1fdbfc9-2a8e-49db-b9c0-8ee0e87039ee', 'Charter of Rights and Freedoms', NULL, true, 'The Charter of Rights and Freedoms (particularly Section 15) provides constitutional protection against government discrimination.', 1, '{}', '2025-11-09 13:23:18.449592+00'),
	('35998c3a-3b5a-4d56-9d92-cee444ea26fc', 'b1fdbfc9-2a8e-49db-b9c0-8ee0e87039ee', 'Provincial human rights codes', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:18.50203+00'),
	('0d710447-8587-45a4-ac49-5c88e8272d03', 'b1fdbfc9-2a8e-49db-b9c0-8ee0e87039ee', 'Employment Standards Act', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:18.560365+00'),
	('f333c0f7-bd39-447b-a4dd-c6bbe67ddaef', 'bbfd73f7-45aa-4a5d-b246-287cca1968c6', 'Treating everyone exactly the same', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:18.723455+00'),
	('f6296ddd-df9d-4652-84a3-e74dfad8b04c', 'bbfd73f7-45aa-4a5d-b246-287cca1968c6', 'Recognizing different needs and circumstances to achieve true equality', NULL, true, 'Substantive equality recognizes that treating everyone identically may perpetuate inequality. It focuses on eliminating disadvantage and accommodating differences.', 1, '{}', '2025-11-09 13:23:18.812688+00'),
	('ba9dd96c-ec1c-49e4-99e3-3eee733afbd2', 'bbfd73f7-45aa-4a5d-b246-287cca1968c6', 'Equal outcomes for all groups', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:18.901717+00'),
	('bad26d26-eddc-44cb-82b7-26d34cdfd109', 'bbfd73f7-45aa-4a5d-b246-287cca1968c6', 'Reverse discrimination', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:18.954901+00'),
	('16ab65ff-bbf5-45ea-924d-b31b8c8fc6fe', 'fda19254-ae76-4779-9447-4a7d86d26217', 'Provincial human rights tribunal', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:19.146534+00'),
	('e351f1db-51ea-44fa-a43f-302cdec417e2', 'fda19254-ae76-4779-9447-4a7d86d26217', 'Canadian Human Rights Commission', NULL, true, 'Federal employees and those in federally-regulated industries fall under the Canadian Human Rights Act and should file with the CHRC.', 1, '{}', '2025-11-09 13:23:19.189981+00'),
	('8a355596-89fe-4a42-bf12-70966cfc4765', 'fda19254-ae76-4779-9447-4a7d86d26217', 'Employment Standards branch', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:19.242095+00'),
	('2846ddba-68a7-4a24-badb-3aa4183b718c', 'fda19254-ae76-4779-9447-4a7d86d26217', 'Labour Board', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:19.30877+00'),
	('d8ace94e-2ace-44e6-9045-874b8459e5aa', '2abfd7a8-bdc4-48e9-b1d3-a1d008249540', 'Cannot file a human rights complaint', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:19.523272+00'),
	('afa36225-a109-4fc2-abe8-1133a879d8d5', '2abfd7a8-bdc4-48e9-b1d3-a1d008249540', 'Must pursue only through union grievance', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:19.600933+00'),
	('bc042d48-c541-4e89-bd67-990ee15930a6', '2abfd7a8-bdc4-48e9-b1d3-a1d008249540', 'Can file at HRTO even if covered by collective agreement', NULL, true, 'Ontario allows unionized employees to file at HRTO even if the issue is covered by their collective agreement, though the tribunal may defer to arbitration.', 2, '{}', '2025-11-09 13:23:19.661795+00'),
	('38b3e91e-baf2-4137-951d-b684cd972e0e', '2abfd7a8-bdc4-48e9-b1d3-a1d008249540', 'Must choose between grievance and HRTO', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:19.709868+00'),
	('a8a09fd1-1508-404e-9edd-15ae5453dbf9', '04e3d9ce-1880-4e42-b9b2-edd74e118530', 'To comply with legal requirements', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:19.993449+00'),
	('619c05af-cff3-46db-bf5d-640e1d574291', '04e3d9ce-1880-4e42-b9b2-edd74e118530', 'To systematically identify racial disparities and their root causes to inform action', NULL, true, 'A racial equity audit is a systematic examination of organizational policies, practices, and outcomes to identify racial disparities, understand their root causes, and develop evidence-based recommendations for change. The goal is action and improvement, not compliance or public relations. An audit should surface uncomfortable truths and drive meaningful transformation.', 1, '{}', '2025-11-09 13:23:20.096992+00'),
	('5feec4d9-62e9-44f4-bfe2-9b71ec47f26f', '04e3d9ce-1880-4e42-b9b2-edd74e118530', 'To prove the organization is not racist', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:20.167866+00'),
	('88e75297-42dd-490a-b4fb-2eb7f660254d', 'c271f0d0-b77d-44b5-a9b0-df4f8b1c61cb', 'Quantitative data on demographics and outcomes, qualitative data from lived experiences, and policy/practice reviews', NULL, true, 'Comprehensive audits require multiple data sources: quantitative data (demographics, hiring, promotions, pay, retention, discipline) show what disparities exist; qualitative data (interviews, focus groups, surveys) explain why and how people experience the organization; policy reviews identify formal and informal practices that create or perpetuate disparities. All three are necessary for complete understanding.', 2, '{}', '2025-11-09 13:23:20.676563+00'),
	('3c8abaa1-b2b2-4aac-99a2-127c1ec33e1a', 'c271f0d0-b77d-44b5-a9b0-df4f8b1c61cb', 'Whatever data is easiest to collect', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:20.723152+00'),
	('9e177fa1-0e62-462c-8710-8fa41e2cf66d', '7fe5dfbb-dd6f-4bdf-9c6e-8122dadd1d91', 'Identifying who is responsible for disparities', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:20.89685+00'),
	('45fa0236-af12-41f3-beba-6e910228d05c', '7fe5dfbb-dd6f-4bdf-9c6e-8122dadd1d91', 'Examining underlying systems, policies, and practices that create and maintain disparities rather than just documenting the disparities themselves', NULL, true, 'Root cause analysis moves beyond describing disparities (e.g., "Black employees are promoted less") to understanding why (e.g., "Promotion decisions rely on informal networks and subjective assessments; Black employees lack access to senior sponsors; criteria emphasize cultural fit over skills"). This allows you to address causes rather than symptoms, leading to more effective interventions.', 1, '{}', '2025-11-09 13:23:20.986628+00'),
	('ae4050e5-3156-4a27-b9fa-51117207d123', '7fe5dfbb-dd6f-4bdf-9c6e-8122dadd1d91', 'Finding individual instances of discrimination', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:21.049192+00'),
	('e9a11b01-10b0-44ed-a2ea-87f7695781e1', '7fe5dfbb-dd6f-4bdf-9c6e-8122dadd1d91', 'Blaming leadership for problems', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:21.122608+00'),
	('c3dba629-5659-4fe9-afef-2eeaf9f3af79', 'fd7ca207-ecac-412d-9739-407e5bde2053', 'It sounds good and uses the right language', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:21.339462+00'),
	('bab81fe1-a42f-412b-a617-41090e3e3b29', 'fd7ca207-ecac-412d-9739-407e5bde2053', 'It is specific, tied to root causes, includes who will do what by when, and has clear success metrics', NULL, true, 'Actionable recommendations are specific (not vague like "improve culture"), address identified root causes, assign clear responsibility, include timelines, define success metrics, and identify needed resources. Vague recommendations like "increase diversity" or "provide more training" rarely lead to change. Effective recommendations name concrete actions with accountability.', 1, '{}', '2025-11-09 13:23:21.394159+00'),
	('9025a18d-5f50-494b-b0b7-6a8c10c433e2', 'fd7ca207-ecac-412d-9739-407e5bde2053', 'It is easy to implement', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:21.452991+00'),
	('6528d41a-bc17-4e5c-a70f-73aa5950c88c', 'fd7ca207-ecac-412d-9739-407e5bde2053', 'It makes everyone feel comfortable', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:21.515019+00'),
	('3df8b928-38da-4236-84ad-e3caebcf7d59', '3dde0658-5ae4-4ebe-9196-c6929c2aa164', 'They are completely separate issues', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:21.744721+00'),
	('a66329a8-3a18-4e7a-9fb1-92ccfd37a7fc', '3dde0658-5ae4-4ebe-9196-c6929c2aa164', 'Both are systems of white supremacy—colonialism dispossesses Indigenous lands while anti-Blackness dehumanizes and exploits Black labor and bodies', NULL, true, 'Settler colonialism and anti-Black racism are interconnected white supremacist systems. Colonialism: dispossesses Indigenous peoples from land, establishes white settler states, exploits resources. Anti-Black racism: enslaves and dehumanizes Black people, extracts labor, positions Black people as property not people. Both rely on white supremacy as justification. In Canadian context, Black enslavement helped build colonial economy while Indigenous dispossession created "Canada" as settler state. Understanding this connection is essential—you cannot address one without the other. Decolonial anti-racism recognizes shared roots in white supremacy while respecting distinct struggles.', 1, '{}', '2025-11-09 13:23:21.796347+00'),
	('0dfb02af-feb3-4217-95cb-df0291917a23', '3dde0658-5ae4-4ebe-9196-c6929c2aa164', 'Only colonialism is about white supremacy', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:21.840788+00'),
	('05686a2f-c1ee-478f-b52c-71038e3ddb1d', '3dde0658-5ae4-4ebe-9196-c6929c2aa164', 'Anti-Black racism has nothing to do with colonialism', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:21.896915+00'),
	('5564decf-1ab5-433c-a7d1-a3810736e878', '20e3a2dd-bfb1-40c1-9d21-de08f068f7aa', 'Decolonization can mean anything', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:22.05394+00'),
	('e1b50e4b-f59b-4ade-b276-616cf5890828', '20e3a2dd-bfb1-40c1-9d21-de08f068f7aa', 'Decolonization must be literal—returning land, sovereignty, and self-determination to Indigenous peoples—not just diversity or "decolonizing your mind"', NULL, true, 'This critical phrase from Tuck and Yang means: decolonization is literal repatriation of Indigenous land and sovereignty, not metaphor for diversity, inclusion, or personal "decolonizing." When institutions say "decolonize the curriculum" without addressing land theft or Indigenous governance, they appropriate and defang decolonization. True decolonization requires settlers giving up land, power, resources—uncomfortable unsettling of colonial order. For anti-racism work: do not co-opt "decolonize" to mean anti-racism or equity work. Respect specificity of Indigenous decolonial struggles while doing anti-Black racism work in solidarity—they are related but distinct.', 1, '{}', '2025-11-09 13:23:22.11266+00'),
	('b450bf51-1e6a-4c5c-aa71-682252ef6b5a', '20e3a2dd-bfb1-40c1-9d21-de08f068f7aa', 'Metaphors are bad', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:22.16349+00'),
	('c6b1d112-a862-4c6a-be76-6b7e5c187ed7', '20e3a2dd-bfb1-40c1-9d21-de08f068f7aa', 'Decolonization is only about changing language', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:22.203094+00'),
	('e49ec76f-8b59-4f62-b4c4-a123de02ff9a', 'f84cd90a-2cb4-42e1-b7e6-c2f748fac77a', 'Does not exist', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:22.38259+00'),
	('60dbe903-d389-406e-a12a-ef4f545bffc5', 'f84cd90a-2cb4-42e1-b7e6-c2f748fac77a', 'Anti-Black racism that can exist within Indigenous communities, shaped by colonial white supremacy and requiring accountability and solidarity-building', NULL, true, 'Anti-Blackness can exist in Indigenous communities, shaped by: colonial imposition of anti-Black racism (residential schools taught white supremacy), divide-and-conquer tactics pitting communities against each other, proximity to whiteness as survival strategy, and internalized hierarchies from colonialism. Examples: excluding Black Indigenous people, repeating anti-Black stereotypes, accessing resources while Black people cannot. Acknowledging this is not attacking Indigenous people—it is recognizing colonialism''s reach and building genuine solidarity. Black and Indigenous peoples must address anti-Blackness while respecting Indigenous sovereignty and working together against white supremacy. Solidarity requires accountability, not erasure.', 1, '{}', '2025-11-09 13:23:22.430932+00'),
	('5e03e590-21bd-468a-baac-dbd5b841f335', 'f84cd90a-2cb4-42e1-b7e6-c2f748fac77a', 'Only settlers can be anti-Black', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:22.467086+00'),
	('740bb0f3-9146-44c1-b3d2-73c624ac6a3e', 'f84cd90a-2cb4-42e1-b7e6-c2f748fac77a', 'Discussing it divides movements', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:22.507203+00'),
	('20c289ee-ae96-4fe6-b9df-f761d39a975c', '1596d821-1330-404a-94bf-84f681f6d68b', 'Black people should not engage with decolonization', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:22.681157+00'),
	('28af3159-3828-4e8d-8ce9-489fa608bd9f', '1596d821-1330-404a-94bf-84f681f6d68b', 'Black people can support Indigenous decolonization while centering anti-Black racism, recognizing overlapping but distinct struggles under white supremacy', NULL, true, 'Black people''s relationship to decolonization is complex. Most Black Canadians are not settlers (did not benefit from land theft, many descended from enslaved people or refugees fleeing oppression). Black people can support Indigenous land return and sovereignty while also addressing anti-Black racism—these are distinct but related struggles against white supremacy. Mistakes to avoid: conflating decolonization with anti-racism (they overlap but are not same), erasing Black presence when discussing decolonization, or claiming Black people are settlers equivalent to white colonizers. Approach: build solidarity recognizing distinct oppressions, center Indigenous voices on land/sovereignty, and continue anti-Black racism work without appropriating decolonization language.', 1, '{}', '2025-11-09 13:23:22.729148+00'),
	('c47ca0be-0223-466b-8291-cd973180c8b7', '1596d821-1330-404a-94bf-84f681f6d68b', 'Decolonization and anti-racism are the same thing', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:22.786842+00'),
	('8b5e8c04-f95a-448e-a945-f409a60a1b92', 'e78309a5-874f-4ff5-b94d-013012057c0b', 'So you can avoid the conversation entirely', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:23.096357+00'),
	('f72eb654-6964-4e1f-94e8-4aed6ee52918', 'e78309a5-874f-4ff5-b94d-013012057c0b', 'To recognize and manage your defensive reactions so they don''t derail the conversation', NULL, true, 'Self-awareness helps you recognize when you''re becoming defensive so you can pause, breathe, and respond thoughtfully rather than reactively. This keeps the conversation productive.', 1, '{}', '2025-11-09 13:23:23.15125+00'),
	('918b35a6-2497-42b8-beb4-d3bd3f77453f', 'e78309a5-874f-4ff5-b94d-013012057c0b', 'To prove you''re not racist', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:23.23838+00'),
	('efe94d75-19c4-4ff5-9bb1-0f9bd2765859', 'e78309a5-874f-4ff5-b94d-013012057c0b', 'To prepare your arguments', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:23.292173+00'),
	('3382ed1e-0a8b-49c0-b677-abda37afc88d', '6d3f92ed-2e80-44e0-92ec-026f02e14266', 'Enforcing workplace conduct policies', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:23.469113+00'),
	('c86bf9d6-42c3-4a6e-bd99-8093a53c19e5', '6d3f92ed-2e80-44e0-92ec-026f02e14266', 'Criticizing how someone expresses their experience (e.g., "you''re too angry") instead of hearing the substance', NULL, true, 'Tone policing prioritizes the listener''s comfort over justice. It silences legitimate anger and makes the conversation about how something is said rather than what is being said. Anger is a rational response to injustice.', 1, '{}', '2025-11-09 13:23:23.534677+00'),
	('b30b2f0d-7957-4992-94f1-bd237dcbf60c', '6d3f92ed-2e80-44e0-92ec-026f02e14266', 'Speaking in a professional tone', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:23.596444+00'),
	('6ca3f18f-09de-4647-8e87-16c05638ae95', '6d3f92ed-2e80-44e0-92ec-026f02e14266', 'Politely correcting grammar', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:23.648497+00'),
	('bf94c377-6285-4419-bcd5-8afadd5f4b29', '67b2fe10-dac6-4475-bbd2-89a3b9f56a55', 'Leave the conversation immediately', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:23.811424+00'),
	('9569b592-4660-4667-b701-25f91692f7cf', '67b2fe10-dac6-4475-bbd2-89a3b9f56a55', 'Explain why you''re not racist', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:23.893443+00'),
	('27fc48f9-4bd5-429c-870f-be9cff7480b1', '67b2fe10-dac6-4475-bbd2-89a3b9f56a55', 'Pause, breathe, and notice your physical/emotional reactions before responding', NULL, true, 'When activated, pause and breathe to reset your nervous system. Notice your reactions (tight jaw, racing heart, urge to defend). This creates space to respond thoughtfully rather than reactively.', 2, '{}', '2025-11-09 13:23:23.942172+00'),
	('8cfd2036-7d64-4175-b808-2fe0c560a500', '67b2fe10-dac6-4475-bbd2-89a3b9f56a55', 'Change the subject to something more comfortable', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:23.996915+00'),
	('35c6a7f5-8792-4b6f-9fe8-3188101b6dfb', '15198842-ada8-4f7c-ae2c-316e9efd9a3b', 'To be polite', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:24.242177+00'),
	('3bf72541-dc39-424c-afeb-f6e465c4288b', '15198842-ada8-4f7c-ae2c-316e9efd9a3b', 'Because people need to feel heard before they can hear you', NULL, true, 'People are unable to process new information when they don''t feel heard. Listening and affirming creates the psychological foundation for productive exchange. If you skip to adding information, they''ll still be defending rather than listening.', 1, '{}', '2025-11-09 13:23:24.315627+00'),
	('a0ca7a47-a7cf-40be-b634-e2deb0d45d31', '15198842-ada8-4f7c-ae2c-316e9efd9a3b', 'To waste time', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:24.385705+00'),
	('489594e9-8632-4b89-8a17-7c39a3d44309', '15198842-ada8-4f7c-ae2c-316e9efd9a3b', 'It''s just a suggestion, not required', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:24.430345+00'),
	('195a7403-d968-4911-aa67-47ffaa58e164', '257914f7-0d80-4ffb-b796-672eebf8e47f', 'Enforcing professional workplace standards', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:24.554812+00'),
	('944500e9-ba9b-4814-ab15-f5ea8361d35a', '257914f7-0d80-4ffb-b796-672eebf8e47f', 'Critiquing how someone expresses their experience to avoid hearing the substance', NULL, true, 'Tone policing prioritizes the listener''s comfort over justice. It says "I''ll only listen if you''re calm" and silences legitimate anger. It''s a form of resistance because it derails the conversation from content to delivery.', 1, '{}', '2025-11-09 13:23:24.601666+00'),
	('d6880a75-c9b4-4ce4-8ad0-e8a010ab7728', '257914f7-0d80-4ffb-b796-672eebf8e47f', 'Speaking in a calm tone', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:24.677684+00'),
	('7004331c-465a-469e-b1bc-1e75a6d3101d', '257914f7-0d80-4ffb-b796-672eebf8e47f', 'Helping someone communicate better', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:24.738457+00'),
	('792e8398-904a-4d62-a046-2fe16fb1a7a2', '67669516-6228-4372-97a7-4ddf606c76a0', 'Adding helpful context', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:24.946124+00'),
	('978dba48-fd75-4d88-bf41-356e1a60a824', '67669516-6228-4372-97a7-4ddf606c76a0', 'Trying to exempt themselves from the conversation about systemic racism', NULL, true, 'This is a defensive move to position themselves as "one of the good ones" and thus not implicated in racism. It centers them and their identity rather than focusing on systemic issues and impacts. The conversation becomes about their feelings rather than racism.', 1, '{}', '2025-11-09 13:23:25.04952+00'),
	('d9c50c39-147d-4661-8ec2-2c02f03f9431', '67669516-6228-4372-97a7-4ddf606c76a0', 'Demonstrating their anti-racism credentials', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:25.176839+00'),
	('7084af61-88c2-4bea-96dd-8e08ed5c1398', '67669516-6228-4372-97a7-4ddf606c76a0', 'Agreeing with the speaker', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:25.233189+00'),
	('b9f200b8-6e8b-4b28-9ec5-253b29a22906', '84a7d3f0-5c97-436e-b406-1daad2eb5cc5', 'Immediately defend yourself', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:25.430675+00'),
	('fe11783d-1aa4-43a9-ba1e-ec464046ced4', '84a7d3f0-5c97-436e-b406-1daad2eb5cc5', 'Leave the conversation', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:25.495007+00'),
	('dae8e42d-e515-4434-80b2-ab94a3899bb5', '84a7d3f0-5c97-436e-b406-1daad2eb5cc5', 'Pause, breathe, notice your reaction, then choose a thoughtful response', NULL, true, 'Defensiveness is normal but doesn''t have to dictate your response. Pausing allows you to reset your nervous system and respond thoughtfully rather than reactively. This keeps the conversation productive.', 2, '{}', '2025-11-09 13:23:25.533477+00'),
	('79e18a5b-34a4-4f9b-9c64-8fa316a1582c', '84a7d3f0-5c97-436e-b406-1daad2eb5cc5', 'Cry to show you care', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:25.574427+00'),
	('7b3fae24-72ca-4f0f-a67a-3359574db7b2', '0d2125e5-05ce-4aa3-bed5-05e162b05013', 'Only about explicit white supremacist groups', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:25.85151+00'),
	('00fbb8ca-05fb-4fb0-a928-5cf4d6e3af5f', '0d2125e5-05ce-4aa3-bed5-05e162b05013', 'The ways that white dominant culture is embedded in organizational structures, norms, and practices—including perfectionism, urgency, individualism, and defensiveness', NULL, true, 'White supremacy culture refers to the characteristics and norms of white dominant culture that are embedded in organizational structures, practices, and values—often seen as "normal" or "professional" but actually uphold white ways of being and harm Black people and other racialized groups. Tema Okun identified characteristics including: perfectionism, sense of urgency, defensiveness, quantity over quality, worship of written word, paternalism, individualism, right to comfort, fear of open conflict, and power hoarding. These are not just individual behaviors but systemic norms that privilege whiteness, punish difference, and maintain power imbalances. Understanding this helps identify root causes of organizational racism beyond individual bias.', 1, '{}', '2025-11-09 13:23:25.892662+00'),
	('6a12b9db-7a58-48a2-a091-fd24f327995b', '0d2125e5-05ce-4aa3-bed5-05e162b05013', 'Not a real thing in workplaces', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:25.945983+00'),
	('6d78047b-82c6-4c43-91cf-616ff48752c6', '0d2125e5-05ce-4aa3-bed5-05e162b05013', 'Only about individual racist people', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:25.997027+00'),
	('0428faa1-f0b4-43f7-8c9e-62c3f5e9b7fe', '301cf478-3b29-41ba-a72a-cce7d612a2b8', 'Perfectionism is just about high standards', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:26.156612+00'),
	('65ec2cb9-d404-4681-befb-35bdc1374cd3', '301cf478-3b29-41ba-a72a-cce7d612a2b8', 'Perfectionism culture punishes mistakes harshly, allows no room for learning, holds Black employees to higher standards, and prioritizes image over substance', NULL, true, 'Perfectionism in white supremacy culture: Little appreciation for work process or learning from mistakes (only perfect outcomes matter), Black employees held to higher standards while white employees'' mistakes excused, Fear of failure prevents innovation and risk-taking, Blame culture when things go wrong, Defensive when criticized or when mistakes pointed out. For Black employees this means: constant scrutiny and nitpicking, no grace for mistakes white colleagues receive, hypervisibility and higher standards, and exhaustion from needing to be "twice as good." Alternative: build learning culture, normalize mistakes as growth, apply consistent standards, appreciate process not just outcome, and give grace especially to those facing systemic barriers.', 1, '{}', '2025-11-09 13:23:26.214687+00'),
	('f369260d-2abc-4eb3-8d92-04dfc10d8f20', '301cf478-3b29-41ba-a72a-cce7d612a2b8', 'Having high standards is good for everyone', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:26.269918+00'),
	('a6057e44-0848-4c47-b442-c29c76fc8517', '301cf478-3b29-41ba-a72a-cce7d612a2b8', 'Black employees benefit from perfectionism', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:26.312296+00'),
	('079c3afd-54ab-475e-9594-6e3ae13663ea', 'f0c7f8bc-8650-4fa0-9d45-7dbf43c38c09', 'Working quickly is always good', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:26.468581+00'),
	('45130cd7-953f-4954-b930-37b71fd0f1d5', 'f0c7f8bc-8650-4fa0-9d45-7dbf43c38c09', 'Urgency culture prioritizes speed over quality, prevents meaningful planning and relationships, and uses "urgency" to dismiss concerns about equity and inclusion', NULL, true, 'Sense of urgency as white supremacy culture: Creates artificial urgency that prevents thoughtful planning, Uses "we do not have time" to dismiss equity concerns, Sacrifices quality for speed, Prevents relationship-building and trust necessary for real change, Values quick action over sustainable transformation. Impact on Black employees: Equity work deprioritized as "too slow," Concerns dismissed as "slowing down progress," Burnout from constant urgency, Meaningful change prevented in favor of performative quick wins. Alternative: Differentiate between real and manufactured urgency, Build in time for relationship and trust, Recognize that meaningful change takes time, Slow down to do it right rather than fast to check box.', 1, '{}', '2025-11-09 13:23:26.52779+00'),
	('8607ca80-a268-459f-99ad-a0a457d483c0', 'f0c7f8bc-8650-4fa0-9d45-7dbf43c38c09', 'Deadlines are white supremacy', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:26.589905+00'),
	('bd8c0815-9666-4bee-8404-98998e5be598', 'f0c7f8bc-8650-4fa0-9d45-7dbf43c38c09', 'Black people do not value timeliness', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:26.682533+00'),
	('610d571d-db70-4941-ab38-7e23c59fb32c', '44e1df80-a713-4afc-867f-e1e29c1ce34e', 'Just hire more diverse people', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:26.838784+00'),
	('e07224ef-c51c-48db-b455-5b44084542f5', '44e1df80-a713-4afc-867f-e1e29c1ce34e', 'Name and interrupt these patterns, build anti-racist alternatives rooted in collective care, center Black voices and leadership, and commit to sustained systemic change', NULL, true, 'Dismantling white supremacy culture requires: Naming it—Educate about these characteristics, make visible what was normalized, Call it out when it happens, Build awareness without shaming. Interrupt it—Challenge perfectionism, urgency, defensiveness when they arise, Support making mistakes and learning, Create space for conflict and discomfort, Share power and decision-making. Build alternatives—Develop anti-racist norms and practices, Center collective care and sustainability, Value diverse ways of being and knowing, Create accountability structures. Sustain it—Long-term commitment not one-time training, Center Black leadership and voices, Address resistance and backlash with clarity, Transform systems not just individuals. This is ongoing work requiring humility, accountability, and willingness to be uncomfortable.', 1, '{}', '2025-11-09 13:23:26.886022+00'),
	('630ea6fc-093d-45a2-babf-fe9074922d80', '44e1df80-a713-4afc-867f-e1e29c1ce34e', 'It cannot be changed', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:26.948111+00'),
	('e953d310-1e7e-4a4c-aad3-eaca1d49d746', '44e1df80-a713-4afc-867f-e1e29c1ce34e', 'Ignore it and it will go away', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:26.994392+00'),
	('aa415097-2ae4-4951-b2a6-ab8fb53ea28f', '61d89412-eca2-46b6-9ac1-5f13a452133e', 'Racism that happens outdoors', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:27.30411+00'),
	('af17b2ee-53d3-4ddf-8217-1ddc7f41b35f', '61d89412-eca2-46b6-9ac1-5f13a452133e', 'The disproportionate exposure of Black and racialized communities to environmental hazards like pollution, toxins, and contaminated land/water', NULL, true, 'Environmental racism is the systemic pattern where Black, Indigenous, and racialized communities are disproportionately exposed to environmental hazards: landfills, industrial facilities, contaminated sites, poor air/water quality, etc. This is not random—it results from discriminatory zoning, housing policies, and land use decisions that locate environmental harms near communities with less political power. Africville (Halifax) is a Canadian example: a thriving Black community destroyed and used for sewage, dump sites, and industrial facilities.', 1, '{}', '2025-11-09 13:23:27.376867+00'),
	('90309d1e-082d-4cef-bf20-59c23e845542', '61d89412-eca2-46b6-9ac1-5f13a452133e', 'Individual prejudice about environmental issues', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:27.436776+00'),
	('53793d24-31d7-4910-ba75-e2176f73867e', '61d89412-eca2-46b6-9ac1-5f13a452133e', 'A term only used in the United States', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:27.518004+00'),
	('b4e9c680-d60b-4d71-841a-f28056495879', 'b67bc05b-8836-4d9c-8bac-a2b431d60748', 'A Black community prospered with city support', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:27.675013+00'),
	('eb29d8b0-f1df-41dd-a725-a9c22815f980', 'b67bc05b-8836-4d9c-8bac-a2b431d60748', 'A thriving Black community was systematically destroyed through environmental racism, refused basic services, then demolished to make way for industrial development', NULL, true, 'Africville was a thriving Black community in Halifax founded in the 1840s. The city systematically refused basic services (water, sewage, paved roads) while locating environmental hazards there: infectious disease hospital, city dump, slaughterhouse, etc. In the 1960s, residents were forcibly relocated and homes demolished—supposedly for "urban renewal" but really to make way for industrial development. Africville is a stark example of environmental racism: a Black community deliberately subjected to environmental harms then destroyed.', 1, '{}', '2025-11-09 13:23:27.736293+00'),
	('47d81b15-0acd-403f-99fb-b271424e94d2', 'b67bc05b-8836-4d9c-8bac-a2b431d60748', 'Nothing significant', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:27.78702+00'),
	('de514889-8d8f-4fcf-9307-6bdeeede8368', 'b67bc05b-8836-4d9c-8bac-a2b431d60748', 'The community voluntarily relocated', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:27.844146+00'),
	('3d699304-20f3-469d-a01a-6a4f0ebf5419', '069a89d8-3ef7-45c2-9cc4-35bf38476a9f', 'It doesn''t affect health', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:27.9743+00'),
	('150457cd-f92c-49e9-9e5c-47a02202fe21', '069a89d8-3ef7-45c2-9cc4-35bf38476a9f', 'Black communities near pollution face higher rates of asthma, cancer, respiratory disease, and other health problems', NULL, true, 'Environmental racism has severe health consequences. Black communities near industrial pollution, highways, and waste facilities face higher rates of asthma (especially children), cancer, cardiovascular disease, birth complications, and reduced life expectancy. Poor air quality, water contamination, and toxic exposure create health disparities. For example, Black children in polluted neighborhoods have asthma rates 2-3 times higher than white children. This is environmental injustice—communities harmed by decisions made without their consent.', 1, '{}', '2025-11-09 13:23:28.021482+00'),
	('9fb47424-360e-4be1-867b-1ad34be5bd1b', '069a89d8-3ef7-45c2-9cc4-35bf38476a9f', 'Health impacts are the same for all communities', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:28.059865+00'),
	('fca971bf-639b-47f4-b044-ffa0eb1b6029', '069a89d8-3ef7-45c2-9cc4-35bf38476a9f', 'Only affects mental health', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:28.108841+00'),
	('e7006410-61db-4d64-b718-b04de14a81e4', '52dc30e6-a35e-4d9d-9fc9-7ca4342d11fc', 'Tell individuals to recycle more', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:28.266922+00'),
	('641b5f20-76eb-4d24-9660-46289e22b96d', '52dc30e6-a35e-4d9d-9fc9-7ca4342d11fc', 'Community-led organizing, policy changes mandating environmental equity assessments, holding polluters accountable, and investing in Black community health', NULL, true, 'Solutions require systemic change, not individual actions. This includes: community-led organizing for environmental justice, policy requiring environmental equity assessments before siting hazards, holding corporations accountable for pollution, investing in Black community health and infrastructure, meaningful community consultation with veto power, reparations for communities harmed (like Africville), and climate justice policies centering vulnerable communities. Black communities must lead solutions—not be told what''s "best" for them.', 1, '{}', '2025-11-09 13:23:28.313151+00'),
	('037ef94f-aa8f-4e31-8fa8-63e84a516615', '52dc30e6-a35e-4d9d-9fc9-7ca4342d11fc', 'Ignore the problem', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:28.36196+00'),
	('e76b49be-c1f2-424e-9774-2c66fefa83e8', '52dc30e6-a35e-4d9d-9fc9-7ca4342d11fc', 'Move Black communities away without addressing root causes', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:28.40525+00'),
	('3bbfbd41-5dc1-4ab6-aad2-bfb6c03843ae', '070b54af-075d-4440-8cc9-2dc11e7e68df', 'Areas with too many banks', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:28.654785+00'),
	('c7d93290-c02f-472e-9e7c-492642e6c954', 'd7f2cd90-fea3-4c0e-92b5-38ec81136f14', 'Asking Black patients to be more assertive', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:31.268843+00'),
	('fc6dd278-1230-4ffe-a7bc-bdceaee4811e', 'd7f2cd90-fea3-4c0e-92b5-38ec81136f14', 'Providing translation services', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:31.325287+00'),
	('6a8f9ee3-75dd-40f1-9b7b-435f3edfa88e', '070b54af-075d-4440-8cc9-2dc11e7e68df', 'Geographic areas, often Black neighborhoods, where residents lack access to banking services and face barriers to financial inclusion', NULL, true, 'Banking deserts are areas where residents lack access to bank branches and ATMs, forcing reliance on predatory alternatives like payday lenders and check-cashing stores with exorbitant fees. Black neighborhoods are disproportionately banking deserts due to redlining legacy, bank branch closures, and discriminatory business decisions. Without banking access, residents pay more for financial services, cannot build credit or savings, and face barriers to loans and homeownership—perpetuating wealth inequality.', 1, '{}', '2025-11-09 13:23:28.71224+00'),
	('d102b22f-18a5-4d3a-81a5-58d3f283655f', '070b54af-075d-4440-8cc9-2dc11e7e68df', 'Only a problem in rural areas', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:28.754062+00'),
	('39b4dd76-dab7-472f-baec-3998e63a2d9c', '070b54af-075d-4440-8cc9-2dc11e7e68df', 'Not a real issue in Canada', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:28.796261+00'),
	('1d65d93c-0f07-4b4b-b305-77ac3847b695', '938f017c-9613-4cc3-9d64-3a627dd3615d', 'It does not affect homeownership', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:28.964372+00'),
	('1aec7aa7-7bf5-41ec-8d88-168651653fa5', '938f017c-9613-4cc3-9d64-3a627dd3615d', 'Black applicants are denied mortgages at higher rates than white applicants with similar financial profiles and receive higher interest rates when approved', NULL, true, 'Studies show Black mortgage applicants are denied at significantly higher rates than white applicants with similar credit scores, income, and debt-to-income ratios. When approved, Black borrowers often receive higher interest rates, costing thousands more over loan lifetime. This reflects both explicit bias (discriminatory lending practices) and systemic factors (lower appraisals of Black neighborhoods, exclusion from informal networks providing better rates). Mortgage discrimination is a primary driver of the racial wealth gap.', 1, '{}', '2025-11-09 13:23:29.009425+00'),
	('654b61ff-34f7-44f9-9f5c-fa7882ca1194', '938f017c-9613-4cc3-9d64-3a627dd3615d', 'Banks treat all applicants equally', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:29.061692+00'),
	('c1af0ad5-aadd-41d5-8bec-2c0ff4f47874', '938f017c-9613-4cc3-9d64-3a627dd3615d', 'Only income matters for mortgage approval', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:29.105379+00'),
	('eba418e6-7676-4a36-b49f-47d10f25690b', '0ec4ab10-8045-43ae-b120-f8c53ea3d6ac', 'Appraisers are completely objective', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:29.299911+00'),
	('0306bae0-b07b-4270-8755-24ffd9d29b69', '0ec4ab10-8045-43ae-b120-f8c53ea3d6ac', 'Homes in Black neighborhoods and Black-owned homes are systematically undervalued compared to comparable white-owned homes', NULL, true, 'Research shows homes in Black neighborhoods are systematically undervalued by tens of thousands of dollars compared to similar homes in white neighborhoods. Black homeowners report appraisals increasing when they remove family photos, have white friends "stand in" as owners, or hide indicators of Black occupancy. This appraisal bias reduces Black wealth (home equity), makes refinancing harder, and perpetuates neighborhood disinvestment. It reflects both individual appraiser bias and systemic undervaluation of Black communities.', 1, '{}', '2025-11-09 13:23:29.364733+00'),
	('8cbde42a-0fa7-45ac-8b31-4c9ca87e8c5b', '0ec4ab10-8045-43ae-b120-f8c53ea3d6ac', 'Property values are determined only by square footage', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:29.413607+00'),
	('256f7552-e9cc-4f0f-8a0d-0570c51a5d01', '0ec4ab10-8045-43ae-b120-f8c53ea3d6ac', 'Appraisal bias does not exist', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:29.45851+00'),
	('c0335686-e1d2-4f1d-a351-8680acd26640', '4058e42b-6f61-4fce-8cbb-ae841bb7197e', 'Predatory lenders', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:29.665074+00'),
	('6a6ff666-30b3-4b91-a701-bf91e468c9ba', '4058e42b-6f61-4fce-8cbb-ae841bb7197e', 'Black-led or mission-driven financial institutions that provide banking, lending, and financial services in underserved communities', NULL, true, 'CDFIs are financial institutions (credit unions, community banks, loan funds) that prioritize serving communities excluded from mainstream banking. Many are Black-led and focus on Black communities. They provide affordable loans, banking access, financial education, and business capital without exploitative terms. CDFIs challenge the banking desert problem by bringing services where mainstream banks refuse to operate. They demonstrate that serving Black communities is viable—mainstream banks choose not to. Supporting CDFIs is one strategy for financial justice.', 1, '{}', '2025-11-09 13:23:29.741137+00'),
	('530ca043-f930-46fe-9021-a9eed00a8ca9', '4058e42b-6f61-4fce-8cbb-ae841bb7197e', 'Government welfare programs', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:29.81828+00'),
	('79ba4b6e-f452-4977-b545-5ea8d859f4b8', '4058e42b-6f61-4fce-8cbb-ae841bb7197e', 'Only exist in the United States', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:29.874616+00'),
	('2ec568e5-e1a3-4f75-a513-cb2b20a514c9', '7d73811d-d860-4b47-80b4-738999138614', 'The difference between what patients report and what doctors believe', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:30.154883+00'),
	('5bf63575-bcd9-4355-826a-e042fe4c6fb9', '7d73811d-d860-4b47-80b4-738999138614', 'Systematic under-assessment and under-treatment of pain in Black patients due to false biological beliefs', NULL, true, 'The "pain gap" refers to the well-documented phenomenon where Black patients'' pain is systematically under-assessed and under-treated compared to white patients. Research shows many healthcare providers hold false beliefs about biological differences (e.g., that Black people have thicker skin or higher pain tolerance), leading to inadequate pain management.', 1, '{}', '2025-11-09 13:23:30.208703+00'),
	('7e64de36-3cbd-49f6-9498-38081f3201de', '7d73811d-d860-4b47-80b4-738999138614', 'The time between requesting pain medication and receiving it', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:30.267989+00'),
	('b31ad80f-d17a-4718-8119-8e9ad8780dd9', '7d73811d-d860-4b47-80b4-738999138614', 'Differences in pain tolerance across populations', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:30.313767+00'),
	('7ba462a9-1881-4dc4-89dc-51c2f6689a17', 'd2aace40-7111-4289-9dae-14d3fa183f8b', 'No significant disparities exist in Canada', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:30.506134+00'),
	('7618c524-e6a4-4309-bce8-519c98151013', 'd2aace40-7111-4289-9dae-14d3fa183f8b', 'Black women experience higher rates of severe maternal morbidity and mortality', NULL, true, 'Canadian data show that Black women, particularly Black immigrants and refugees, experience significantly higher rates of severe maternal morbidity and complications compared to white women. Studies also indicate higher risks of preterm birth, low birth weight, and pregnancy-related complications even when controlling for socioeconomic factors.', 1, '{}', '2025-11-09 13:23:30.557841+00'),
	('88151252-e60b-45e8-b33a-1b962cd3fec1', 'd2aace40-7111-4289-9dae-14d3fa183f8b', 'Black women receive better prenatal care than other groups', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:30.601973+00'),
	('0ac67c15-3a54-4257-9641-74709cecdf6f', 'd2aace40-7111-4289-9dae-14d3fa183f8b', 'Maternal health disparities are only a U.S. problem', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:30.663938+00'),
	('0c44481c-27bd-4424-ac63-3102d864b0ac', '55122dc1-ca87-4b65-9384-a570f73da9bc', 'Black patients are naturally distrustful', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:30.827171+00'),
	('92125d43-3c80-4192-bc74-1023934ca53c', '55122dc1-ca87-4b65-9384-a570f73da9bc', 'Historical and ongoing experiences of discrimination, dismissal, and harm in healthcare settings', NULL, true, 'Lower trust is a rational response to both historical harms (forced sterilization, unethical experimentation) and ongoing experiences of discrimination, dismissal of symptoms, and differential treatment. When patients consistently report not being believed or receiving substandard care, trust erodes. This isn''t about culture or literacy—it''s about justified wariness based on experience.', 1, '{}', '2025-11-09 13:23:30.885252+00'),
	('841bf761-3d49-4e92-92fb-94862d4e7497', '55122dc1-ca87-4b65-9384-a570f73da9bc', 'Cultural differences in communication styles', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:30.937167+00'),
	('20831611-bda5-48e7-a856-cf10cd2e3640', '55122dc1-ca87-4b65-9384-a570f73da9bc', 'Lack of health literacy', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:30.994707+00'),
	('e5cc4add-9ad5-49e4-b5e0-10a347943a83', 'd7f2cd90-fea3-4c0e-92b5-38ec81136f14', 'Cultural competency training alone', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:31.167235+00'),
	('69ba5a7b-1d80-4bfc-92f9-3fb3b020535e', 'd7f2cd90-fea3-4c0e-92b5-38ec81136f14', 'Systemic changes in policies, protocols, workforce diversity, and accountability for outcomes', NULL, true, 'While individual education matters, sustainable change requires systemic approaches: collecting and analyzing race-based outcome data, revising clinical protocols to reduce bias, increasing workforce diversity at all levels, removing barriers to access, and creating accountability for equitable outcomes. Training alone, without structural change, has limited impact.', 1, '{}', '2025-11-09 13:23:31.224613+00'),
	('79d06802-2e38-47a4-89b3-556cf0a9509d', '6b7f5714-2f3e-45c7-9b88-cbec8603a3df', 'Protect the organization from liability', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:31.611659+00'),
	('f3a9da65-958e-429a-938d-2f5a12992505', '6b7f5714-2f3e-45c7-9b88-cbec8603a3df', 'Maintain thoroughness, objectivity, and procedural fairness for all parties', NULL, true, 'While protecting the organization matters, the most important principle is conducting a fair, thorough, and objective investigation. This means treating all parties with respect, gathering all relevant evidence, and making findings based on facts, not assumptions. A well-conducted investigation protects everyone involved and reduces legal risk.', 1, '{}', '2025-11-09 13:23:31.669461+00'),
	('1f1c86d3-f431-4663-b6ae-dfd9d997ac1b', '6b7f5714-2f3e-45c7-9b88-cbec8603a3df', 'Resolve the complaint as quickly as possible', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:31.724894+00'),
	('cfcf8bbe-5023-4e16-9903-419ac84058f8', '6b7f5714-2f3e-45c7-9b88-cbec8603a3df', 'Support the complainant no matter what', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:31.771732+00'),
	('fa9f9f9a-e60d-4191-a653-4e690e7abcd1', '41b72555-dfd3-4965-b8c6-1351b4a362d3', 'To give preferential treatment to visible minorities', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:31.911811+00'),
	('2d4a343b-bb5b-47b8-ab07-44bee7ab8d60', '41b72555-dfd3-4965-b8c6-1351b4a362d3', 'To achieve equality in the workplace by correcting disadvantages experienced by designated groups', NULL, true, 'The EEA aims to achieve equality by identifying and removing barriers that disadvantage four designated groups (women, Indigenous peoples, persons with disabilities, and visible minorities, including Black Canadians). It requires proactive measures like representation goals, not quotas, to correct historical and systemic disadvantage.', 1, '{}', '2025-11-09 13:23:31.960246+00'),
	('70776309-5e5a-49ad-9d9f-bdc27ec29eb7', '41b72555-dfd3-4965-b8c6-1351b4a362d3', 'To meet quotas for hiring', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:32.00068+00'),
	('630dd4c4-44d8-4e84-a8d9-7bc6cf860779', '41b72555-dfd3-4965-b8c6-1351b4a362d3', 'To discriminate against white men', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:32.063876+00'),
	('c290e2bc-06eb-4096-ab3d-62d4baf42b32', '4c21bfc9-bc1c-418a-ae3d-d32cb808f422', 'It makes interviews faster', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:32.241353+00'),
	('06b457f1-6914-4ad9-bea1-90bc4cd94ae6', '4c21bfc9-bc1c-418a-ae3d-d32cb808f422', 'It ensures all candidates are asked the same questions and evaluated using consistent criteria', NULL, true, 'Structured interviewing reduces bias by ensuring consistency. When all candidates answer the same questions evaluated using predetermined criteria, hiring decisions are based on job-relevant factors rather than subjective impressions or rapport. Research shows structured interviews significantly reduce racial bias compared to unstructured conversations.', 1, '{}', '2025-11-09 13:23:32.290537+00'),
	('e2a43cb7-0dfe-490b-9c19-55882fa6bc08', '4c21bfc9-bc1c-418a-ae3d-d32cb808f422', 'It eliminates the need for reference checks', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:32.336046+00'),
	('be718888-5733-4ea5-872e-e5e3a187261f', '4c21bfc9-bc1c-418a-ae3d-d32cb808f422', 'It guarantees you''ll hire diverse candidates', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:32.377105+00'),
	('a13cc4ab-8c0b-473d-8094-2181e72b5d66', '8ad3a071-7344-4787-b691-409693ac8e5e', 'Public shaming when they fail', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:32.519946+00'),
	('9af69a20-a114-4567-b5a1-d887867ab6fb', '8ad3a071-7344-4787-b691-409693ac8e5e', 'Tie equity outcomes to performance evaluations and compensation', NULL, true, 'Accountability requires consequences. When equity outcomes are part of how leaders are evaluated and compensated, they prioritize it. This might include metrics like representation in hiring/promotions, retention rates, employee feedback, and demonstrated leadership actions. Without accountability mechanisms, equity remains aspirational rather than actual.', 1, '{}', '2025-11-09 13:23:32.581972+00'),
	('009e76e6-55aa-4546-b74a-04b176dcd164', '8ad3a071-7344-4787-b691-409693ac8e5e', 'Send them to more training', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:32.658572+00'),
	('990e5644-9caf-415b-a793-3c0d4d6d8b4a', '8ad3a071-7344-4787-b691-409693ac8e5e', 'Hope they care enough to act', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:32.695289+00'),
	('caa55db9-0537-4c9d-b843-b1b97a5b82cd', '254c19ca-77ef-430c-8745-d1dfdff85b88', 'Assuming both experiences are identical', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:32.959806+00'),
	('153ea04d-5151-4f71-bc40-8c64f56bf8f8', '254c19ca-77ef-430c-8745-d1dfdff85b88', 'Recognizing shared oppression while honoring distinct experiences and avoiding appropriation', NULL, true, 'Authentic solidarity requires recognizing both commonalities (shared experiences of white supremacy, colonialism, resistance) and distinctions (Indigenous relationship to land and sovereignty vs. Black experiences of forced migration and diaspora). We must honor both without erasing differences or appropriating struggles that are not our own.', 1, '{}', '2025-11-09 13:23:33.006832+00'),
	('67885ed0-5697-4462-9043-bc81d298bb53', '254c19ca-77ef-430c-8745-d1dfdff85b88', 'Focusing only on what is shared', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:33.055711+00'),
	('42fe4ddc-f7fc-48c2-b7ac-a6038ed6b1aa', '254c19ca-77ef-430c-8745-d1dfdff85b88', 'Competing for resources and attention', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:33.10224+00'),
	('96ed9c32-572b-4f58-8edd-e9eb94cfa3b9', 'df961da5-0fce-46ea-afe0-5a0e55caa908', 'They are completely separate with no relationship', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:33.250704+00'),
	('9243634f-1037-42b4-ae8b-b9e52f87e29d', 'df961da5-0fce-46ea-afe0-5a0e55caa908', 'Both are systems of white supremacy that relied on dehumanization, exploitation, and violence to extract value from racialized bodies and lands', NULL, true, 'Colonialism (theft of Indigenous lands, genocide, forced assimilation) and chattel slavery (theft of Black people, forced labor, commodification) are interconnected systems of white supremacy. Both relied on dehumanization, violence, and extraction. They operated simultaneously in Canada and reinforced each other—settler colonialism required displacing Indigenous peoples to create plantation economies that exploited enslaved Black labor.', 1, '{}', '2025-11-09 13:23:33.287456+00'),
	('70068ccf-4097-4313-ae1e-20e560792c21', 'df961da5-0fce-46ea-afe0-5a0e55caa908', 'Only colonialism is a system of white supremacy', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:33.346843+00'),
	('08ecf08e-a14f-49f0-a2d4-5bd5d93b0b7b', 'df961da5-0fce-46ea-afe0-5a0e55caa908', 'They happened in different time periods', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:33.410987+00'),
	('8681e054-3793-4cf0-9a11-6e11e8a2ca5a', '617b2e84-f3b7-432d-8f9a-a4f81b5c7989', 'Never mention the other community''s struggles', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:33.551265+00'),
	('2567b9f5-9300-4be3-b1fa-2b067b7ebf7b', '617b2e84-f3b7-432d-8f9a-a4f81b5c7989', 'Understand and speak to another community''s struggles without claiming them as your own or using them for personal gain', NULL, true, 'Avoiding appropriation means we can learn from, support, and show solidarity with another community''s struggles without claiming them as our own. For example, Black people should not claim Indigenous identity or speak over Indigenous voices on land and sovereignty. Indigenous people should not claim Black identity or speak over Black voices on slavery and diaspora. We stand with, not as, each other.', 1, '{}', '2025-11-09 13:23:33.604287+00'),
	('91d3abbd-1866-48f2-add1-ef256ee552fd', '617b2e84-f3b7-432d-8f9a-a4f81b5c7989', 'Only focus on your own community', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:33.655064+00'),
	('3740bff5-5859-4e45-9065-da5d4f0d7e40', '617b2e84-f3b7-432d-8f9a-a4f81b5c7989', 'Copy the other community''s strategies exactly', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:33.700309+00'),
	('5c016246-92a0-4217-b533-d14b0f5d7339', 'd3f3bccc-3a1a-4d2d-bd23-99e7e6ef18d3', 'It''s not important—focus only on solidarity', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:33.842893+00'),
	('18f991f5-d3ec-47e7-a12d-1252a6cc313c', 'd3f3bccc-3a1a-4d2d-bd23-99e7e6ef18d3', 'Authentic solidarity requires accountability; we cannot build genuine relationships while perpetuating harm against each other', NULL, true, 'Solidarity requires accountability. Anti-Blackness exists in some Indigenous communities (e.g., exclusion, stereotypes, colorism). Anti-Indigeneity exists in some Black communities (e.g., invisibilizing Indigenous peoples, benefiting from settlement). We must address these within our own communities, not to shame but to build authentic relationships based on mutual respect and support, not replication of colonial harm.', 1, '{}', '2025-11-09 13:23:33.884362+00'),
	('cffd3341-f764-40ad-a332-de3cfe4d2a69', 'd3f3bccc-3a1a-4d2d-bd23-99e7e6ef18d3', 'To prove we''re better than the other community', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:33.944522+00'),
	('e864bef6-19af-4dad-88fe-abe7aa63338e', 'd3f3bccc-3a1a-4d2d-bd23-99e7e6ef18d3', 'Only white people need to address racism', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:33.994529+00'),
	('09ad9e8e-f984-4d5b-8f26-9e0f26402194', '7c032198-b0e3-4cd3-868a-c05040d07210', 'Class and race are completely separate', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:36.671473+00'),
	('ac6b0728-e5ef-4eb9-a199-85d2bd012479', 'a0f570d1-8802-425c-98a9-ed94a0fcc88c', 'Disabled Black people face same issues as white disabled people', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:36.880606+00'),
	('4d0f8e9b-ee31-4f10-ae66-d4a248089fcf', '4f5a8533-8dcb-4e0b-ae8f-36ef642fd089', 'A framework that recognizes overlapping identities create unique experiences that cannot be understood by examining each identity separately', NULL, true, 'Intersectionality, coined by Kimberlé Crenshaw, recognizes that identities like race, gender, class, and sexuality overlap to create unique experiences of privilege and oppression. A Black woman''s experience is not simply "racism + sexism"—the intersection creates distinct challenges that cannot be understood by looking at race or gender alone.', 0, '{}', '2025-11-09 13:23:34.310422+00'),
	('1072bff6-51ee-41ed-8698-269586970d99', '4f5a8533-8dcb-4e0b-ae8f-36ef642fd089', 'A way to rank different forms of oppression', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:34.365399+00'),
	('01cb4e77-59bf-4b2c-935a-ebaa88c0f96b', '4f5a8533-8dcb-4e0b-ae8f-36ef642fd089', 'The belief that all forms of discrimination are the same', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:34.421383+00'),
	('3ba80649-e4eb-4803-9fc2-7fb6353a8e23', '4f5a8533-8dcb-4e0b-ae8f-36ef642fd089', 'A diversity training technique', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:34.470179+00'),
	('fa3fc11b-3d8a-44ae-9166-cbca6184ec12', '10a798d3-ab17-4ea7-8109-3d60db980f16', 'Black women earn the same as white women when education is controlled', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:34.641718+00'),
	('03d75cc4-206a-4d97-8a17-c3313c1dc257', '10a798d3-ab17-4ea7-8109-3d60db980f16', 'Black women face a "double disadvantage" earning less than white women and Black men', NULL, true, 'Data consistently show Black women face compounded disadvantages. They earn less than both white women (facing racial disparities) and Black men (facing gender disparities), are underrepresented in leadership, experience higher unemployment, and report more discrimination and microaggressions. This is intersectionality in action—not just racism, not just sexism, but unique barriers at the intersection.', 1, '{}', '2025-11-09 13:23:34.694865+00'),
	('2a70fb7e-9aaa-452a-b6b5-fe2af6cd5655', '10a798d3-ab17-4ea7-8109-3d60db980f16', 'Black women are overrepresented in senior leadership', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:34.742772+00'),
	('468b2c3a-0eb6-45c4-99e7-a5f4e155b456', '10a798d3-ab17-4ea7-8109-3d60db980f16', 'Black women face fewer barriers than Black men', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:34.805187+00'),
	('c3c028ed-cba0-4b9a-aa61-ad61bdf3bbb9', '8d2594c4-71d6-4437-8456-6c6bb21acc60', 'An accurate description of how Black women behave', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:35.053993+00'),
	('376fbfd5-ed06-485b-b71c-a891463eea5f', '8d2594c4-71d6-4437-8456-6c6bb21acc60', 'A harmful stereotype that pathologizes Black women''s legitimate expressions of emotion or assertiveness', NULL, true, 'The "angry Black woman" stereotype falsely characterizes Black women as hostile, aggressive, or difficult. When Black women express normal assertiveness, disagreement, or justified frustration, they are more likely to be labeled "angry" or "difficult" than white women expressing the same behaviors. This stereotype is used to silence, dismiss, and penalize Black women in workplaces.', 1, '{}', '2025-11-09 13:23:35.101783+00'),
	('6d5f879b-7354-4d75-94d9-bdfd76292188', '8d2594c4-71d6-4437-8456-6c6bb21acc60', 'A compliment to Black women''s strength', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:35.179843+00'),
	('9b21d794-76b9-42f3-ad2b-20f40ecb5b78', '8d2594c4-71d6-4437-8456-6c6bb21acc60', 'Something that only affects Black women outside the workplace', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:35.244014+00'),
	('e4216b97-d2cd-4aec-8d87-9304081eb3cf', '68075fe7-83c0-486d-bd72-7d3c4d3916d5', 'There is no difference—the terms are interchangeable', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:35.431958+00'),
	('f6d1247b-b132-4fd3-a051-67fd2164bef8', '68075fe7-83c0-486d-bd72-7d3c4d3916d5', 'Mentorship provides advice; sponsorship involves actively advocating for advancement and using your influence on their behalf', NULL, true, 'While mentorship (advice, guidance, support) is valuable, sponsorship is critical for advancement. A sponsor actively advocates for a Black woman in rooms where decisions are made, nominates her for opportunities, uses their influence to advance her career, and takes risks on her behalf. Black women are often over-mentored but under-sponsored—they receive advice but not the advocacy needed to break through barriers.', 1, '{}', '2025-11-09 13:23:35.476566+00'),
	('66a24364-7760-4d74-af20-af4707537acb', '68075fe7-83c0-486d-bd72-7d3c4d3916d5', 'Sponsorship is only for entry-level employees', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:35.522722+00'),
	('80dc9c9f-ffc2-4b84-8237-e5ddbe246bea', '68075fe7-83c0-486d-bd72-7d3c4d3916d5', 'Mentorship is more valuable than sponsorship', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:35.566073+00'),
	('fb679bce-5048-4727-9e16-9fd4b46e8feb', 'a0e95724-d6ef-443a-a4eb-cdeaee75f50e', 'Just adding up different identities', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:35.809871+00'),
	('33631f14-eb6d-4cf1-a653-851a9467786c', 'a0e95724-d6ef-443a-a4eb-cdeaee75f50e', 'A framework from Black feminist thought showing how race, gender, class, and other systems of oppression interact and create unique experiences of discrimination', NULL, true, 'Intersectionality, coined by Kimberlé Crenshaw, describes how systems of oppression (racism, sexism, classism, ableism, homophobia, transphobia) intersect and create unique experiences of marginalization. It is not additive (Black + woman = double oppression) but multiplicative (Black women face unique oppression called misogynoir that is neither just racism nor just sexism). Originated in Black feminist thought (Combahee River Collective, Audre Lorde, bell hooks) to address erasure of Black women in both anti-racist and feminist movements. Intersectionality requires examining structural power, not just individual identities, and centering most marginalized experiences.', 1, '{}', '2025-11-09 13:23:35.858014+00'),
	('fcb2deec-a742-4f39-9e16-7a97f0d986bf', 'a0e95724-d6ef-443a-a4eb-cdeaee75f50e', 'Only about gender and race', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:35.911621+00'),
	('59ec42f5-dcb7-42a3-92f6-6290ed066122', 'a0e95724-d6ef-443a-a4eb-cdeaee75f50e', 'A buzzword with no real meaning', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:35.968847+00'),
	('07ec47d4-b139-4116-91eb-83fa91c4a7c2', 'af780b40-9fd1-4159-9a30-a247772191cf', 'Same as regular misogyny', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:36.215491+00'),
	('4edaeb8e-d56a-4734-9f5b-f3081b63f94e', 'af780b40-9fd1-4159-9a30-a247772191cf', 'Anti-Black misogyny—the unique hatred, stereotyping, and violence targeting Black women and girls specifically', NULL, true, 'Misogynoir (coined by Moya Bailey) is anti-Black misogyny—the specific hatred and violence targeting Black women and girls that is distinct from misogyny targeting white women or racism targeting Black men. Examples: hypersexualization and dehumanization of Black women, "angry Black woman" stereotype, higher rates of intimate partner violence and sexual assault, criminalizing Black motherhood, denial of pain and credibility in healthcare, pushout from schools, exclusion from beauty standards and femininity. Misogynoir is structural (in laws, policies, institutions) not just interpersonal. Addressing misogynoir requires centering Black women''s experiences and safety, not just adding women to anti-racism or Black people to feminism.', 1, '{}', '2025-11-09 13:23:36.28312+00'),
	('d97350da-e768-4b7a-843d-31ff43871a1a', 'af780b40-9fd1-4159-9a30-a247772191cf', 'Not a real concept', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:36.328695+00'),
	('3c1bafca-b708-440b-8278-c1901aca087b', 'af780b40-9fd1-4159-9a30-a247772191cf', 'Only about interpersonal interactions', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:36.37268+00'),
	('ad116814-09e1-4e94-9f36-8526181560ff', '7c032198-b0e3-4cd3-868a-c05040d07210', 'Class does not matter if you face racism', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:36.536869+00'),
	('6848bc99-1a23-44eb-9a1e-d91cc116569b', '7c032198-b0e3-4cd3-868a-c05040d07210', 'Black people face economic oppression through labor exploitation, wealth gap, precarious work, and denial of economic mobility—class does not erase racism and racism shapes class position', NULL, true, 'Class and race are intertwined. Black people in Canada: face wealth gap (lower median income, less homeownership, less intergenerational wealth), are overrepresented in low-wage precarious work, experience labor exploitation (from slavery to contemporary gig economy), face barriers to entrepreneurship and business ownership, and have fragile economic mobility easily disrupted by racism. Wealthy Black people still face racism (carding, discrimination in stores, workplace racism) AND face "Black tax" (expected to support extended family/community, less intergenerational wealth transfer). Working-class Black people face compounded oppression. Addressing economic justice requires tackling racist barriers to wealth-building and employment equity, not just "diversity."', 1, '{}', '2025-11-09 13:23:36.578629+00'),
	('0e9e8244-c6d4-403a-bd45-74a87e10ccb3', '7c032198-b0e3-4cd3-868a-c05040d07210', 'Wealthy Black people face no racism', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:36.627068+00'),
	('8e4fc572-4979-4950-a2a0-cb6f0f74f9d4', 'a0f570d1-8802-425c-98a9-ed94a0fcc88c', 'Black disabled people face compounded discrimination—more likely to be killed by police, excluded from disability justice movements, denied healthcare, and pathologized', NULL, true, 'Black disabled people face unique oppression: Police violence (Black disabled people more likely to be killed during mental health crises or due to not responding to commands), Healthcare discrimination (pain dismissed, needs ignored, experimented on historically and contemporarily), Disability justice exclusion (white-dominated disability movements often ignore race, center white experiences), Pathologization (Black children overdiagnosed with behavioral disabilities, Black adults'' trauma misdiagnosed as mental illness), Barriers to services (poverty, systemic racism, lack of culturally appropriate supports). Addressing this requires: centering Black disabled voices, police abolition, healthcare reform, and building disability justice movements that do not replicate anti-Black racism.', 1, '{}', '2025-11-09 13:23:36.945939+00'),
	('ba29347f-8d98-4607-a5e2-a1e6c44bd87a', 'a0f570d1-8802-425c-98a9-ed94a0fcc88c', 'Ableism only affects white people', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:37.000139+00'),
	('4ea941b2-7995-4849-bca3-b9b2b736949a', 'a0f570d1-8802-425c-98a9-ed94a0fcc88c', 'Anti-racism automatically includes disability justice', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:37.068855+00'),
	('02295067-d2bc-46e2-adc9-5eefdcae3c0f', 'a3bd0fc1-ab78-43ef-9b58-743749ca0e63', 'Any form of discrimination based on skin color', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:37.290845+00'),
	('5b34946f-cd52-4e6b-9ca1-99e12156f674', 'a3bd0fc1-ab78-43ef-9b58-743749ca0e63', 'Prejudice, attitudes, and stereotypes specifically directed at people of Black/African descent', NULL, true, 'Anti-Black racism is the specific prejudice, attitudes, beliefs, stereotyping, and discrimination directed at people of African descent, rooted in their unique history and experience.', 1, '{}', '2025-11-09 13:23:37.337522+00'),
	('12168250-626e-4f49-92ba-8e4f6392a234', 'a3bd0fc1-ab78-43ef-9b58-743749ca0e63', 'Historical events that happened only in the United States', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:37.381077+00'),
	('38c6cd6a-0ac1-4545-b8a9-a0e1ebb9a46d', 'a3bd0fc1-ab78-43ef-9b58-743749ca0e63', 'Individual acts of meanness', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:37.426448+00'),
	('5fe0f0fc-2ce1-48a3-89aa-8bfa711d9aa1', 'a67313f4-8568-44a1-8c51-aad2b04ba80e', '1776', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:37.566742+00'),
	('dba5f55d-3755-4b11-a6f7-cef4bd5f1f89', 'a67313f4-8568-44a1-8c51-aad2b04ba80e', '1807', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:37.664662+00'),
	('55fd4e3e-8f85-46ce-b187-73879fc18f92', 'a67313f4-8568-44a1-8c51-aad2b04ba80e', '1834', NULL, true, 'Slavery was abolished throughout the British Empire, including Canada, in 1834. However, this was not the end of anti-Black discrimination.', 2, '{}', '2025-11-09 13:23:37.731678+00'),
	('9590237f-2d06-4720-a393-509b9034ca54', 'a67313f4-8568-44a1-8c51-aad2b04ba80e', '1865', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:37.790468+00'),
	('89bb28ba-918d-4648-a538-c0f5da5b6ab5', '707e48a6-e212-4f5f-919a-acbe3723ac99', 'Is more harmful', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:38.056422+00'),
	('5f82cebf-8139-42bd-a85f-efa410f322af', '707e48a6-e212-4f5f-919a-acbe3723ac99', 'Is embedded in policies, practices, and institutions', NULL, true, 'Systemic racism is embedded in the policies, practices, and procedures of institutions and systems, creating barriers for racialized groups regardless of individual intentions.', 1, '{}', '2025-11-09 13:23:38.123928+00'),
	('663de631-0f7b-49a0-bfe8-b5df79b4bdf9', '707e48a6-e212-4f5f-919a-acbe3723ac99', 'Only affects Black people', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:38.211773+00'),
	('ec7d0108-c267-4b87-ad1d-8580c33aae32', '707e48a6-e212-4f5f-919a-acbe3723ac99', 'Is easier to identify', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:38.313346+00'),
	('d1725592-a752-4c4e-b74f-f5815597d21d', '13043711-554f-41c3-b6c1-8c8598cd285d', 'Ontario', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:38.510782+00'),
	('a17ded5a-61a3-4dc1-934d-4bc3182409a9', '13043711-554f-41c3-b6c1-8c8598cd285d', 'Quebec', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:38.553055+00'),
	('f6bdfea7-83cf-4c05-85c3-f001313a0719', '13043711-554f-41c3-b6c1-8c8598cd285d', 'Nova Scotia', NULL, true, 'Nova Scotia maintained legally segregated schools for Black students until 1965, demonstrating the persistence of formal discrimination in Canada.', 2, '{}', '2025-11-09 13:23:38.600159+00'),
	('13c71966-0811-4365-a304-82ccc69b8450', '13043711-554f-41c3-b6c1-8c8598cd285d', 'British Columbia', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:38.64193+00'),
	('d68ea675-227a-45cf-a577-95817dd1517a', '7a70e679-470b-4c00-b686-b7dd663d108e', 'Canada being exceptionally anti-racist', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:38.829488+00'),
	('496de825-76ac-4dfd-983a-b9e56099055e', '7a70e679-470b-4c00-b686-b7dd663d108e', 'The false belief that Canada does not have a history of racism', NULL, true, 'Canadian exceptionalism is the myth that Canada is inherently more tolerant than other countries (especially the US), which obscures our own history and present reality of anti-Black racism.', 1, '{}', '2025-11-09 13:23:38.881446+00'),
	('90f4ec82-fce5-43ea-b832-ca69f11f42f9', '7a70e679-470b-4c00-b686-b7dd663d108e', 'Canada having better diversity policies than other countries', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:38.946785+00'),
	('e86b73ce-2a9f-4579-a865-2a577656034b', '7a70e679-470b-4c00-b686-b7dd663d108e', 'Black excellence in Canada', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:39.034417+00'),
	('e8378241-f9d2-4cbe-9368-cae445985e5b', '92128a41-2f85-411b-865a-3b1fde6b006d', 'Providing specialized education', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:39.233454+00'),
	('50962edb-3f32-4832-8774-00b6e4b8eac1', '92128a41-2f85-411b-865a-3b1fde6b006d', 'Placing them in lower academic tracks, limiting opportunities', NULL, true, 'Streaming places Black students disproportionately in applied or basic level courses, limiting access to university and career opportunities despite ability.', 1, '{}', '2025-11-09 13:23:39.280192+00'),
	('fab4af24-7e89-442d-bcfa-c1de5d5dc160', '92128a41-2f85-411b-865a-3b1fde6b006d', 'Helping them graduate faster', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:39.317536+00'),
	('0b524a91-9bfd-4bb3-83e9-1a2d95d0765e', '92128a41-2f85-411b-865a-3b1fde6b006d', 'Giving them more teacher attention', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:39.400166+00'),
	('576f20ec-69d5-45d9-8c5e-bed7a0e18daa', '4042bcce-bf07-4142-83f7-942a2a5b6427', 'Checking identification at clubs', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:39.56359+00'),
	('25619ba4-203b-491d-af54-4aa9ec6ab459', '4042bcce-bf07-4142-83f7-942a2a5b6427', 'Police randomly stopping and documenting individuals', NULL, true, 'Carding (or street checks) is the practice of police arbitrarily stopping, questioning, and documenting individuals. Data shows Black people are disproportionately carded.', 1, '{}', '2025-11-09 13:23:39.662365+00'),
	('15241bca-b491-4e15-9e7e-7a07616a7d9d', '4042bcce-bf07-4142-83f7-942a2a5b6427', 'Credit card fraud', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:39.75099+00'),
	('cc75d615-03c1-4bd6-9525-4d05c4143f57', '4042bcce-bf07-4142-83f7-942a2a5b6427', 'School identification systems', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:39.825179+00'),
	('1a0183ed-e5d2-4538-b092-ce4e894dd461', '3e16e289-c7e6-42a9-932d-51aa7e875bf9', 'Same rate', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:40.024695+00'),
	('700a99b8-b15d-41af-a444-d6471e626cc8', '3e16e289-c7e6-42a9-932d-51aa7e875bf9', '1.5 times', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:40.072809+00'),
	('60619f6f-724b-46d9-a552-0c37d419703d', '3e16e289-c7e6-42a9-932d-51aa7e875bf9', '3 times', NULL, true, 'Research shows Black students in Ontario are approximately 3 times more likely to be suspended, even for similar behaviors, indicating bias in discipline.', 2, '{}', '2025-11-09 13:23:40.115797+00'),
	('a7515d30-bb15-466c-8731-44033b2f2aeb', '3e16e289-c7e6-42a9-932d-51aa7e875bf9', '5 times', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:40.155998+00'),
	('5a83118d-fc9c-4414-930a-b8add7f52eb9', 'e52e46f9-9334-414d-80de-a84b8b3890c4', 'Only affects racist people', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:40.340265+00'),
	('e36a4add-63cb-464a-b41e-5a2ae2183e96', 'e52e46f9-9334-414d-80de-a84b8b3890c4', 'Can be completely eliminated with training', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:40.390003+00'),
	('ff97ac69-2dee-4ec1-aa64-0893b794f8b9', 'e52e46f9-9334-414d-80de-a84b8b3890c4', 'Exists in everyone and requires ongoing work to address', NULL, true, 'Unconscious bias affects everyone due to societal conditioning. Recognizing and actively working to counter these biases is an ongoing process.', 2, '{}', '2025-11-09 13:23:40.474704+00'),
	('360c1a63-acbb-44ba-a456-188fd0fb0c02', 'e52e46f9-9334-414d-80de-a84b8b3890c4', 'Is not relevant to anti-Black racism', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:40.535264+00'),
	('c3d2e614-4fd0-4979-bccd-345db2a121a9', '47dbc192-0bcd-473a-be36-8e8dea7e66ca', 'Your own comfort', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:40.734183+00'),
	('2e9f7565-e335-42fa-9763-c20a10b25d54', '47dbc192-0bcd-473a-be36-8e8dea7e66ca', 'The safety and wishes of the person experiencing racism', NULL, true, 'The safety and preferences of the person experiencing racism should guide your intervention. Sometimes direct intervention can escalate harm.', 1, '{}', '2025-11-09 13:23:40.775278+00'),
	('f122becf-b66f-4eb7-befc-005de1653d64', '47dbc192-0bcd-473a-be36-8e8dea7e66ca', 'Not making a scene', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:40.81945+00'),
	('56330ae3-82d6-4ff1-944c-363d8187ae91', '47dbc192-0bcd-473a-be36-8e8dea7e66ca', 'Proving you are not racist', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:40.887367+00'),
	('3d59a8ec-4372-4cc6-8d46-63862a8ddb3f', 'efb790f0-1cd9-454b-adb5-8e452ce6503d', '"I''m not racist, I have Black friends"', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:41.132517+00'),
	('5af9b36b-a319-449e-9d92-abed9b141027', 'efb790f0-1cd9-454b-adb5-8e452ce6503d', '"I''m sorry you felt that way"', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:41.229474+00'),
	('b40c7248-c052-4e95-b4bc-736252a74ade', 'efb790f0-1cd9-454b-adb5-8e452ce6503d', '"I apologize for the harm I caused. I will educate myself and do better"', NULL, true, 'True accountability involves acknowledging harm without defensiveness, taking responsibility, and committing to change without burdening the harmed person with your education.', 2, '{}', '2025-11-09 13:23:41.374129+00'),
	('c185a058-c9b0-4d46-a100-766777f8c086', 'efb790f0-1cd9-454b-adb5-8e452ce6503d', '"You''re too sensitive"', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:41.479072+00'),
	('a03e08f6-1fde-49c7-a352-cb1ce31a9415', '59e81924-a2dc-400c-8b0a-415d318c6444', 'A one-time training', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:41.702954+00'),
	('d0b4e8c0-28ab-464f-9143-c49eef1377c8', '59e81924-a2dc-400c-8b0a-415d318c6444', 'Only for Black people to do', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:41.753502+00'),
	('8fcad8d7-8599-49da-8475-c18cf3cf99de', '59e81924-a2dc-400c-8b0a-415d318c6444', 'A lifelong commitment requiring continuous learning and action', NULL, true, 'Anti-racism is ongoing work that requires continuous learning, unlearning, and action. It is never "complete" because society and we ourselves are always evolving.', 2, '{}', '2025-11-09 13:23:41.803882+00'),
	('d8308a18-1cce-4c2d-a0ea-a228c173d10c', '59e81924-a2dc-400c-8b0a-415d318c6444', 'Complete once you understand the issues', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:41.859746+00'),
	('a623a84e-9833-4259-bc1b-401812dfbf54', '362677f6-0d7f-4b4c-90dc-d31c86c14767', 'Equality means everyone gets the same thing; equity means everyone gets what they need', NULL, true, 'Equality treats everyone the same, which may not address different needs or barriers. Equity recognizes that people start from different places and provides what each person needs to achieve fair outcomes.', 0, '{}', '2025-11-09 13:23:42.063595+00'),
	('88bb88c2-1b34-4631-92cc-ccbc53e33388', '362677f6-0d7f-4b4c-90dc-d31c86c14767', 'Equality is newer; equity is an older concept', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:42.109947+00'),
	('14e86604-3c5d-49de-b32a-07c8d45098f4', '362677f6-0d7f-4b4c-90dc-d31c86c14767', 'Equality applies to race; equity applies to gender', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:42.167753+00'),
	('2d24b44f-8061-4a79-b119-b56bb5f4894f', '362677f6-0d7f-4b4c-90dc-d31c86c14767', 'They mean the same thing', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:42.229277+00'),
	('2bcc0062-056c-4cc3-a5d6-17a7fc0daf11', '7b826932-3083-45a5-add1-d2f0c7b57a36', 'Specific examples of prohibited conduct', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:42.354253+00'),
	('5f67c853-596e-4a78-a5aa-7107dc113071', '7b826932-3083-45a5-add1-d2f0c7b57a36', 'Clear reporting procedures with timelines', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:42.396102+00'),
	('6cfa3faa-414e-468f-8327-381ff9c7ead3', '7b826932-3083-45a5-add1-d2f0c7b57a36', 'Subjective language like "professional appearance" without definition', NULL, true, 'Subjective terms like "professional appearance" can be interpreted through cultural biases and enforced discriminately. Policies should use objective, clearly defined criteria.', 2, '{}', '2025-11-09 13:23:42.444048+00'),
	('6e10f392-d5db-41de-af6e-fc64fd7b2a32', '7b826932-3083-45a5-add1-d2f0c7b57a36', 'Regular review and update schedule', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:42.480995+00'),
	('ff07fccc-d88d-4a0e-8c9b-aed6af27b613', 'ebe71863-ce64-42e8-b85c-5aacbc664bbf', 'It''s legally required', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:42.607764+00'),
	('6b5f2009-164f-42a5-a58c-70af15d581c9', 'ebe71863-ce64-42e8-b85c-5aacbc664bbf', 'They can identify barriers and unintended consequences that others might miss', NULL, true, 'Black employees have lived experience with racism and can identify issues that others might overlook. Their input helps create more effective policies and demonstrates genuine commitment to equity.', 1, '{}', '2025-11-09 13:23:42.657+00'),
	('42cc2c9c-cbd0-4b20-9dee-c1cc6f49e027', 'ebe71863-ce64-42e8-b85c-5aacbc664bbf', 'To check for grammar and spelling errors', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:42.701938+00'),
	('04000bcf-9927-42f6-aabd-93b90e3221db', 'ebe71863-ce64-42e8-b85c-5aacbc664bbf', 'So they can''t complain later', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:42.756311+00'),
	('49d8e731-8172-486c-ab0c-bdd01955b4c7', 'b81a7191-7b06-4766-953f-eb216ea293f4', 'It costs too much money', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:42.935548+00'),
	('078e6664-bc6d-44f7-9365-f141fb10dd19', 'b81a7191-7b06-4766-953f-eb216ea293f4', 'It brings in Black employees but doesn''t create an environment where they can thrive', NULL, true, 'Diversity (representation) without inclusion means Black employees may be hired but face barriers to advancement, belonging, and success. True equity requires both diverse representation and inclusive culture.', 1, '{}', '2025-11-09 13:23:42.998237+00'),
	('897df568-ebd9-4979-bb4a-43dc95d06f78', 'b81a7191-7b06-4766-953f-eb216ea293f4', 'It violates employment laws', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:43.045981+00'),
	('5665dbbe-e051-42f2-833f-8c61df5ef504', 'b81a7191-7b06-4766-953f-eb216ea293f4', 'It takes too much time', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:43.092819+00'),
	('c5329c2f-b604-4836-a4ea-d00890c4b99c', 'a3c2518d-e5d7-49dc-ab49-17401b723437', 'Sending a statement after a racial justice incident', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:43.256072+00'),
	('d6399d23-4cf0-4d6d-ad2e-b37e9cf56623', 'a3c2518d-e5d7-49dc-ab49-17401b723437', 'Hosting a lunch-and-learn during Black History Month', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:43.296471+00'),
	('b2ccd873-5c4c-45a0-a753-df8959051299', 'a3c2518d-e5d7-49dc-ab49-17401b723437', 'Conducting a racial equity audit and transparently sharing results and action plans', NULL, true, 'Genuine commitment involves assessing current state, being transparent about findings, and taking concrete action. Statements and one-time events without systemic change are performative.', 2, '{}', '2025-11-09 13:23:43.342669+00'),
	('870d6847-9db0-456b-8da4-e875d12e1841', 'a3c2518d-e5d7-49dc-ab49-17401b723437', 'Hiring a Chief Diversity Officer', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:43.384532+00'),
	('c5d9a897-eddc-4918-a15d-9f5e793a3c30', 'cd4e7e2a-a732-4549-94e2-2f5c76528189', 'Use legal jargon to ensure enforceability', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:43.511857+00'),
	('825d40b2-bd83-44ca-b267-6fe29f0d2c41', 'cd4e7e2a-a732-4549-94e2-2f5c76528189', 'Keep policies vague to allow flexibility', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:43.568263+00'),
	('e8b80037-4a86-4fcd-81c3-fef9ca243d04', 'cd4e7e2a-a732-4549-94e2-2f5c76528189', 'Use specific, objective criteria and avoid subjective terms like "culture fit"', NULL, true, 'Inclusive policies should use clear, specific, objective language that reduces bias. Subjective terms can be interpreted through cultural biases and enforced discriminately.', 2, '{}', '2025-11-09 13:23:43.654477+00'),
	('33481d53-777d-4d3c-8729-9d66fb007bd4', 'cd4e7e2a-a732-4549-94e2-2f5c76528189', 'Focus only on what is prohibited, not what is encouraged', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:43.718578+00'),
	('ea9a41ce-ef60-41fd-a444-65c2166467a6', '6d96b9d9-ab80-43b4-94e6-ee0a3154336b', 'Count the number of Black employees hired', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:43.868559+00'),
	('04e83e7c-5763-42db-9493-8098b4072f0c', '6d96b9d9-ab80-43b4-94e6-ee0a3154336b', 'Track multiple metrics including retention, promotion, engagement, and qualitative feedback from Black employees', NULL, true, 'Measuring inclusive culture requires multiple indicators: quantitative metrics (retention, promotion, pay equity), qualitative data (employee feedback, exit interviews), and behavioral observations. Hiring alone doesn''t reflect inclusion.', 1, '{}', '2025-11-09 13:23:43.912897+00'),
	('511f91ee-f7be-489e-995e-3972be46894d', '6d96b9d9-ab80-43b4-94e6-ee0a3154336b', 'Ask white employees if they see any problems', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:43.954409+00'),
	('bd6dce1b-e0c9-427b-8fb9-8ba24b90ee44', '6d96b9d9-ab80-43b4-94e6-ee0a3154336b', 'Check if there have been any formal complaints', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:43.994636+00'),
	('16d25434-7819-4228-ac14-d7b223233783', 'c9a3c484-b49c-401c-a8cf-017553e186b8', 'It''s required by law', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:44.18747+00'),
	('b030551f-02de-45a5-aee6-a08f2382650c', 'c9a3c484-b49c-401c-a8cf-017553e186b8', 'It reveals whether Black employees can advance or are concentrated at lower levels', NULL, true, 'Overall representation can mask inequity. An organization might have good overall representation but if Black employees are concentrated at entry level and absent from leadership, that indicates barriers to advancement.', 1, '{}', '2025-11-09 13:23:44.240632+00'),
	('f896d69e-5ac3-4836-ad4c-947573430bb8', 'c9a3c484-b49c-401c-a8cf-017553e186b8', 'It makes the reports longer', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:44.336775+00'),
	('9586e666-f59d-4c53-aaf1-bb64c360981c', 'c9a3c484-b49c-401c-a8cf-017553e186b8', 'It''s easier to calculate', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:44.381484+00'),
	('33e08359-ab86-4f51-b13b-5189442bff3d', 'd99cf7b8-e4fe-4c05-b571-702137e3da20', 'Black employees are less committed', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:44.523293+00'),
	('88a44386-3553-438f-94ee-a8aba36f0b25', 'd99cf7b8-e4fe-4c05-b571-702137e3da20', 'The organization is doing a good job of hiring', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:44.565247+00'),
	('7ea553ce-c831-4e22-ba80-6c1b7b3c323e', 'd99cf7b8-e4fe-4c05-b571-702137e3da20', 'Black employees may not feel included or see opportunities for advancement', NULL, true, 'High voluntary turnover among Black employees often signals issues with inclusion, belonging, advancement opportunities, or experiencing discrimination. It''s a red flag that requires investigation.', 2, '{}', '2025-11-09 13:23:44.60143+00'),
	('cd759f45-34a9-4452-a522-358874288ee4', 'd99cf7b8-e4fe-4c05-b571-702137e3da20', 'Salaries are too high', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:44.660691+00'),
	('69548abb-18aa-485d-b7f5-bb60ba54fca5', '0b4cc460-5ed8-4415-a711-428ad15de6e5', 'It''s easier', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:44.791025+00'),
	('c8ebae70-47c3-4a36-8df9-b9d04c21c110', '0b4cc460-5ed8-4415-a711-428ad15de6e5', 'It''s required by law', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:44.833389+00'),
	('14e03d73-c15b-4350-9713-7f2b20b93377', '0b4cc460-5ed8-4415-a711-428ad15de6e5', 'To ensure you''re comparing similar jobs and isolating any unexplained gaps', NULL, true, 'Pay equity analysis must compare like-to-like (same role, level, location, experience) to determine if there are unexplained gaps based on race. Comparing across different roles doesn''t reveal pay discrimination.', 2, '{}', '2025-11-09 13:23:44.887388+00'),
	('ed02b60b-b072-4194-a91e-f48260ef2adf', '0b4cc460-5ed8-4415-a711-428ad15de6e5', 'To make the organization look better', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:44.922951+00'),
	('47a8e8a9-233b-40b6-b4e1-1bdce80a237f', 'c37dc8ed-cab0-4d84-80a9-ff992ac910b2', 'It''s required by law', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:45.10809+00'),
	('556e9d15-7200-41c8-b7c0-b2ff40f627bd', 'c37dc8ed-cab0-4d84-80a9-ff992ac910b2', 'To identify disparities and track progress toward equity', NULL, true, 'While some data collection may be legally required, the primary purpose should be to identify where disparities exist, track whether interventions are working, and hold the organization accountable for progress.', 1, '{}', '2025-11-09 13:23:45.1494+00'),
	('015dd9df-0fd8-43ac-a323-daf391f9bebb', 'c37dc8ed-cab0-4d84-80a9-ff992ac910b2', 'To fill out government forms', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:45.190108+00'),
	('a9e407be-4efd-40b2-bd23-8c9628d8044b', 'c37dc8ed-cab0-4d84-80a9-ff992ac910b2', 'To look good in marketing materials', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:45.233409+00'),
	('a4984416-8d73-4238-a455-e95f5355ac9a', 'e34759f0-84c0-4641-a3a4-73beafe8a4c7', 'Make it mandatory so you get complete data', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:45.389628+00'),
	('3cf9a12c-7c64-4e32-a7ab-6957e90dbe5a', 'e34759f0-84c0-4641-a3a4-73beafe8a4c7', 'Collect as much detail as possible', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:45.423223+00'),
	('b1d8b73a-1260-4a9f-bcbc-321e9d5257ca', 'e34759f0-84c0-4641-a3a4-73beafe8a4c7', 'Be transparent about purpose and use, make it voluntary, and ensure confidentiality', NULL, true, 'Ethical data collection requires transparency about why you''re collecting and how it will be used, voluntary participation with option to decline, and strong confidentiality protections. Building trust is essential.', 2, '{}', '2025-11-09 13:23:45.466177+00'),
	('2d5ce1b5-3b3b-448e-91cc-c50533f9cc0d', 'e34759f0-84c0-4641-a3a4-73beafe8a4c7', 'Only collect what''s legally required', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:45.503163+00'),
	('af91a156-54eb-4973-b504-4f6334fe0b91', 'f1b3b5f9-59ca-4242-9b62-b7e1fe2d1a0c', 'It''s required by law', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:45.619566+00'),
	('f74054b3-d11e-40f2-9129-7268902ffab2', 'f1b3b5f9-59ca-4242-9b62-b7e1fe2d1a0c', 'It builds trust, drives accountability, and enables benchmarking', NULL, true, 'Transparency builds trust with employees and stakeholders, creates accountability for progress, allows comparison with other organizations, and demonstrates genuine commitment beyond words.', 1, '{}', '2025-11-09 13:23:45.660644+00'),
	('4e4407a8-20cd-4b6b-a180-0a90f86ce8e6', 'f1b3b5f9-59ca-4242-9b62-b7e1fe2d1a0c', 'It makes the organization look good', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:45.7215+00'),
	('9616e51f-91a8-4769-896b-eea695d9847b', 'f1b3b5f9-59ca-4242-9b62-b7e1fe2d1a0c', 'It''s easier than keeping it private', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:45.759858+00'),
	('48c5c69e-afd0-4443-9189-73c8fc83a854', '50bbd472-5067-4342-945c-c28445d3cf3f', 'Explanations for why the disparities exist', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:45.874121+00'),
	('4833de31-d231-4e02-b955-57428aba4d15', '50bbd472-5067-4342-945c-c28445d3cf3f', 'Comparisons showing you''re better than competitors', NULL, false, NULL, 1, '{}', '2025-11-09 13:23:45.916278+00'),
	('041f12d1-6eb2-4d89-9a44-b2ea08836c70', '50bbd472-5067-4342-945c-c28445d3cf3f', 'Specific actions you''re taking to address the disparities with timelines and accountability', NULL, true, 'While context and acknowledgment matter, the most critical element is explaining what concrete actions you''re taking to address disparities, with specific timelines and clear accountability. Data without action is meaningless.', 2, '{}', '2025-11-09 13:23:45.975575+00'),
	('faebfc16-d1fb-4dd4-ab24-f597ad50b70a', '50bbd472-5067-4342-945c-c28445d3cf3f', 'Apologies and statements of regret', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:46.030539+00'),
	('f3315f77-ed91-48db-b9f5-6a601b693498', 'ac3bf6a9-a8a5-4b72-8a15-7ef9c37cdf5a', 'Crime reporting is always objective', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:46.253891+00'),
	('30024bd3-6195-4f49-b614-5cdf0cf85ccc', 'ac3bf6a9-a8a5-4b72-8a15-7ef9c37cdf5a', 'Media disproportionately associates Black people with crime, uses dehumanizing language, and omits context while over-reporting white perpetrators as anomalies', NULL, true, 'Studies show media disproportionately depicts Black people as criminals relative to actual crime data, uses dehumanizing language ("thug," "gang member") more often for Black suspects, publishes mugshots of Black accused more frequently, and frames Black crime as inherent while white crime is contextualized as anomaly. This perpetuates stereotypes linking Blackness with criminality, influences public perception and policy, and dehumanizes victims when they are Black. Ethical reporting requires: equal treatment, humanizing language, systemic context, and interrogating editorial choices.', 1, '{}', '2025-11-09 13:23:46.291527+00'),
	('f7588b5f-42b9-4700-99f4-a77d988aeaa2', 'ac3bf6a9-a8a5-4b72-8a15-7ef9c37cdf5a', 'Crime should not be reported', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:46.362288+00'),
	('5bbfe7d8-cd90-4843-860f-8cc8b3b8c298', 'ac3bf6a9-a8a5-4b72-8a15-7ef9c37cdf5a', 'All crime coverage is racist', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:46.419167+00'),
	('dded5212-d85e-4f4e-b13a-2ab3e7686a1e', '8cbcd47e-05a5-4a41-b1a9-f9ad6243751d', 'Reporting on community challenges', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:46.569236+00'),
	('a06597d3-2d89-4980-a3c8-9376f83d73ae', '8cbcd47e-05a5-4a41-b1a9-f9ad6243751d', 'Media patterns that focus only on problems, pathology, and deficits in Black communities while ignoring contributions, resilience, and systemic causes', NULL, true, 'Deficit narratives frame Black communities solely through problems—poverty, crime, broken families—without context, systemic analysis, or stories of achievement, culture, joy, and resistance. This creates false perception that issues are inherent to Blackness rather than products of racism. Ethical reporting requires: centering Black voices and expertise, reporting systemic causes not just symptoms, including stories of contribution/resilience, and avoiding trauma porn. Balance does not mean ignoring problems—it means contextualizing them within larger realities of community strength and systemic oppression.', 1, '{}', '2025-11-09 13:23:46.611841+00'),
	('0c501fa5-280c-4158-874e-66945901449b', '8cbcd47e-05a5-4a41-b1a9-f9ad6243751d', 'Balanced reporting', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:46.645373+00'),
	('b5e0f856-70d8-4cef-8cb2-11ec26baae23', '8cbcd47e-05a5-4a41-b1a9-f9ad6243751d', 'Only positive stories should be told', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:46.682681+00'),
	('0eaa8ab2-3e68-4898-ae65-e5beab69f3a1', '75821f65-24d4-4dbe-ba4e-a2c05f05d0d4', 'For appearances only', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:46.821124+00'),
	('27d798ab-654f-49b3-818f-28f42cb029ec', '75821f65-24d4-4dbe-ba4e-a2c05f05d0d4', 'Diverse newsrooms including Black journalists shape what stories are covered, how they are framed, what sources are consulted, and what is considered newsworthy', NULL, true, 'Homogeneous (white) newsrooms perpetuate bias through: what stories are deemed important, how issues are framed, which sources are considered credible, what language is used, and what is scrutinized vs accepted. Black journalists bring lived experience, community connections, and critical lens that challenges dominant narratives. However, diversity alone is insufficient—Black journalists must have decision-making power (not just hired to cover "Black issues"), supportive environments, and pathways to leadership. Newsroom diversity is about power: who decides what the public hears?', 1, '{}', '2025-11-09 13:23:46.860142+00'),
	('eb78893a-f5ee-44e3-918b-4cf671e6c19f', '75821f65-24d4-4dbe-ba4e-a2c05f05d0d4', 'Only for reporting on Black communities', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:46.925709+00'),
	('bcce8b7d-e844-4b8f-b4d8-c19868d7339e', '75821f65-24d4-4dbe-ba4e-a2c05f05d0d4', 'Diversity does not affect journalism quality', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:46.963992+00'),
	('54d3ea2b-baee-4b5e-a83b-0b23f96515b1', '28a6f7f1-5037-42f4-8c04-035a944cd3fd', 'Never admitting mistakes', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:47.108166+00'),
	('d3ed6ccf-4492-4204-a98a-97919c2749c1', '31246125-6f14-4049-8c40-3e95da5c12d6', 'Data is not collected on race and police violence', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:49.123012+00'),
	('31bc70eb-4f1e-4159-b983-5d90e7dcda9c', '9145959a-6524-4b3e-938f-d6e09a47a95d', 'There are no alternatives to police', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:49.315583+00'),
	('e61c6668-b43c-497e-b1e0-38aa47ba82e5', '0a88ac16-f301-406c-bd0f-5df012ccac1d', 'Get defensive about your intent', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:51.573241+00'),
	('e832cff3-578c-4275-a684-a2a6417bdd42', '8f8c769b-8d52-4fda-a5b0-ab892abae3bb', 'They are minor and don''t really matter', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:51.715418+00'),
	('b025a366-7f1b-4994-883d-cfb6b50f9aeb', '28a6f7f1-5037-42f4-8c04-035a944cd3fd', 'Systems for community feedback, transparent corrections processes, meaningful apologies, material repair for harm, and ongoing relationship with affected communities', NULL, true, 'Ethical accountability goes beyond legal requirements to include: accessible mechanisms for community feedback (not just comment sections), transparent processes for investigating concerns, prominent corrections (not buried), meaningful apologies acknowledging specific harm, material repair (not just words), and ongoing accountability relationships with Black communities. One-off corrections are insufficient—accountability requires systemic change: examining patterns of harm, changing editorial practices, involving communities in decision-making, and demonstrating change over time. Media must earn trust through consistent action, not performative diversity statements.', 1, '{}', '2025-11-09 13:23:47.148467+00'),
	('d53345e1-2ade-4a90-a74a-132806a33539', '28a6f7f1-5037-42f4-8c04-035a944cd3fd', 'Only issuing corrections when sued', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:47.187644+00'),
	('070cecf4-1f12-41ac-9f26-9063583f9dfa', '28a6f7f1-5037-42f4-8c04-035a944cd3fd', 'Accountability is not necessary for media', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:47.222852+00'),
	('7305e47b-8153-4b7c-bf88-c539bca36b09', 'f965eb15-9d1c-486f-a93b-2faacbb5ffe0', 'Helping people is always good', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:47.45121+00'),
	('bc8c1956-553c-40e9-9078-f10b184e2f23', 'f965eb15-9d1c-486f-a93b-2faacbb5ffe0', 'The harmful pattern where white people position themselves as rescuers of Black communities, centering their own goodness rather than community self-determination', NULL, true, 'White saviorism is the harmful pattern where white people (individuals or organizations) position themselves as rescuers of Black/racialized communities while centering their own benevolence, moral superiority, and comfort. It assumes communities need saving rather than resources and power. White saviorism perpetuates paternalism (we know what''s best for you), extraction (using community stories for fundraising), and maintains power imbalances. Anti-racist work requires stepping back, supporting Black leadership, sharing power—not claiming credit for "saving" anyone.', 1, '{}', '2025-11-09 13:23:47.486495+00'),
	('cc6ccdde-ec89-4bbe-8eed-aea5ca0ebb05', 'f965eb15-9d1c-486f-a93b-2faacbb5ffe0', 'Any white person working in nonprofits', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:47.523604+00'),
	('f6c7cf52-eec1-44e8-b69e-da41792a3c19', 'f965eb15-9d1c-486f-a93b-2faacbb5ffe0', 'Only happens internationally', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:47.560798+00'),
	('04301af3-998a-4e6a-a7c0-8aaf3ca2308d', '0fd17c04-5ce6-48b6-b980-9c6f96c29b5b', 'Black people should handle all Black issues alone', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:47.691555+00'),
	('72b05e75-6742-4a0a-a20b-0305c1076b61', '0fd17c04-5ce6-48b6-b980-9c6f96c29b5b', 'Decisions, programs, and policies affecting Black communities must center Black voices, leadership, and self-determination—not be made for them', NULL, true, '"Nothing About Us Without Us" means Black communities must lead decisions affecting them. Too often, white-led organizations design programs "for" Black communities without meaningful input, then wonder why initiatives fail. This perpetuates harm by: ignoring community expertise, imposing outside solutions, extracting stories/data without benefit, and maintaining power with funders/decision-makers. Authentic partnership requires: centering Black leadership, sharing decision-making power, resourcing community-led solutions, and being accountable to those most impacted—not doing things "for" them.', 1, '{}', '2025-11-09 13:23:47.734885+00'),
	('9ceea62b-860f-4776-8599-5a38afa789a4', '0fd17c04-5ce6-48b6-b980-9c6f96c29b5b', 'Everyone should be included in all decisions', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:47.781545+00'),
	('35d69809-2ad7-4d56-8131-c2c3a7f25422', '0fd17c04-5ce6-48b6-b980-9c6f96c29b5b', 'Only Black people can work on anti-racism', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:47.829179+00'),
	('14f0f0e8-ae6e-483c-b6c8-a4fbdeeeb923', 'd00c9599-a3a6-4b35-b130-6a2f85e781aa', 'Funding is distributed equitably', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:47.949368+00'),
	('ba3b7c2f-48b6-490e-82f7-e8c6e69980e8', 'd00c9599-a3a6-4b35-b130-6a2f85e781aa', 'Black-led organizations receive significantly less funding than white-led organizations, often with more restrictions and less unrestricted support', NULL, true, 'Data consistently show Black-led organizations receive far less philanthropic funding (often <2% of foundation grants), are more likely to receive small/restricted grants vs large/unrestricted gifts, face more burdensome reporting requirements, and have less access to funder networks. This reflects systemic racism in philanthropy: biased perceptions of credibility, risk aversion, homogeneous funder networks, and preference for white-led "neutral" organizations over Black-led community organizations. Funding inequity perpetuates power imbalances and under-resources those closest to problems.', 1, '{}', '2025-11-09 13:23:47.995276+00'),
	('70e10062-95c9-4fc6-b139-d49c9e657cfc', 'd00c9599-a3a6-4b35-b130-6a2f85e781aa', 'Black organizations receive too much funding', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:48.052297+00'),
	('25c3697f-c013-4613-80e5-99eae9f68ae5', 'd00c9599-a3a6-4b35-b130-6a2f85e781aa', 'Race does not affect funding decisions', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:48.095572+00'),
	('79b46db3-7495-4e49-b4c2-fe4bf94b30e6', '9dd9406c-bcba-4786-a434-c907b8335369', 'Trusting organizations will waste money', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:48.282988+00'),
	('fbff2b06-17e0-4aee-81de-d494d3770c7a', '9dd9406c-bcba-4786-a434-c907b8335369', 'Funding practices that provide unrestricted support, reduce burdens, share power, and trust community organizations as experts', NULL, true, 'Trust-based philanthropy shifts from extractive, controlling funding to practices that trust community organizations: providing unrestricted/general operating support (not just project funding), multi-year commitments (not one-year grants), streamlined applications/reporting (not 50-page proposals), participatory decision-making, and building relationships beyond transactions. It recognizes organizations closest to communities are experts—not problems to be managed. Trust-based approaches resource Black-led organizations equitably and acknowledge that restrictive funding perpetuates white institutional control.', 1, '{}', '2025-11-09 13:23:48.341983+00'),
	('05f4ddbb-9ef2-4895-ac09-ab3389236bef', '9dd9406c-bcba-4786-a434-c907b8335369', 'Not requiring any accountability', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:48.393085+00'),
	('0ae08b2c-2fda-477d-8cb5-93aaf7c39f79', '9dd9406c-bcba-4786-a434-c907b8335369', 'Only for large established organizations', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:48.437781+00'),
	('be70f398-cbe7-4206-978f-8e5c201254dd', 'c899f1c1-b720-476b-a8e3-f32d1a4ce055', 'A normal police practice with no racial bias', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:48.70617+00'),
	('49ff8e9f-4093-478d-bb0a-87efcd7b3233', 'c899f1c1-b720-476b-a8e3-f32d1a4ce055', 'The practice of randomly stopping, questioning, and documenting people, disproportionately targeting Black people', NULL, true, 'Carding (street checks) is the practice of police randomly stopping, questioning, and documenting individuals not suspected of any crime. Toronto data showed Black people were 3 times more likely to be carded than white people. It created databases of tens of thousands of Black residents, many never charged with anything. Carding violates rights, erodes trust, and reinforces criminalization of Black communities. Many jurisdictions have restricted or banned the practice.', 1, '{}', '2025-11-09 13:23:48.756466+00'),
	('c1397189-8ca7-4ebb-9e69-49642e5882d6', 'c899f1c1-b720-476b-a8e3-f32d1a4ce055', 'Only happens in the United States', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:48.816504+00'),
	('13978e53-66a1-4994-bd76-4d0240fef032', 'c899f1c1-b720-476b-a8e3-f32d1a4ce055', 'An effective crime prevention strategy', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:48.856418+00'),
	('7361558b-197f-4bd4-b543-617227790079', '31246125-6f14-4049-8c40-3e95da5c12d6', 'Police use force equally across all racial groups', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:48.992179+00'),
	('f1501d87-a9a2-4ac7-af7c-cda2fde31d51', '31246125-6f14-4049-8c40-3e95da5c12d6', 'Black people are significantly overrepresented in police shootings and use of force incidents', NULL, true, 'Data show Black Canadians are vastly overrepresented in police shootings. In Toronto, Black people are 8.8% of population but 37% of people shot by police (20 times the rate). Similar patterns exist across Canada. Black people are also overrepresented in use of force reports, wellness checks gone deadly, and deaths in custody. This is not about behavior—it''s about how police perceive and respond to Black people.', 1, '{}', '2025-11-09 13:23:49.030912+00'),
	('00b15ca6-d23a-4737-a0b1-da90d1ea22e5', '31246125-6f14-4049-8c40-3e95da5c12d6', 'Police violence is not a problem in Canada', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:49.079857+00'),
	('76ee26d4-b4fd-4a30-a385-f97b43d3b265', '9145959a-6524-4b3e-938f-d6e09a47a95d', 'Community-led responses to crises, needs, and harms that prioritize care, support, and addressing root causes rather than criminalization', NULL, true, 'Community-based alternatives send trained community responders (not police) to mental health crises, housing issues, substance use, youth conflicts, etc. Examples include crisis intervention teams, mobile crisis units, street outreach workers, violence interruption programs, and restorative justice circles. These approaches prioritize care, de-escalation, connection to resources, and addressing root causes—resulting in better outcomes and lower costs than police responses.', 1, '{}', '2025-11-09 13:23:49.369841+00'),
	('e76115c1-2ed3-47ac-8bd0-640721eafa50', '9145959a-6524-4b3e-938f-d6e09a47a95d', 'Just hiring more police officers', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:49.411743+00'),
	('71b1b07b-1dbc-4652-b10f-34842e9af1ad', '9145959a-6524-4b3e-938f-d6e09a47a95d', 'Private security companies', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:49.480725+00'),
	('51a1f4c2-ccbc-4971-9e76-72a8af4eb6c5', '6220783a-3737-4fc4-88b2-0094b1493dae', 'Eliminate all law enforcement immediately', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:49.608366+00'),
	('e20132cd-f80e-489c-b4bf-89f54e993183', '6220783a-3737-4fc4-88b2-0094b1493dae', 'Reduce bloated police budgets and reinvest in community resources (housing, mental health, education) that actually create safety', NULL, true, '"Defund the police" means reducing over-inflated police budgets (often 30-50% of municipal budgets) and reinvesting in community resources that address root causes of harm: affordable housing, mental health services, education, youth programs, addiction support. Police don''t prevent crime—addressing poverty, trauma, and lack of resources does. Defunding recognizes police cannot solve social problems and redirects funds to what actually creates safety.', 1, '{}', '2025-11-09 13:23:49.64944+00'),
	('2f1aaf3f-a6d6-4d17-b01e-d34b4cc3adf7', '6220783a-3737-4fc4-88b2-0094b1493dae', 'Stop paying police officers', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:49.712281+00'),
	('e8f7a9e7-897f-49cb-886c-69d86eae241e', '6220783a-3737-4fc4-88b2-0094b1493dae', 'Increase crime', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:49.75502+00'),
	('90008109-fc23-4acf-afe8-254acc676888', '50c3d4a0-a73c-4037-93c4-8f31ebda838a', 'Only for policies that mention race', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:49.989528+00'),
	('791fd07b-b41b-42fc-bf66-24364b9a0871', '50c3d4a0-a73c-4037-93c4-8f31ebda838a', 'A systematic examination of how proposed policies will affect racial equity, identifying disparate impacts before implementation', NULL, true, 'A Racial Equity Impact Assessment (REIA) is a systematic process conducted before policy implementation to: identify how policy will affect different racial groups, predict disparate impacts using data and community input, examine whether policy addresses or perpetuates inequity, and propose modifications to advance equity. REIAs are critical because facially neutral policies often have racist outcomes when historical context and current disparities are ignored. They require disaggregated data, community engagement, and commitment to modify/reject policies that harm Black communities—not just documenting harm.', 1, '{}', '2025-11-09 13:23:50.03074+00'),
	('7a86c340-f2c4-46dd-91a9-be045f19cd92', '50c3d4a0-a73c-4037-93c4-8f31ebda838a', 'Not necessary for policy-making', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:50.079748+00'),
	('2e4abf44-3369-413a-ae96-413756f65706', '50c3d4a0-a73c-4037-93c4-8f31ebda838a', 'Only retrospective analysis', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:50.154046+00'),
	('78e23283-05bd-4c47-96ac-5aba41e4734b', 'f7d21f5c-e6ab-43a5-b8f7-826092c9e16a', 'Policies that do not mention race cannot be racist', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:50.339986+00'),
	('df807d31-008f-40ba-9586-2e20ef333c69', 'f7d21f5c-e6ab-43a5-b8f7-826092c9e16a', 'Policies that do not explicitly mention race but perpetuate racial inequity through disparate impacts, often due to historical context', NULL, true, 'Facially neutral policies do not mention race but perpetuate inequity due to historical context and current disparities. Examples: minimum sentencing laws (appear neutral but disproportionately incarcerate Black people due to biased policing), school funding based on property taxes (perpetuates segregation and under-resourcing in Black neighborhoods), credit score requirements (reflect historical discrimination in lending). These policies maintain systemic racism precisely because they ignore racial context. Colorblindness in policy is not neutral—it perpetuates existing inequity by refusing to address it.', 1, '{}', '2025-11-09 13:23:50.399874+00'),
	('4425f8be-b2cf-4318-a9c3-de5cbef8849d', 'f7d21f5c-e6ab-43a5-b8f7-826092c9e16a', 'All neutral policies are fair', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:50.460116+00'),
	('221f249c-f04d-4679-9a07-bf102129dcc2', 'f7d21f5c-e6ab-43a5-b8f7-826092c9e16a', 'Only explicitly racist policies cause harm', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:50.501437+00'),
	('a258df7d-b3c0-4320-9d56-70c7081943b6', '410b8991-d7e3-47ed-9759-6b28dc87d102', 'Collecting race data is divisive', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:50.618361+00'),
	('afcb1c23-64cb-4ce1-957b-7080cc4a2361', '410b8991-d7e3-47ed-9759-6b28dc87d102', 'Without data showing how policies affect different racial groups, it is impossible to identify disparities, measure progress, or hold systems accountable', NULL, true, 'Race-based data is essential because: you cannot address what you do not measure, aggregate data hides disparities (averaging Black and white outcomes makes racism invisible), policy claims about equity cannot be verified without tracking outcomes by race, and systems cannot be held accountable without evidence. Arguments against collecting race data ("divisive," "creates division") perpetuate racism by making inequity invisible. Disaggregated data reveals disparate impacts and forces acknowledgment of systemic racism—that is why it is resisted. Evidence-based equity policy is impossible without race data.', 1, '{}', '2025-11-09 13:23:50.660191+00'),
	('572527a2-b042-4dc2-9594-3b4202937a69', '410b8991-d7e3-47ed-9759-6b28dc87d102', 'Colorblind policies are better', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:50.697378+00'),
	('3302f168-ad08-4090-9e81-edf0db4a29a4', '410b8991-d7e3-47ed-9759-6b28dc87d102', 'Data is not important for policy', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:50.731948+00'),
	('87aa1bf8-0438-449f-9441-58c2e7d0d344', 'c4792a9e-3d31-4dce-9f1e-2d8cbfc7a25c', 'Assuming policies work as intended', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:50.863362+00'),
	('02dbf7d1-59ea-4821-ad0b-cece9974edca', 'c4792a9e-3d31-4dce-9f1e-2d8cbfc7a25c', 'Tracking outcomes by race, community feedback, enforcement data, ongoing adjustments, and accountability for failing to achieve equity goals', NULL, true, 'Policy wins mean nothing if implementation fails or perpetuates inequity. Effective monitoring requires: disaggregated outcome data (are racial disparities closing?), community feedback from those most impacted, enforcement/compliance data (is policy being implemented?), identification of barriers and unintended consequences, ongoing adjustments based on evidence, and accountability consequences when systems fail to achieve equity. Too often, "equity policies" are passed but never funded, enforced, or monitored—allowing systems to claim progress without change. Advocates must stay engaged beyond policy passage to ensure real implementation and impact.', 1, '{}', '2025-11-09 13:23:50.903038+00'),
	('ff35faab-5500-4e81-b112-40934d796232', 'c4792a9e-3d31-4dce-9f1e-2d8cbfc7a25c', 'Just passing the policy is enough', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:50.937771+00'),
	('cace4266-8a8c-4c7b-a204-feb6787829a3', 'c4792a9e-3d31-4dce-9f1e-2d8cbfc7a25c', 'Implementation does not matter', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:50.986048+00'),
	('f4e0f606-3e83-4335-9e90-e7cfb6e09ee6', '9e1ed1e9-362f-467d-973b-b71b8cf720a6', 'Black Lives Matter', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:51.196845+00'),
	('da88c886-a9f4-4edb-a86f-e99abf6409b5', '9e1ed1e9-362f-467d-973b-b71b8cf720a6', 'I don''t see color', NULL, true, '"I don''t see color" invalidates the lived experience of racism and suggests being Black is something to be overlooked rather than respected.', 1, '{}', '2025-11-09 13:23:51.235116+00'),
	('9e3a1112-8be4-4b84-9c8f-5af4604aa94e', '9e1ed1e9-362f-467d-973b-b71b8cf720a6', 'Systemic racism exists', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:51.270377+00'),
	('848a5491-d66a-4f9f-8625-579cdde1072b', '9e1ed1e9-362f-467d-973b-b71b8cf720a6', 'Let me educate myself', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:51.321086+00'),
	('cebdecaf-0788-470b-b7b4-e73d3d8b2d22', '0a88ac16-f301-406c-bd0f-5df012ccac1d', 'Explain what you actually meant', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:51.452997+00'),
	('0ad7aa5c-da70-4a47-9054-4923545d79a3', '0a88ac16-f301-406c-bd0f-5df012ccac1d', 'Thank them and apologize', NULL, true, 'Thank the person for telling you and apologize for the harm caused. Intent doesn''t negate impact.', 1, '{}', '2025-11-09 13:23:51.494781+00'),
	('5b4670dc-a8f6-46b7-bb89-b13b9843ec3a', '0a88ac16-f301-406c-bd0f-5df012ccac1d', 'Ask them not to be so sensitive', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:51.529785+00'),
	('bafd659c-4807-466d-bff3-81e812097dee', '8f8c769b-8d52-4fda-a5b0-ab892abae3bb', 'They are small individual incidents that accumulate', NULL, true, 'The "micro" refers to individual incidents, but the cumulative effect is significant. Many prefer the term "everyday racism."', 1, '{}', '2025-11-09 13:23:51.767649+00'),
	('6436ea89-8c5f-49eb-8575-120a1f8dd5ef', '8f8c769b-8d52-4fda-a5b0-ab892abae3bb', 'Only micromanagers do them', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:51.810529+00'),
	('67fc8aa9-2fcc-43d7-9230-8c44586ee529', '8f8c769b-8d52-4fda-a5b0-ab892abae3bb', 'They are easy to fix', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:51.855214+00'),
	('f69570cc-f9b9-401d-bc86-5d30d5fc7e94', '9e1ea0b4-4f14-451b-a680-ca695feadecc', 'Nothing, they work fine', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:52.089468+00'),
	('ee5915f5-bc48-40bb-a850-407679b30e44', '9e1ea0b4-4f14-451b-a680-ca695feadecc', 'They rely on homogeneous networks, biased job descriptions, and transactional relationships that exclude Black candidates', NULL, true, 'Traditional recruiting perpetuates exclusion by: relying on homogeneous networks ("who do we know?"), using coded language in job descriptions (e.g., "culture fit," "polish"), requiring unnecessary credentials that screen out qualified candidates, taking transactional approaches (showing up only when hiring), and failing to examine bias in screening. To recruit Black talent authentically, build ongoing relationships with Black communities/institutions, remove barriers, expand networks, and demonstrate genuine commitment.', 1, '{}', '2025-11-09 13:23:52.140224+00'),
	('4a586179-4c5a-4659-9394-a29a62a2f858', '9e1ea0b4-4f14-451b-a680-ca695feadecc', 'They are too inclusive', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:52.194267+00'),
	('f620f803-c6a5-49a0-b84b-6503793025d0', '9e1ea0b4-4f14-451b-a680-ca695feadecc', 'They only need minor tweaks', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:52.251634+00'),
	('61160166-e06a-4ff3-9b3e-35260640054e', '2737d772-e0c7-47f5-a9b3-adaf8bc1cd3b', 'There is no problem with culture fit', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:52.394033+00'),
	('f67e518d-6796-48c6-b3ec-51dde95e13fc', '2737d772-e0c7-47f5-a9b3-adaf8bc1cd3b', 'It is often code for "people like us" and screens out Black candidates who would bring valuable different perspectives', NULL, true, '"Culture fit" sounds neutral but is often code for hiring people similar to existing (often white) staff. It screens out Black candidates who don''t match the dominant culture, reinforcing homogeneity. Research shows candidates who "fit" are often those who look, talk, and think like existing employees. Instead, prioritize "culture add"—hiring people who bring different perspectives, challenge assumptions, and expand your culture. Diversity strengthens teams; homogeneity creates blind spots.', 1, '{}', '2025-11-09 13:23:52.444822+00'),
	('36e9b03d-1511-4052-99bd-04e473d0d871', '2737d772-e0c7-47f5-a9b3-adaf8bc1cd3b', 'It ensures team cohesion', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:52.506004+00'),
	('a7b66e23-ce27-49eb-b2cb-e80d5a03561c', '2737d772-e0c7-47f5-a9b3-adaf8bc1cd3b', 'It helps with retention', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:52.556948+00'),
	('ba3b0316-5510-46fc-aa2f-9ebeee9b327d', '5a35fe81-b9f9-4b46-a90c-cc4622e3f61b', 'They are not committed', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:52.703455+00'),
	('d9e0a4d8-24ba-4ca8-a709-c5f114193150', '5a35fe81-b9f9-4b46-a90c-cc4622e3f61b', 'Due to systemic barriers: microaggressions, exclusion from networks, biased evaluations, lack of advancement, hostile environments, and emotional exhaustion', NULL, true, 'Black employees leave due to hostile work environments: constant microaggressions, being the "only one," exclusion from informal networks/opportunities, biased performance evaluations, glass ceilings blocking advancement, lack of psychological safety, emotional labor of educating colleagues, and watching organizations fail to act on stated DEI commitments. The issue is not individual "fit"—it''s systemic barriers. Exit interviews often reveal patterns organizations ignore. Retention requires addressing root causes, not surface-level perks.', 1, '{}', '2025-11-09 13:23:52.756077+00'),
	('37ef30d9-4fa1-469b-8fc5-ad60ff24263b', '5a35fe81-b9f9-4b46-a90c-cc4622e3f61b', 'Better pay elsewhere', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:52.805364+00'),
	('84b5c4ae-cc96-40b6-a454-06c78691c1ff', '5a35fe81-b9f9-4b46-a90c-cc4622e3f61b', 'Personal reasons unrelated to workplace', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:52.850369+00'),
	('3fd400c5-b27c-477d-b433-3d816ee47e34', '687fbf9a-498f-4b37-a654-1faef1c2c118', 'The same onboarding for everyone', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:52.994444+00'),
	('9c08c1a1-3cd7-46ff-8289-2f9bc40c20cd', '687fbf9a-498f-4b37-a654-1faef1c2c118', 'Intentional access to networks, clear expectations, sponsorship, resources, and addressing barriers Black employees face', NULL, true, 'Equitable onboarding requires more than generic orientation. Black employees need: intentional access to informal networks (not just formal org charts), sponsors (not just mentors) who advocate for them, clear expectations and success metrics, resources and support, education for existing staff on inclusive behaviors, and acknowledgment of barriers they may face. Don''t assume everyone has equal access—white employees benefit from homogeneous networks. Equitable onboarding proactively creates access and support.', 1, '{}', '2025-11-09 13:23:53.05046+00'),
	('740b8d2a-9af5-4ed4-80c1-e84eff26898f', '687fbf9a-498f-4b37-a654-1faef1c2c118', 'A welcome email and desk', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:53.106216+00'),
	('88b1ff01-f74f-4323-8962-e3e606bd0968', '687fbf9a-498f-4b37-a654-1faef1c2c118', 'Diversity training on day one', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:53.151575+00'),
	('15467439-3526-4322-a3cf-f889b9b3f786', '9421818f-d455-4c8c-a4dd-b2419c51bb5e', 'Technology is completely objective and neutral', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:53.436238+00'),
	('4c7bc80a-19df-4aaf-8419-58eebac85db1', '9421818f-d455-4c8c-a4dd-b2419c51bb5e', 'Technology is designed by people with biases, trained on biased data, and deployed in biased systems—reflecting and amplifying existing inequalities', NULL, true, 'Technology is not neutral because: it''s designed by people (often homogeneous tech teams) whose biases shape design choices, it''s trained on historical data reflecting societal racism, algorithms optimize for patterns that include discriminatory patterns, deployment contexts are inequitable, and tech lacks transparency/accountability. The "neutral tech" myth allows companies to disclaim responsibility. In reality, facial recognition misidentifies Black faces, hiring algorithms screen out Black candidates, and predictive policing targets Black neighborhoods—by design, not accident.', 1, '{}', '2025-11-09 13:23:53.474282+00'),
	('532610c0-6179-4cf1-86ea-16695eda6173', '9421818f-d455-4c8c-a4dd-b2419c51bb5e', 'Only certain technologies are biased', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:53.52065+00'),
	('f1fc1214-c8f3-4c5a-8623-892c0d44e3ce', '9421818f-d455-4c8c-a4dd-b2419c51bb5e', 'Bias can be easily removed from technology', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:53.584876+00'),
	('67943e17-8aac-4afd-b3ff-dfb0c00de040', 'c490f284-c657-4fef-8c67-591edd83c4aa', 'They accurately predict crime', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:53.757291+00'),
	('5440cfb2-c237-47e5-aeae-9f96d0659671', 'c490f284-c657-4fef-8c67-591edd83c4aa', 'They are trained on biased policing data and create feedback loops that over-police Black communities', NULL, true, 'Predictive policing algorithms are trained on historical arrest data—which reflects biased policing, not actual crime patterns. If police historically over-policed Black neighborhoods (they did), algorithms "predict" crime there and send more police, leading to more arrests, which "confirms" the prediction. This creates a feedback loop amplifying existing bias. Algorithms don''t predict crime—they predict where police have been. They legitimize discriminatory policing under the guise of "objective" data, making racism harder to challenge.', 1, '{}', '2025-11-09 13:23:53.81067+00'),
	('ebffec80-8f81-4439-898c-bdb29bbab142', 'c490f284-c657-4fef-8c67-591edd83c4aa', 'They reduce bias in policing', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:53.863818+00'),
	('696ee3c9-ca99-4755-8a4e-8ee1748d35a0', 'c490f284-c657-4fef-8c67-591edd83c4aa', 'They are only used in the United States', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:53.917343+00'),
	('9796d8ad-45a4-46cc-b2bc-14369f1ca96c', '030abd3c-3760-4be5-9255-35a4ed802bfa', 'They do not discriminate', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:54.089363+00'),
	('73c8f241-ee1a-4230-963e-777dc9f1cb18', '030abd3c-3760-4be5-9255-35a4ed802bfa', 'They are trained on past hiring data reflecting bias, use proxies for race, and penalize candidates from Black neighborhoods or schools', NULL, true, 'Hiring algorithms perpetuate discrimination by: being trained on historical hiring data (which reflected bias against Black candidates), using proxies for race (names, zip codes, schools, speech patterns), penalizing resume gaps common in marginalized communities, optimizing for "culture fit" (code for homogeneity), and lacking transparency. Amazon''s algorithm penalized resumes mentioning "women''s" organizations. Similar patterns affect Black candidates. Algorithms don''t eliminate bias—they scale and legitimize it under claims of "objectivity."', 1, '{}', '2025-11-09 13:23:54.132237+00'),
	('4677c157-04b2-48b9-8e0e-cfbaa075570a', '030abd3c-3760-4be5-9255-35a4ed802bfa', 'They increase diversity', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:54.18074+00'),
	('2e16fb26-0587-4610-a8e5-c1f674bb5fd7', '030abd3c-3760-4be5-9255-35a4ed802bfa', 'Human recruiters are more biased than algorithms', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:54.229993+00'),
	('b250b558-2f06-42dd-af49-5129971aef96', '6b395d02-91ad-410f-b0ff-33d20cba1dd0', 'Just testing for accuracy', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:54.376008+00'),
	('92b76744-9252-4eba-908f-19586dba059e', '6b395d02-91ad-410f-b0ff-33d20cba1dd0', 'Diverse development teams, bias audits, impact assessments, transparency, accountability mechanisms, and centering affected communities', NULL, true, 'Ethical AI requires: diverse development teams (not just white/Asian men), rigorous bias audits across racial groups, algorithmic impact assessments before deployment, transparency about how algorithms work, accountability when harm occurs, participatory design centering affected communities, ongoing monitoring for disparate impacts, and willingness to NOT deploy when harm cannot be mitigated. "Moving fast and breaking things" breaks people. Ethical AI prioritizes justice over profit.', 1, '{}', '2025-11-09 13:23:54.44682+00'),
	('83c3aea2-2de5-4f32-aa1b-e2eb109ec167', '6b395d02-91ad-410f-b0ff-33d20cba1dd0', 'Faster processing speeds', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:54.49629+00'),
	('5a67926a-573a-455f-9c64-124a27500292', '6b395d02-91ad-410f-b0ff-33d20cba1dd0', 'More data collection', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:54.582421+00'),
	('cfe32970-51bf-45dd-8d56-de52543e525c', 'd99a47b0-7ad9-46ff-86b7-e00aea0b520f', 'Not a legitimate clinical issue', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:54.843179+00'),
	('1874095f-f8e4-466c-8019-a126c351f9e7', 'd99a47b0-7ad9-46ff-86b7-e00aea0b520f', 'Race-based traumatic stress from experiencing racism—including discrimination, violence, microaggressions, and systemic oppression—that causes psychological and physical harm', NULL, true, 'Racial trauma (race-based traumatic stress) is the psychological and physical harm caused by experiences of racism. It includes: direct discrimination and violence, witnessing violence against other Black people, microaggressions and daily assaults, systemic oppression and marginalization, fear for safety due to racism. Symptoms mirror PTSD: hypervigilance, anxiety, depression, anger, physical health impacts, intrusive thoughts. Racial trauma is cumulative—small incidents compound over time. It is intergenerational—passed through families and communities. It is legitimate clinical issue requiring trauma-informed, culturally responsive treatment—not pathologizing natural responses to oppression.', 1, '{}', '2025-11-09 13:23:54.902598+00'),
	('42b61b4c-fa4d-4b93-91d1-6c17fe4e58ff', 'd99a47b0-7ad9-46ff-86b7-e00aea0b520f', 'Only happens with extreme violence', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:54.96349+00'),
	('12ec2003-fae4-4750-aaab-c2a1e35ef119', 'd99a47b0-7ad9-46ff-86b7-e00aea0b520f', 'Same as general trauma', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:55.010528+00'),
	('be8c4957-257e-439a-a2f1-8a379b5dc541', '11bc50a7-2d41-4a81-9dd8-5698ba0e3c70', 'Trauma-informed care is enough without addressing racism', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:55.169111+00'),
	('f2659acd-f108-44c9-b114-2dc1806c97d3', '11bc50a7-2d41-4a81-9dd8-5698ba0e3c70', 'Apply principles of safety, trustworthiness, choice, collaboration, and empowerment while naming and addressing racism as source of trauma', NULL, true, 'Trauma-informed care in anti-racist context requires: Safety—Create physical and psychological safety, recognize racism as safety threat, address racist policies and practices. Trustworthiness—Be transparent about institutional racism, acknowledge harm, build trust through accountability. Choice and collaboration—Center Black agency and self-determination, recognize resilience and resistance not just victimhood. Empowerment—Support Black leadership, validate experiences of racism, provide resources and tools. Cultural responsiveness—Understand cultural context of trauma, work with community healers, avoid pathologizing cultural coping. Critical difference: mainstream trauma-informed care often ignores racism as trauma source—anti-racist approach names and addresses racism directly.', 1, '{}', '2025-11-09 13:23:55.209808+00'),
	('926a0d84-672a-4f28-9669-9404df3fc19b', '11bc50a7-2d41-4a81-9dd8-5698ba0e3c70', 'Ignore race and focus only on trauma', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:55.248917+00'),
	('2a50e90b-2a2d-4278-966a-f6644ae06300', '11bc50a7-2d41-4a81-9dd8-5698ba0e3c70', 'Trauma-informed care is only for clinical settings', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:55.284864+00'),
	('91a61ded-d027-4995-806b-980d56a44062', '7c305960-1af6-4483-af18-c7ebf4c488a6', 'Re-traumatization does not happen in helping professions', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:55.433096+00'),
	('60244aad-995c-4978-ae9a-a9c78abd1e9b', '7c305960-1af6-4483-af18-c7ebf4c488a6', 'Re-traumatization occurs when systems and services cause additional harm—prevent it by addressing racism, building trust, avoiding power-over dynamics, and centering safety', NULL, true, 'Re-traumatization happens when systems/services meant to help cause additional harm. For Black people, this includes: Being disbelieved or dismissed when reporting racism, Facing racism from providers meant to help, Institutional betrayal (organization ignores or covers up harm), Coercive practices removing choice and autonomy, Microaggressions and stereotyping, Culturally inappropriate or harmful interventions. Preventing re-traumatization: Address systemic racism in your institution, Build accountability for racist harm, Create genuine safety not just physical but psychological, Respect Black people''s autonomy and choices, Hire and support Black providers, Listen and believe when Black people name racism, Avoid power-over dynamics, Center healing and restoration not punishment.', 1, '{}', '2025-11-09 13:23:55.470765+00'),
	('486509ad-82f0-4418-a8a6-d786213e61c3', '7c305960-1af6-4483-af18-c7ebf4c488a6', 'Only about reminding people of past trauma', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:55.513857+00'),
	('76242be4-7a27-46bf-bc1b-ca7bfa424947', '7c305960-1af6-4483-af18-c7ebf4c488a6', 'Cannot be prevented', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:55.555505+00'),
	('60f41f1b-db29-4684-b061-472519ee6adb', '7be35117-05e8-4314-b304-3ae57404df51', 'Not real—practitioners should just be tougher', NULL, false, NULL, 0, '{}', '2025-11-09 13:23:55.714605+00'),
	('e1177a6b-4170-4923-991c-781d0884bd2c', '7be35117-05e8-4314-b304-3ae57404df51', 'The emotional and psychological impact of repeatedly witnessing or addressing racism and trauma—requires self-care, supervision, and organizational support', NULL, true, 'Vicarious trauma (secondary traumatic stress, compassion fatigue) affects people doing anti-racism work, especially Black practitioners: Repeatedly hearing/witnessing racist harm, Carrying others'' racial trauma, Working in racist institutions while addressing racism, Experiencing own racism while supporting others, Emotional labor of educating and managing white fragility. Symptoms: burnout, cynicism, hopelessness, anxiety, physical health issues, numbing. For Black practitioners: compounded by own experiences of racism, higher expectations and scrutiny, less institutional support. Addressing it requires: Organizational responsibility (not just individual self-care), Supervision and peer support, Rest and boundaries, Healing-centered approaches, Addressing root causes (institutional racism) not just symptoms. Self-care is not bubble baths—it is systemic change.', 1, '{}', '2025-11-09 13:23:55.752205+00'),
	('f0fd2352-67a6-4c54-bb2c-8cac43ab127c', '7be35117-05e8-4314-b304-3ae57404df51', 'Only affects weak people', NULL, false, NULL, 2, '{}', '2025-11-09 13:23:55.789963+00'),
	('f02f896c-37aa-4ac1-8f60-24637b13982b', '7be35117-05e8-4314-b304-3ae57404df51', 'Same for everyone regardless of race', NULL, false, NULL, 3, '{}', '2025-11-09 13:23:55.823933+00');


--
-- Data for Name: question_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."quiz_questions" ("id", "quiz_id", "question_id", "question_pool_id", "points", "order_index", "is_required") VALUES
	('a9613ff1-47b6-40c0-80a7-5bc873334232', '90910129-a0a9-4670-b22a-0e9a263b0f39', '9bb103b2-ce49-45f0-9589-0d2f431209ca', NULL, 1, 0, true),
	('dda5f2a3-213b-47c2-95af-802c24f4424b', '90910129-a0a9-4670-b22a-0e9a263b0f39', '23f33151-99f3-4a97-9f05-6206c3442b86', NULL, 1, 1, true),
	('548d30ff-484b-41c2-a292-54cdd94f5224', '90910129-a0a9-4670-b22a-0e9a263b0f39', 'def3ce75-a00a-4df7-aca1-85431c9ceec8', NULL, 1, 2, true),
	('140b5676-fb56-4c40-a9e8-ab3fd9209594', '90910129-a0a9-4670-b22a-0e9a263b0f39', '298907a3-c26f-4dd2-9826-87ed1287b71e', NULL, 1, 3, true),
	('651490f8-894b-48d5-884a-7baa9f475d3c', '191f953b-b1fd-4b1a-bc43-ea81a48fa663', 'b70b2ff4-7688-4ae5-b580-3f1aefa13764', NULL, 1, 0, true),
	('2544c71b-9133-4ad3-a3d3-a3b461607a2a', '191f953b-b1fd-4b1a-bc43-ea81a48fa663', '4c348b55-e3f4-4f80-b02f-6827b93592e2', NULL, 1, 1, true),
	('6cccf8bb-fc45-4c88-924a-350bb6db6407', '191f953b-b1fd-4b1a-bc43-ea81a48fa663', 'ceca8c66-ad69-4176-bb6e-13cb9044195f', NULL, 1, 2, true),
	('80ea8268-89d2-46a8-9af8-a0ddbf15634e', '191f953b-b1fd-4b1a-bc43-ea81a48fa663', '1887e377-e69a-47e4-bf60-b396d1947ab5', NULL, 1, 3, true),
	('4efd9af4-0797-4a53-ad5d-885276d7b07e', 'b5b498b4-a08f-4c22-9eea-67394d404453', '959f01d6-a8f5-4e8d-bb44-9da069e5f09e', NULL, 1, 0, true),
	('55c838e3-86ba-4bf2-8b00-8dbb5235189c', 'b5b498b4-a08f-4c22-9eea-67394d404453', '6a0d2d46-5304-411c-9c44-f1c7dff28c5f', NULL, 1, 1, true),
	('1df33460-28f2-4387-b258-b6fa0bae00b6', 'b5b498b4-a08f-4c22-9eea-67394d404453', '4a37ec91-47ca-4099-aef9-5fb3bfc8afff', NULL, 1, 2, true),
	('1c5d7701-3e71-437e-add8-4e04dc75b974', 'b5b498b4-a08f-4c22-9eea-67394d404453', '87e3217f-65a7-4c2e-978e-a9867f687ad7', NULL, 1, 3, true),
	('f1d145df-0d59-4edf-9f28-008fd73a26b6', 'da7c0814-f186-4087-8fed-d52e69a1814d', '11df4b6e-ba1d-4516-a4e6-1e237422ad99', NULL, 1, 0, true),
	('0ce8fd85-2090-4e67-9bc1-8e32f38f3f2b', 'da7c0814-f186-4087-8fed-d52e69a1814d', 'dcdc1d5c-30f4-4abe-8fa8-4247039a3c74', NULL, 1, 1, true),
	('b774c1d3-7cfb-42e7-939f-b7c6311297ae', 'da7c0814-f186-4087-8fed-d52e69a1814d', '2f91fdf7-60a5-4d0e-846c-85d978df7b43', NULL, 1, 2, true),
	('d871f085-738f-4744-bbd5-8cfa0c594950', 'da7c0814-f186-4087-8fed-d52e69a1814d', 'bb517f18-1247-47cd-a3e7-8d4ebfe83876', NULL, 1, 3, true),
	('58e34e09-fef7-4491-9bcd-bdd7cb51782b', '805cb457-b696-4051-934b-23b2b28496a0', 'e7feaecb-b8e2-4610-a0fe-a8bc37680db8', NULL, 1, 0, true),
	('a15e80bb-ed3e-4adb-b12d-0d663338b935', '805cb457-b696-4051-934b-23b2b28496a0', '623d9d9b-7c65-430b-a06c-0c6383d565ba', NULL, 1, 1, true),
	('965fcc10-f265-4ba0-90de-ed80018668eb', '805cb457-b696-4051-934b-23b2b28496a0', '11cd9bfe-5a09-431f-9c2c-318a750f8d8f', NULL, 1, 2, true),
	('0d011c83-0e13-4497-b457-1d1b1c87a4ed', 'd1324f94-57fd-4cdc-b057-35d9050dc029', '6be03fcf-687f-455e-a062-cae4e2ac75a1', NULL, 1, 0, true),
	('bd1ed38e-6399-43a9-aa71-f2c04e03ce1b', 'd1324f94-57fd-4cdc-b057-35d9050dc029', '420a7478-7430-4ed2-96a7-4e7b5a8ef8a0', NULL, 1, 1, true),
	('84fefbc1-30b3-4bf3-a20b-a4700de52982', 'd1324f94-57fd-4cdc-b057-35d9050dc029', '5c97feb3-2f09-467a-a8b5-512a0f50bef2', NULL, 1, 2, true),
	('36ab2aa5-fad7-44e0-ba87-3ec3a4deb920', 'b25ee3f8-b358-494c-b29e-b150bec60550', '457e0ba9-bdf8-4853-9150-62ced9353b05', NULL, 1, 0, true),
	('2c7e5d9c-0cc6-4188-bf01-0149cdc6719e', 'b25ee3f8-b358-494c-b29e-b150bec60550', '4bf17ff1-30b5-4daa-920d-0e16a854d1d2', NULL, 1, 1, true),
	('5d111f9e-7c22-4d38-803a-4f933454df41', 'b25ee3f8-b358-494c-b29e-b150bec60550', 'e195091a-18fa-45cd-809b-bb849439a5c1', NULL, 1, 2, true),
	('b3706d1b-3163-4982-96bc-00827aa0ad55', '2127beaa-1ce3-482d-b3c4-14e8d8645865', '41a3fb01-0ba5-4a95-8f05-1b1c42af5a18', NULL, 1, 0, true),
	('29e3eff9-824e-4258-bed1-1c08ab946f26', '2127beaa-1ce3-482d-b3c4-14e8d8645865', '9606e085-a595-41a2-9e69-ec03171c535b', NULL, 1, 1, true),
	('f29c3045-aa68-4a14-91c9-0394d636322a', '2127beaa-1ce3-482d-b3c4-14e8d8645865', '8211021f-6c72-4171-8e25-b850aac93323', NULL, 1, 2, true),
	('6f795e95-e89c-47a5-afae-1fa2e5be66c4', '2127beaa-1ce3-482d-b3c4-14e8d8645865', 'ed1773fe-a164-426b-a69d-49e57b066331', NULL, 1, 3, true),
	('648b9c5c-9acd-4f0d-82ec-d0e40fca6bb1', '3f810986-6c03-4730-b7a4-83b671f92192', '9285aae1-d227-4791-a25b-1a2c96306a3f', NULL, 1, 0, true),
	('cb97d791-8bbe-4c65-9905-dac73cba9607', '3f810986-6c03-4730-b7a4-83b671f92192', '9c9854d5-0110-44e1-8a60-aece45dbdab7', NULL, 1, 1, true),
	('c528087f-c7a2-449e-ba21-29ab15ec66f4', '3f810986-6c03-4730-b7a4-83b671f92192', '3bca78fa-a4f5-462a-8e1e-6b762d101cb2', NULL, 1, 2, true),
	('4db0801e-c251-467e-85fe-702bd323a25b', '3f810986-6c03-4730-b7a4-83b671f92192', '2ab1f0ad-0697-48cc-89f6-19bc341da715', NULL, 1, 3, true),
	('30fb9479-e7df-4500-a6ba-854a34ccd66a', 'ca38d485-3cff-46e2-99f7-6a075ba32025', '1b8e6384-47d8-4abf-8598-56f6e1fb19d5', NULL, 1, 0, true),
	('15ea6a0b-e881-41a1-850b-b8df96423dfe', 'ca38d485-3cff-46e2-99f7-6a075ba32025', 'f03b09db-b1c5-4f95-a840-0b70cd067716', NULL, 1, 1, true),
	('43fa7c44-e3a8-47a8-b84e-0d5ba16cb519', 'ca38d485-3cff-46e2-99f7-6a075ba32025', '055a147e-2388-4220-aafc-2ead3888e9ef', NULL, 1, 2, true),
	('fdb48d08-2c29-46a8-a6c0-dc6a1c2d3594', '64d2cfb3-fb59-4795-895f-e82601d6461e', 'b1fdbfc9-2a8e-49db-b9c0-8ee0e87039ee', NULL, 1, 0, true),
	('73ed30fc-bfc1-4e4b-a103-bc5a31b6d4f9', '64d2cfb3-fb59-4795-895f-e82601d6461e', 'bbfd73f7-45aa-4a5d-b246-287cca1968c6', NULL, 1, 1, true),
	('c2488af8-07f2-4114-9012-795ad664f80f', '64d2cfb3-fb59-4795-895f-e82601d6461e', 'fda19254-ae76-4779-9447-4a7d86d26217', NULL, 1, 2, true),
	('87b4be74-3423-4b9c-828d-88996511b61d', '64d2cfb3-fb59-4795-895f-e82601d6461e', '2abfd7a8-bdc4-48e9-b1d3-a1d008249540', NULL, 1, 3, true),
	('1a4bba86-f4f9-4fb1-b7ef-c1f3bd511507', 'fdc479d8-3cde-4562-82ed-02edead2c83c', '04e3d9ce-1880-4e42-b9b2-edd74e118530', NULL, 1, 0, true),
	('289b0277-d7bc-403a-bded-4f3112045b70', 'fdc479d8-3cde-4562-82ed-02edead2c83c', 'c271f0d0-b77d-44b5-a9b0-df4f8b1c61cb', NULL, 1, 1, true),
	('160cac20-d57a-4702-988e-adc6b52d046c', 'fdc479d8-3cde-4562-82ed-02edead2c83c', '7fe5dfbb-dd6f-4bdf-9c6e-8122dadd1d91', NULL, 1, 2, true),
	('59061bb1-a907-423c-a2da-c83646762a06', 'fdc479d8-3cde-4562-82ed-02edead2c83c', 'fd7ca207-ecac-412d-9739-407e5bde2053', NULL, 1, 3, true),
	('05954149-f003-4070-aa0d-d9a53c4b28f6', 'd2fe75f7-3a37-4704-b7cf-1a19a47a1cce', '3dde0658-5ae4-4ebe-9196-c6929c2aa164', NULL, 1, 0, true),
	('9a87ec30-d78c-4846-9f52-228a40afd3c7', 'd2fe75f7-3a37-4704-b7cf-1a19a47a1cce', '20e3a2dd-bfb1-40c1-9d21-de08f068f7aa', NULL, 1, 1, true),
	('52089765-3584-475c-a4fe-43d516a8e0ec', 'd2fe75f7-3a37-4704-b7cf-1a19a47a1cce', 'f84cd90a-2cb4-42e1-b7e6-c2f748fac77a', NULL, 1, 2, true),
	('9bddc094-f0d0-4799-8b3a-9b384d79d999', 'd2fe75f7-3a37-4704-b7cf-1a19a47a1cce', '1596d821-1330-404a-94bf-84f681f6d68b', NULL, 1, 3, true),
	('2f63f850-087a-4e41-bd4a-f32d471939ce', '9933e320-e6dc-49b6-b268-d59103eadcb9', 'e78309a5-874f-4ff5-b94d-013012057c0b', NULL, 1, 0, true),
	('52d7e36c-6387-4620-b4a1-96938d521ec9', '9933e320-e6dc-49b6-b268-d59103eadcb9', '6d3f92ed-2e80-44e0-92ec-026f02e14266', NULL, 1, 1, true),
	('1a27085f-c8d8-4bbb-8f33-35dc04de311e', '9933e320-e6dc-49b6-b268-d59103eadcb9', '67b2fe10-dac6-4475-bbd2-89a3b9f56a55', NULL, 1, 2, true),
	('9429476c-2acc-4c9d-b1d9-36517e16941c', '6cf51c3c-7606-4d71-8dc6-de02aafadad1', '15198842-ada8-4f7c-ae2c-316e9efd9a3b', NULL, 1, 0, true),
	('975ad24e-4cd3-47d2-9198-3609586ee74f', '6cf51c3c-7606-4d71-8dc6-de02aafadad1', '257914f7-0d80-4ffb-b796-672eebf8e47f', NULL, 1, 1, true),
	('94405525-163a-4bb0-ac9c-dd613ed6e0ef', '6cf51c3c-7606-4d71-8dc6-de02aafadad1', '67669516-6228-4372-97a7-4ddf606c76a0', NULL, 1, 2, true),
	('08222acb-a809-416d-9a24-2c28ffe123fc', '6cf51c3c-7606-4d71-8dc6-de02aafadad1', '84a7d3f0-5c97-436e-b406-1daad2eb5cc5', NULL, 1, 3, true),
	('71934790-9d9a-4890-b742-8ec3b9d052cb', 'fe067e4e-32bf-45af-800e-c5537bc1a8c6', '0d2125e5-05ce-4aa3-bed5-05e162b05013', NULL, 1, 0, true),
	('21d14b6e-6ca5-4018-85fb-8918a07f8fe4', 'fe067e4e-32bf-45af-800e-c5537bc1a8c6', '301cf478-3b29-41ba-a72a-cce7d612a2b8', NULL, 1, 1, true),
	('98026922-d281-49f4-a91f-aced17461720', 'fe067e4e-32bf-45af-800e-c5537bc1a8c6', 'f0c7f8bc-8650-4fa0-9d45-7dbf43c38c09', NULL, 1, 2, true),
	('6efc8290-750f-438a-8ba2-22f0ce57a535', 'fe067e4e-32bf-45af-800e-c5537bc1a8c6', '44e1df80-a713-4afc-867f-e1e29c1ce34e', NULL, 1, 3, true),
	('04ae7ddc-c779-4d01-95f7-bd07d17f2783', '2c06214c-81b8-41c5-a4d1-90b5c15488b1', '61d89412-eca2-46b6-9ac1-5f13a452133e', NULL, 1, 0, true),
	('5eff254b-9a01-4b41-a8dc-56a9457bb598', '2c06214c-81b8-41c5-a4d1-90b5c15488b1', 'b67bc05b-8836-4d9c-8bac-a2b431d60748', NULL, 1, 1, true),
	('241bd8bb-0fe3-4c12-a4e0-79df7a21b2b9', '2c06214c-81b8-41c5-a4d1-90b5c15488b1', '069a89d8-3ef7-45c2-9cc4-35bf38476a9f', NULL, 1, 2, true),
	('5faf617c-42dc-46a2-895a-0d5d2f0d59db', '2c06214c-81b8-41c5-a4d1-90b5c15488b1', '52dc30e6-a35e-4d9d-9fc9-7ca4342d11fc', NULL, 1, 3, true),
	('ecc3bb14-c735-41a8-848e-9ba471204841', 'cdb71704-04f8-4d04-97f2-e421fa5fa197', '070b54af-075d-4440-8cc9-2dc11e7e68df', NULL, 1, 0, true),
	('fd57758b-c419-41ba-a287-ec894c8eaeaa', 'cdb71704-04f8-4d04-97f2-e421fa5fa197', '938f017c-9613-4cc3-9d64-3a627dd3615d', NULL, 1, 1, true),
	('8a5f6809-e1d6-4d35-84ff-0f53429180b3', 'cdb71704-04f8-4d04-97f2-e421fa5fa197', '0ec4ab10-8045-43ae-b120-f8c53ea3d6ac', NULL, 1, 2, true),
	('2a5c373a-65c1-491d-9c5c-cd0f06421169', 'cdb71704-04f8-4d04-97f2-e421fa5fa197', '4058e42b-6f61-4fce-8cbb-ae841bb7197e', NULL, 1, 3, true),
	('ed31e901-261c-47b5-81f8-cd492112b97b', '1416aa01-8709-4078-9d64-5535178339e3', '7d73811d-d860-4b47-80b4-738999138614', NULL, 1, 0, true),
	('270f835a-25d4-4ce2-8da0-9592f96216f4', '1416aa01-8709-4078-9d64-5535178339e3', 'd2aace40-7111-4289-9dae-14d3fa183f8b', NULL, 1, 1, true),
	('9cf7e982-5c12-4007-b930-146334cb612e', '1416aa01-8709-4078-9d64-5535178339e3', '55122dc1-ca87-4b65-9384-a570f73da9bc', NULL, 1, 2, true),
	('a9c66be1-514c-4880-a1d1-fa8dae26e0f0', '1416aa01-8709-4078-9d64-5535178339e3', 'd7f2cd90-fea3-4c0e-92b5-38ec81136f14', NULL, 1, 3, true),
	('214244c1-83aa-4e1d-a2e8-f9131bae173d', 'fbc3d7e0-65c1-431b-a901-441f5dbce861', '6b7f5714-2f3e-45c7-9b88-cbec8603a3df', NULL, 1, 0, true),
	('f565e71c-2e0f-4d7e-b7e3-613d8a64219e', 'fbc3d7e0-65c1-431b-a901-441f5dbce861', '41b72555-dfd3-4965-b8c6-1351b4a362d3', NULL, 1, 1, true),
	('2f9f1f3a-f417-4214-b345-8b9f86242660', 'fbc3d7e0-65c1-431b-a901-441f5dbce861', '4c21bfc9-bc1c-418a-ae3d-d32cb808f422', NULL, 1, 2, true),
	('b2c5df7c-30ee-41c7-ad08-163a5edd6f45', 'fbc3d7e0-65c1-431b-a901-441f5dbce861', '8ad3a071-7344-4787-b691-409693ac8e5e', NULL, 1, 3, true),
	('f25c7077-c2f9-4375-9aa8-d60f3b4ffae8', 'b56afcd9-29af-41c5-aaaa-223818e9aaba', '254c19ca-77ef-430c-8745-d1dfdff85b88', NULL, 1, 0, true),
	('11200999-cf88-4154-b870-7401821ee8af', 'b56afcd9-29af-41c5-aaaa-223818e9aaba', 'df961da5-0fce-46ea-afe0-5a0e55caa908', NULL, 1, 1, true),
	('5d29a2eb-be99-44dd-98d7-742d3d3c28dc', 'b56afcd9-29af-41c5-aaaa-223818e9aaba', '617b2e84-f3b7-432d-8f9a-a4f81b5c7989', NULL, 1, 2, true),
	('71826cc8-7a75-4d31-bd83-00023242223c', 'b56afcd9-29af-41c5-aaaa-223818e9aaba', 'd3f3bccc-3a1a-4d2d-bd23-99e7e6ef18d3', NULL, 1, 3, true),
	('7caeca67-4eda-49ff-a377-fd44d81ffdac', '7b53b7df-f0c9-4f3c-8a5a-8ad40334512e', '4f5a8533-8dcb-4e0b-ae8f-36ef642fd089', NULL, 1, 0, true),
	('1069dd5e-fabd-4c37-a859-dd6ca06d511c', '7b53b7df-f0c9-4f3c-8a5a-8ad40334512e', '10a798d3-ab17-4ea7-8109-3d60db980f16', NULL, 1, 1, true),
	('e882ccab-837e-4981-abb8-0e255a5db8f9', '7b53b7df-f0c9-4f3c-8a5a-8ad40334512e', '8d2594c4-71d6-4437-8456-6c6bb21acc60', NULL, 1, 2, true),
	('a4029119-be36-4b54-b68d-aedf2048f3d4', '7b53b7df-f0c9-4f3c-8a5a-8ad40334512e', '68075fe7-83c0-486d-bd72-7d3c4d3916d5', NULL, 1, 3, true),
	('eaef4c5b-1052-408a-bf37-03167f7115cc', '3d14462c-455b-4649-be10-8bd571585eaa', 'a0e95724-d6ef-443a-a4eb-cdeaee75f50e', NULL, 1, 0, true),
	('8b5e4dd7-1831-40c5-9daf-303a964a5580', '3d14462c-455b-4649-be10-8bd571585eaa', 'af780b40-9fd1-4159-9a30-a247772191cf', NULL, 1, 1, true),
	('0cbff4f0-af35-476f-9698-a30ba75a6308', '3d14462c-455b-4649-be10-8bd571585eaa', '7c032198-b0e3-4cd3-868a-c05040d07210', NULL, 1, 2, true),
	('7aa4ab30-3947-4b19-b7aa-0134dad6c970', '3d14462c-455b-4649-be10-8bd571585eaa', 'a0f570d1-8802-425c-98a9-ed94a0fcc88c', NULL, 1, 3, true),
	('303924a9-8448-4d41-a44c-24dfcdc82947', 'f4f766a4-4a85-4f6a-9dae-72a1b8507f04', 'a3bd0fc1-ab78-43ef-9b58-743749ca0e63', NULL, 1, 0, true),
	('8dc56dc8-e155-456b-9769-08e0e6cb5ff9', 'f4f766a4-4a85-4f6a-9dae-72a1b8507f04', 'a67313f4-8568-44a1-8c51-aad2b04ba80e', NULL, 1, 1, true),
	('94ea30b0-3763-4d9e-b068-f49b996917a0', 'f4f766a4-4a85-4f6a-9dae-72a1b8507f04', '707e48a6-e212-4f5f-919a-acbe3723ac99', NULL, 1, 2, true),
	('7976cd9e-b5d5-4b61-9328-b5c3ae8448b3', 'f4f766a4-4a85-4f6a-9dae-72a1b8507f04', '13043711-554f-41c3-b6c1-8c8598cd285d', NULL, 1, 3, true),
	('2aeeda24-7537-48ea-8691-953f5b8defdb', 'f4f766a4-4a85-4f6a-9dae-72a1b8507f04', '7a70e679-470b-4c00-b686-b7dd663d108e', NULL, 1, 4, true),
	('fd42abb8-b8d7-4eb6-81c5-e8b1c3025775', '35e0c543-054f-4a46-b4aa-5231cb65a37d', '92128a41-2f85-411b-865a-3b1fde6b006d', NULL, 1, 0, true),
	('0a887ed1-77f6-48a3-89ff-bec1702e12b0', '35e0c543-054f-4a46-b4aa-5231cb65a37d', '4042bcce-bf07-4142-83f7-942a2a5b6427', NULL, 1, 1, true),
	('98b20b7a-3fcd-4965-abff-49d891b9e7f8', '35e0c543-054f-4a46-b4aa-5231cb65a37d', '3e16e289-c7e6-42a9-932d-51aa7e875bf9', NULL, 1, 2, true),
	('272ba934-48c8-466f-bf71-a164e64ffc9b', 'c46b6de5-df51-43ef-958e-28e573475bab', 'e52e46f9-9334-414d-80de-a84b8b3890c4', NULL, 1, 0, true),
	('ed9d2d2a-cc93-4fbf-b9bc-d248044689ed', 'c46b6de5-df51-43ef-958e-28e573475bab', '47dbc192-0bcd-473a-be36-8e8dea7e66ca', NULL, 1, 1, true),
	('dfa4a300-ee40-4812-9110-da12c45296b6', 'c46b6de5-df51-43ef-958e-28e573475bab', 'efb790f0-1cd9-454b-adb5-8e452ce6503d', NULL, 1, 2, true),
	('e5b51cd1-1cf4-4566-a8a0-e34da3384190', 'c46b6de5-df51-43ef-958e-28e573475bab', '59e81924-a2dc-400c-8b0a-415d318c6444', NULL, 1, 3, true),
	('13d78686-3c93-4a40-9aa4-064cb779ed33', '6e512818-cf8a-4869-995a-3035d4f755a8', '362677f6-0d7f-4b4c-90dc-d31c86c14767', NULL, 1, 0, true),
	('37758ff3-a090-43dc-8969-ce799010df68', '6e512818-cf8a-4869-995a-3035d4f755a8', '7b826932-3083-45a5-add1-d2f0c7b57a36', NULL, 1, 1, true),
	('97a5290e-5fcc-4cd6-9d43-8a16ace2ff23', '6e512818-cf8a-4869-995a-3035d4f755a8', 'ebe71863-ce64-42e8-b85c-5aacbc664bbf', NULL, 1, 2, true),
	('f160ae88-1e85-40e7-baff-a34308dfef63', '42296a6b-b1d6-4a1a-ae70-db99ea4e20c0', 'b81a7191-7b06-4766-953f-eb216ea293f4', NULL, 1, 0, true),
	('05f803d2-010e-485e-9624-a7d78bbbc29d', '42296a6b-b1d6-4a1a-ae70-db99ea4e20c0', 'a3c2518d-e5d7-49dc-ab49-17401b723437', NULL, 1, 1, true),
	('81383995-9c9a-49a2-a534-67b70951fc78', '42296a6b-b1d6-4a1a-ae70-db99ea4e20c0', 'cd4e7e2a-a732-4549-94e2-2f5c76528189', NULL, 1, 2, true),
	('1bf92a3f-531c-4d52-9cae-7eb2eb49e01f', '42296a6b-b1d6-4a1a-ae70-db99ea4e20c0', '6d96b9d9-ab80-43b4-94e6-ee0a3154336b', NULL, 1, 3, true),
	('3714d477-74d4-45c7-bd84-585d13fae5a5', '40f68e7f-8ae6-466e-a4c0-acfaa8c77465', 'c9a3c484-b49c-401c-a8cf-017553e186b8', NULL, 1, 0, true),
	('03d7ca69-5b6f-4413-8b19-ad476140a52f', '40f68e7f-8ae6-466e-a4c0-acfaa8c77465', 'd99cf7b8-e4fe-4c05-b571-702137e3da20', NULL, 1, 1, true),
	('35e2f41a-b0f7-4e7d-bc51-fa0d87ac2e5b', '40f68e7f-8ae6-466e-a4c0-acfaa8c77465', '0b4cc460-5ed8-4415-a711-428ad15de6e5', NULL, 1, 2, true),
	('0953b302-f030-446b-99ba-1551b1d8fdba', '558589df-011b-4132-8b07-6d80211b5b6e', 'c37dc8ed-cab0-4d84-80a9-ff992ac910b2', NULL, 1, 0, true),
	('7c4cca7f-0332-4811-99a3-0ba78802a740', '558589df-011b-4132-8b07-6d80211b5b6e', 'e34759f0-84c0-4641-a3a4-73beafe8a4c7', NULL, 1, 1, true),
	('d818efad-2f4e-4621-bc5d-4b4c905c5dbd', '558589df-011b-4132-8b07-6d80211b5b6e', 'f1b3b5f9-59ca-4242-9b62-b7e1fe2d1a0c', NULL, 1, 2, true),
	('d477b126-ebf9-4b7c-9f2c-392caed04963', '558589df-011b-4132-8b07-6d80211b5b6e', '50bbd472-5067-4342-945c-c28445d3cf3f', NULL, 1, 3, true),
	('487f345b-5b64-4104-8d79-5dd3214d3df0', '5fd777ee-67ec-4ab2-a083-5104a19588cd', 'ac3bf6a9-a8a5-4b72-8a15-7ef9c37cdf5a', NULL, 1, 0, true),
	('e54871cf-af64-4bf7-a181-a4ab6027dad5', '5fd777ee-67ec-4ab2-a083-5104a19588cd', '8cbcd47e-05a5-4a41-b1a9-f9ad6243751d', NULL, 1, 1, true),
	('84ccf619-656d-4f6b-956b-6d36512b0945', '5fd777ee-67ec-4ab2-a083-5104a19588cd', '75821f65-24d4-4dbe-ba4e-a2c05f05d0d4', NULL, 1, 2, true),
	('857a7ad7-1f1a-4e91-8d7d-ad8c5b7d3ebf', '5fd777ee-67ec-4ab2-a083-5104a19588cd', '28a6f7f1-5037-42f4-8c04-035a944cd3fd', NULL, 1, 3, true),
	('3bd36d98-c870-4ae2-98e1-b45548ac0e61', '21c90adb-5427-4b4c-b888-1093f09d57ac', 'f965eb15-9d1c-486f-a93b-2faacbb5ffe0', NULL, 1, 0, true),
	('08daf6d3-04ac-40fb-bdd1-c760929ab4d2', '21c90adb-5427-4b4c-b888-1093f09d57ac', '0fd17c04-5ce6-48b6-b980-9c6f96c29b5b', NULL, 1, 1, true),
	('b99fc6c5-221b-4107-9c0b-fb4095c5a814', '21c90adb-5427-4b4c-b888-1093f09d57ac', 'd00c9599-a3a6-4b35-b130-6a2f85e781aa', NULL, 1, 2, true),
	('037759a7-856a-4a90-91d7-2cf72f6265f6', '21c90adb-5427-4b4c-b888-1093f09d57ac', '9dd9406c-bcba-4786-a434-c907b8335369', NULL, 1, 3, true),
	('6625c519-e6cd-46e1-9bc3-587dbbccca20', '444b2769-f94f-4a75-b403-33a6f6a3e786', 'c899f1c1-b720-476b-a8e3-f32d1a4ce055', NULL, 1, 0, true),
	('2aea0f1f-d199-407a-b12d-6ba2b728ca1b', '444b2769-f94f-4a75-b403-33a6f6a3e786', '31246125-6f14-4049-8c40-3e95da5c12d6', NULL, 1, 1, true),
	('cbfaa603-6c65-45c3-8b74-256ff2d6190d', '444b2769-f94f-4a75-b403-33a6f6a3e786', '9145959a-6524-4b3e-938f-d6e09a47a95d', NULL, 1, 2, true),
	('11c4af02-36ce-4e60-8bf1-c3c186e1b31c', '444b2769-f94f-4a75-b403-33a6f6a3e786', '6220783a-3737-4fc4-88b2-0094b1493dae', NULL, 1, 3, true),
	('d0ca3136-e1d8-42f6-a6cc-c653b14f931b', 'e6006d79-be5b-4963-bcb8-09b2bacc477a', '50c3d4a0-a73c-4037-93c4-8f31ebda838a', NULL, 1, 0, true),
	('c546f646-e30a-43b8-b710-13c0e25d8d47', 'e6006d79-be5b-4963-bcb8-09b2bacc477a', 'f7d21f5c-e6ab-43a5-b8f7-826092c9e16a', NULL, 1, 1, true),
	('20e141f2-62c5-4296-a9c4-6591222cf88e', 'e6006d79-be5b-4963-bcb8-09b2bacc477a', '410b8991-d7e3-47ed-9759-6b28dc87d102', NULL, 1, 2, true),
	('80a878ed-7c44-4cdd-ab49-ecaa9aa97d7c', 'e6006d79-be5b-4963-bcb8-09b2bacc477a', 'c4792a9e-3d31-4dce-9f1e-2d8cbfc7a25c', NULL, 1, 3, true),
	('d19868cc-f9f2-4fc2-9c95-57ba050d681a', '6470e49e-5ec7-472e-abc5-1922f74de573', '9e1ed1e9-362f-467d-973b-b71b8cf720a6', NULL, 1, 0, true),
	('70904aec-6451-4671-8917-596fd321a47b', '6470e49e-5ec7-472e-abc5-1922f74de573', '0a88ac16-f301-406c-bd0f-5df012ccac1d', NULL, 1, 1, true),
	('7bdf6c09-1d75-4205-91fc-70b622cae653', '6470e49e-5ec7-472e-abc5-1922f74de573', '8f8c769b-8d52-4fda-a5b0-ab892abae3bb', NULL, 1, 2, true),
	('63ff69f1-40fb-46e8-a47e-317823ffc039', 'a5d830d2-d34c-474f-8289-78f087d06dca', '9e1ea0b4-4f14-451b-a680-ca695feadecc', NULL, 1, 0, true),
	('8b83db32-32a2-4ec4-a25c-66f49210ed15', 'a5d830d2-d34c-474f-8289-78f087d06dca', '2737d772-e0c7-47f5-a9b3-adaf8bc1cd3b', NULL, 1, 1, true),
	('0a525fa4-e340-4aea-ab14-1646e826ec6c', 'a5d830d2-d34c-474f-8289-78f087d06dca', '5a35fe81-b9f9-4b46-a90c-cc4622e3f61b', NULL, 1, 2, true),
	('5514ead2-8b38-4e3e-a795-9b79c2b64b5e', 'a5d830d2-d34c-474f-8289-78f087d06dca', '687fbf9a-498f-4b37-a654-1faef1c2c118', NULL, 1, 3, true),
	('efe406f6-43f1-4abb-b36a-4d2b2a306af0', 'f4b0baaa-b728-4b0c-9029-1b51c22e1b7d', '9421818f-d455-4c8c-a4dd-b2419c51bb5e', NULL, 1, 0, true),
	('4a6313ca-ee97-4e9b-bc5d-484b4ceb0437', 'f4b0baaa-b728-4b0c-9029-1b51c22e1b7d', 'c490f284-c657-4fef-8c67-591edd83c4aa', NULL, 1, 1, true),
	('7f0f0f71-e61d-4d95-8189-2f9abc1df827', 'f4b0baaa-b728-4b0c-9029-1b51c22e1b7d', '030abd3c-3760-4be5-9255-35a4ed802bfa', NULL, 1, 2, true),
	('09e6f0de-b620-40dc-b5c7-f97e3bafb183', 'f4b0baaa-b728-4b0c-9029-1b51c22e1b7d', '6b395d02-91ad-410f-b0ff-33d20cba1dd0', NULL, 1, 3, true),
	('08f71349-a711-4963-81c5-ba6a6d846f0e', 'd9777ee6-2c12-4955-bdbf-5ca5a73a1910', 'd99a47b0-7ad9-46ff-86b7-e00aea0b520f', NULL, 1, 0, true),
	('ef5b8a94-4c95-49f2-8f27-9e28d75e041d', 'd9777ee6-2c12-4955-bdbf-5ca5a73a1910', '11bc50a7-2d41-4a81-9dd8-5698ba0e3c70', NULL, 1, 1, true),
	('e12865a6-0a65-47d3-b7c6-8fcfb410d571', 'd9777ee6-2c12-4955-bdbf-5ca5a73a1910', '7c305960-1af6-4483-af18-c7ebf4c488a6', NULL, 1, 2, true),
	('4c9273dd-49f9-47c5-88a7-2dc9271c6cc6', 'd9777ee6-2c12-4955-bdbf-5ca5a73a1910', '7be35117-05e8-4314-b304-3ae57404df51', NULL, 1, 3, true);


--
-- Data for Name: quiz_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: resource_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: rewards_catalog; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."roles" ("id", "name", "slug", "description", "level", "is_system", "created_at", "updated_at") VALUES
	('3508fcca-fd1e-4249-9882-96c7c109fea2', 'System', 'system', 'System role for automated processes', 70, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('1cae862d-325e-4d53-83d9-18946df872e7', 'Super Admin', 'super_admin', 'Full system access across all organizations', 60, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('0493084f-6c1a-446c-b59c-4f91be8a1d18', 'Admin', 'admin', 'Full access within organization', 50, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('57169d7d-6f32-4a8f-b3b0-21f8db6b374f', 'Manager', 'manager', 'Manage team and content within organization', 40, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('b518cdef-a795-48a1-9249-c56faf2cb124', 'Analyst', 'analyst', 'Advanced data analysis and reporting', 30, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('12c81f46-2de0-47d7-8839-a0f8fdc9a131', 'Instructor', 'instructor', 'Create and manage training content', 20, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('b2fafd85-bb3f-4ffd-a71b-04b0bed021a1', 'Learner', 'learner', 'Basic access to training and resources', 10, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00'),
	('8412eded-0d12-4fbb-b58e-f93108613485', 'Guest', 'guest', 'Limited read-only access', 0, true, '2025-11-08 21:12:15.601014+00', '2025-11-08 21:12:15.601014+00');


--
-- Data for Name: role_hierarchy; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_permissions" ("id", "role_id", "permission_id", "created_at") VALUES
	('ffb25a87-804e-45d4-9ff0-88e53358f0db', '1cae862d-325e-4d53-83d9-18946df872e7', '7c565f11-271b-42fd-9c54-87677c825994', '2025-11-08 21:12:15.601014+00'),
	('643b8af6-b27f-44a6-aa9a-522c2b16d8e0', '1cae862d-325e-4d53-83d9-18946df872e7', 'b1d977fd-540e-44da-a99e-eb2121d09219', '2025-11-08 21:12:15.601014+00'),
	('fa1092fd-79db-491c-990d-c3f1b334f871', '1cae862d-325e-4d53-83d9-18946df872e7', '23f841fa-b31d-4bba-a092-91910f07bf88', '2025-11-08 21:12:15.601014+00'),
	('c4801bf4-6e83-4669-aa98-4842802d2e48', '1cae862d-325e-4d53-83d9-18946df872e7', '6fedd4c4-f51a-49f1-8a09-6b2ba492a4eb', '2025-11-08 21:12:15.601014+00'),
	('64898ce1-8e49-4abe-9680-1a4367cf89b5', '1cae862d-325e-4d53-83d9-18946df872e7', 'bbefee82-2a29-4769-9d37-e64b2f990ac6', '2025-11-08 21:12:15.601014+00'),
	('d5aa1470-b91b-48a7-8c1d-797823632007', '1cae862d-325e-4d53-83d9-18946df872e7', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00'),
	('e899a2f3-a97e-417f-a05a-dc73fb14b9a5', '1cae862d-325e-4d53-83d9-18946df872e7', '8c94ccf8-d098-418a-9120-59d5f0bb32f4', '2025-11-08 21:12:15.601014+00'),
	('6bd3f3bf-19f5-4049-b5b3-e5d6271f1162', '1cae862d-325e-4d53-83d9-18946df872e7', 'ee45a887-2a14-41ec-b571-833ac00edf38', '2025-11-08 21:12:15.601014+00'),
	('9f8f7ded-de93-4937-a27e-4c1999edb95a', '1cae862d-325e-4d53-83d9-18946df872e7', 'eb470f0f-14c3-4d28-8bb3-35c7355a6125', '2025-11-08 21:12:15.601014+00'),
	('e7df3469-d0fc-4146-a656-f2a020d01cdb', '1cae862d-325e-4d53-83d9-18946df872e7', '3728de4d-3802-4b7b-bca8-0415dd1b67eb', '2025-11-08 21:12:15.601014+00'),
	('04431c0d-010f-4cad-8a0a-2f2ce7a51d7f', '1cae862d-325e-4d53-83d9-18946df872e7', '40e29c3f-9e64-48b6-8b84-6b067e306198', '2025-11-08 21:12:15.601014+00'),
	('5a3c2b62-f822-497d-9d4a-8ba7bf6cf605', '1cae862d-325e-4d53-83d9-18946df872e7', '6744650a-e95c-4136-885b-377071fd9b48', '2025-11-08 21:12:15.601014+00'),
	('3012ad65-11f5-4800-b0e7-69be7e0a3cf5', '1cae862d-325e-4d53-83d9-18946df872e7', 'b2e73316-419b-4785-aebd-71f981624392', '2025-11-08 21:12:15.601014+00'),
	('017ae83a-cea7-4076-b635-eec1d3f0be9f', '1cae862d-325e-4d53-83d9-18946df872e7', '6faa3bc9-bfbe-4dbd-8bbe-57971a3b7350', '2025-11-08 21:12:15.601014+00'),
	('808e3350-8bbf-4644-a3e8-f64b649e6c49', '1cae862d-325e-4d53-83d9-18946df872e7', '25e9b6b0-f789-4541-afa0-eb27ebf83878', '2025-11-08 21:12:15.601014+00'),
	('10b50965-1ea1-4a76-a99a-0cec4d99dfc5', '1cae862d-325e-4d53-83d9-18946df872e7', '40f0a4d5-3df1-42b3-a7ea-5a299582b5ab', '2025-11-08 21:12:15.601014+00'),
	('a014d1fa-ca14-4851-ba7e-5f1ab575498b', '1cae862d-325e-4d53-83d9-18946df872e7', 'eb57b65d-2087-4ca8-9f56-7699895f1bef', '2025-11-08 21:12:15.601014+00'),
	('e7a04210-b13f-4a2f-a749-ad7380458cd9', '1cae862d-325e-4d53-83d9-18946df872e7', 'cbd228be-7bdb-4cfa-9947-89fbe3e984ff', '2025-11-08 21:12:15.601014+00'),
	('050451bf-e301-4a9b-b5a3-55a4fd61af75', '1cae862d-325e-4d53-83d9-18946df872e7', 'f6de9320-583a-4cc5-ab70-9b986a6ee608', '2025-11-08 21:12:15.601014+00'),
	('be15e89d-3ea7-4771-99bc-f130927a5679', '1cae862d-325e-4d53-83d9-18946df872e7', 'b83ed4ad-9c16-4d3f-813e-cf6fe2a6d0f1', '2025-11-08 21:12:15.601014+00'),
	('13268e80-f29d-4e4f-9ed6-d90ea56e4ff2', '1cae862d-325e-4d53-83d9-18946df872e7', 'f8ab9a06-b6af-44e7-8dbe-98b665075c4d', '2025-11-08 21:12:15.601014+00'),
	('ca33c12f-adee-421b-a5e3-9c1cd7901402', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '7c565f11-271b-42fd-9c54-87677c825994', '2025-11-08 21:12:15.601014+00'),
	('2574d51a-dc96-4723-b17b-8adf8a8ad5df', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'b1d977fd-540e-44da-a99e-eb2121d09219', '2025-11-08 21:12:15.601014+00'),
	('5cc2390c-449d-4d7b-a69c-25a289cebe56', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '23f841fa-b31d-4bba-a092-91910f07bf88', '2025-11-08 21:12:15.601014+00'),
	('2689adcb-9134-4ffe-ad28-1d7beb2c9465', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '6fedd4c4-f51a-49f1-8a09-6b2ba492a4eb', '2025-11-08 21:12:15.601014+00'),
	('6a4ceb39-4cb1-4039-80d8-90b2078b4b01', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'bbefee82-2a29-4769-9d37-e64b2f990ac6', '2025-11-08 21:12:15.601014+00'),
	('328bfdb3-3415-4020-96f5-f4e27685c426', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00'),
	('508cb2be-e65b-4bb5-9568-7ab25da51171', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '8c94ccf8-d098-418a-9120-59d5f0bb32f4', '2025-11-08 21:12:15.601014+00'),
	('85a091eb-46d8-4784-836b-6007b14b4114', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'ee45a887-2a14-41ec-b571-833ac00edf38', '2025-11-08 21:12:15.601014+00'),
	('485c4876-21c8-4e6f-b40b-3e64c1d5707d', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'eb470f0f-14c3-4d28-8bb3-35c7355a6125', '2025-11-08 21:12:15.601014+00'),
	('526415e6-8993-46bb-8e2d-732f35f67268', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '40e29c3f-9e64-48b6-8b84-6b067e306198', '2025-11-08 21:12:15.601014+00'),
	('69f1bc4f-0fa7-4d28-8dfe-0a51ee9f2ea4', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '6744650a-e95c-4136-885b-377071fd9b48', '2025-11-08 21:12:15.601014+00'),
	('b9bc23a3-3b4a-4696-a884-dcab940c6b85', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '6faa3bc9-bfbe-4dbd-8bbe-57971a3b7350', '2025-11-08 21:12:15.601014+00'),
	('160f7eb5-2b77-4533-800a-f1db32be8911', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '25e9b6b0-f789-4541-afa0-eb27ebf83878', '2025-11-08 21:12:15.601014+00'),
	('6e3e87bf-cca8-4398-9f8c-b645d8f93673', '0493084f-6c1a-446c-b59c-4f91be8a1d18', '40f0a4d5-3df1-42b3-a7ea-5a299582b5ab', '2025-11-08 21:12:15.601014+00'),
	('03158d70-867a-4fd6-8583-18d6d9436aa2', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'eb57b65d-2087-4ca8-9f56-7699895f1bef', '2025-11-08 21:12:15.601014+00'),
	('31d4aa82-58ad-413a-9cbe-c0a799c550e9', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'cbd228be-7bdb-4cfa-9947-89fbe3e984ff', '2025-11-08 21:12:15.601014+00'),
	('71bc3732-f6ff-45e5-907d-4dc845c9bded', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'f6de9320-583a-4cc5-ab70-9b986a6ee608', '2025-11-08 21:12:15.601014+00'),
	('c3624014-7c8b-4ee9-8fa8-9226be90b091', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'b83ed4ad-9c16-4d3f-813e-cf6fe2a6d0f1', '2025-11-08 21:12:15.601014+00'),
	('5ecf5abf-c236-4c97-bb03-86eacbe5f746', '0493084f-6c1a-446c-b59c-4f91be8a1d18', 'f8ab9a06-b6af-44e7-8dbe-98b665075c4d', '2025-11-08 21:12:15.601014+00'),
	('17097a4d-d8d4-45cf-b580-76cc0ba969ae', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', 'b1d977fd-540e-44da-a99e-eb2121d09219', '2025-11-08 21:12:15.601014+00'),
	('b0179393-c127-4770-9927-cde1b3eca112', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '23f841fa-b31d-4bba-a092-91910f07bf88', '2025-11-08 21:12:15.601014+00'),
	('0c3c8db0-8b6b-4c36-ab1c-1cede6f78fc8', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', 'bbefee82-2a29-4769-9d37-e64b2f990ac6', '2025-11-08 21:12:15.601014+00'),
	('ce86a652-48c9-4b07-bb86-25fb6ea87187', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00'),
	('6df21f34-cb0d-449a-86c8-79f568a4df50', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '8c94ccf8-d098-418a-9120-59d5f0bb32f4', '2025-11-08 21:12:15.601014+00'),
	('e488177c-144b-4b31-b241-d9ae4181d8af', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '40e29c3f-9e64-48b6-8b84-6b067e306198', '2025-11-08 21:12:15.601014+00'),
	('49a67636-6814-4090-bb19-7571359fcaaa', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '6744650a-e95c-4136-885b-377071fd9b48', '2025-11-08 21:12:15.601014+00'),
	('54ba83a2-084f-499b-a8a0-2c0ef7c91525', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '6faa3bc9-bfbe-4dbd-8bbe-57971a3b7350', '2025-11-08 21:12:15.601014+00'),
	('c251cc1d-1ffc-40d6-9b67-4b31421c2bc0', '57169d7d-6f32-4a8f-b3b0-21f8db6b374f', '40f0a4d5-3df1-42b3-a7ea-5a299582b5ab', '2025-11-08 21:12:15.601014+00'),
	('b5ac757e-1578-40ea-a383-595826eb0d0f', 'b518cdef-a795-48a1-9249-c56faf2cb124', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00'),
	('1cc2405f-c228-44ac-89c5-24dcba7d2483', 'b518cdef-a795-48a1-9249-c56faf2cb124', '40e29c3f-9e64-48b6-8b84-6b067e306198', '2025-11-08 21:12:15.601014+00'),
	('875b7c5f-4c36-487c-acb4-d77c4c577af8', 'b518cdef-a795-48a1-9249-c56faf2cb124', '6faa3bc9-bfbe-4dbd-8bbe-57971a3b7350', '2025-11-08 21:12:15.601014+00'),
	('2fe3addd-0bd9-4d9d-a513-83661c56b1b1', 'b518cdef-a795-48a1-9249-c56faf2cb124', '25e9b6b0-f789-4541-afa0-eb27ebf83878', '2025-11-08 21:12:15.601014+00'),
	('c2714169-80af-4e99-b94d-1985af4c8960', 'b518cdef-a795-48a1-9249-c56faf2cb124', '40f0a4d5-3df1-42b3-a7ea-5a299582b5ab', '2025-11-08 21:12:15.601014+00'),
	('ab0eca63-2938-472a-9e67-3a57f33f93b6', '12c81f46-2de0-47d7-8839-a0f8fdc9a131', 'bbefee82-2a29-4769-9d37-e64b2f990ac6', '2025-11-08 21:12:15.601014+00'),
	('cae2dfe2-336b-4865-ac10-1b9b0cbcd68c', '12c81f46-2de0-47d7-8839-a0f8fdc9a131', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00'),
	('cf4a9b9a-190d-45d8-a8ae-d224373740bf', '12c81f46-2de0-47d7-8839-a0f8fdc9a131', '8c94ccf8-d098-418a-9120-59d5f0bb32f4', '2025-11-08 21:12:15.601014+00'),
	('44c41045-a879-436b-ba9e-6babf6deb516', '12c81f46-2de0-47d7-8839-a0f8fdc9a131', '40e29c3f-9e64-48b6-8b84-6b067e306198', '2025-11-08 21:12:15.601014+00'),
	('36e5cabf-794f-4a82-b21f-77e3458adc80', 'b2fafd85-bb3f-4ffd-a71b-04b0bed021a1', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00'),
	('e0e797f3-3ad4-41fe-9aaa-1d193000d50f', 'b2fafd85-bb3f-4ffd-a71b-04b0bed021a1', '40e29c3f-9e64-48b6-8b84-6b067e306198', '2025-11-08 21:12:15.601014+00'),
	('32afe7ac-fadb-4299-b854-37a49030633b', '8412eded-0d12-4fbb-b58e-f93108613485', '943f0e2a-a013-46a5-8a81-0221da50ce8c', '2025-11-08 21:12:15.601014+00');


--
-- Data for Name: skill_prerequisites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: skill_validations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sso_login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: study_buddies; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."testimonials" ("id", "created_at", "updated_at", "name", "role", "organization", "content", "rating", "featured", "active", "display_order", "photo_url", "linkedin_url", "case_study_url") VALUES
	('6de26003-5fa8-40bc-b42e-3be08bed6f90', '2025-11-08 21:12:16.060461+00', '2025-11-08 21:12:16.060461+00', 'Sarah Johnson', 'Chief Diversity Officer', 'TechCorp Canada', 'ABR Insights has transformed how we approach equity in our workplace. The tribunal case database alone has been invaluable for understanding systemic issues and making data-driven decisions. Our leadership team now has the tools to create meaningful change.', 5, true, true, 1, '/images/testimonials/sarah-johnson.jpg', NULL, NULL),
	('94c1c674-2e1c-430e-8961-8862f122ba9c', '2025-11-08 21:12:16.060461+00', '2025-11-08 21:12:16.060461+00', 'Marcus Williams', 'HR Director', 'National Bank of Canada', 'The training courses are exceptional - evidence-based, practical, and designed by experts who understand the nuances of anti-Black racism. Our team engagement scores have improved significantly since implementing ABR Insights across our organization.', 5, true, true, 2, '/images/testimonials/marcus-williams.jpg', NULL, NULL),
	('867fc641-05cf-4e9e-9d9c-affc84099358', '2025-11-08 21:12:16.060461+00', '2025-11-08 21:12:16.060461+00', 'Dr. Aisha Patel', 'Head of Learning & Development', 'Healthcare Systems Ontario', 'What sets ABR Insights apart is the combination of legal precedents, expert training, and actionable analytics. We''ve been able to identify and address equity gaps we didn''t even know existed. This platform is essential for any organization serious about EDI.', 5, true, true, 3, '/images/testimonials/aisha-patel.jpg', NULL, NULL),
	('5a232923-f4e2-474d-8285-729bce521cde', '2025-11-08 21:12:16.060461+00', '2025-11-08 21:12:16.060461+00', 'James Chen', 'VP of People Operations', 'RetailCo Inc.', 'ABR Insights provides the evidence and framework we needed to move beyond performative diversity initiatives. The case studies and best practices have guided our policy development and training programs. Highly recommend for any Canadian organization.', 5, true, true, 4, '/images/testimonials/james-chen.jpg', NULL, NULL);


--
-- Data for Name: training_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_activity_feed; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_course_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_course_points; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_follows; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_points; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_points_transactions_legacy; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_profiles_extended; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_rewards; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user_streaks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: watch_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict 4qaLaUaWE51whYc0FqFZ6qt6zOLtGZF2URbKl4RT0yA5VeaqtYHgcb323qLeS83

RESET ALL;
