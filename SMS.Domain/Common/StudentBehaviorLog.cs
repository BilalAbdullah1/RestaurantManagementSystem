using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_behavior_logs")]
    public class StudentBehaviorLog : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid academic_year_id { get; set; }
        
        public DateTime incident_date { get; set; }
        public string incident_type { get; set; } = default!; // e.g., "Late Arrival", "Bullying", "Excellent Work"
        public int points_affected { get; set; } = 0; // Positive for good behavior, negative for bad
        public string action_taken { get; set; } = default!;
        
        public Guid reported_by_user_id { get; set; }
    }
}