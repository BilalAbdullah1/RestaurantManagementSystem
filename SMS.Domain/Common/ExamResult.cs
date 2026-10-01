using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("exam_results")]
    public class ExamResult : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        public Guid exam_setup_id { get; set; }
        public Guid class_id { get; set; }
        public Guid student_id { get; set; }
        
        [Column(TypeName = "decimal(7,2)")]
        public decimal total_max_marks { get; set; }
        
        [Column(TypeName = "decimal(7,2)")]
        public decimal total_obtained_marks { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal percentage { get; set; }
        
        public string grade { get; set; } = default!;
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal gpa { get; set; }
        
        public string status { get; set; } = default!;
        public string remarks { get; set; } = default!;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}