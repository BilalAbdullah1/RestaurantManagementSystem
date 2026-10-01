using System;

namespace RMS.Application.DTOs
{
    public class StaffFormDto
    {
        public Guid? id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? user_id { get; set; }
        public Guid role_id { get; set; }
        public string first_name { get; set; } = default!;
        public string last_name { get; set; } = default!;
        public string email { get; set; } = default!;
        public string phone { get; set; } = default!;
        public string cnic { get; set; } = default!;
        public string designation { get; set; } = default!;
        public string qualification { get; set; } = default!;
        public decimal basic_salary { get; set; }
        public DateTime joining_date { get; set; }
        public bool is_active { get; set; }
        public string? profile_picture_url { get; set; }
    }
}