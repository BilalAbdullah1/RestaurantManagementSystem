-- =========================================================================================
-- RESTAURANT MANAGEMENT SYSTEM (RMS) SEED DATA SCRIPT
-- Populates initial Menu Categories, Dishes, Dining Tables, Customers & Reservations
-- Target Tenant: Voke Gourmet Restaurant (RMS-01)
-- =========================================================================================

BEGIN;

DO $$
DECLARE
    v_tenant_id UUID;
    v_cat_starters UUID := gen_random_uuid();
    v_cat_steaks UUID := gen_random_uuid();
    v_cat_burgers UUID := gen_random_uuid();
    v_cat_pizzas UUID := gen_random_uuid();
    v_cat_asian UUID := gen_random_uuid();
    v_cat_drinks UUID := gen_random_uuid();
    v_cat_desserts UUID := gen_random_uuid();

    v_tbl_1 UUID := gen_random_uuid();
    v_tbl_2 UUID := gen_random_uuid();
    v_tbl_3 UUID := gen_random_uuid();
    v_tbl_4 UUID := gen_random_uuid();
    v_tbl_vip1 UUID := gen_random_uuid();
    v_tbl_patio1 UUID := gen_random_uuid();

    v_cust_1 UUID := gen_random_uuid();
    v_cust_2 UUID := gen_random_uuid();
    v_cust_3 UUID := gen_random_uuid();

    v_item_steak UUID := gen_random_uuid();
    v_item_burger UUID := gen_random_uuid();
    v_item_pizza UUID := gen_random_uuid();
    v_item_mojito UUID := gen_random_uuid();
BEGIN
    -- 1. Identify or Create Tenant
    SELECT id INTO v_tenant_id FROM "tenants" WHERE "school_code" = 'RMS-01' OR "school_name" ILIKE '%Voke%' LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        v_tenant_id := gen_random_uuid();
        INSERT INTO "tenants" ("id", "school_name", "school_code", "subdomain", "email", "phone", "address", "principal_name", "currency", "is_active")
        VALUES (v_tenant_id, 'Voke Gourmet Restaurant & Bistro', 'RMS-01', 'rms', 'admin@vokerestaurant.com', '+92 300 1234567', 'Main Boulevard, Gulberg III, Lahore', 'General Manager', 'PKR', TRUE);
    END IF;

    -- 2. Insert Menu Categories
    INSERT INTO "menu_categories" ("id", "tenant_id", "name", "description", "icon", "display_order", "is_active") VALUES
    (v_cat_starters, v_tenant_id, 'Starters & Appetizers', 'Crispy bites, finger foods, and warm soups', 'Flame', 1, TRUE),
    (v_cat_steaks, v_tenant_id, 'Steaks & Gourmet Grills', 'Prime Angus beef, tenderloin, and grilled poultry', 'Utensils', 2, TRUE),
    (v_cat_burgers, v_tenant_id, 'Artisan Burgers & Sandwiches', 'Smash burgers, brioche buns with signature sauces', 'ShoppingBag', 3, TRUE),
    (v_cat_pizzas, v_tenant_id, 'Wood-Fired Pizzas', 'Hand-tossed sourdough with fresh mozzarella', 'Pizza', 4, TRUE),
    (v_cat_asian, v_tenant_id, 'Asian Wok & Bowls', 'Noodles, pad thai, kung pao chicken & fried rice', 'Sparkles', 5, TRUE),
    (v_cat_drinks, v_tenant_id, 'Mocktails & Beverages', 'Artisan sodas, fresh mojitos, and specialty coffee', 'Coffee', 6, TRUE),
    (v_cat_desserts, v_tenant_id, 'Desserts & Sweets', 'Molten lava cakes, cheesecakes and gelato', 'Cake', 7, TRUE)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Menu Items
    INSERT INTO "menu_items" ("id", "tenant_id", "category_id", "name", "description", "price", "cost_price", "prep_time_minutes", "calories", "is_available", "is_featured", "is_vegetarian", "is_vegan", "is_gluten_free") VALUES
    (gen_random_uuid(), v_tenant_id, v_cat_starters, 'Crispy Dynamite Prawns', 'Batter-fried prawns tossed in spicy Japanese mayo and scallions', 1390.00, 580.00, 12, 420, TRUE, TRUE, FALSE, FALSE, FALSE),
    (gen_random_uuid(), v_tenant_id, v_cat_starters, 'Truffle Parmesan Fries', 'Hand-cut russet fries, white truffle oil, grated parmesan & garlic aioli', 790.00, 220.00, 8, 380, TRUE, FALSE, TRUE, FALSE, TRUE),
    (v_item_steak, v_tenant_id, v_cat_steaks, 'Prime Beef Tenderloin Steak', '250g grilled beef tenderloin served with wild mushroom sauce & mashed potato', 3450.00, 1550.00, 25, 780, TRUE, TRUE, FALSE, FALSE, TRUE),
    (gen_random_uuid(), v_tenant_id, v_cat_steaks, 'Grilled Chimichurri Chicken', 'Char-grilled chicken breast, zesty Argentinian herb chimichurri & roasted veg', 1890.00, 680.00, 18, 590, TRUE, FALSE, FALSE, FALSE, TRUE),
    (v_item_burger, v_tenant_id, v_cat_burgers, 'Double Truffle Smash Burger', 'Two beef patties, aged cheddar, caramelised onions, truffle mayo on brioche', 1450.00, 520.00, 15, 850, TRUE, TRUE, FALSE, FALSE, FALSE),
    (gen_random_uuid(), v_tenant_id, v_cat_burgers, 'Crispy Nashville Hot Chicken Burger', 'Crispy buttermilk chicken thigh, Nashville spice dip, dill pickles & slaw', 1290.00, 440.00, 14, 760, TRUE, FALSE, FALSE, FALSE, FALSE),
    (v_item_pizza, v_tenant_id, v_cat_pizzas, 'Artisan Pepperoni Classico', 'Tomato sugo, fior di latte mozzarella, imported beef pepperoni, hot honey drizzle', 2150.00, 650.00, 16, 920, TRUE, TRUE, FALSE, FALSE, FALSE),
    (gen_random_uuid(), v_tenant_id, v_cat_pizzas, 'Quattro Formaggi', 'Mozzarella, gorgonzola, parmesan, ricotta, fresh basil & extra virgin olive oil', 1990.00, 620.00, 15, 860, TRUE, FALSE, TRUE, FALSE, FALSE),
    (gen_random_uuid(), v_tenant_id, v_cat_asian, 'Classic Chicken Pad Thai', 'Stir-fried rice noodles, bean sprouts, crushed peanuts, tamarind sauce', 1590.00, 480.00, 15, 620, TRUE, FALSE, FALSE, FALSE, TRUE),
    (v_item_mojito, v_tenant_id, v_cat_drinks, 'Mint Lime Passion Mojito', 'Fresh mint leaves, lime juice, passionfruit purée, sparkling soda', 550.00, 120.00, 5, 140, TRUE, TRUE, TRUE, TRUE, TRUE),
    (gen_random_uuid(), v_tenant_id, v_cat_desserts, 'Belgian Molten Lava Cake', 'Warm chocolate fudge cake with molten core, vanilla bean gelato', 890.00, 260.00, 12, 540, TRUE, TRUE, TRUE, FALSE, FALSE)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Insert Dining Tables
    INSERT INTO "dining_tables" ("id", "tenant_id", "table_number", "capacity", "floor_area", "status", "current_server_name") VALUES
    (v_tbl_1, v_tenant_id, 'T-01', 2, 'Ground Floor', 'Available', 'Hamza Khan'),
    (v_tbl_2, v_tenant_id, 'T-02', 4, 'Ground Floor', 'Occupied', 'Hamza Khan'),
    (v_tbl_3, v_tenant_id, 'T-03', 4, 'Ground Floor', 'Available', 'Hamza Khan'),
    (v_tbl_4, v_tenant_id, 'T-04', 6, 'Ground Floor', 'Billing', 'Ali Raza'),
    (v_tbl_vip1, v_tenant_id, 'VIP-1', 8, 'VIP Lounge', 'Reserved', 'Usman Tariq'),
    (v_tbl_patio1, v_tenant_id, 'P-01', 4, 'Outdoor Patio', 'Available', 'Zubair Ahmed')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Insert Customers (CRM)
    INSERT INTO "customers" ("id", "tenant_id", "full_name", "phone", "email", "address", "loyalty_points", "total_orders", "total_spent", "favorite_dish") VALUES
    (v_cust_1, v_tenant_id, 'Ahmed Malik', '+92 321 8899112', 'ahmed.malik@gmail.com', 'DHA Phase 5, Lahore', 480, 14, 38500.00, 'Prime Beef Tenderloin Steak'),
    (v_cust_2, v_tenant_id, 'Dr. Ayesha Siddiqui', '+92 300 4455667', 'ayesha.s@yahoo.com', 'Model Town, Lahore', 620, 19, 52400.00, 'Double Truffle Smash Burger'),
    (v_cust_3, v_tenant_id, 'Bilal Farooq', '+92 333 1122334', 'bilal.f@outlook.com', 'Gulberg III, Lahore', 210, 6, 16900.00, 'Artisan Pepperoni Classico')
    ON CONFLICT (id) DO NOTHING;

    -- 6. Insert Table Reservations
    INSERT INTO "table_reservations" ("id", "tenant_id", "table_id", "guest_name", "guest_phone", "guest_email", "party_size", "reservation_time", "status", "special_requests") VALUES
    (gen_random_uuid(), v_tenant_id, v_tbl_vip1, 'Senator Haroon Rasheed', '+92 300 9988776', 'haroon@vip.com', 6, NOW() + INTERVAL '2 hours', 'Confirmed', 'Candle-light setup, window booth preferred'),
    (gen_random_uuid(), v_tenant_id, v_tbl_2, 'Sara Sheikh', '+92 322 5544332', 'sara.sheikh@gmail.com', 4, NOW() + INTERVAL '4 hours', 'Confirmed', 'High-chair needed for toddler')
    ON CONFLICT (id) DO NOTHING;

END $$;

COMMIT;
