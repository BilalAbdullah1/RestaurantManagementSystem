-- RAW SQL MIGRATION SCRIPT: Add elective_group_name to subjects table
-- Run this script in PostgreSQL database console

ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS elective_group_name VARCHAR(100) NULL;

COMMENT ON COLUMN subjects.elective_group_name IS 'Optional Elective Choice Group Designation (e.g. Group A: Pre-Medical, Group B: Pre-Engineering)';
