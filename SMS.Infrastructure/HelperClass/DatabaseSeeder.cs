using SMS.Infrastructure.Persistence;
using SMS.Core.Entities;
using SMS.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

public static class DatabaseSeeder
{
    public record ChartOfAccountSeedTemplate(string Code, string Name, string Type, string SubCategory, decimal Balance, string? ParentCode = null, int Level = 1);
    public record PermissionSeedTemplate(string Name, string Description, string ModuleName);

    public static readonly string[] StandardRoles = new[] { "Admin", "Teacher", "Student", "Parent", "Staff" };

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
                    description = $"System generated {roleName} role",
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

            // Only seed if this role has 0 permissions currently assigned
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

        if (normalized.Contains("admin") || normalized.Contains("principal"))
        {
            return allPermissions; // Full Access
        }

        if (normalized.Contains("teacher"))
        {
            return allPermissions.Where(p =>
                p.module_name == "Academic & Timetable" ||
                p.module_name == "Examinations & Grading" ||
                (p.description != null && (
                    p.description.StartsWith("students.view") ||
                    p.description.StartsWith("attendance.") ||
                    p.description.StartsWith("lessonplans.") ||
                    p.description.StartsWith("studymaterials.") ||
                    p.description.StartsWith("marks.") ||
                    p.description.StartsWith("exams.view") ||
                    p.description.StartsWith("library.view") ||
                    p.description.StartsWith("notices.")
                ))
            ).ToList();
        }

        if (normalized.Contains("staff"))
        {
            return allPermissions.Where(p =>
                (p.description != null && (
                    p.description.StartsWith("students.view") ||
                    p.description.StartsWith("attendance.view") ||
                    p.description.StartsWith("staff.view") ||
                    p.description.StartsWith("notices.view") ||
                    p.description.StartsWith("helpdesk.")
                ))
            ).ToList();
        }

        if (normalized.Contains("student"))
        {
            return allPermissions.Where(p =>
                (p.description != null && (
                    p.description.StartsWith("academic.view") ||
                    p.description.StartsWith("attendance.view") ||
                    p.description.StartsWith("exams.view") ||
                    p.description.StartsWith("reportcards.") ||
                    p.description.StartsWith("studymaterials.") ||
                    p.description.StartsWith("notices.view")
                ))
            ).ToList();
        }

        if (normalized.Contains("parent"))
        {
            return allPermissions.Where(p =>
                (p.description != null && (
                    p.description.StartsWith("students.view") ||
                    p.description.StartsWith("attendance.view") ||
                    p.description.StartsWith("fees.view") ||
                    p.description.StartsWith("reportcards.") ||
                    p.description.StartsWith("notices.view") ||
                    p.description.StartsWith("helpdesk.")
                ))
            ).ToList();
        }

        return allPermissions.Where(p => p.description != null && p.description.EndsWith(".view")).ToList();
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

        // Level 1: Master Heads (No parent_id)
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

        // Level 2: Sub-Control Groups (Link to Level 1)
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

        // Level 3: Operational Sub-Ledger Accounts (Link to Level 2)
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
            else
            {
                // If account exists from older seed but lacks parent_id/level, backfill it
                var existingAcc = existingAccounts[t.Code];
                bool modified = false;
                if (!string.IsNullOrEmpty(t.ParentCode) && existingAcc.parent_id == null && existingAccounts.TryGetValue(t.ParentCode, out var parentAcc))
                {
                    existingAcc.parent_id = parentAcc.id;
                    modified = true;
                }
                if (existingAcc.level != t.Level)
                {
                    existingAcc.level = t.Level;
                    modified = true;
                }
                if (modified)
                {
                    context.ChartOfAccounts.Update(existingAcc);
                    level3Added++;
                }
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

        // 2. Check or create Voke Solutions Tenant
        var vokeTenant = await context.Tenants.IgnoreQueryFilters().FirstOrDefaultAsync(t => t.school_code == "VOKE" || t.school_name == "Voke Solutions");
        if (vokeTenant == null)
        {
            vokeTenant = new Tenant
            {
                id = Guid.NewGuid(),
                school_name = "Voke Solutions",
                school_code = "VOKE",
                subdomain = "voke",
                phone = "+92 300 0000000",
                email = "admin@vokesolutions.com",
                address = "Voke Solutions Innovation Campus, Main Boulevard",
                principal_name = "System Administrator",
                registration_no = "REG-VOKE-2026",
                website = "https://vokesolutions.com",
                currency = "PKR",
                fiscal_year_start = "04-01",
                primary_color = "#2563eb",
                is_active = true,
                created_at = DateTimeOffset.UtcNow
            };
            context.Tenants.Add(vokeTenant);
            await context.SaveChangesAsync();
        }

        // 3. Seed Roles, Role Permissions, and Chart of Accounts for Voke Solutions
        await SeedTenantDefaultsAsync(context, vokeTenant.id);

        // 4. Seed Default Admin User for Voke Solutions
        var adminRole = await context.Roles.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.tenant_id == vokeTenant.id && r.name == "Admin");
        if (adminRole != null)
        {
            var existingUser = await context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.tenant_id == vokeTenant.id && u.email == "admin@vokesolutions.com");
            if (existingUser == null)
            {
                var adminUser = new User
                {
                    id = Guid.NewGuid(),
                    tenant_id = vokeTenant.id,
                    role_id = adminRole.id,
                    first_name = "Voke",
                    last_name = "Admin",
                    email = "admin@vokesolutions.com",
                    password_hash = PasswordHasher.HashPassword("Admin@123"),
                    phone_number = "+92 300 0000000",
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
            // 1. Students & SIS Module
            new("View Student Directory", "students.view", "Students & Admissions"),
            new("Register New Student", "students.create", "Students & Admissions"),
            new("Edit Student Profile", "students.edit", "Students & Admissions"),
            new("Delete Student Record", "students.delete", "Students & Admissions"),
            new("Export Student Data", "students.export", "Students & Admissions"),
            new("Mark Student Daily Attendance", "attendance.mark", "Students & Admissions"),
            new("View Attendance Reports & Heatmap", "attendance.view", "Students & Admissions"),
            new("Process Student Promotions & Transfers", "students.promotions", "Students & Admissions"),
            new("Manage Student Behavior Logs", "students.behavior", "Students & Admissions"),
            new("Manage Admissions Desk & CRM", "admissions.manage", "Students & Admissions"),

            // 2. Academic & Timetable
            new("View Classes, Sections & Subjects", "academic.view", "Academic & Timetable"),
            new("Manage Classes & Sections", "classes.manage", "Academic & Timetable"),
            new("Manage Subjects Curriculum", "subjects.manage", "Academic & Timetable"),
            new("Manage Master Class & Teacher Timetables", "timetable.manage", "Academic & Timetable"),
            new("Manage Lesson Plans & Syllabus", "lessonplans.manage", "Academic & Timetable"),
            new("Upload Study Materials & E-Books", "studymaterials.manage", "Academic & Timetable"),

            // 3. Examinations & Grading
            new("View Examination Schedules", "exams.view", "Examinations & Grading"),
            new("Create Exam Paper Setup & Datesheets", "exams.manage", "Examinations & Grading"),
            new("Enter Student Subject Marks", "marks.entry", "Examinations & Grading"),
            new("Lock & Finalize Examination Marks", "marks.lock", "Examinations & Grading"),
            new("Configure Grading Scales & GPA", "gradingscales.manage", "Examinations & Grading"),
            new("Generate Report Cards & Transcripts", "reportcards.generate", "Examinations & Grading"),

            // 4. Finance, Fees & Accounts
            new("View Fee Structures & Concessions", "fees.view", "Finance & Accounts"),
            new("Collect Student Fee Payments", "fees.collect", "Finance & Accounts"),
            new("Generate Fee Challans & 3-Copy Vouchers", "fees.vouchers", "Finance & Accounts"),
            new("Manage Chart of Accounts & General Ledger", "accounts.manage", "Finance & Accounts"),
            new("View Financial Statements & P&L Reports", "finance.reports", "Finance & Accounts"),
            new("Manage School Expenses & Vouchers", "expenses.manage", "Finance & Accounts"),

            // 5. HR & Staff Payroll
            new("View Staff & Teacher Directory", "staff.view", "HR & Payroll"),
            new("Manage Staff Profiles & Contracts", "staff.manage", "HR & Payroll"),
            new("Process Staff Monthly Payroll & Slips", "payroll.manage", "HR & Payroll"),
            new("Approve Staff Leave Applications", "leaves.manage", "HR & Payroll"),
            new("Manage Staff Advances & Loans", "loans.manage", "HR & Payroll"),

            // 6. Transport, Hostel & Library
            new("Manage Transport Routes & Vehicles", "transport.manage", "Facilities & Transport"),
            new("Manage Hostel Dormitories & Allocations", "hostel.manage", "Facilities & Transport"),
            new("Manage Library Catalog & Book Loans", "library.manage", "Facilities & Transport"),

            // 7. Communication & System Settings
            new("View & Post School Notices", "notices.manage", "Communication & Helpdesk"),
            new("Broadcast SMS & Push Alerts", "alerts.broadcast", "Communication & Helpdesk"),
            new("Manage Helpdesk & Parent Inquiries", "helpdesk.manage", "Communication & Helpdesk"),
            new("Configure School Identity & Settings", "settings.manage", "System Administration"),
            new("Manage User Accounts & Passwords", "users.manage", "System Administration"),
            new("Configure Roles & Permissions Matrix", "roles.manage", "System Administration"),
            new("View Security Audit Trail Logs", "audit.view", "System Administration")
        };
    }

    public static List<ChartOfAccountSeedTemplate> GetDefaultChartOfAccounts()
    {
        return new List<ChartOfAccountSeedTemplate>
        {
            // ==========================================
            // 1000 SERIES: ASSETS
            // ==========================================
            // Level 1: Master Head
            new("1000", "ASSETS", "Asset", "Master Control Group", 0.00m, null, 1),

            // Level 2: Sub-Control Groups
            new("1100", "Current Assets", "Asset", "Current Asset", 0.00m, "1000", 2),
            new("1200", "Fixed & Non-Current Assets", "Asset", "Fixed Asset", 0.00m, "1000", 2),

            // Level 3: Operational Sub-Ledger Accounts
            new("1101", "Petty Cash Vault (Custodian Float)", "Asset", "Cash & Cash Equivalents", 0.00m, "1100", 3),
            new("1102", "Main School Bank Operating Account", "Asset", "Cash & Cash Equivalents", 0.00m, "1100", 3),
            new("1103", "Student Fee Accounts Receivable", "Asset", "Current Asset", 0.00m, "1100", 3),
            new("1104", "Student RFID Cashless Wallet Clearing", "Asset", "Current Asset", 0.00m, "1100", 3),
            new("1105", "Short-Term Advances & Prepayments", "Asset", "Current Asset", 0.00m, "1100", 3),

            new("1201", "School Land & Campus Infrastructure", "Asset", "Fixed Asset", 0.00m, "1200", 3),
            new("1202", "Computer Labs & IT Equipment", "Asset", "Fixed Asset", 0.00m, "1200", 3),
            new("1203", "Classroom Furniture & Lab Fixtures", "Asset", "Fixed Asset", 0.00m, "1200", 3),
            new("1204", "School Buses & Transport Fleet Vehicles", "Asset", "Fixed Asset", 0.00m, "1200", 3),

            // ==========================================
            // 2000 SERIES: LIABILITIES
            // ==========================================
            // Level 1: Master Head
            new("2000", "LIABILITIES", "Liability", "Master Control Group", 0.00m, null, 1),

            // Level 2: Sub-Control Groups
            new("2100", "Current Liabilities & Payables", "Liability", "Current Liability", 0.00m, "2000", 2),
            new("2200", "Long-Term Liabilities", "Liability", "Long-Term Liability", 0.00m, "2000", 2),

            // Level 3: Operational Sub-Ledger Accounts
            new("2101", "Accounts Payable & Vendor Dues", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2102", "Refundable Student Security Deposits", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2103", "Staff Salaries Payable", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2104", "Staff Provident Fund & Gratuity Liability", "Liability", "Current Liability", 0.00m, "2100", 3),
            new("2105", "Advance Student Fee Collections (Unearned)", "Liability", "Current Liability", 0.00m, "2100", 3),

            new("2201", "Long-Term Commercial Bank Loans", "Liability", "Long-Term Liability", 0.00m, "2200", 3),

            // ==========================================
            // 3000 SERIES: EQUITY & SURPLUS
            // ==========================================
            // Level 1: Master Head
            new("3000", "EQUITY & CAPITAL", "Equity", "Master Control Group", 0.00m, null, 1),

            // Level 2: Sub-Control Groups
            new("3100", "Capital & Shareholder Reserves", "Equity", "Capital", 0.00m, "3000", 2),
            new("3200", "Retained Surplus & Reserves", "Equity", "Retained Earnings", 0.00m, "3000", 2),

            // Level 3: Operational Sub-Ledger Accounts
            new("3101", "School Founder / Trust Capital", "Equity", "Capital", 0.00m, "3100", 3),
            new("3102", "Campus Infrastructure Reserve Surplus", "Equity", "Reserves", 0.00m, "3100", 3),
            new("3201", "Retained Earnings & Accumulated Surplus", "Equity", "Retained Earnings", 0.00m, "3200", 3),

            // ==========================================
            // 4000 SERIES: REVENUE / INCOME
            // ==========================================
            // Level 1: Master Head
            new("4000", "REVENUE & INCOME", "Revenue", "Master Control Group", 0.00m, null, 1),

            // Level 2: Sub-Control Groups
            new("4100", "Core Academic Tuition & Fee Income", "Revenue", "Operating Income", 0.00m, "4000", 2),
            new("4200", "Auxiliary & Facility Revenue", "Revenue", "Other Income", 0.00m, "4000", 2),

            // Level 3: Operational Sub-Ledger Accounts
            new("4101", "Monthly Tuition Fee Income", "Revenue", "Operating Income", 0.00m, "4100", 3),
            new("4102", "Admission & Registration Fee Income", "Revenue", "Operating Income", 0.00m, "4100", 3),
            new("4103", "Annual Development & Exam Fee Income", "Revenue", "Operating Income", 0.00m, "4100", 3),
            new("4104", "Science & Computer Lab Fee Income", "Revenue", "Operating Income", 0.00m, "4100", 3),

            new("4201", "Transport Fleet Monthly Fee Income", "Revenue", "Operating Income", 0.00m, "4200", 3),
            new("4202", "Hostel Lodging & Mess Fee Income", "Revenue", "Operating Income", 0.00m, "4200", 3),
            new("4203", "Late Fee Fine Collections Income", "Revenue", "Other Income", 0.00m, "4200", 3),
            new("4204", "Canteen & Uniform Commission Revenue", "Revenue", "Other Income", 0.00m, "4200", 3),

            // ==========================================
            // 5000 SERIES: OPERATING EXPENSES
            // ==========================================
            // Level 1: Master Head
            new("5000", "EXPENSES", "Expense", "Master Control Group", 0.00m, null, 1),

            // Level 2: Sub-Control Groups
            new("5100", "Payroll & Staff Compensation", "Expense", "Operating Expense", 0.00m, "5000", 2),
            new("5200", "Campus Facility & Utilities Expenses", "Expense", "Operating Expense", 0.00m, "5000", 2),
            new("5300", "Academic, Administrative & Financial Costs", "Expense", "Operating Expense", 0.00m, "5000", 2),

            // Level 3: Operational Sub-Ledger Accounts
            new("5101", "Teaching & Academic Faculty Salaries", "Expense", "Operating Expense", 0.00m, "5100", 3),
            new("5102", "Administrative & Non-Teaching Staff Salaries", "Expense", "Operating Expense", 0.00m, "5100", 3),
            new("5103", "Staff Medical, Allowances & Bonuses", "Expense", "Operating Expense", 0.00m, "5100", 3),

            new("5201", "Utilities (Electricity, Water, Gas)", "Expense", "Operating Expense", 0.00m, "5200", 3),
            new("5202", "Building Rent & Campus Lease", "Expense", "Operating Expense", 0.00m, "5200", 3),
            new("5203", "Campus Maintenance, Janitorial & Repairs", "Expense", "Operating Expense", 0.00m, "5200", 3),
            new("5204", "Fuel, Transport Fleet & Generator Logistics", "Expense", "Operating Expense", 0.00m, "5200", 3),

            new("5301", "Stationery, Exam Papers & Printing Supplies", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5302", "School Events, Sports, Annual Day & Celebrations", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5303", "Marketing, Social Media & Admissions Advertising", "Expense", "Operating Expense", 0.00m, "5300", 3),
            new("5304", "Bank Charges & Payment Gateway Fees", "Expense", "Financial Expense", 0.00m, "5300", 3)
        };
    }
}