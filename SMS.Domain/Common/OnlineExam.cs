using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("online_exams")]
    public class OnlineExam : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid? section_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid exam_setup_id { get; set; }

        [Required]
        public string title { get; set; } = default!;
        
        public DateTime exam_date { get; set; }
        public int duration_minutes { get; set; }
        public int total_marks { get; set; }
        public int passing_marks { get; set; }

        // Pro Features
        public bool shuffle_questions { get; set; } = true;
        public bool shuffle_options { get; set; } = true;
        public bool is_published { get; set; } = false;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
