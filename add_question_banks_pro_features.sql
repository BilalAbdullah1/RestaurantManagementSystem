-- SQL Migration Script for Question Bank Pro Features
-- Run this script in PostgreSQL / SQL Server database

ALTER TABLE question_banks 
ADD COLUMN IF NOT EXISTS topic_name VARCHAR(150) NULL,
ADD COLUMN IF NOT EXISTS explanation TEXT NULL,
ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) NOT NULL DEFAULT 'MCQ';
