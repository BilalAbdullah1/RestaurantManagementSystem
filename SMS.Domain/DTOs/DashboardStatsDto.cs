using System;
using System.Collections.Generic;

namespace SMS.Domain.DTOs
{
    public class DashboardStatsDto
    {
        public decimal TodaySales { get; set; }
        public int TodayOrdersCount { get; set; }
        public int ActiveTablesCount { get; set; }
        public int TotalTablesCount { get; set; }
        public int PendingKotCount { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public decimal TotalExpensesThisMonth { get; set; }
        public int TotalActiveStaff { get; set; }
        public int TotalMenuItems { get; set; }
        public List<HourlySalesDto> HourlySales { get; set; } = new();
        public List<CategorySalesDto> CategoryBreakdown { get; set; } = new();
    }

    public class HourlySalesDto
    {
        public string Hour { get; set; } = string.Empty;
        public decimal Sales { get; set; }
        public int Orders { get; set; }
    }

    public class CategorySalesDto
    {
        public string CategoryName { get; set; } = string.Empty;
        public decimal Sales { get; set; }
        public int ItemsSold { get; set; }
    }

    public class FinanceTrendDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Expenses { get; set; }
    }
}
