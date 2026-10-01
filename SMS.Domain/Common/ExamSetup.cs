using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("exam_setups")]
    public class ExamSetup : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        [Required]
        public string title { get; set; } = default!;
        
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        
        public string status { get; set; } = "Upcoming";
        public string? description { get; set; } = default!;
        
        public bool is_locked { get; set; } = false;
        
        // Advanced Pro Features
        public decimal? weightage_percentage { get; set; }
        public DateTime? marks_entry_deadline { get; set; }
        public string? target_class_ids { get; set; }
        public string? academic_session { get; set; }
        public bool is_published { get; set; } = false;

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}