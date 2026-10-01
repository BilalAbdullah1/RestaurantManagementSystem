-- SQL Migration to fix PostgreSQL 23505 duplicate key error on fee_structures
-- This updates the unique constraint to include the student category

ALTER TABLE fee_structures DROP CONSTRAINT IF EXISTS unique_fee_structure_matrix;

ALTER TABLE fee_structures ADD CONSTRAINT unique_fee_structure_matrix UNIQUE (academic_year_id, class_id, fee_type_id, category);
