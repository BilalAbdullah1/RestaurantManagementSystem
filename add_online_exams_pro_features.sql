-- SQL Migration Script for Online Exams Pro Features
-- Run this script in PostgreSQL / SQL Server database

ALTER TABLE online_exams 
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS shuffle_options BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
