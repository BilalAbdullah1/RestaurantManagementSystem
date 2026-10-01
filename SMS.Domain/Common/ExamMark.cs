using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("exam_marks")]
    public class ExamMark : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        public Guid exam_setup_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid student_id { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal theory_marks { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal practical_marks { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal assignment_marks { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal obtained_marks { get; set; }
        
        public bool is_absent { get; set; }
        public string remarks { get; set; } = default!;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}