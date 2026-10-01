-- Migration Script for Module 8: Communication & Helpdesk (71-80)
-- =============================================================

BEGIN;

-- 1. Create notices table (Digital Notice Board)
CREATE TABLE IF NOT EXISTS "notices" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "title" text NOT NULL DEFAULT '',
    "content" text NOT NULL DEFAULT '',
    "category" text NOT NULL DEFAULT 'Academic',
    "target_audience" text NOT NULL DEFAULT 'All',
    "attachment_url" text,
    "posted_by" text NOT NULL DEFAULT 'Principal Office',
    "is_active" boolean NOT NULL DEFAULT true,
    "published_at" timestamp with time zone NOT NULL DEFAULT NOW(),
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW(),
    "expires_at" timestamp with time zone
);

-- 2. Create ptm_slots table (PTM Scheduler)
CREATE TABLE IF NOT EXISTS "ptm_slots" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "teacher_id" uuid NOT NULL,
    "teacher_name" text NOT NULL DEFAULT '',
    "meeting_date" timestamp with time zone NOT NULL DEFAULT NOW(),
    "start_time" text NOT NULL DEFAULT '10:00 AM',
    "end_time" text NOT NULL DEFAULT '10:15 AM',
    "is_booked" boolean NOT NULL DEFAULT false,
    "booked_by_parent_name" text,
    "booked_by_student_name" text,
    "meeting_notes" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- 3. Create helpdesk_tickets table (Helpdesk / Ticketing System)
CREATE TABLE IF NOT EXISTS "helpdesk_tickets" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "ticket_number" text NOT NULL DEFAULT '',
    "raised_by_name" text NOT NULL DEFAULT '',
    "raised_by_role" text NOT NULL DEFAULT 'Parent',
    "category" text NOT NULL DEFAULT 'Facilities',
    "subject" text NOT NULL DEFAULT '',
    "description" text NOT NULL DEFAULT '',
    "priority" text NOT NULL DEFAULT 'Medium',
    "status" text NOT NULL DEFAULT 'Open',
    "resolution_remarks" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- 4. Create feedback_suggestions table (Anonymous Feedback)
CREATE TABLE IF NOT EXISTS "feedback_suggestions" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "is_anonymous" boolean NOT NULL DEFAULT true,
    "submitted_by_name" text,
    "category" text NOT NULL DEFAULT 'General',
    "subject" text NOT NULL DEFAULT '',
    "feedback_text" text NOT NULL DEFAULT '',
    "admin_response" text,
    "status" text NOT NULL DEFAULT 'Under Review',
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- 5. Create event_calendar_items table (Event Calendar)
CREATE TABLE IF NOT EXISTS "event_calendar_items" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "title" text NOT NULL DEFAULT '',
    "event_type" text NOT NULL DEFAULT 'Academics',
    "start_date" timestamp with time zone NOT NULL DEFAULT NOW(),
    "end_date" timestamp with time zone NOT NULL DEFAULT NOW(),
    "location" text NOT NULL DEFAULT 'School Auditorium',
    "description" text NOT NULL DEFAULT '',
    "created_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

-- 6. Create staff_chat_messages table (Internal Staff Chat Platform)
CREATE TABLE IF NOT EXISTS "staff_chat_messages" (
    "id" uuid NOT NULL PRIMARY KEY,
    "tenant_id" uuid NOT NULL,
    "sender_id" uuid NOT NULL,
    "sender_name" text NOT NULL DEFAULT '',
    "sender_role" text NOT NULL DEFAULT 'Staff',
    "receiver_id" uuid,
    "channel" text NOT NULL DEFAULT 'General',
    "message_text" text NOT NULL DEFAULT '',
    "attachment_url" text,
    "sent_at" timestamp with time zone NOT NULL DEFAULT NOW()
);

COMMIT;
