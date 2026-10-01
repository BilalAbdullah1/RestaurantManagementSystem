using System;
using System.Collections.Generic;

namespace SMS.Application.DTOs
{
    public class AttendanceRecordDto
    {
        public Guid student_id { get; set; }
        public string status { get; set; } = default!; // Present, Absent, Late, Leave
        public string remarks { get; set; } = default!;
        public TimeSpan? check_in_time { get; set; }
        public TimeSpan? check_out_time { get; set; }
        public bool is_late { get; set; }
        public bool is_half_day { get; set; }
        public decimal fine_amount { get; set; }
    }

    public class BulkMarkAttendanceDto
    {
        public Guid tenant_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid? class_id { get; set; }
        public Guid? section_id { get; set; }
        public DateTime date { get; set; }
        public List<AttendanceRecordDto> records { get; set; } = default!;
    }

    // Reports response mapping ke liye clean DTO
    public class AttendanceReportResponseDto
    {
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        public int roll_number { get; set; }
        public int total_days { get; set; }
        public int presents { get; set; }
        public int absents { get; set; }
        public int leaves { get; set; }
        public int lates { get; set; }
        public decimal attendance_percentage { get; set; }
    }
    public class WeeklyAttendanceDto
    {
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        public decimal overall_percentage { get; set; } // Naya Field
        public Dictionary<string, AttendanceDetailDto> records { get; set; } = default!;
    }

    public class AttendanceDetailDto
    {
        public string status { get; set; } = default!;
        public string reason { get; set; } = default!;
    }

    public class AttendanceHeatmapDto
    {
        public string Date { get; set; } = string.Empty; // yyyy-MM-dd
        public int PresentCount { get; set; }
        public int TotalCount { get; set; }
        public decimal Percentage { get; set; }
    }
}