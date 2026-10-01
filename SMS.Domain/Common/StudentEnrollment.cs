using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_enrollments")]
    public class StudentEnrollment : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid class_id { get; set; }
        public Guid section_id { get; set; }
        public int roll_number { get; set; }
        public string status { get; set; } = "Active"; // Active, Transferred, Promoted, Dropped
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}