using System;
using System.Collections.Generic;

namespace SMS.Application.DTOs
{
    public class StaffAttendanceRecordDto
    {
        public Guid staff_id { get; set; }
        public string status { get; set; } = default!; // Present, Absent, Late, Leave
        public DateTime? check_in { get; set; }
        public DateTime? check_out { get; set; }
    }

    public class BulkMarkStaffAttendanceDto
    {
        public Guid tenant_id { get; set; }
        public DateTime date { get; set; }
        public List<StaffAttendanceRecordDto> records { get; set; } = default!;
    }

    // Reports response mapping ke liye clean DTO
    public class StaffAttendanceReportResponseDto
    {
        public Guid staff_id { get; set; }
        public string staff_name { get; set; } = default!;
        public string designation { get; set; } = default!;
        public string cnic { get; set; } = default!;
        public int total_days { get; set; }
        public int presents { get; set; }
        public int absents { get; set; }
        public int leaves { get; set; }
        public int lates { get; set; }
        public decimal attendance_percentage { get; set; }
    }

    public class StaffWeeklyAttendanceDto
    {
        public Guid staff_id { get; set; }
        public string staff_name { get; set; } = default!;
        public string designation { get; set; } = default!;
        public decimal overall_percentage { get; set; }
        public Dictionary<string, StaffAttendanceDetailDto> records { get; set; } = default!;
    }

    public class StaffAttendanceDetailDto
    {
        public string status { get; set; } = default!;
        public DateTime? check_in { get; set; }
    }

    public class SyncBiometricDto
    {
        public Guid tenant_id { get; set; }
        public DateTime date { get; set; }
    }

    public class PayrollAttendanceSummaryDto
    {
        public Guid staff_id { get; set; }
        public string staff_name { get; set; } = default!;
        public string designation { get; set; } = default!;
        public decimal basic_salary { get; set; }

        // Raw Counts
        public int total_presents { get; set; }
        public int total_lates { get; set; }
        public int total_half_days { get; set; }
        public int total_leaves { get; set; }
        public int actual_absents { get; set; }

        // Calculated Rules
        public int penalty_absents { get; set; } // Lates aur Half-days se mil kar banne walay absents
        public int lwp_days { get; set; } // Leave Without Pay (Quota exceed hone par)

        // Final Output for Salary Slip
        public int total_deductible_days { get; set; }
        public decimal deduction_amount { get; set; }
        public decimal net_payable_salary { get; set; }
    }
}