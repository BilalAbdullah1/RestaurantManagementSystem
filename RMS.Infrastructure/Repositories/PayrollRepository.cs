using Microsoft.EntityFrameworkCore;
using RMS.Application.DTOs;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class SalarySlipRepository : ISalarySlipRepository
    {
        private readonly ApplicationDbContext _context;

        public SalarySlipRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> GenerateBulkSlipsAsync(GenerateBulkSalarySlipsDto dto)
        {
            // 1. Fetch active staff
            var staffList = await _context.Staff
                .Where(s => s.tenant_id == dto.tenant_id && s.is_active == true)
                .ToListAsync();

            if (!staffList.Any()) return 0;
            var staffIds = staffList.Select(s => s.id).ToList();

            // 2. Fetch the entire month's attendance for deductions
            var attendanceRecords = await _context.StaffAttendances
                .Where(a => staffIds.Contains(a.staff_id) && a.date.Month == dto.month && a.date.Year == dto.year)
                .ToListAsync();

            // 3. Find already generated slips to avoid duplicates
            var existingSlips = await _context.SalarySlips
                .Where(s => s.tenant_id == dto.tenant_id && s.salary_month == dto.salary_month)
                .Select(s => s.staff_id)
                .ToListAsync();

            // 4. Fetch Active Staff Loans for deduction
            var activeLoans = await _context.StaffLoans
                .Where(l => l.tenant_id == dto.tenant_id && l.status == "Approved" && l.remaining_balance > 0)
                .ToListAsync();

            var newSlips = new List<SalarySlip>();
            int daysInMonth = DateTime.DaysInMonth(dto.year, dto.month);

            // 5. Calculate for each staff member
            foreach (var staff in staffList)
            {
                if (existingSlips.Contains(staff.id)) continue; // Skip if already generated

                var records = attendanceRecords.Where(a => a.staff_id == staff.id).ToList();
                int lates = records.Count(a => a.status == "Late");
                int halfDays = records.Count(a => a.status == "Half-Day");
                int leaves = records.Count(a => a.status == "Leave");
                int absents = records.Count(a => a.status == "Absent");

                // Rule Engine Calculations
                int penaltyFromLates = lates / dto.lates_per_absent;
                int penaltyFromHalfDays = halfDays / dto.half_days_per_absent;
                int lwp = leaves > dto.allowed_leaves ? (leaves - dto.allowed_leaves) : 0;
                
                int totalDeductibleDays = absents + penaltyFromLates + penaltyFromHalfDays + lwp;

                // 1. Allowances (15% House Rent, 10% Medical)
                decimal houseRentAllowance = Math.Round(staff.basic_salary * 0.15m, 2);
                decimal medicalAllowance = Math.Round(staff.basic_salary * 0.10m, 2);
                decimal totalAllowances = houseRentAllowance + medicalAllowance;

                // 2. Attendance Absences Deduction
                decimal perDaySalary = staff.basic_salary / daysInMonth;
                decimal attendanceDeduction = Math.Round(totalDeductibleDays * perDaySalary, 2);

                // 3. Provident Fund Deduction (5% of basic salary)
                decimal pfDeduction = Math.Round(staff.basic_salary * 0.05m, 2);

                // 4. Advance Loan Installment Deduction
                decimal loanDeduction = 0;
                var activeLoan = activeLoans.FirstOrDefault(l => l.staff_id == staff.id);
                if (activeLoan != null)
                {
                    loanDeduction = activeLoan.monthly_installment > activeLoan.remaining_balance
                        ? activeLoan.remaining_balance
                        : activeLoan.monthly_installment;

                    activeLoan.remaining_balance -= loanDeduction;
                    if (activeLoan.remaining_balance <= 0)
                    {
                        activeLoan.status = "Repaid";
                    }
                    _context.StaffLoans.Update(activeLoan);
                }

                // 5. Income Tax Calculation
                decimal taxDeduction = CalculateMonthlyIncomeTax(staff.basic_salary, totalAllowances);

                // Financial Calculation Summary
                decimal totalDeductions = attendanceDeduction + pfDeduction + loanDeduction + taxDeduction;
                decimal netSalary = staff.basic_salary + totalAllowances - totalDeductions;
                if (netSalary < 0) netSalary = 0;

                newSlips.Add(new SalarySlip
                {
                    id = Guid.NewGuid(),
                    tenant_id = dto.tenant_id,
                    staff_id = staff.id,
                    salary_month = dto.salary_month,
                    basic_salary = staff.basic_salary,
                    house_rent_allowance = houseRentAllowance,
                    medical_allowance = medicalAllowance,
                    allowance_amount = totalAllowances,
                    deduction_amount = totalDeductions,
                    provident_fund_deduction = pfDeduction,
                    loan_deduction = loanDeduction,
                    income_tax_deduction = taxDeduction,
                    net_salary = netSalary,
                    status = "Unpaid",
                    created_at = DateTime.UtcNow
                });
            }

            if (newSlips.Any())
            {
                await _context.SalarySlips.AddRangeAsync(newSlips);
                await _context.SaveChangesAsync();
            }

            return newSlips.Count;
        }

        private static decimal CalculateMonthlyIncomeTax(decimal basicSalary, decimal totalAllowances)
        {
            decimal annualGross = (basicSalary + totalAllowances) * 12m;
            decimal annualTax = 0;

            if (annualGross <= 600000m)
            {
                annualTax = 0m;
            }
            else if (annualGross <= 1200000m)
            {
                annualTax = (annualGross - 600000m) * 0.025m;
            }
            else if (annualGross <= 2400000m)
            {
                annualTax = 15000m + (annualGross - 1200000m) * 0.125m;
            }
            else
            {
                annualTax = 165000m + (annualGross - 2400000m) * 0.225m;
            }

            return Math.Round(annualTax / 12m, 2);
        }

        public async Task<IEnumerable<SalarySlipResponseDto>> GetSlipsAsync(Guid tenantId, string salaryMonth)
        {
            var query = _context.SalarySlips.Where(s => s.tenant_id == tenantId);

            if (!string.IsNullOrEmpty(salaryMonth))
            {
                query = query.Where(s => s.salary_month == salaryMonth);
            }

            return await query
                .Join(_context.Staff, ss => ss.staff_id, st => st.id, (ss, st) => new { ss, st })
                .Join(_context.Users, temp => temp.st.user_id, u => u.id, (temp, u) => new SalarySlipResponseDto
                {
                    id = temp.ss.id,
                    staff_id = temp.ss.staff_id,
                    staff_name = u.first_name + " " + u.last_name,
                    designation = temp.st.designation,
                    salary_month = temp.ss.salary_month,
                    basic_salary = temp.ss.basic_salary,
                    house_rent_allowance = temp.ss.house_rent_allowance,
                    medical_allowance = temp.ss.medical_allowance,
                    allowance_amount = temp.ss.allowance_amount,
                    deduction_amount = temp.ss.deduction_amount,
                    provident_fund_deduction = temp.ss.provident_fund_deduction,
                    loan_deduction = temp.ss.loan_deduction,
                    income_tax_deduction = temp.ss.income_tax_deduction,
                    net_salary = temp.ss.net_salary,
                    status = temp.ss.status,
                    payment_date = temp.ss.payment_date
                })
                .OrderBy(x => x.staff_name)
                .ToListAsync();
        }

        public async Task<bool> MarkAsPaidAsync(Guid id)
        {
            var slip = await _context.SalarySlips.FindAsync(id);
            if (slip == null || slip.status == "Paid") return false;

            slip.status = "Paid";
            slip.payment_date = DateTime.UtcNow;
            _context.SalarySlips.Update(slip);

            // Link to General Ledger (Chart of Accounts Live Payroll Posting)
            try
            {
                var salaryExpenseHead = await _context.ChartOfAccounts.FirstOrDefaultAsync(a => a.tenant_id == slip.tenant_id && (a.code == "5001" || a.code == "5002" || a.type == "Expense"));
                if (salaryExpenseHead != null)
                {
                    salaryExpenseHead.balance += slip.net_salary;
                    _context.ChartOfAccounts.Update(salaryExpenseHead);
                }

                var bankAssetHead = await _context.ChartOfAccounts.FirstOrDefaultAsync(a => a.tenant_id == slip.tenant_id && (a.code == "1002" || a.code == "1001"));
                if (bankAssetHead != null)
                {
                    bankAssetHead.balance -= slip.net_salary;
                    _context.ChartOfAccounts.Update(bankAssetHead);
                }
            }
            catch { /* Silent fallback if GL fails */ }

            return await _context.SaveChangesAsync() > 0;
        }
    }
}