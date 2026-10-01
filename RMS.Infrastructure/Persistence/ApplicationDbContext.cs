using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using RMS.Core.Interfaces;
using RMS.Infrastructure.Services;
using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        private readonly ITenantProvider _tenantProvider;
        private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;
        public Guid TenantId { get; }

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options, 
            ITenantProvider tenantProvider,
            Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _tenantProvider = tenantProvider;
            _httpContextAccessor = httpContextAccessor;
            TenantId = _tenantProvider.GetTenantId();
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }
        
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Permission> Permissions { get; set; }

        // Restaurant Staff & HR / Payroll
        public DbSet<Staff> Staff { get; set; }
        public DbSet<StaffAttendance> StaffAttendances { get; set; }
        public DbSet<SalarySlip> SalarySlips { get; set; }
        public DbSet<StaffLoan> StaffLoans { get; set; }
        public DbSet<StaffAppraisal> StaffAppraisals { get; set; }
        public DbSet<StaffClearance> StaffClearances { get; set; }
        public DbSet<LeaveApplication> LeaveApplications { get; set; }

        // Financial Accounting & Inventory
        public DbSet<ChartOfAccount> ChartOfAccounts { get; set; }
        public DbSet<RestaurantExpense> RestaurantExpenses { get; set; }
        public DbSet<RestaurantExpense> SchoolExpenses { get => RestaurantExpenses; set => RestaurantExpenses = value; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }

        // Notifications & General
        public DbSet<RMS.Domain.Common.Notification> Notifications { get; set; }
        public DbSet<Holiday> Holidays { get; set; }

        // Core Restaurant Management System (RMS)
        public DbSet<Category> MenuCategories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<DiningTable> DiningTables { get; set; }
        public DbSet<TableReservation> TableReservations { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<KitchenOrderTicket> KitchenOrderTickets { get; set; }
        public DbSet<Customer> Customers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Composite Key for RolePermission
            modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.role_id, rp.permission_id });

            // Dynamic Loop for Multi-Tenancy Filter & DateTime UTC Conversion
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // 1. Multi-Tenant Global Query Filter Setup
                if (typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var tenantProp = Expression.Property(parameter, "tenant_id");
                    var currentTenantProp = Expression.Property(Expression.Constant(this), nameof(TenantId));
                    var emptyGuidConst = Expression.Constant(Guid.Empty);

                    var isTenantEmpty = Expression.Equal(currentTenantProp, emptyGuidConst);
                    var isMatchingTenant = Expression.Equal(tenantProp, currentTenantProp);
                    var combinedBody = Expression.OrElse(isTenantEmpty, isMatchingTenant);
                    var lambda = Expression.Lambda(combinedBody, parameter);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }

                // 2. DateTime UTC Value Converter
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        modelBuilder.Entity(entityType.ClrType)
                                    .Property(property.Name)
                                    .HasConversion(new ValueConverter<DateTime, DateTime>(
                                        v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
                                        v => v
                                    ));
                    }
                }
            }

            // Configure Many-to-Many Join Table Relationships
            modelBuilder.Entity<RolePermission>()
                .HasOne<Role>()
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.role_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne<Permission>()
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.permission_id)
                .OnDelete(DeleteBehavior.Cascade);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = new System.Collections.Generic.List<AuditLog>();
            var userIdStr = _httpContextAccessor?.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = Guid.TryParse(userIdStr, out var uid) ? uid : null;
            var ipAddress = _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString();

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                if (entry.Entity is IMustHaveTenant tenantEntity && entry.State == EntityState.Added)
                {
                    if (tenantEntity.tenant_id == Guid.Empty && TenantId != Guid.Empty)
                    {
                        tenantEntity.tenant_id = TenantId;
                    }
                }

                var auditEntry = new AuditLog
                {
                    id = Guid.NewGuid(),
                    tenant_id = TenantId,
                    table_name = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                    action = entry.State.ToString(),
                    user_id = userId,
                    ip_address = ipAddress,
                    created_at = DateTimeOffset.UtcNow,
                    new_values = System.Text.Json.JsonSerializer.Serialize(entry.CurrentValues.ToObject())
                };

                auditEntries.Add(auditEntry);
            }

            if (auditEntries.Count > 0)
            {
                AuditLogs.AddRange(auditEntries);
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}