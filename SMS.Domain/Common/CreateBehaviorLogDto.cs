using System;

namespace SMS.Application.DTOs
{
    public class CreateBehaviorLogDto
    {
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid academic_year_id { get; set; }
        public DateTime incident_date { get; set; }
        public string incident_type { get; set; } = default!;
        public int points_affected { get; set; }
        public string action_taken { get; set; } = default!;
        public Guid reported_by_user_id { get; set; }
    }

    // Frontend par grid/cards dikhane ke liye joined DTO
    public class BehaviorLogResponseDto
    {
        public Guid id { get; set; }
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        public DateTime incident_date { get; set; }
        public string incident_type { get; set; } = default!;
        public int points_affected { get; set; }
        public string action_taken { get; set; } = default!;
        public string reported_by_name { get; set; } = default!;
    }
}