using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_subject_attendance")]
    public class StudentSubjectAttendance : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        public Guid student_id { get; set; }
        public Guid timetable_period_id { get; set; }
        
        public DateTime date { get; set; }
        public string status { get; set; } = "Present"; // Present, Absent, Late, Leave
        public string? remarks { get; set; } = string.Empty;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
