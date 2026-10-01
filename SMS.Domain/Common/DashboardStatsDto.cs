using System.Collections.Generic;

namespace SMS.Domain.DTOs
{
    /// <summary>
    /// Main dashboard response DTO — saara data ek hi API call mein
    /// </summary>
    public class DashboardStatsDto
    {
        // ── KPI Cards ──────────────────────────────────────────────
        public int TotalStudents { get; set; }
        public int TotalActiveStaff { get; set; }
        public int TotalClasses { get; set; }
        public int TotalTransportRoutes { get; set; }
        public int TotalHostelRooms { get; set; }
        public int ExamsThisMonth { get; set; }

        // ── Today's Attendance ────────────────────────────────────
        public int StudentsPresentToday { get; set; }
        public int StudentsLateToday { get; set; }
        public int StudentsAbsentToday { get; set; }
        public decimal StudentAttendancePctToday { get; set; }

        // ── Staff Attendance Today ────────────────────────────────
        public int StaffPresentToday { get; set; }
        public int StaffAbsentToday { get; set; }
        public decimal StaffAttendancePctToday { get; set; }

        // ── Fee Collection — Current Month ────────────────────────
        public decimal FeeCollectedThisMonth { get; set; }
        public decimal FeePendingThisMonth { get; set; }
        public decimal FeeTargetThisMonth { get; set; }
        public decimal FeeCollectionPct { get; set; }

        // ── 12-Month Fee Trend ────────────────────────────────────
        public List<MonthlyFeeDto> MonthlyFeeTrend { get; set; } = new();

        // ── Students Per Class ────────────────────────────────────
        public List<ClassEnrollmentDto> StudentsPerClass { get; set; } = new();

        // ── Fee Pending Per Class ─────────────────────────────────
        public List<ClassFeePendingDto> FeePendingPerClass { get; set; } = new();

        // ── Recent Activity ───────────────────────────────────────
        public List<RecentActivityDto> RecentActivities { get; set; } = new();

        // ── Upcoming Exams ────────────────────────────────────────
        public List<UpcomingExamDto> UpcomingExams { get; set; } = new();

        // ── Gender Demographics ──────────────────────────────────
        public List<GenderRatioDto> StudentGenderRatio { get; set; } = new();
    }

    public class GenderRatioDto
    {
        public string Gender { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class FinanceTrendDto
    {
        public string Month { get; set; } = string.Empty; // e.g., "Jul"
        public decimal Revenue { get; set; }
        public decimal Expenses { get; set; }
    }

    public class MonthlyFeeDto
    {
        public string Month { get; set; } = string.Empty;   // e.g. "Jul"
        public decimal Collected { get; set; }
        public decimal Target { get; set; }
    }

    public class ClassEnrollmentDto
    {
        public string ClassName { get; set; } = string.Empty;
        public int StudentCount { get; set; }
    }

    public class ClassFeePendingDto
    {
        public string ClassName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int PaidCount { get; set; }
        public int PendingCount { get; set; }
        public decimal PaidPct { get; set; }
    }

    public class RecentActivityDto
    {
        public string Type { get; set; } = string.Empty;   // "student" | "fee" | "attendance" | "exam" | "payroll"
        public string Message { get; set; } = string.Empty;
        public string TimeAgo { get; set; } = string.Empty;
    }

    public class UpcomingExamDto
    {
        public string ExamTitle { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ExamDate { get; set; } = string.Empty;
        public string DaysLeft { get; set; } = string.Empty;
    }
}
