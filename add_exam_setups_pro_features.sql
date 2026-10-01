-- SQL Migration Script for Exam Setups Pro Features
-- Run this script in PostgreSQL / SQL Server database

ALTER TABLE exam_setups 
ADD COLUMN IF NOT EXISTS weightage_percentage NUMERIC(5,2) NULL,
ADD COLUMN IF NOT EXISTS marks_entry_deadline TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS target_class_ids TEXT NULL,
ADD COLUMN IF NOT EXISTS academic_session VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
