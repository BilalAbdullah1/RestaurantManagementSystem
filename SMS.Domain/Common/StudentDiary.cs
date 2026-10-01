using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_diaries")]
    public class StudentDiary : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid class_id { get; set; }
        public Guid section_id { get; set; }
        public DateTime date { get; set; }
        public string remarks { get; set; } = string.Empty;
        public string? homework_summary { get; set; }
        public string? conduct { get; set; } = "Good";
        public string? created_by { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
