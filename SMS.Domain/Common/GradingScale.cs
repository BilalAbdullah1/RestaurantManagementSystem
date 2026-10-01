using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("grading_scales")]
    public class GradingScale : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        [Required]
        public string grade_name { get; set; } = default!;
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal min_percentage { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal max_percentage { get; set; }
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal gpa_point { get; set; }
        
        public string? remarks { get; set; } = default!;

        // Pro Features
        public bool is_passing_grade { get; set; } = true;
        public string badge_color { get; set; } = "success";
        public string education_level { get; set; } = "General";
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}