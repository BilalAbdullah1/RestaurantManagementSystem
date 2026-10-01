using System;

namespace RMS.Application.DTOs
{
    public class LeaveApplicationDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? student_id { get; set; }
        public Guid? staff_id { get; set; }
        public string leave_type { get; set; } = default!;
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public string reason { get; set; } = default!;
        public string? attachment_url { get; set; }
        public string status { get; set; } = "Pending";
        public Guid? approver_id { get; set; }
        public string? approver_notes { get; set; }
        public DateTime applied_on { get; set; }
    }

    public class CreateLeaveApplicationDto
    {
        public Guid tenant_id { get; set; }
        public Guid? student_id { get; set; }
        public Guid? staff_id { get; set; }
        public string leave_type { get; set; } = default!;
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public string reason { get; set; } = default!;
        public string? attachment_url { get; set; }
    }

    public class UpdateLeaveStatusDto
    {
        public string status { get; set; } = default!;
        public Guid approver_id { get; set; }
        public string? approver_notes { get; set; }
    }
}
