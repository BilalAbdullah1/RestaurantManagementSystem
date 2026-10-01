using System;

namespace SMS.Application.DTOs
{
    public class EnrollStudentDto
    {
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid class_id { get; set; }
        public Guid section_id { get; set; }
        public int roll_number { get; set; }
    }

    public class TransferStudentDto
    {
        public Guid enrollment_id { get; set; }
        public Guid new_class_id { get; set; }
        public Guid new_section_id { get; set; }
        public int new_roll_number { get; set; }
        public string? remarks { get; set; }
    }

    public class PromoteStudentDto
    {
        public Guid student_id { get; set; }
        public Guid previous_enrollment_id { get; set; }
        public Guid new_academic_year_id { get; set; }
        public Guid new_class_id { get; set; }
        public Guid new_section_id { get; set; }
        public int new_roll_number { get; set; }
    }
}