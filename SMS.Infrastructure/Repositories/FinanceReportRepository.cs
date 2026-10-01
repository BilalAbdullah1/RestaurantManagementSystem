using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Domain.DTOs;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
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

            // Fetch overdue or unpaid challans
            var overdueChallans = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId && fc.status != "Paid" && fc.status != "Cancelled" && fc.due_date < now)
                .ToListAsync();

            var studentIds = overdueChallans.Select(c => c.student_id).Distinct().ToList();

            var students = await _context.Students
                .Where(s => studentIds.Contains(s.id))
                .ToDictionaryAsync(s => s.id);

            var classIds = overdueChallans.Select(c => c.class_id).Distinct().ToList();
            var classes = await _context.Classes
                .Where(c => classIds.Contains(c.id))
                .ToDictionaryAsync(c => c.id);

            var report = new DefaulterReportDto();
            var defaultersDict = new Dictionary<Guid, DefaulterDto>();

            foreach (var challan in overdueChallans)
            {
                if (!defaultersDict.TryGetValue(challan.student_id, out var def))
                {
                    var student = students.GetValueOrDefault(challan.student_id);
                    var className = classes.GetValueOrDefault(challan.class_id)?.name ?? "Unknown";

                    def = new DefaulterDto
                    {
                        StudentId = challan.student_id,
                        StudentName = student != null ? $"{student.first_name} {student.last_name}" : "Unknown",
                        AdmissionNumber = student?.admission_number ?? "N/A",
                        ClassName = className,
                        ParentPhone = student?.guardian_phone ?? "N/A",
                        PendingAmount = 0,
                        OverdueChallansCount = 0
                    };
                    defaultersDict[challan.student_id] = def;
                }

                // Remaining balance = net_payable - paid_amount (for partial payments)
                var remaining = challan.net_payable - challan.paid_amount;
                def.PendingAmount += remaining > 0 ? remaining : challan.net_payable;
                def.OverdueChallansCount++;

                var daysOverdue = (now - challan.due_date).TotalDays;
                string aging = "1-30 Days";
                if (daysOverdue > 90) aging = "90+ Days";
                else if (daysOverdue > 60) aging = "61-90 Days";
                else if (daysOverdue > 30) aging = "31-60 Days";

                // Keep the worst aging category
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

            // ── 1. FEE PAYMENTS ──────────────────────────────────────────────────────
            // Get all challan IDs for this tenant
            var tenantChallanIds = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId)
                .Select(fc => fc.id)
                .ToListAsync();

            // Payments in the date range
            var payments = await _context.FeePayments
                .Where(p => tenantChallanIds.Contains(p.challan_id)
                         && p.payment_date >= startDate
                         && p.payment_date <= endDate)
                .ToListAsync();

            var paymentChallanIds = payments.Select(p => p.challan_id).Distinct().ToList();

            // Load challan details for fee-category breakdown
            var challanDetails = await _context.FeeChallanDetails
                .Where(d => paymentChallanIds.Contains(d.challan_id))
                .ToListAsync();

            // Load challans (for late_fine + student info)
            var challans = await _context.FeeChallans
                .Where(fc => paymentChallanIds.Contains(fc.id))
                .ToDictionaryAsync(fc => fc.id);

            // Load students for descriptions
            var studentIds = challans.Values.Select(c => c.student_id).Distinct().ToList();
            var students = await _context.Students
                .Where(s => studentIds.Contains(s.id))
                .ToDictionaryAsync(s => s.id);

            // Load classes
            var classIds = challans.Values.Select(c => c.class_id).Distinct().ToList();
            var classes = await _context.Classes
                .Where(c => classIds.Contains(c.id))
                .ToDictionaryAsync(c => c.id);

            // ── Revenue: Fee payments broken down by fee category name ──────────────
            // We allocate each payment proportionally across fee_challan_details
            // so we get proper "Tuition Fee", "Transport Fee", "Lab Fee" breakdown
            var feeRevenueByCat = new Dictionary<string, decimal>(StringComparer.OrdinalIgnoreCase);

            foreach (var payment in payments)
            {
                if (!challans.TryGetValue(payment.challan_id, out var challan)) continue;
                var details = challanDetails.Where(d => d.challan_id == payment.challan_id).ToList();
                var challanNet = challan.net_payable > 0 ? challan.net_payable : 1;

                if (details.Any())
                {
                    foreach (var det in details)
                    {
                        var catName = string.IsNullOrWhiteSpace(det.fee_name) ? "Tuition Fee" : det.fee_name;
                        var proportion = det.net_amount / challanNet;
                        var allocated = payment.amount * proportion;
                        feeRevenueByCat[catName] = feeRevenueByCat.GetValueOrDefault(catName, 0) + allocated;
                    }
                }
                else
                {
                    // No detail rows — lump under Tuition Fee
                    feeRevenueByCat["Tuition Fee"] = feeRevenueByCat.GetValueOrDefault("Tuition Fee", 0) + payment.amount;
                }

                // Line item for each payment
                students.TryGetValue(challan.student_id, out var stu);
                classes.TryGetValue(challan.class_id, out var cls);
                var stuName = stu != null ? $"{stu.first_name} {stu.last_name}" : "Student";
                pnl.RevenueItems.Add(new PnlLineItemDto
                {
                    Date       = payment.payment_date.ToString("dd MMM yyyy"),
                    Description = $"Fee Collection — {stuName} ({cls?.name ?? "N/A"})",
                    Category   = "Fee Payment",
                    Reference  = $"REC-{challan.challan_number}",
                    Amount     = payment.amount,
                    Source     = "FeePayment"
                });
            }

            decimal totalFeeRevenue = feeRevenueByCat.Values.Sum();

            // ── Revenue: Late Fines (from paid challans in period) ─────────────────
            var paidChallansInPeriod = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId
                          && fc.status == "Paid"
                          && fc.late_fine > 0)
                .ToListAsync();

            // Filter: only challans that had a payment in this period
            var paidWithFine = paidChallansInPeriod
                .Where(fc => paymentChallanIds.Contains(fc.id) && fc.late_fine > 0)
                .ToList();

            decimal totalLateFine = paidWithFine.Sum(fc => fc.late_fine);

            foreach (var fc in paidWithFine)
            {
                students.TryGetValue(fc.student_id, out var stu);
                classes.TryGetValue(fc.class_id, out var cls);
                var stuName = stu != null ? $"{stu.first_name} {stu.last_name}" : "Student";
                pnl.RevenueItems.Add(new PnlLineItemDto
                {
                    Date        = fc.created_at.ToString("dd MMM yyyy"),
                    Description = $"Late Fine — {stuName} ({cls?.name ?? "N/A"})",
                    Category    = "Late Fine",
                    Reference   = $"FINE-{fc.challan_number}",
                    Amount      = fc.late_fine,
                    Source      = "LateFine"
                });
            }

            pnl.TotalRevenue       = totalFeeRevenue + totalLateFine;
            pnl.TotalPaymentsCount = payments.Count;

            // Revenue Breakdown (categories for bar chart)
            foreach (var kv in feeRevenueByCat.OrderByDescending(k => k.Value))
            {
                pnl.RevenueBreakdown.Add(new FinanceCategorySummaryDto
                {
                    Category   = kv.Key,
                    Amount     = Math.Round(kv.Value, 2),
                    Percentage = pnl.TotalRevenue > 0
                                    ? Math.Round((kv.Value / pnl.TotalRevenue) * 100, 1)
                                    : 0,
                    Count      = payments.Count(p => paymentChallanIds.Contains(p.challan_id))
                });
            }

            if (totalLateFine > 0)
            {
                pnl.RevenueBreakdown.Add(new FinanceCategorySummaryDto
                {
                    Category   = "Late Fines",
                    Amount     = Math.Round(totalLateFine, 2),
                    Percentage = pnl.TotalRevenue > 0
                                    ? Math.Round((totalLateFine / pnl.TotalRevenue) * 100, 1)
                                    : 0,
                    Count      = paidWithFine.Count
                });
            }

            if (!pnl.RevenueBreakdown.Any())
            {
                pnl.RevenueBreakdown.Add(new FinanceCategorySummaryDto
                {
                    Category = "No Income Recorded", Amount = 0, Percentage = 0
                });
            }

            // ── 2. EXPENSES ───────────────────────────────────────────────────────────
            var expenses = await _context.SchoolExpenses
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
            var salStaff    = await _context.Staff
                .Where(st => salStaffIds.Contains(st.id))
                .ToDictionaryAsync(st => st.id);
            var salUserIds  = salStaff.Values.Select(st => st.user_id).Distinct().ToList();
            var salUsers    = await _context.Users
                .Where(u => salUserIds.Contains(u.id))
                .ToDictionaryAsync(u => u.id);

            decimal totalSchoolExpense = expenses.Sum(e => e.amount);
            decimal totalSalaryExpense = salaries.Sum(s => s.net_salary);
            pnl.TotalExpenses    = totalSchoolExpense + totalSalaryExpense;
            pnl.TotalExpenseCount = expenses.Count + salaries.Count;

            // Expense line items — school expenses
            foreach (var exp in expenses)
            {
                pnl.ExpenseItems.Add(new PnlLineItemDto
                {
                    Date        = exp.expense_date.ToString("dd MMM yyyy"),
                    Description = exp.title,
                    Category    = string.IsNullOrWhiteSpace(exp.category) ? "Miscellaneous" : exp.category,
                    Reference   = exp.receipt_no ?? "—",
                    Amount      = exp.amount,
                    Source      = "Expense"
                });
            }

            // Expense line items — salaries
            foreach (var sal in salaries)
            {
                salStaff.TryGetValue(sal.staff_id, out var st);
                var staffName = "Staff Member";
                if (st != null && salUsers.TryGetValue(st.user_id, out var usr))
                    staffName = $"{usr.first_name} {usr.last_name}";

                pnl.ExpenseItems.Add(new PnlLineItemDto
                {
                    Date        = (sal.payment_date ?? sal.created_at).ToString("dd MMM yyyy"),
                    Description = $"Salary — {staffName} ({sal.salary_month})",
                    Category    = "Staff Salaries",
                    Reference   = $"SAL-{sal.id.ToString()[..8].ToUpper()}",
                    Amount      = sal.net_salary,
                    Source      = "Salary"
                });
            }

            // Expense Breakdown (categories for bar chart) — ALL expenses collected first, THEN compute %
            var expByCat = expenses
                .GroupBy(e => string.IsNullOrWhiteSpace(e.category) ? "Miscellaneous" : e.category)
                .Select(g => new FinanceCategorySummaryDto
                {
                    Category   = g.Key,
                    Amount     = g.Sum(e => e.amount),
                    Count      = g.Count(),
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
                    Category   = "Staff Salaries",
                    Amount     = totalSalaryExpense,
                    Count      = salaries.Count,
                    Percentage = pnl.TotalExpenses > 0
                                    ? Math.Round((totalSalaryExpense / pnl.TotalExpenses) * 100, 1)
                                    : 0
                });
            }

            if (!expByCat.Any())
            {
                expByCat.Add(new FinanceCategorySummaryDto
                {
                    Category = "No Expenses Recorded", Amount = 0, Percentage = 0
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

            // FIX: Use FeePayments table with actual payment_date for daily collection
            // First get all challan IDs belonging to this tenant
            var tenantChallanIds = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId)
                .Select(fc => fc.id)
                .ToListAsync();

            // Then get payments made on this specific date
            var dailyPayments = await _context.FeePayments
                .Where(p => tenantChallanIds.Contains(p.challan_id)
                         && p.payment_date >= startOfDay
                         && p.payment_date <= endOfDay)
                .ToListAsync();

            var challanIds = dailyPayments.Select(p => p.challan_id).Distinct().ToList();

            // Load challans for student/class info
            var challans = await _context.FeeChallans
                .Where(fc => challanIds.Contains(fc.id))
                .ToDictionaryAsync(fc => fc.id);

            var studentIds = challans.Values.Select(c => c.student_id).Distinct().ToList();
            var students = await _context.Students
                .Where(s => studentIds.Contains(s.id))
                .ToDictionaryAsync(s => s.id);

            var classIds = challans.Values.Select(c => c.class_id).Distinct().ToList();
            var classes = await _context.Classes
                .Where(c => classIds.Contains(c.id))
                .ToDictionaryAsync(c => c.id);

            var totalCollected = dailyPayments.Sum(p => p.amount);

            // FIX: Real cash/bank breakdown from actual payment_method field
            var cashTotal = dailyPayments.Where(p => p.payment_method == "Cash" || string.IsNullOrEmpty(p.payment_method)).Sum(p => p.amount);
            var bankTotal = dailyPayments.Where(p => p.payment_method != "Cash" && !string.IsNullOrEmpty(p.payment_method)).Sum(p => p.amount);

            var dto = new DailyCollectionDto
            {
                Date = date,
                TotalCollected = totalCollected,
                TotalTransactions = dailyPayments.Count,
                CashCollection = cashTotal,
                BankCollection = bankTotal
            };

            foreach (var payment in dailyPayments.OrderByDescending(p => p.payment_date))
            {
                var challan = challans.GetValueOrDefault(payment.challan_id);
                if (challan == null) continue;

                var student = students.GetValueOrDefault(challan.student_id);
                var className = classes.GetValueOrDefault(challan.class_id)?.name ?? "Unknown";

                dto.Transactions.Add(new DailyCollectionTransactionDto
                {
                    ReceiptNumber = $"REC-{challan.challan_number}",
                    StudentName = student != null ? $"{student.first_name} {student.last_name}" : "Unknown",
                    ClassName = className,
                    Amount = payment.amount,
                    PaymentMode = string.IsNullOrEmpty(payment.payment_method) ? "Cash" : payment.payment_method,
                    PaymentTime = payment.payment_date
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

            // 1. Fee Payments -> Fee Collection JVs
            var feeChallans = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId)
                .ToDictionaryAsync(fc => fc.id);

            var feeChallanIds = feeChallans.Keys.ToList();

            var feePaymentsQuery = _context.FeePayments
                .Where(p => feeChallanIds.Contains(p.challan_id));

            if (startDate.HasValue) feePaymentsQuery = feePaymentsQuery.Where(p => p.payment_date >= startDate.Value);
            if (endDate.HasValue) feePaymentsQuery = feePaymentsQuery.Where(p => p.payment_date <= endDate.Value);

            var feePayments = await feePaymentsQuery.OrderByDescending(p => p.payment_date).ToListAsync();

            var studentIds = feeChallans.Values.Select(c => c.student_id).Distinct().ToList();
            var students = await _context.Students.Where(s => studentIds.Contains(s.id)).ToDictionaryAsync(s => s.id);
            var classIds = feeChallans.Values.Select(c => c.class_id).Distinct().ToList();
            var classes = await _context.Classes.Where(c => classIds.Contains(c.id)).ToDictionaryAsync(c => c.id);

            int feeIndex = 1;
            foreach (var fp in feePayments)
            {
                feeChallans.TryGetValue(fp.challan_id, out var challan);
                var studentName = "Student";
                var className = "";
                if (challan != null)
                {
                    if (students.TryGetValue(challan.student_id, out var st)) studentName = $"{st.first_name} {st.last_name}";
                    if (classes.TryGetValue(challan.class_id, out var cl)) className = cl.name;
                }

                bool isBank = !string.IsNullOrEmpty(fp.payment_method) && fp.payment_method.ToLower().Contains("bank");
                var debitAcc = isBank ? (bankAcc ?? cashAcc) : (cashAcc ?? bankAcc);

                result.Add(new GeneralLedgerTransactionDto
                {
                    Id = fp.id.ToString(),
                    VoucherNo = $"JV-{fp.payment_date.Year}-FEE-{feeIndex++:D4}",
                    Date = fp.payment_date,
                    DebitAccountId = debitAcc?.id,
                    DebitAccountName = debitAcc?.name ?? (isBank ? "Bank Account" : "Cash Vault"),
                    DebitAccountType = debitAcc?.type ?? "Asset",
                    CreditAccountId = revenueAcc?.id,
                    CreditAccountName = revenueAcc?.name ?? "Tuition Fee Revenue",
                    CreditAccountType = revenueAcc?.type ?? "Revenue",
                    Narrative = $"Fee Collection: {studentName} ({className}) - Rec #{challan?.challan_number ?? "N/A"}",
                    Amount = fp.amount,
                    Source = "Fee Collection",
                    PostedAt = fp.payment_date
                });
            }

            // 2. School Expenses -> Expense JVs
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
                    DebitAccountName = matchedExpAcc?.name ?? (exp.category ?? "School Expense"),
                    DebitAccountType = matchedExpAcc?.type ?? "Expense",
                    CreditAccountId = creditAcc?.id,
                    CreditAccountName = creditAcc?.name ?? (isBank ? "Bank Account" : "Cash Vault"),
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
                    DebitAccountName = salaryExpenseAcc?.name ?? "Staff Payroll Expense",
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

