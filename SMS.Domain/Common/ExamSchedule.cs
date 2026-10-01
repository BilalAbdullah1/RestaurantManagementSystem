using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("exam_schedules")]
    public class ExamSchedule : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        public Guid exam_setup_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        
        public DateTime exam_date { get; set; }
        public string start_time { get; set; } = default!; // "09:00 AM" or "09:00"
        public string end_time { get; set; } = default!;   // "12:00 PM" or "12:00"
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal total_marks { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal passing_marks { get; set; }

        // Pro Features
        public string? room_number { get; set; }
        public string? invigilator_name { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}