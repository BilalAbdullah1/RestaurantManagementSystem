using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_attendance")]
    public class StudentAttendance : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid? class_id { get; set; }
        public Guid? section_id { get; set; }
        public DateTime date { get; set; }
        public string status { get; set; } = "Present"; // Present, Absent, Late, Leave
        public string? remarks { get; set; } = default!;
        
        public TimeSpan? check_in_time { get; set; }
        public TimeSpan? check_out_time { get; set; }
        public bool is_late { get; set; } = false;
        public bool is_half_day { get; set; } = false;
        public decimal fine_amount { get; set; } = 0;

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}