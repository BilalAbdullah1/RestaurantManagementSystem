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
    public class FinanceReportRepository : IFinanceReportRepository
    {
        private readonly ApplicationDbContext _context;

        public FinanceReportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DefaulterReportDto> GetDefaultersAsync(Guid tenantId)
        {
            var now = DateTime.UtcNow;

            // In RMS: fetch unpaid or pending orders
            var unpaidOrders = await _context.Orders
                .Where(o => o.tenant_id == tenantId && (o.payment_status == "Unpaid" || o.payment_status == "Pending"))
                .ToListAsync();

            var report = new DefaulterReportDto();
            var defaultersDict = new Dictionary<string, DefaulterDto>();

            foreach (var order in unpaidOrders)
            {
                var customerKey = !string.IsNullOrEmpty(order.customer_phone) 
                    ? order.customer_phone 
                    : (!string.IsNullOrEmpty(order.customer_name) ? order.customer_name : order.id.ToString());

                if (!defaultersDict.TryGetValue(customerKey, out var def))
                {
                    def = new DefaulterDto
                    {
                        StudentId = order.id,
                        StudentName = string.IsNullOrEmpty(order.customer_name) ? "Walk-in Guest" : order.customer_name,
                        AdmissionNumber = order.order_number,
                        ClassName = order.order_type,
                        ParentPhone = order.customer_phone ?? "N/A",
                        PendingAmount = 0,
                        OverdueChallansCount = 0
                    };
                    defaultersDict[customerKey] = def;
                }

                def.PendingAmount += order.total_amount;
                def.OverdueChallansCount++;

                var daysOverdue = (now - order.created_at).TotalDays;
                string aging = "1-30 Days";
                if (daysOverdue > 90) aging = "90+ Days";
                else if (daysOverdue > 60) aging = "61-90 Days";
                else if (daysOverdue > 30) aging = "31-60 Days";

                if (def.AgingCategory == "" || (def.AgingCategory == "1-30 Days" && aging != "1-30 Days"))
                    def.AgingCategory = aging;
                else if (def.AgingCategory == "31-60 Days" && (aging == "61-90 Days" || aging == "90+ Days"))
                    def.AgingCategory = aging;
                else if (def.AgingCategory == "61-90 Days" && aging == "90+ Days")
                    def.AgingCategory = aging;
            }

            report.Defaulters = defaultersDict.Values.OrderByDescending(d => d.PendingAmount).ToList();
            report.TotalDefaulters = report.Defaulters.Count;
            report.TotalPendingAmount = report.Defaulters.Sum(d => d.PendingAmount);

            report.AgingSummary["1-30 Days"] = report.Defaulters.Where(d => d.AgingCategory == "1-30 Days").Sum(d => d.PendingAmount);
            report.AgingSummary["31-60 Days"] = report.Defaulters.Where(d => d.AgingCategory == "31-60 Days").Sum(d => d.PendingAmount);
            report.AgingSummary["61-90 Days"] = report.Defaulters.Where(d => d.AgingCategory == "61-90 Days").Sum(d => d.PendingAmount);
            report.AgingSummary["90+ Days"] = report.Defaulters.Where(d => d.AgingCategory == "90+ Days").Sum(d => d.PendingAmount);

            return report;
        }

        public async Task<ProfitAndLossDto> GetProfitAndLossAsync(Guid tenantId, DateTime startDate, DateTime endDate)
        {
            var pnl = new ProfitAndLossDto
            {
                PeriodLabel = $"{startDate:dd MMM yyyy} – {endDate:dd MMM yyyy}"
            };

            // ── 1. RESTAURANT ORDER REVENUE ──────────────────────────────────────────
            var paidOrders = await _context.Orders
                .Where(o => o.tenant_id == tenantId
                         && o.payment_status == "Paid"
                         && o.created_at >= startDate
                         && o.created_at <= endDate)
                .OrderBy(o => o.created_at)
                .ToListAsync();

            var revenueByType = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);

            foreach (var order in paidOrders)
            {
                var type = string.IsNullOrWhiteSpace(order.order_type) ? "DineIn" : order.order_type;
                revenueByType[type] = revenueByType.GetValueOrDefault(type, 0) + order.total_amount;

                pnl.RevenueItems.Add(new PnlLineItemDto
                {
                    Date = order.created_at.ToString("dd MMM yyyy"),
                    Description = $"Order #{order.order_number} ({type}) — {order.customer_name}",
                    Category = $"{type} Sales",
                    Reference = $"ORD-{order.order_number}",
                    Amount = order.total_amount,
                    Source = "FoodOrder"
                });
            }

            pnl.TotalRevenue = paidOrders.Sum(o => o.total_amount);
            pnl.TotalPaymentsCount = paidOrders.Count;

            // Revenue Breakdown (categories for bar / pie chart)
            foreach (var kv in revenueByType.OrderByDescending(k => k.Value))
            {
                pnl.RevenueBreakdown.Add(new FinanceCategorySummaryDto
                {
                    Category = $"{kv.Key} Sales",
                    Amount = Math.Round(kv.Value, 2),
                    Percentage = pnl.TotalRevenue > 0
                                    ? Math.Round((kv.Value / pnl.TotalRevenue) * 100, 1)
                                    : 0,
                    Count = paidOrders.Count(o => (o.order_type ?? "DineIn").Equals(kv.Key, StringComparison.OrdinalIgnoreCase))
                });
            }

            if (!pnl.RevenueBreakdown.Any())
            {
                pnl.RevenueBreakdown.Add(new FinanceCategorySummaryDto
                {
                    Category = "No Sales Recorded",
                    Amount = 0,
                    Percentage = 0,
                    Count = 0
                });
            }

            // ── 2. EXPENSES ───────────────────────────────────────────────────────────
            var expenses = await _context.RestaurantExpenses
                .Where(e => e.tenant_id == tenantId
                         && e.expense_date >= startDate
                         && e.expense_date <= endDate)
                .OrderBy(e => e.expense_date)
                .ToListAsync();

            var salaries = await _context.SalarySlips
                .Where(s => s.tenant_id == tenantId
                         && s.status == "Paid"
                         && s.payment_date >= startDate
                         && s.payment_date <= endDate)
                .ToListAsync();

            // Load staff names for salary line items
            var salStaffIds = salaries.Select(s => s.staff_id).Distinct().ToList();
            var salStaff = await _context.Staff
                .Where(st => salStaffIds.Contains(st.id))
                .ToDictionaryAsync(st => st.id);
            var salUserIds = salStaff.Values.Select(st => st.user_id).Distinct().ToList();
            var salUsers = await _context.Users
                .Where(u => salUserIds.Contains(u.id))
                .ToDictionaryAsync(u => u.id);

            decimal totalRestaurantExpense = expenses.Sum(e => e.amount);
            decimal totalSalaryExpense = salaries.Sum(s => s.net_salary);
            pnl.TotalExpenses = totalRestaurantExpense + totalSalaryExpense;
            pnl.TotalExpenseCount = expenses.Count + salaries.Count;

            // Expense line items — restaurant operations expenses
            foreach (var exp in expenses)
            {
                pnl.ExpenseItems.Add(new PnlLineItemDto
                {
                    Date = exp.expense_date.ToString("dd MMM yyyy"),
                    Description = exp.title,
                    Category = string.IsNullOrWhiteSpace(exp.category) ? "Kitchen & Ops" : exp.category,
                    Reference = exp.receipt_no ?? "—",
                    Amount = exp.amount,
                    Source = "Expense"
                });
            }

            // Expense line items — staff salaries
            foreach (var sal in salaries)
            {
                salStaff.TryGetValue(sal.staff_id, out var st);
                var staffName = "Staff Member";
                if (st != null && salUsers.TryGetValue(st.user_id, out var usr))
                    staffName = $"{usr.first_name} {usr.last_name}";

                pnl.ExpenseItems.Add(new PnlLineItemDto
                {
                    Date = (sal.payment_date ?? sal.created_at).ToString("dd MMM yyyy"),
                    Description = $"Salary — {staffName} ({sal.salary_month})",
                    Category = "Staff Salaries",
                    Reference = $"SAL-{sal.id.ToString()[..8].ToUpper()}",
                    Amount = sal.net_salary,
                    Source = "Salary"
                });
            }

            // Expense Breakdown
            var expByCat = expenses
                .GroupBy(e => string.IsNullOrWhiteSpace(e.category) ? "Kitchen & Ops" : e.category)
                .Select(g => new FinanceCategorySummaryDto
                {
                    Category = g.Key,
                    Amount = g.Sum(e => e.amount),
                    Count = g.Count(),
                    Percentage = pnl.TotalExpenses > 0
                                    ? Math.Round((g.Sum(e => e.amount) / pnl.TotalExpenses) * 100, 1)
                                    : 0
                })
                .OrderByDescending(x => x.Amount)
                .ToList();

            if (totalSalaryExpense > 0)
            {
                expByCat.Add(new FinanceCategorySummaryDto
                {
                    Category = "Staff Salaries",
                    Amount = totalSalaryExpense,
                    Count = salaries.Count,
                    Percentage = pnl.TotalExpenses > 0
                                    ? Math.Round((totalSalaryExpense / pnl.TotalExpenses) * 100, 1)
                                    : 0
                });
            }

            if (!expByCat.Any())
            {
                expByCat.Add(new FinanceCategorySummaryDto
                {
                    Category = "No Expenses Recorded",
                    Amount = 0,
                    Percentage = 0,
                    Count = 0
                });
            }

            pnl.ExpenseBreakdown = expByCat;

            // ── 3. Net Profit / (Loss) ────────────────────────────────────────────────
            pnl.NetProfit = pnl.TotalRevenue - pnl.TotalExpenses;

            return pnl;
        }

        public async Task<DailyCollectionDto> GetDailyCollectionAsync(Guid tenantId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1).AddTicks(-1);

            // Fetch paid orders for this specific date
            var dailyOrders = await _context.Orders
                .Where(o => o.tenant_id == tenantId
                         && o.payment_status == "Paid"
                         && o.created_at >= startOfDay
                         && o.created_at <= endOfDay)
                .OrderByDescending(o => o.created_at)
                .ToListAsync();

            var totalCollected = dailyOrders.Sum(o => o.total_amount);
            var cashTotal = dailyOrders.Where(o => o.payment_method == "Cash" || string.IsNullOrEmpty(o.payment_method)).Sum(o => o.total_amount);
            var bankTotal = dailyOrders.Where(o => o.payment_method != "Cash" && !string.IsNullOrEmpty(o.payment_method)).Sum(o => o.total_amount);

            var dto = new DailyCollectionDto
            {
                Date = date,
                TotalCollected = totalCollected,
                TotalTransactions = dailyOrders.Count,
                CashCollection = cashTotal,
                BankCollection = bankTotal
            };

            foreach (var order in dailyOrders)
            {
                dto.Transactions.Add(new DailyCollectionTransactionDto
                {
                    ReceiptNumber = $"ORD-{order.order_number}",
                    StudentName = string.IsNullOrEmpty(order.customer_name) ? "Walk-in Guest" : order.customer_name,
                    ClassName = $"{order.order_type ?? "DineIn"} (Table {order.table_number ?? "N/A"})",
                    Amount = order.total_amount,
                    PaymentMode = string.IsNullOrEmpty(order.payment_method) ? "Cash" : order.payment_method,
                    PaymentTime = order.created_at
                });
            }

            return dto;
        }

        public async Task<List<GeneralLedgerTransactionDto>> GetGeneralLedgerAsync(Guid tenantId, DateTime? startDate, DateTime? endDate)
        {
            var result = new List<GeneralLedgerTransactionDto>();

            var coaList = await _context.ChartOfAccounts
                .Where(a => a.tenant_id == tenantId)
                .ToListAsync();

            var bankAcc = coaList.FirstOrDefault(a => a.code == "1102" || a.code == "1002" || a.name.Contains("Bank")) ?? coaList.FirstOrDefault(a => a.type == "Asset");
            var cashAcc = coaList.FirstOrDefault(a => a.code == "1101" || a.code == "1001" || a.name.Contains("Cash")) ?? bankAcc;
            var revenueAcc = coaList.FirstOrDefault(a => a.code == "4101" || a.code == "4001" || a.type == "Revenue");
            var salaryExpenseAcc = coaList.FirstOrDefault(a => a.code == "5101" || a.code == "5001" || a.name.Contains("Salary")) ?? coaList.FirstOrDefault(a => a.type == "Expense");
            var generalExpenseAcc = coaList.FirstOrDefault(a => a.code == "5201" || a.code == "5003" || a.type == "Expense");

            // 1. Paid Orders -> Sales JVs
            var orderQuery = _context.Orders
                .Where(o => o.tenant_id == tenantId && o.payment_status == "Paid");

            if (startDate.HasValue) orderQuery = orderQuery.Where(o => o.created_at >= startDate.Value);
            if (endDate.HasValue) orderQuery = orderQuery.Where(o => o.created_at <= endDate.Value);

            var orders = await orderQuery.OrderByDescending(o => o.created_at).ToListAsync();

            int orderIndex = 1;
            foreach (var ord in orders)
            {
                bool isBank = !string.IsNullOrEmpty(ord.payment_method) && !ord.payment_method.Equals("Cash", StringComparison.OrdinalIgnoreCase);
                var debitAcc = isBank ? (bankAcc ?? cashAcc) : (cashAcc ?? bankAcc);

                result.Add(new GeneralLedgerTransactionDto
                {
                    Id = ord.id.ToString(),
                    VoucherNo = $"JV-{ord.created_at.Year}-SLS-{orderIndex++:D4}",
                    Date = ord.created_at,
                    DebitAccountId = debitAcc?.id,
                    DebitAccountName = debitAcc?.name ?? (isBank ? "POS Card / Bank Account" : "Cash Register Drawer"),
                    DebitAccountType = debitAcc?.type ?? "Asset",
                    CreditAccountId = revenueAcc?.id,
                    CreditAccountName = revenueAcc?.name ?? "Food & Beverage Sales Revenue",
                    CreditAccountType = revenueAcc?.type ?? "Revenue",
                    Narrative = $"Restaurant Sales: Order #{ord.order_number} ({ord.order_type}) - Guest: {ord.customer_name}",
                    Amount = ord.total_amount,
                    Source = "FoodOrder",
                    PostedAt = ord.created_at
                });
            }

            // 2. Restaurant Expenses -> Expense JVs
            var expenseQuery = _context.SchoolExpenses
                .Where(e => e.tenant_id == tenantId);

            if (startDate.HasValue) expenseQuery = expenseQuery.Where(e => e.expense_date >= startDate.Value);
            if (endDate.HasValue) expenseQuery = expenseQuery.Where(e => e.expense_date <= endDate.Value);

            var expenses = await expenseQuery.OrderByDescending(e => e.expense_date).ToListAsync();

            int expIndex = 1;
            foreach (var exp in expenses)
            {
                var matchedExpAcc = (exp.account_id.HasValue ? coaList.FirstOrDefault(a => a.id == exp.account_id.Value) : null)
                    ?? coaList.FirstOrDefault(a => a.type == "Expense" && (a.name.Contains(exp.category ?? "") || a.code == "5201" || a.code == "5003"))
                    ?? generalExpenseAcc;
                bool isBank = !string.IsNullOrEmpty(exp.payment_method) && exp.payment_method.ToLower().Contains("bank");
                var creditAcc = isBank ? (bankAcc ?? cashAcc) : (cashAcc ?? bankAcc);

                result.Add(new GeneralLedgerTransactionDto
                {
                    Id = exp.id.ToString(),
                    VoucherNo = $"JV-{exp.expense_date.Year}-EXP-{expIndex++:D4}",
                    Date = exp.expense_date,
                    DebitAccountId = matchedExpAcc?.id,
                    DebitAccountName = matchedExpAcc?.name ?? (exp.category ?? "Kitchen & Restaurant Expense"),
                    DebitAccountType = matchedExpAcc?.type ?? "Expense",
                    CreditAccountId = creditAcc?.id,
                    CreditAccountName = creditAcc?.name ?? (isBank ? "Bank Account" : "Cash Drawer"),
                    CreditAccountType = creditAcc?.type ?? "Asset",
                    Narrative = $"{exp.category ?? "Expense"}: {exp.title} (Paid to: {exp.paid_to ?? "Vendor"})",
                    Amount = exp.amount,
                    Source = "Expense",
                    PostedAt = exp.created_at
                });
            }

            // 3. Paid Salary Slips -> Salary JVs
            var salaryQuery = _context.SalarySlips
                .Where(s => s.tenant_id == tenantId && s.status == "Paid");

            if (startDate.HasValue) salaryQuery = salaryQuery.Where(s => s.payment_date >= startDate.Value);
            if (endDate.HasValue) salaryQuery = salaryQuery.Where(s => s.payment_date <= endDate.Value);

            var salarySlips = await salaryQuery.OrderByDescending(s => s.payment_date ?? s.created_at).ToListAsync();

            var staffIds = salarySlips.Select(s => s.staff_id).Distinct().ToList();
            var staffDict = await _context.Staff.Where(st => staffIds.Contains(st.id)).ToDictionaryAsync(st => st.id);
            var userIds = staffDict.Values.Select(st => st.user_id).Distinct().ToList();
            var usersDict = await _context.Users.Where(u => userIds.Contains(u.id)).ToDictionaryAsync(u => u.id);

            int salIndex = 1;
            foreach (var sal in salarySlips)
            {
                var staffName = "Staff Member";
                if (staffDict.TryGetValue(sal.staff_id, out var st) && usersDict.TryGetValue(st.user_id, out var usr))
                {
                    staffName = $"{usr.first_name} {usr.last_name}";
                }
                var payDate = sal.payment_date ?? sal.created_at;

                result.Add(new GeneralLedgerTransactionDto
                {
                    Id = sal.id.ToString(),
                    VoucherNo = $"JV-{payDate.Year}-PAY-{salIndex++:D4}",
                    Date = payDate,
                    DebitAccountId = salaryExpenseAcc?.id,
                    DebitAccountName = salaryExpenseAcc?.name ?? "Restaurant Staff Payroll Expense",
                    DebitAccountType = salaryExpenseAcc?.type ?? "Expense",
                    CreditAccountId = bankAcc?.id,
                    CreditAccountName = bankAcc?.name ?? "Bank Account",
                    CreditAccountType = bankAcc?.type ?? "Asset",
                    Narrative = $"Payroll Disbursement: {staffName} - Month: {sal.salary_month}",
                    Amount = sal.net_salary,
                    Source = "Salary",
                    PostedAt = payDate
                });
            }

            return result.OrderByDescending(x => x.Date).ToList();
        }
    }
}
