-- =========================================================================================
-- RESTAURANT MANAGEMENT SYSTEM (RMS) MIGRATION SCRIPT
-- Purpose: Safely drops obsolete School Management System tables and creates RMS domain tables
-- Compatible with PostgreSQL 12+
-- =========================================================================================

BEGIN;

-- 1. DROP OBSOLETE SCHOOL TABLES (CASCADE)
DROP TABLE IF EXISTS "homework_submissions" CASCADE;
DROP TABLE IF EXISTS "homework" CASCADE;
DROP TABLE IF EXISTS "lesson_plans" CASCADE;
DROP TABLE IF EXISTS "syllabus" CASCADE;
DROP TABLE IF EXISTS "timetable_periods" CASCADE;
DROP TABLE IF EXISTS "class_timetables" CASCADE;
DROP TABLE IF EXISTS "certificate_templates" CASCADE;
DROP TABLE IF EXISTS "school_certificates" CASCADE;
DROP TABLE IF EXISTS "parent_students" CASCADE;
DROP TABLE IF EXISTS "parents" CASCADE;
DROP TABLE IF EXISTS "book_issues" CASCADE;
DROP TABLE IF EXISTS "library_members" CASCADE;
DROP TABLE IF EXISTS "books" CASCADE;
DROP TABLE IF EXISTS "book_categories" CASCADE;
DROP TABLE IF EXISTS "fuel_logs" CASCADE;
DROP TABLE IF EXISTS "vehicle_maintenance" CASCADE;
DROP TABLE IF EXISTS "transport_fee_collections" CASCADE;
DROP TABLE IF EXISTS "transport_allocations" CASCADE;
DROP TABLE IF EXISTS "vehicles" CASCADE;
DROP TABLE IF EXISTS "stops" CASCADE;
DROP TABLE IF EXISTS "routes" CASCADE;
DROP TABLE IF EXISTS "hostel_fee_collections" CASCADE;
DROP TABLE IF EXISTS "hostel_allocations" CASCADE;
DROP TABLE IF EXISTS "hostel_beds" CASCADE;
DROP TABLE IF EXISTS "hostel_rooms" CASCADE;
DROP TABLE IF EXISTS "hostels" CASCADE;
DROP TABLE IF EXISTS "student_scholarships" CASCADE;
DROP TABLE IF EXISTS "scholarships" CASCADE;
DROP TABLE IF EXISTS "fee_discounts" CASCADE;
DROP TABLE IF EXISTS "fee_payments" CASCADE;
DROP TABLE IF EXISTS "fee_challan_details" CASCADE;
DROP TABLE IF EXISTS "fee_challans" CASCADE;
DROP TABLE IF EXISTS "fee_structure_items" CASCADE;
DROP TABLE IF EXISTS "fee_structures" CASCADE;
DROP TABLE IF EXISTS "exam_results" CASCADE;
DROP TABLE IF EXISTS "exam_schedules" CASCADE;
DROP TABLE IF EXISTS "exams" CASCADE;
DROP TABLE IF EXISTS "student_id_cards" CASCADE;
DROP TABLE IF EXISTS "student_attendances" CASCADE;
DROP TABLE IF EXISTS "student_enrollments" CASCADE;
DROP TABLE IF EXISTS "students" CASCADE;
DROP TABLE IF EXISTS "grade_systems" CASCADE;
DROP TABLE IF EXISTS "class_subject_teachers" CASCADE;
DROP TABLE IF EXISTS "subjects" CASCADE;
DROP TABLE IF EXISTS "sections" CASCADE;
DROP TABLE IF EXISTS "classes" CASCADE;
DROP TABLE IF EXISTS "academic_years" CASCADE;

-- 2. CREATE RESTAURANT SCHEMA TABLES

-- Menu Categories
CREATE TABLE IF NOT EXISTS "menu_categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "display_order" INT DEFAULT 0,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_menu_categories_tenant" ON "menu_categories"("tenant_id");

-- Menu Items
CREATE TABLE IF NOT EXISTS "menu_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "category_id" UUID NOT NULL REFERENCES "menu_categories"("id") ON DELETE CASCADE,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "price" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "cost_price" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "image_url" TEXT,
    "sku" VARCHAR(50),
    "prep_time_minutes" INT DEFAULT 15,
    "calories" INT,
    "is_available" BOOLEAN DEFAULT TRUE,
    "is_featured" BOOLEAN DEFAULT FALSE,
    "is_vegetarian" BOOLEAN DEFAULT FALSE,
    "is_vegan" BOOLEAN DEFAULT FALSE,
    "is_gluten_free" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_menu_items_tenant" ON "menu_items"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_menu_items_category" ON "menu_items"("category_id");

-- Dining Tables
CREATE TABLE IF NOT EXISTS "dining_tables" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "table_number" VARCHAR(50) NOT NULL,
    "capacity" INT NOT NULL DEFAULT 4,
    "floor_area" VARCHAR(50) DEFAULT 'Main Dining',
    "status" VARCHAR(50) DEFAULT 'Available',
    "current_order_id" UUID,
    "current_server_name" VARCHAR(100),
    "qr_code_token" VARCHAR(100),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_dining_tables_tenant" ON "dining_tables"("tenant_id");

-- Table Reservations
CREATE TABLE IF NOT EXISTS "table_reservations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "table_id" UUID REFERENCES "dining_tables"("id") ON DELETE SET NULL,
    "guest_name" VARCHAR(100) NOT NULL,
    "guest_phone" VARCHAR(50) NOT NULL,
    "guest_email" VARCHAR(100),
    "party_size" INT NOT NULL DEFAULT 2,
    "reservation_time" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" VARCHAR(50) DEFAULT 'Confirmed',
    "special_requests" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_table_reservations_tenant" ON "table_reservations"("tenant_id");

-- Orders
CREATE TABLE IF NOT EXISTS "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "order_number" VARCHAR(50) NOT NULL,
    "order_type" VARCHAR(50) DEFAULT 'DineIn',
    "table_id" UUID REFERENCES "dining_tables"("id") ON DELETE SET NULL,
    "table_number" VARCHAR(50),
    "server_id" UUID,
    "server_name" VARCHAR(100),
    "customer_name" VARCHAR(100) DEFAULT 'Walk-in Guest',
    "customer_phone" VARCHAR(50),
    "subtotal" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "tax_amount" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "discount_amount" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "total_amount" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "payment_method" VARCHAR(50) DEFAULT 'Cash',
    "payment_status" VARCHAR(50) DEFAULT 'Paid',
    "order_status" VARCHAR(50) DEFAULT 'Completed',
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_orders_tenant" ON "orders"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders"("created_at");

-- Order Items
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "menu_item_id" UUID REFERENCES "menu_items"("id") ON DELETE SET NULL,
    "item_name" VARCHAR(150) NOT NULL,
    "unit_price" NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    "quantity" INT NOT NULL DEFAULT 1,
    "special_instructions" TEXT,
    "status" VARCHAR(50) DEFAULT 'Pending'
);
CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "order_items"("order_id");

-- Kitchen Order Tickets (KOT)
CREATE TABLE IF NOT EXISTS "kitchen_order_tickets" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
    "order_number" VARCHAR(50) NOT NULL,
    "table_number" VARCHAR(50),
    "order_type" VARCHAR(50) DEFAULT 'DineIn',
    "status" VARCHAR(50) DEFAULT 'Pending',
    "kitchen_station" VARCHAR(50) DEFAULT 'Main Kitchen',
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_kitchen_order_tickets_tenant" ON "kitchen_order_tickets"("tenant_id");

-- Customers (Loyalty / CRM)
CREATE TABLE IF NOT EXISTS "customers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100),
    "address" TEXT,
    "loyalty_points" INT DEFAULT 0,
    "total_orders" INT DEFAULT 0,
    "total_spent" NUMERIC(10,2) DEFAULT 0.00,
    "favorite_dish" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_customers_tenant" ON "customers"("tenant_id");

COMMIT;
