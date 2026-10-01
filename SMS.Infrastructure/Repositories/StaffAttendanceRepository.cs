using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class StaffAttendanceRepository : IStaffAttendanceRepository
    {
        private readonly ApplicationDbContext _context;

        public StaffAttendanceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. DAILY ATTENDANCE GRID - Get all active staff with their today's attendance status
        public async Task<IEnumerable<object>> GetDailyAttendanceAsync(Guid tenantId, DateTime date)
        {
            return await _context.Staff
                .Where(s => s.tenant_id == tenantId && s.is_active == true)
                .Join(_context.Users,
                      s => s.user_id,
                      u => u.id,
                      (s, u) => new { s, u })
                .Select(x => new
                {
                    staff_id = x.s.id,
                    staff_name = x.u.first_name + " " + x.u.last_name,
                    designation = x.s.designation,
                    cnic = x.s.cnic,
                    // Check if attendance already marked for this date
                    attendance_status = _context.StaffAttendances
                        .Where(sa => sa.staff_id == x.s.id && sa.date.Date == date.Date)
                        .Select(sa => sa.status)
                        .FirstOrDefault() ?? "Present",
                    check_in = _context.StaffAttendances
                        .Where(sa => sa.staff_id == x.s.id && sa.date.Date == date.Date)
                        .Select(sa => sa.check_in)
                        .FirstOrDefault(),
                    check_out = _context.StaffAttendances
                        .Where(sa => sa.staff_id == x.s.id && sa.date.Date == date.Date)
                        .Select(sa => sa.check_out)
                        .FirstOrDefault()
                })
                .OrderBy(x => x.staff_name)
                .ToListAsync();
        }

        // 2. BULK UPSERT LOGIC - Overwrite if exists, Insert if new
        public async Task SaveBulkAttendanceAsync(Guid tenantId, DateTime date, List<StaffAttendanceRecordDto> records)
        {
            var staffIds = records.Select(r => r.staff_id).ToList();

            var existingAttendance = await _context.StaffAttendances
                .Where(a => a.date.Date == date.Date && staffIds.Contains(a.staff_id))
                .ToListAsync();

            foreach (var record in records)
            {
                var existing = existingAttendance.FirstOrDefault(a => a.staff_id == record.staff_id);

                if (existing != null)
                {
                    existing.status = record.status;
                    existing.check_in = record.check_in;
                    existing.check_out = record.check_out;
                    _context.StaffAttendances.Update(existing);
                }
                else
                {
                    var newAttendance = new StaffAttendance
                    {
                        id = Guid.NewGuid(),
                        tenant_id = tenantId,
                        staff_id = record.staff_id,
                        date = date.Date,
                        status = record.status,
                        check_in = record.check_in,
                        check_out = record.check_out
                    };
                    await _context.StaffAttendances.AddAsync(newAttendance);
                }
            }
        }

        // 3. MONTHLY TIMELINE - Single staff member's log
        public async Task<IEnumerable<StaffAttendance>> GetMonthlyAttendanceAsync(Guid staffId, int month, int year)
        {
            return await _context.StaffAttendances
                .Where(a => a.staff_id == staffId && a.date.Month == month && a.date.Year == year)
                .OrderBy(a => a.date)
                .ToListAsync();
        }

        // 4. ANALYTICS REPORT - For Payroll & HR
        public async Task<IEnumerable<StaffAttendanceReportResponseDto>> GetAttendanceReportAsync(Guid tenantId, DateTime startDate, DateTime endDate)
        {
            var staffMembers = await _context.Staff
                .Where(s => s.tenant_id == tenantId && s.is_active == true)
                .Join(_context.Users, s => s.user_id, u => u.id, (s, u) => new { s, u })
                .ToListAsync();

            var staffIds = staffMembers.Select(x => x.s.id).ToList();

            var attendanceData = await _context.StaffAttendances
                .Where(a => staffIds.Contains(a.staff_id) && a.date.Date >= startDate.Date && a.date.Date <= endDate.Date)
                .ToListAsync();

            var reportList = new List<StaffAttendanceReportResponseDto>();

            foreach (var target in staffMembers)
            {
                var targetAttendance = attendanceData.Where(a => a.staff_id == target.s.id).ToList();
                int totalDays = targetAttendance.Count;
                int presents = targetAttendance.Count(a => a.status == "Present");
                int absents = targetAttendance.Count(a => a.status == "Absent");
                int leaves = targetAttendance.Count(a => a.status == "Leave");
                int lates = targetAttendance.Count(a => a.status == "Late");

                decimal percentage = totalDays > 0 ? ((decimal)(presents + lates) / totalDays) * 100 : 0;

                reportList.Add(new StaffAttendanceReportResponseDto
                {
                    staff_id = target.s.id,
                    staff_name = $"{target.u.first_name} {target.u.last_name}",
                    designation = target.s.designation,
                    cnic = target.s.cnic,
                    total_days = totalDays,
                    presents = presents,
                    absents = absents,
                    leaves = leaves,
                    lates = lates,
                    attendance_percentage = Math.Round(percentage, 2)
                });
            }

            return reportList.OrderBy(r => r.staff_name);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<StaffWeeklyAttendanceDto>> GetWeeklyMatrixAsync(Guid tenantId, DateTime startDate, DateTime endDate)
        {
            var staffList = await _context.Staff
                .Where(s => s.tenant_id == tenantId && s.is_active == true)
                .Join(_context.Users, s => s.user_id, u => u.id, (s, u) => new { s, u })
                .OrderBy(x => x.u.first_name)
                .ToListAsync();

            var staffIds = staffList.Select(x => x.s.id).ToList();

            var attendanceRecords = await _context.StaffAttendances
                .Where(a => staffIds.Contains(a.staff_id) && a.date.Date >= startDate.Date && a.date.Date <= endDate.Date)
                .ToListAsync();

            var result = new List<StaffWeeklyAttendanceDto>();

            foreach (var staff in staffList)
            {
                var staffRecords = attendanceRecords.Where(a => a.staff_id == staff.s.id).ToList();
                var recordsDict = new Dictionary<string, StaffAttendanceDetailDto>();

                foreach (var att in staffRecords)
                {
                    recordsDict[att.date.ToString("yyyy-MM-dd")] = new StaffAttendanceDetailDto
                    {
                        status = att.status,
                        check_in = att.check_in
                    };
                }

                int totalDays = staffRecords.Count;
                int presents = staffRecords.Count(a => a.status == "Present" || a.status == "Late" || a.status == "Half-Day");
                decimal percentage = totalDays > 0 ? Math.Round(((decimal)presents / totalDays) * 100, 2) : 0;

                result.Add(new StaffWeeklyAttendanceDto
                {
                    staff_id = staff.s.id,
                    staff_name = $"{staff.u.first_name} {staff.u.last_name}",
                    designation = staff.s.designation,
                    overall_percentage = percentage,
                    records = recordsDict
                });
            }
            return result;
        }

        public async Task SaveBiometricSyncAsync(Guid tenantId, DateTime date)
        {
            // Active staff nikalna
            var activeStaff = await _context.Staff
                .Where(s => s.tenant_id == tenantId && s.is_active == true)
                .ToListAsync();

            var staffIds = activeStaff.Select(s => s.id).ToList();

            var existingAttendance = await _context.StaffAttendances
                .Where(a => a.date.Date == date.Date && staffIds.Contains(a.staff_id))
                .ToListAsync();

            foreach (var staff in activeStaff)
            {
                var existing = existingAttendance.FirstOrDefault(a => a.staff_id == staff.id);

                var randomMinutes = new Random().Next(0, 30);
                var checkInTime = date.Date.AddHours(8).AddMinutes(-randomMinutes); // Around 8 AM
                var checkOutTime = date.Date.AddHours(15).AddMinutes(randomMinutes); // Around 3 PM

                if (existing != null)
                {
                    // Agar pehle se mark hai, toh sirf time update karein
                    existing.status = "Present";
                    existing.check_in = checkInTime;
                    existing.check_out = checkOutTime;
                    _context.StaffAttendances.Update(existing);
                }
                else
                {
                    var newRecord = new StaffAttendance
                    {
                        id = Guid.NewGuid(),
                        tenant_id = tenantId,
                        staff_id = staff.id,
                        date = date.Date,
                        status = "Present",
                        check_in = checkInTime,
                        check_out = checkOutTime
                    };
                    await _context.StaffAttendances.AddAsync(newRecord);
                }
            }
        }
        public async Task<IEnumerable<PayrollAttendanceSummaryDto>> CalculateMonthlyPayrollAttendanceAsync(
    Guid tenantId,
    int month,
    int year,
    int latesPerAbsent = 3,
    int halfDaysPerAbsent = 2,
    int allowedLeavesPerMonth = 2)
        {
            // 1. Fetch active staff and their basic salary
            var staffList = await _context.Staff
                .Where(s => s.tenant_id == tenantId && s.is_active == true)
                .Join(_context.Users, s => s.user_id, u => u.id, (s, u) => new { s, u })
                .OrderBy(x => x.u.first_name)
                .ToListAsync();

            var staffIds = staffList.Select(x => x.s.id).ToList();

            // 2. Fetch the entire month's attendance
            var attendanceRecords = await _context.StaffAttendances
                .Where(a => staffIds.Contains(a.staff_id) && a.date.Month == month && a.date.Year == year)
                .ToListAsync();

            var payrollSummary = new List<PayrollAttendanceSummaryDto>();
            int daysInMonth = DateTime.DaysInMonth(year, month);

            // 3. Process rules for each staff member
            foreach (var staff in staffList)
            {
                var records = attendanceRecords.Where(a => a.staff_id == staff.s.id).ToList();

                int presents = records.Count(a => a.status == "Present");
                int lates = records.Count(a => a.status == "Late");
                int halfDays = records.Count(a => a.status == "Half-Day");
                int leaves = records.Count(a => a.status == "Leave");
                int absents = records.Count(a => a.status == "Absent");

                // Rule Engine Calculations
                int penaltyFromLates = lates / latesPerAbsent;
                int penaltyFromHalfDays = halfDays / halfDaysPerAbsent;
                int totalPenaltyAbsents = penaltyFromLates + penaltyFromHalfDays;

                int lwp = leaves > allowedLeavesPerMonth ? (leaves - allowedLeavesPerMonth) : 0;

                int totalDeductibleDays = absents + totalPenaltyAbsents + lwp;

                // Financial Calculation based on per-day salary
                decimal perDaySalary = staff.s.basic_salary / daysInMonth;
                decimal deductionAmount = totalDeductibleDays * perDaySalary;
                decimal netPayable = staff.s.basic_salary - deductionAmount;

                payrollSummary.Add(new PayrollAttendanceSummaryDto
                {
                    staff_id = staff.s.id,
                    staff_name = $"{staff.u.first_name} {staff.u.last_name}",
                    designation = staff.s.designation,
                    basic_salary = staff.s.basic_salary,

                    total_presents = presents,
                    total_lates = lates,
                    total_half_days = halfDays,
                    total_leaves = leaves,
                    actual_absents = absents,

                    penalty_absents = totalPenaltyAbsents,
                    lwp_days = lwp,
                    total_deductible_days = totalDeductibleDays,

                    deduction_amount = Math.Round(deductionAmount, 2),
                    net_payable_salary = Math.Round(netPayable, 2)
                });
            }

            return payrollSummary;
        }
    }
}