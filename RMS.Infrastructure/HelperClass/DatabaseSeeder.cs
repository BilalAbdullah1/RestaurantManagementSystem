using RMS.Infrastructure.Persistence;
using RMS.Core.Entities;
using RMS.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

public static class DatabaseSeeder
{
    public record ChartOfAccountSeedTemplate(string Code, string Name, string Type, string SubCategory, decimal Balance, string? ParentCode = null, int Level = 1);
    public record PermissionSeedTemplate(string Name, string Description, string ModuleName);

    public static readonly string[] StandardRoles = new[] { "Admin", "Manager", "Cashier", "Chef", "Server", "Staff" };

    public static async Task SeedPermissionsAsync(ApplicationDbContext context)
    {
        var existingDescriptions = await context.Permissions
            .IgnoreQueryFilters()
            .Select(p => p.description)
            .Where(d => d != null)
            .ToListAsync();

        var masterPermissions = GetMasterPermissions();
        bool hasChanges = false;

        foreach (var p in masterPermissions)
        {
            if (!existingDescriptions.Contains(p.Description))
            {
                context.Permissions.Add(new Permission
                {
                    id = Guid.NewGuid(),
                    name = p.Name,
                    description = p.Description,
                    module_name = p.ModuleName
                });
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedRolesAsync(ApplicationDbContext context)
    {
        var tenants = await context.Tenants.IgnoreQueryFilters().ToListAsync();
        bool hasChanges = false;

        foreach (var tenant in tenants)
        {
            var changed = await SeedRolesForTenantInternalAsync(context, tenant.id);
            if (changed) hasChanges = true;
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }

        // Ensure default role-permissions are also populated
        foreach (var tenant in tenants)
        {
            await SeedRolePermissionsForTenantInternalAsync(context, tenant.id);
        }
    }

    public static async Task<bool> SeedRolesForTenantAsync(ApplicationDbContext context, Guid tenantId)
    {
        var changed = await SeedRolesForTenantInternalAsync(context, tenantId);
        if (changed)
        {
            await context.SaveChangesAsync();
        }
        await SeedRolePermissionsForTenantInternalAsync(context, tenantId);
        return changed;
    }

    private static async Task<bool> SeedRolesForTenantInternalAsync(ApplicationDbContext context, Guid tenantId)
    {
        var existingRoles = await context.Roles
            .IgnoreQueryFilters()
            .Where(r => r.tenant_id == tenantId)
            .Select(r => r.name)
            .ToListAsync();

        bool hasChanges = false;
        foreach (var roleName in StandardRoles)
        {
            if (!existingRoles.Any(r => string.Equals(r, roleName, StringComparison.OrdinalIgnoreCase)))
            {
                context.Roles.Add(new Role
                {
                    id = Guid.NewGuid(),
                    tenant_id = tenantId,
                    name = roleName,
                    description = $"System generated {roleName} role for restaurant operations",
                    is_system_role = true,
                    created_at = DateTime.UtcNow
                });
                hasChanges = true;
            }
        }
        return hasChanges;
    }

    public static async Task SeedRolePermissionsForTenantInternalAsync(ApplicationDbContext context, Guid tenantId)
    {
        var roles = await context.Roles
            .IgnoreQueryFilters()
            .Where(r => r.tenant_id == tenantId)
            .ToListAsync();

        var allPermissions = await context.Permissions.IgnoreQueryFilters().ToListAsync();
        if (!allPermissions.Any() || !roles.Any()) return;

        bool hasChanges = false;

        foreach (var role in roles)
        {
            var existingPermIds = await context.RolePermissions
                .IgnoreQueryFilters()
                .Where(rp => rp.role_id == role.id)
                .Select(rp => rp.permission_id)
                .ToListAsync();

            if (!existingPermIds.Any())
            {
                var targetPerms = GetDefaultPermissionsForRole(role.name, allPermissions);
                foreach (var perm in targetPerms)
                {
                    context.RolePermissions.Add(new RolePermission
                    {
                        role_id = role.id,
                        permission_id = perm.id
                    });
                    hasChanges = true;
                }
            }
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static List<Permission> GetDefaultPermissionsForRole(string roleName, List<Permission> allPermissions)
    {
        var normalized = (roleName ?? "").ToLower().Trim();

        if (normalized.Contains("admin") || normalized.Contains("manager"))
        {
            return allPermissions; // Full Access
        }

        if (normalized.Contains("cashier"))
        {
            return allPermissions.Where(p =>
                p.module_name == "Point of Sale & Billing" ||
                p.module_name == "Tables & Floor Plan" ||
                p.module_name == "Customer Management" ||
                (p.description != null && (
                    p.description.StartsWith("orders.") ||
                    p.description.StartsWith("reservations.") ||
                    p.description.StartsWith("finance.shift")
                ))
            ).ToList();
        }

        if (normalized.Contains("chef") || normalized.Contains("kitchen"))
        {
            return allPermissions.Where(p =>
                p.module_name == "Kitchen Display System (KDS)" ||
                (p.description != null && (
                    p.description.StartsWith("menu.view") ||
                    p.description.StartsWith("stock.view") ||
                    p.description.StartsWith("orders.view")
                ))
            ).ToList();
        }

        if (normalized.Contains("server") || normalized.Contains("waiter"))
        {
            return allPermissions.Where(p =>
                p.module_name == "Point of Sale & Billing" ||
                p.module_name == "Tables & Floor Plan" ||
                (p.description != null && (
                    p.description.StartsWith("menu.view") ||
                    p.description.StartsWith("orders.") ||
                    p.description.StartsWith("reservations.view")
                ))
            ).ToList();
        }

        return allPermissions.Where(p => p.description != null && (p.description.EndsWith(".view") || p.description.StartsWith("staff."))).ToList();
    }

    public static async Task SeedChartOfAccountsAsync(ApplicationDbContext context)
    {
        var tenants = await context.Tenants.IgnoreQueryFilters().ToListAsync();
        bool hasChanges = false;

        foreach (var tenant in tenants)
        {
            var seeded = await SeedChartOfAccountsForTenantInternalAsync(context, tenant.id);
            if (seeded > 0) hasChanges = true;
        }

        if (hasChanges)
        {
            await context.SaveChangesAsync();
        }
    }

    public static async Task<int> SeedChartOfAccountsForTenantAsync(ApplicationDbContext context, Guid tenantId)
    {
        var count = await SeedChartOfAccountsForTenantInternalAsync(context, tenantId);
        if (count > 0)
        {
            await context.SaveChangesAsync();
        }
        return count;
    }

    private static async Task<int> SeedChartOfAccountsForTenantInternalAsync(ApplicationDbContext context, Guid tenantId)
    {
        var existingAccounts = await context.ChartOfAccounts
            .IgnoreQueryFilters()
            .Where(c => c.tenant_id == tenantId)
            .ToDictionaryAsync(c => c.code, c => c);

        var templates = GetDefaultChartOfAccounts();
        int addedCount = 0;

        // Level 1: Master Head
        foreach (var t in templates.Where(x => x.Level == 1))
        {
            if (!existingAccounts.ContainsKey(t.Code))
            {
                var account = new ChartOfAccount
                {
                    id = Guid.NewGuid(),
                    tenant_id = tenantId,
                    parent_id = null,
                    code = t.Code,
                    name = t.Name,
                    type = t.Type,
                    sub_category = t.SubCategory,
                    level = 1,
                    balance = t.Balance,
                    currency = "PKR",
                    exchange_rate = 1.0m,
                    is_reconciled = true,
                    is_active = true,
                    created_at = DateTime.UtcNow
                };
                existingAccounts[t.Code] = account;
                context.ChartOfAccounts.Add(account);
                addedCount++;
            }
        }
        if (addedCount > 0)
        {
            await context.SaveChangesAsync();
        }

        // Level 2: Sub-Control Groups
        int level2Added = 0;
        foreach (var t in templates.Where(x => x.Level == 2))
        {
            if (!existingAccounts.ContainsKey(t.Code))
            {
                Guid? parentId = null;
                if (!string.IsNullOrEmpty(t.ParentCode) && existingAccounts.TryGetValue(t.ParentCode, out var parentAcc))
                {
                    parentId = parentAcc.id;
                }

                var account = new ChartOfAccount
                {
                    id = Guid.NewGuid(),
                    tenant_id = tenantId,
                    parent_id = parentId,
                    code = t.Code,
                    name = t.Name,
                    type = t.Type,
                    sub_category = t.SubCategory,
                    level = 2,
                    balance = t.Balance,
                    currency = "PKR",
                    exchange_rate = 1.0m,
                    is_reconciled = true,
                    is_active = true,
                    created_at = DateTime.UtcNow
                };
                existingAccounts[t.Code] = account;
                context.ChartOfAccounts.Add(account);
                level2Added++;
                addedCount++;
            }
        }
        if (level2Added > 0)
        {
            await context.SaveChangesAsync();
        }

        // Level 3: Operational Sub-Ledger Accounts
        int level3Added = 0;
        foreach (var t in templates.Where(x => x.Level == 3))
        {
            if (!existingAccounts.ContainsKey(t.Code))
            {
                Guid? parentId = null;
                if (!string.IsNullOrEmpty(t.ParentCode) && existingAccounts.TryGetValue(t.ParentCode, out var parentAcc))
                {
                    parentId = parentAcc.id;
                }

                var account = new ChartOfAccount
                {
                    id = Guid.NewGuid(),
                    tenant_id = tenantId,
                    parent_id = parentId,
                    code = t.Code,
                    name = t.Name,
                    type = t.Type,
                    sub_category = t.SubCategory,
                    level = 3,
                    balance = t.Balance,
                    currency = "PKR",
                    exchange_rate = 1.0m,
                    is_reconciled = true,
                    is_active = true,
                    created_at = DateTime.UtcNow
                };
                existingAccounts[t.Code] = account;
                context.ChartOfAccounts.Add(account);
                level3Added++;
                addedCount++;
            }
        }
        if (level3Added > 0)
        {
            await context.SaveChangesAsync();
        }

        return addedCount;
    }

    public static async Task SeedTenantDefaultsAsync(ApplicationDbContext context, Guid tenantId)
    {
        await SeedRolesForTenantInternalAsync(context, tenantId);
        await SeedRolePermissionsForTenantInternalAsync(context, tenantId);
        await SeedChartOfAccountsForTenantInternalAsync(context, tenantId);
        await context.SaveChangesAsync();
    }

    public static async Task SeedDefaultTenantAndAdminAsync(ApplicationDbContext context)
    {
        // 1. Ensure master permissions catalog is seeded
        await SeedPermissionsAsync(context);

        // 2. Check or create Voke Gourmet RMS Tenant
        var vokeTenant = await context.Tenants.IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.school_code == "RMS-01" || t.school_code == "VOKE" || t.school_name.Contains("Voke"));

        if (vokeTenant == null)
        {
            vokeTenant = new Tenant
            {
                id = Guid.NewGuid(),
                school_name = "Voke Gourmet Restaurant & Bistro",
                school_code = "RMS-01",
                subdomain = "rms",
                phone = "+92 300 1234567",
                email = "admin@vokerestaurant.com",
                address = "Main Boulevard, Gulberg III, Food Street, Lahore",
                principal_name = "General Manager",
                registration_no = "RMS-REG-2026",
                website = "https://vokerestaurant.com",
                currency = "PKR",
                fiscal_year_start = "01-01",
                primary_color = "#ea580c",
                is_active = true,
                created_at = DateTimeOffset.UtcNow
            };
            context.Tenants.Add(vokeTenant);
            await context.SaveChangesAsync();
        }

        // 3. Seed Roles, Role Permissions, and Chart of Accounts
        await SeedTenantDefaultsAsync(context, vokeTenant.id);

        // 4. Seed Default Admin User
        var adminRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.tenant_id == vokeTenant.id && r.name == "Admin");
        if (adminRole != null)
        {
            var existingUser = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.tenant_id == vokeTenant.id && (u.email == "admin@vokerestaurant.com" || u.email == "admin@vokesolutions.com"));
            if (existingUser == null)
            {
                var adminUser = new User
                {
                    id = Guid.NewGuid(),
                    tenant_id = vokeTenant.id,
                    role_id = adminRole.id,
                    first_name = "Restaurant",
                    last_name = "Administrator",
                    email = "admin@vokerestaurant.com",
                    password_hash = PasswordHasher.HashPassword("Admin@123"),
                    phone_number = "+92 300 1234567",
                    is_active = true,
                    created_at = DateTime.UtcNow
                };
                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }

    public static List<PermissionSeedTemplate> GetMasterPermissions()
    {
        return new List<PermissionSeedTemplate>
        {
            // 1. Point of Sale & Orders
            new("Access POS Terminal", "pos.access", "Point of Sale & Billing"),
            new("Create Food Orders", "pos.create", "Point of Sale & Billing"),
            new("Apply Discounts & Promos", "pos.discount", "Point of Sale & Billing"),
            new("Process Bill Payments & Settle", "pos.settle", "Point of Sale & Billing"),
            new("Void or Cancel Orders", "orders.void", "Point of Sale & Billing"),
            new("Print & Re-issue Receipts", "orders.print", "Point of Sale & Billing"),
            new("View All Shift Orders", "orders.view", "Point of Sale & Billing"),

            // 2. Tables & Floor Plan
            new("View Dining Floor Plan", "tables.view", "Tables & Floor Plan"),
            new("Manage Tables & Floor Layout", "tables.manage", "Tables & Floor Plan"),
            new("Transfer or Merge Tables", "tables.transfer", "Tables & Floor Plan"),
            new("Manage Guest Table Bookings", "reservations.manage", "Tables & Floor Plan"),
            new("View Reservations Directory", "reservations.view", "Tables & Floor Plan"),

            // 3. Menu & Recipe Management
            new("View Food & Drink Menu", "menu.view", "Menu & Recipes"),
            new("Create & Edit Menu Items", "menu.manage", "Menu & Recipes"),
            new("Manage Categories & Sections", "categories.manage", "Menu & Recipes"),
            new("Toggle In-Stock / 86 Items", "menu.stocktoggle", "Menu & Recipes"),

            // 4. Kitchen Display System (KDS)
            new("View Kitchen Display Orders", "kds.view", "Kitchen Display System (KDS)"),
            new("Update KOT Ticket Status", "kds.update", "Kitchen Display System (KDS)"),
            new("Filter Kitchen Stations", "kds.stations", "Kitchen Display System (KDS)"),

            // 5. Customer & Loyalty CRM
            new("View Customer Directory", "customers.view", "Customer Management"),
            new("Manage Customer Profiles", "customers.manage", "Customer Management"),
            new("Manage Loyalty Points & Rewards", "loyalty.manage", "Customer Management"),

            // 6. Inventory & Food Stock
            new("View Raw Ingredients Stock", "inventory.view", "Inventory & Stock"),
            new("Record Stock Purchases & GRN", "inventory.purchase", "Inventory & Stock"),
            new("Perform Stock Audits & Wastage Logs", "inventory.waste", "Inventory & Stock"),

            // 7. Restaurant Finance & Accounts
            new("Manage Chart of Accounts & GL", "accounts.manage", "Finance & Accounts"),
            new("View Shift Collections & Daily P&L", "finance.reports", "Finance & Accounts"),
            new("Record Restaurant Operational Expenses", "expenses.manage", "Finance & Accounts"),

            // 8. Staff HR & Payroll
            new("View Staff Directory", "staff.view", "HR & Payroll"),
            new("Manage Staff Roster & Shifts", "staff.manage", "HR & Payroll"),
            new("Process Staff Wages & Payroll", "payroll.manage", "HR & Payroll"),
            new("Approve Staff Leave Applications", "leaves.manage", "HR & Payroll"),

            // 9. System Administration
            new("Configure Restaurant Identity & Settings", "settings.manage", "System Administration"),
            new("Manage User Logins & Passwords", "users.manage", "System Administration"),
            new("Configure Roles & Permissions Matrix", "roles.manage", "System Administration"),
            new("View System Audit Logs", "audit.view", "System Administration")
        };
    }

    public static List<ChartOfAccountSeedTemplate> GetDefaultChartOfAccounts()
    {
        return new List<ChartOfAccountSeedTemplate>
        {
            // 1000 SERIES: ASSETS
            new("1000", "ASSETS", "Asset", "Master Control Group", 0.00m, null, 1),
            new("1100", "Current Assets", "Asset", "Current Asset", 0.00m, "1000", 2),
            new("1200", "Fixed Assets & Equipment", "Asset", "Fixed Asset", 0.00m, "1000", 2),

            new("1101", "POS Cash Register Drawer Float", "Asset", "Cash & Cash Equivalents", 0.00m, "1100", 3),
            new("1102", "Main Restaurant Operating Bank Account", "Asset", "Cash & Cash Equivalents", 0.00m, "1100", 3),
            new("1103", "Customer Accounts Receivable (Corporate & Catering)", "Asset", "Current Asset", 0.00m, "1100", 3),
            new("1104", "Credit Card Merchant Settlement Clearing", "Asset", "Current Asset", 0.00m, "1100", 3),
            new("1105", "Online Food Aggregators Clearing (Foodpanda/Blink)", "Asset", "Current Asset", 0.00m, "1100", 3),

            new("1201", "Commercial Kitchen & Cooking Equipment", "Asset", "Fixed Asset", 0.00m, "1200", 3),
            new("1202", "Dining Furniture, Booths & Ambience Fixtures", "Asset", "Fixed Asset", 0.00m, "1200", 3),
            new("1203", "POS Hardware Terminals, KDS Tablets & Printers", "Asset", "Fixed Asset", 0.00m, "1200", 3),

            // 2000 SERIES: LIABILITIES
            new("2000", "LIABILITIES", "Liability", "Master Control Group", 0.00m, null, 1),
            new("2100", "Current Liabilities & Payables", "Liability", "Current Liability", 0.00m, "2000", 2),
            new("2200", "Long-Term Liabilities", "Liability", "Long-Term Liability", 0.00m, "2000", 2),

            new("2101", "Food & Grocery Suppliers Accounts Payable", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2102", "Restaurant Staff Wages Payable", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2103", "Sales Tax & VAT Payable", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2104", "Advance Banquet & Party Booking Deposits", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2201", "Long-Term Commercial Equipment Financing", "Liability", "Long-Term Liability", 0.00m, "2200", 3),

            // 3000 SERIES: EQUITY
            new("3000", "EQUITY & CAPITAL", "Equity", "Master Control Group", 0.00m, null, 1),
            new("3100", "Owner's Equity & Partner Capital", "Equity", "Capital", 0.00m, "3000", 2),
            new("3200", "Retained Profits & Reserves", "Equity", "Retained Earnings", 0.00m, "3000", 2),

            new("3101", "Restaurant Founder / Partner Capital", "Equity", "Capital", 0.00m, "3100", 3),
            new("3201", "Accumulated Net Operating Profits", "Equity", "Retained Earnings", 0.00m, "3200", 3),

            // 4000 SERIES: REVENUE
            new("4000", "REVENUE & SALES", "Revenue", "Master Control Group", 0.00m, null, 1),
            new("4100", "Food & Beverage Operating Sales", "Revenue", "Operating Income", 0.00m, "4000", 2),
            new("4200", "Auxiliary Restaurant Revenue", "Revenue", "Other Income", 0.00m, "4000", 2),

            new("4101", "Dine-In Food & Beverage Sales Revenue", "Revenue", "Operating Income", 0.00m, "4100", 3),
            new("4102", "Takeaway & Parcel Counter Sales Revenue", "Revenue", "Operating Income", 0.00m, "4100", 3),
            new("4103", "Online Home Delivery Sales Revenue", "Revenue", "Operating Income", 0.00m, "4100", 3),
            new("4201", "Banquet Hall & Catering Service Revenue", "Revenue", "Other Income", 0.00m, "4200", 3),
            new("4202", "Delivery Surcharge & Packing Fees Income", "Revenue", "Other Income", 0.00m, "4200", 3),

            // 5000 SERIES: OPERATING EXPENSES
            new("5000", "OPERATING EXPENSES", "Expense", "Master Control Group", 0.00m, null, 1),
            new("5100", "Kitchen Raw Food & Ingredient Purchases", "Expense", "Cost of Goods Sold", 0.00m, "5000", 2),
            new("5200", "Staff Payroll & Wages", "Expense", "Operating Expense", 0.00m, "5000", 2),
            new("5300", "Restaurant Utilities & Overhead Costs", "Expense", "Operating Expense", 0.00m, "5000", 2),

            new("5101", "Fresh Meat, Poultry & Seafood Purchases", "Expense", "Cost of Goods Sold", 0.00m, "5100", 3),
            new("5102", "Dairy, Cheese, Bakery & Groceries Purchases", "Expense", "Cost of Goods Sold", 0.00m, "5100", 3),
            new("5103", "Beverages, Syrups, Coffee Beans & Bar Supplies", "Expense", "Cost of Goods Sold", 0.00m, "5100", 3),
            new("5104", "Food Packaging, Boxes & Disposable Cutlery", "Expense", "Cost of Goods Sold", 0.00m, "5100", 3),

            new("5201", "Head Chef & Kitchen Staff Wages", "Expense", "Operating Expense", 0.00m, "5200", 3),
            new("5202", "Waiters, Captains & Front-of-House Salaries", "Expense", "Operating Expense", 0.00m, "5200", 3),
            new("5203", "Cashier & Managerial Compensation", "Expense", "Operating Expense", 0.00m, "5200", 3),

            new("5301", "Restaurant Building Rent & Facility Lease", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5302", "Commercial Cooking LPG Gas & Electricity", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5303", "Kitchen Equipment Maintenance & Repairs", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5304", "Food Photography, Social Media & Marketing Promos", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5305", "Bank Card Processing & POS Transaction Fees", "Expense", "Financial Expense", 0.00m, "5300", 3)
        };
    }
}