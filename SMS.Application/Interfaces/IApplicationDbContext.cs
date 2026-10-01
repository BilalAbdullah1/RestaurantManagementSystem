using Microsoft.EntityFrameworkCore;
using SMS.Core.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Tenant> Tenants { get; }
        DbSet<Role> Roles { get; }
        DbSet<User> Users { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<AuditLog> AuditLogs { get; }

        // Restaurant Staff & HR / Payroll
        DbSet<Staff> Staff { get; }
        DbSet<StaffAttendance> StaffAttendances { get; }
        DbSet<SalarySlip> SalarySlips { get; }
        DbSet<StaffLoan> StaffLoans { get; }
        DbSet<StaffAppraisal> StaffAppraisals { get; }
        DbSet<StaffClearance> StaffClearances { get; }
        DbSet<LeaveApplication> LeaveApplications { get; }

        // Financial Accounting & Inventory
        DbSet<ChartOfAccount> ChartOfAccounts { get; }
        DbSet<SchoolExpense> SchoolExpenses { get; }
        DbSet<InventoryItem> InventoryItems { get; }
        DbSet<InventoryTransaction> InventoryTransactions { get; }

        // Notifications & General
        DbSet<SMS.Domain.Common.Notification> Notifications { get; }
        DbSet<Holiday> Holidays { get; }

        // Core Restaurant Management System (RMS)
        DbSet<Category> MenuCategories { get; }
        DbSet<MenuItem> MenuItems { get; }
        DbSet<DiningTable> DiningTables { get; }
        DbSet<TableReservation> TableReservations { get; }
        DbSet<Order> Orders { get; }
        DbSet<OrderItem> OrderItems { get; }
        DbSet<KitchenOrderTicket> KitchenOrderTickets { get; }
        DbSet<Customer> Customers { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}