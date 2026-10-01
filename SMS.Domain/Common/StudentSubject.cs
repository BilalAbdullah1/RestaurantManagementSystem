using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_subjects")]
    public class StudentSubject : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        public bool is_elective { get; set; } = false;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
