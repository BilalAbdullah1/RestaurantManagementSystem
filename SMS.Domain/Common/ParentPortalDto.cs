using System;
using System.Collections.Generic;

namespace SMS.Core.Entities
{
    public class MyKidDto
    {
        public Guid student_id { get; set; }
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string admission_number { get; set; } = string.Empty;
        public string class_name { get; set; } = string.Empty;
        public string section_name { get; set; } = string.Empty;
        public string gender { get; set; } = string.Empty;
        public string? photo_url { get; set; } // Can be implemented later if student photos exist
    }

    public class ParentDashboardSummaryDto
    {
        public Guid student_id { get; set; }
        public string student_name { get; set; } = string.Empty;
        public double attendance_percentage { get; set; }
        public decimal total_pending_fees { get; set; }
        public List<PendingFeeDto> pending_fees { get; set; } = new();
        public List<PendingFeeDto> paid_fees { get; set; } = new();
        public List<RecentHomeworkDto> recent_homework { get; set; } = new();
        public List<RecentExamDto> recent_exams { get; set; } = new();
    }

    public class PendingFeeDto
    {
        public Guid challan_id { get; set; }
        public string challan_number { get; set; } = string.Empty;
        public decimal amount { get; set; }
        public DateTime due_date { get; set; }
        public string status { get; set; } = string.Empty;
    }

    public class RecentHomeworkDto
    {
        public Guid homework_id { get; set; }
        public string subject_name { get; set; } = string.Empty;
        public string title { get; set; } = string.Empty;
        public DateTime due_date { get; set; }
        public string status { get; set; } = "Pending"; // "Pending", "Submitted", "Graded"
    }

    public class RecentExamDto
    {
        public string exam_title { get; set; } = string.Empty;
        public string subject_name { get; set; } = string.Empty;
        public decimal marks_obtained { get; set; }
        public decimal total_marks { get; set; }
        public string grade { get; set; } = string.Empty;
    }
}
