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
            var currentMonth = now.Month;
            var currentYear = now.Year;

            var dto = new DashboardStatsDto();

            // ── 1. TOTAL STUDENTS ─────────────────────────────────────────────────
            dto.TotalStudents = await _context.Students
                .Where(s => s.tenant_id == tenantId && s.is_active)
                .CountAsync();

            dto.StudentGenderRatio = await _context.Students
                .Where(s => s.tenant_id == tenantId && s.is_active)
                .GroupBy(s => s.gender)
                .Select(g => new GenderRatioDto
                {
                    Gender = string.IsNullOrEmpty(g.Key) ? "Other" : g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            // ── 2. TOTAL ACTIVE STAFF ─────────────────────────────────────────────
            dto.TotalActiveStaff = await _context.Staff
                .Where(s => s.tenant_id == tenantId && s.is_active)
                .CountAsync();

            // ── 3. TOTAL CLASSES ──────────────────────────────────────────────────
            dto.TotalClasses = await _context.Classes
                .Where(c => c.tenant_id == tenantId)
                .CountAsync();

            // ── 4. TOTAL TRANSPORT ROUTES ─────────────────────────────────────────
            dto.TotalTransportRoutes = await _context.TransportRoutes
                .Where(r => r.tenant_id == tenantId)
                .CountAsync();

            // ── 5. TOTAL HOSTEL ROOMS ─────────────────────────────────────────────
            dto.TotalHostelRooms = await _context.HostelRooms
                .Where(hr => hr.tenant_id == tenantId)
                .CountAsync();

            // ── 6. EXAMS THIS MONTH ───────────────────────────────────────────────
            dto.ExamsThisMonth = await _context.ExamSchedules
                .Where(e => e.tenant_id == tenantId && e.exam_date.Month == currentMonth && e.exam_date.Year == currentYear)
                .Select(e => e.exam_setup_id)
                .Distinct()
                .CountAsync();

            // ── 7. TODAY'S STUDENT ATTENDANCE ─────────────────────────────────────
            var studentAttToday = await _context.StudentAttendances
                .Where(a => a.tenant_id == tenantId && a.date.Date == today)
                .GroupBy(a => a.status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            dto.StudentsPresentToday = studentAttToday.FirstOrDefault(x => x.Status == "Present")?.Count ?? 0;
            dto.StudentsLateToday    = studentAttToday.FirstOrDefault(x => x.Status == "Late")?.Count ?? 0;
            dto.StudentsAbsentToday  = studentAttToday.FirstOrDefault(x => x.Status == "Absent")?.Count ?? 0;

            int totalMarkedStudents = dto.StudentsPresentToday + dto.StudentsLateToday + dto.StudentsAbsentToday;
            dto.StudentAttendancePctToday = totalMarkedStudents > 0
                ? Math.Round((decimal)(dto.StudentsPresentToday + dto.StudentsLateToday) / totalMarkedStudents * 100, 1)
                : 0;

            // ── 8. TODAY'S STAFF ATTENDANCE ───────────────────────────────────────
            var staffAttToday = await _context.StaffAttendances
                .Where(a => a.tenant_id == tenantId && a.date.Date == today)
                .GroupBy(a => a.status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            dto.StaffPresentToday = staffAttToday.FirstOrDefault(x => x.Status == "Present")?.Count ?? 0;
            dto.StaffAbsentToday  = staffAttToday.FirstOrDefault(x => x.Status == "Absent")?.Count ?? 0;

            int totalMarkedStaff = dto.StaffPresentToday + dto.StaffAbsentToday;
            dto.StaffAttendancePctToday = totalMarkedStaff > 0
                ? Math.Round((decimal)dto.StaffPresentToday / totalMarkedStaff * 100, 1)
                : 0;

            // ── 9. FEE COLLECTION — CURRENT & RECENT MONTH ────────────────────────
            var currentMonthName = now.ToString("MMMM yyyy"); // "August 2026"
            var currentMonthCode = now.ToString("yyyy-MM");  // "2026-08"

            var monthChallans = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId && (fc.billing_month == currentMonthName || fc.billing_month == currentMonthCode || fc.billing_month.Contains(now.ToString("MMMM"))))
                .ToListAsync();

            if (!monthChallans.Any())
            {
                var latestMonth = await _context.FeeChallans
                    .Where(fc => fc.tenant_id == tenantId)
                    .OrderByDescending(fc => fc.created_at)
                    .Select(fc => fc.billing_month)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(latestMonth))
                {
                    monthChallans = await _context.FeeChallans
                        .Where(fc => fc.tenant_id == tenantId && fc.billing_month == latestMonth)
                        .ToListAsync();
                }
            }

            dto.FeeCollectedThisMonth = monthChallans
                .Sum(fc => fc.paid_amount > 0 ? fc.paid_amount : (fc.status == "Paid" ? fc.net_payable : (fc.status == "Partially Paid" ? fc.net_payable * 0.5m : 0m)));

            dto.FeeTargetThisMonth = monthChallans.Sum(fc => fc.net_payable);
            dto.FeePendingThisMonth = Math.Max(0m, dto.FeeTargetThisMonth - dto.FeeCollectedThisMonth);

            dto.FeeCollectionPct = dto.FeeTargetThisMonth > 0
                ? Math.Round(dto.FeeCollectedThisMonth / dto.FeeTargetThisMonth * 100, 1)
                : 0;

            // ── 10. 12-MONTH FEE TREND ────────────────────────────────────────────
            var allTenantChallans = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId)
                .ToListAsync();

            var trend = new List<MonthlyFeeDto>();
            for (int i = 11; i >= 0; i--)
            {
                var targetDate  = now.AddMonths(-i);
                var monthName   = targetDate.ToString("MMMM yyyy");
                var monthShort  = targetDate.ToString("MMM");
                var monthCode   = targetDate.ToString("yyyy-MM");

                var monthCh = allTenantChallans
                    .Where(fc => fc.billing_month == monthName || fc.billing_month == monthCode || fc.billing_month.StartsWith(monthShort))
                    .ToList();

                var collected = monthCh.Sum(fc => fc.paid_amount > 0 ? fc.paid_amount : (fc.status == "Paid" ? fc.net_payable : (fc.status == "Partially Paid" ? fc.net_payable * 0.5m : 0m)));
                var target = monthCh.Sum(fc => fc.net_payable);

                trend.Add(new MonthlyFeeDto
                {
                    Month     = monthShort,
                    Collected = collected,
                    Target    = target > 0 ? target : 50000m
                });
            }
            dto.MonthlyFeeTrend = trend;

            // ── 11. STUDENTS PER CLASS & FEE PENDING ──────────────────────────────
            var activeYear = await _context.AcademicYears
                .Where(ay => ay.tenant_id == tenantId && ay.is_current)
                .FirstOrDefaultAsync();

            var classEnrollments = await _context.StudentEnrollments
                .Where(e => e.tenant_id == tenantId && (activeYear == null || e.academic_year_id == activeYear.id) && e.status == "Active")
                .Join(_context.Classes.Where(c => c.tenant_id == tenantId),
                    e => e.class_id,
                    c => c.id,
                    (e, c) => new { c.name })
                .GroupBy(x => x.name)
                .Select(g => new ClassEnrollmentDto
                {
                    ClassName    = g.Key,
                    StudentCount = g.Count()
                })
                .OrderBy(x => x.ClassName)
                .ToListAsync();

            if (!classEnrollments.Any())
            {
                classEnrollments = await _context.StudentEnrollments
                    .Where(e => e.tenant_id == tenantId)
                    .Join(_context.Classes.Where(c => c.tenant_id == tenantId),
                        e => e.class_id,
                        c => c.id,
                        (e, c) => new { c.name })
                    .GroupBy(x => x.name)
                    .Select(g => new ClassEnrollmentDto
                    {
                        ClassName    = g.Key,
                        StudentCount = g.Count()
                    })
                    .OrderBy(x => x.ClassName)
                    .ToListAsync();
            }

            dto.StudentsPerClass = classEnrollments;

            // ── 12. FEE PENDING PER CLASS ─────────────────────────────────────
            var classDict = await _context.Classes
                .Where(c => c.tenant_id == tenantId)
                .ToDictionaryAsync(c => c.id, c => c.name);

            var feePendingPerClass = monthChallans
                .GroupBy(x => classDict.TryGetValue(x.class_id, out var cName) ? cName : "General")
                .Select(g => new ClassFeePendingDto
                {
                    ClassName     = g.Key,
                    TotalStudents = g.Count(),
                    PaidCount     = g.Count(x => x.status == "Paid"),
                    PendingCount  = g.Count(x => x.status != "Paid"),
                    PaidPct       = g.Count() > 0
                        ? Math.Round((decimal)g.Count(x => x.status == "Paid") / g.Count() * 100, 0)
                        : 0
                })
                .OrderBy(x => x.ClassName)
                .ToList();

            dto.FeePendingPerClass = feePendingPerClass;

            // ── 13. RECENT ACTIVITY (Tenant scoped across tables) ────────────────
            var activities = new List<RecentActivityDto>();

            // Recent new students
            var recentStudents = await _context.Students
                .Where(s => s.tenant_id == tenantId)
                .OrderByDescending(s => s.created_at)
                .Take(3)
                .Select(s => new { s.first_name, s.last_name, s.created_at })
                .ToListAsync();

            foreach (var s in recentStudents)
                activities.Add(new RecentActivityDto
                {
                    Type    = "student",
                    Message = $"{s.first_name} {s.last_name} enrolled as student",
                    TimeAgo = GetTimeAgo(s.created_at)
                });

            // Recent challans generated
            var recentChallans = await _context.FeeChallans
                .Where(fc => fc.tenant_id == tenantId)
                .OrderByDescending(fc => fc.created_at)
                .Take(3)
                .Select(fc => new { fc.challan_number, fc.created_at, fc.status })
                .ToListAsync();

            foreach (var fc in recentChallans)
                activities.Add(new RecentActivityDto
                {
                    Type    = "fee",
                    Message = $"Fee challan #{fc.challan_number} marked {fc.status}",
                    TimeAgo = GetTimeAgo(fc.created_at)
                });

            // Upcoming exams
            var upcomingExamList = await _context.ExamSchedules
                .Where(e => e.tenant_id == tenantId && e.exam_date.Date >= today)
                .OrderBy(e => e.exam_date)
                .Take(5)
                .Select(e => new
                {
                    e.exam_setup_id,
                    e.class_id,
                    e.exam_date
                })
                .ToListAsync();

            var classIds   = upcomingExamList.Select(x => x.class_id).Distinct().ToList();
            var examSetIds = upcomingExamList.Select(x => x.exam_setup_id).Distinct().ToList();

            var classNames   = await _context.Classes.Where(c => c.tenant_id == tenantId && classIds.Contains(c.id)).ToDictionaryAsync(c => c.id, c => c.name);
            var examSetNames = await _context.ExamSetups.Where(es => es.tenant_id == tenantId && examSetIds.Contains(es.id)).ToDictionaryAsync(es => es.id, es => es.title);

            dto.UpcomingExams = upcomingExamList.Select(e =>
            {
                var daysLeft = (e.exam_date.Date - today).Days;
                return new UpcomingExamDto
                {
                    ExamTitle = examSetNames.TryGetValue(e.exam_setup_id, out var eName) ? eName : "Exam",
                    ClassName = classNames.TryGetValue(e.class_id, out var cName) ? cName : "—",
                    ExamDate  = e.exam_date.ToString("MMM dd, yyyy"),
                    DaysLeft  = daysLeft == 0 ? "Today" : $"In {daysLeft} day{(daysLeft == 1 ? "" : "s")}"
                };
            }).ToList();

            dto.RecentActivities = activities
                .OrderBy(a => a.TimeAgo)
                .Take(6)
                .ToList();

            return dto;
        }

        private static string GetTimeAgo(DateTime utcTime)
        {
            var diff = DateTime.UtcNow - utcTime;
            if (diff.TotalMinutes < 1)   return "just now";
            if (diff.TotalMinutes < 60)  return $"{(int)diff.TotalMinutes} min ago";
            if (diff.TotalHours < 24)    return $"{(int)diff.TotalHours} hr ago";
            if (diff.TotalDays < 7)      return $"{(int)diff.TotalDays} day{((int)diff.TotalDays == 1 ? "" : "s")} ago";
            return utcTime.ToString("MMM dd");
        }

        public async Task<IEnumerable<FinanceTrendDto>> GetFinanceTrendAsync(Guid tenantId)
        {
            var now = DateTime.UtcNow;
            var trend = new List<FinanceTrendDto>();

            for (int i = 11; i >= 0; i--)
            {
                var targetDate = now.AddMonths(-i);
                var monthKey = targetDate.ToString("yyyy-MM");
                var monthLabel = targetDate.ToString("MMM");

                var monthlyRevenue = await _context.FeeChallans
                    .Where(fc => fc.tenant_id == tenantId && fc.billing_month == monthKey && fc.status == "Paid")
                    .SumAsync(fc => (decimal?)fc.net_payable) ?? 0;

                var monthlySchoolExpenses = await _context.SchoolExpenses
                    .Where(e => e.tenant_id == tenantId && e.expense_date.Month == targetDate.Month && e.expense_date.Year == targetDate.Year)
                    .SumAsync(e => (decimal?)e.amount) ?? 0;

                var monthlySalaries = await _context.SalarySlips
                    .Where(s => s.tenant_id == tenantId && s.salary_month == monthKey && s.status == "Paid")
                    .SumAsync(s => (decimal?)s.net_salary) ?? 0;

                trend.Add(new FinanceTrendDto
                {
                    Month = monthLabel,
                    Revenue = monthlyRevenue,
                    Expenses = monthlySchoolExpenses + monthlySalaries
                });
            }

            return trend;
        }
    }
}
