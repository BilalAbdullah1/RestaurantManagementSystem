-- SQL Migration Script for Exam Schedules Pro Features
-- Run this script in PostgreSQL / SQL Server database

ALTER TABLE exam_schedules 
ADD COLUMN IF NOT EXISTS room_number VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS invigilator_name VARCHAR(100) NULL;
