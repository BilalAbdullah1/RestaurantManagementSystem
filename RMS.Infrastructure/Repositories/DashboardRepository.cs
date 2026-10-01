using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Domain.DTOs;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public DashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var dto = new DashboardStatsDto();

            // 1. TODAY SALES & ORDERS
            var todayOrders = await _context.Orders
                .Where(o => o.tenant_id == tenantId && o.created_at >= today && o.payment_status == "Paid")
                .ToListAsync();

            dto.TodaySales = todayOrders.Sum(o => o.total_amount);
            dto.TodayOrdersCount = todayOrders.Count;

            // 2. TABLES STATUS
            dto.TotalTablesCount = await _context.DiningTables.CountAsync(t => t.tenant_id == tenantId);
            dto.ActiveTablesCount = await _context.DiningTables.CountAsync(t => t.tenant_id == tenantId && t.status == "Occupied");

            // 3. KITCHEN PENDING TICKETS
            dto.PendingKotCount = await _context.KitchenOrderTickets.CountAsync(k => k.tenant_id == tenantId && k.status == "Cooking");

            // 4. MONTHLY REVENUE & EXPENSES
            dto.MonthlyRevenue = await _context.Orders
                .Where(o => o.tenant_id == tenantId && o.created_at >= startOfMonth && o.payment_status == "Paid")
                .SumAsync(o => (decimal?)o.total_amount) ?? 0;

            dto.TotalExpensesThisMonth = await _context.RestaurantExpenses
                .Where(e => e.tenant_id == tenantId && e.expense_date >= startOfMonth)
                .SumAsync(e => (decimal?)e.amount) ?? 0;

            // 5. STAFF & MENU
            dto.TotalActiveStaff = await _context.Staff.CountAsync(s => s.tenant_id == tenantId && s.is_active);
            dto.TotalMenuItems = await _context.MenuItems.CountAsync(m => m.tenant_id == tenantId && m.is_available);

            return dto;
        }

        public async Task<IEnumerable<FinanceTrendDto>> GetFinanceTrendAsync(Guid tenantId)
        {
            var months = new List<FinanceTrendDto>();
            var now = DateTime.UtcNow;

            for (int i = 5; i >= 0; i--)
            {
                var dt = now.AddMonths(-i);
                var start = new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var end = start.AddMonths(1);

                var revenue = await _context.Orders
                    .Where(o => o.tenant_id == tenantId && o.created_at >= start && o.created_at < end && o.payment_status == "Paid")
                    .SumAsync(o => (decimal?)o.total_amount) ?? 0;

                var expenses = await _context.SchoolExpenses
                    .Where(e => e.tenant_id == tenantId && e.expense_date >= start && e.expense_date < end)
                    .SumAsync(e => (decimal?)e.amount) ?? 0;

                months.Add(new FinanceTrendDto
                {
                    Month = dt.ToString("MMM yyyy"),
                    Revenue = revenue,
                    Expenses = expenses
                });
            }

            return months;
        }
    }
}
