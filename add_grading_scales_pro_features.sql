-- SQL Migration Script for Grading Scales Pro Features
-- Run this script in PostgreSQL / SQL Server database

ALTER TABLE grading_scales 
ADD COLUMN IF NOT EXISTS is_passing_grade BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS badge_color VARCHAR(30) NULL DEFAULT 'success',
ADD COLUMN IF NOT EXISTS education_level VARCHAR(50) NULL DEFAULT 'General';
