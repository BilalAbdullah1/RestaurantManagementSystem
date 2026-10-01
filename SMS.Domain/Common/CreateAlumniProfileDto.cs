using System;

namespace SMS.Application.DTOs
{
    public class CreateAlumniProfileDto
    {
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public int graduation_year { get; set; }
        public string current_occupation { get; set; } = default!;
        public string current_organization { get; set; } = default!;
        public string higher_education_details { get; set; } = default!;
    }

    public class UpdateAlumniProfileDto
    {
        public int graduation_year { get; set; }
        public string current_occupation { get; set; } = default!;
        public string current_organization { get; set; } = default!;
        public string higher_education_details { get; set; } = default!;
    }

    // Frontend par Alumni directory dikhane ke liye joined DTO
    public class AlumniProfileResponseDto
    {
        public Guid id { get; set; }
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        public string gender { get; set; } = default!;
        public string phone_number { get; set; } = default!; // Parent/Guardian phone
        
        public int graduation_year { get; set; }
        public string current_occupation { get; set; } = default!;
        public string current_organization { get; set; } = default!;
        public string higher_education_details { get; set; } = default!;
    }
}