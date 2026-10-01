using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("lesson_plans")]
    public class LessonPlan : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid teacher_id { get; set; }
        public string title { get; set; } = string.Empty;
        public string? description { get; set; }
        public DateTime? target_date { get; set; }
        public int completion_percentage { get; set; } = 0;
        public string status { get; set; } = "Pending"; // Pending, In Progress, Completed
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
