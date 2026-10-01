using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_exam_attempts")]
    public class StudentExamAttempt : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid online_exam_id { get; set; }
        public Guid student_id { get; set; }
        
        public int score { get; set; }
        public DateTime start_time { get; set; }
        public DateTime? end_time { get; set; }
        public bool is_completed { get; set; }
        
        public string responses_json { get; set; } = "{}"; // JSON storing answers map
    }
}
