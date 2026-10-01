using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("homework_submissions")]
    public class HomeworkSubmission : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        
        public Guid tenant_id { get; set; }
        
        [Required]
        public Guid homework_id { get; set; }
        
        [Required]
        public Guid student_id { get; set; }
        
        public DateTime submission_date { get; set; } = DateTime.UtcNow;
        
        [Required]
        [MaxLength(50)]
        public string status { get; set; } = "Pending"; // Pending, Submitted, Late, Graded
        
        public string? student_notes { get; set; }
        
        public string? attachment_urls { get; set; }
        
        public int? marks_obtained { get; set; }
        
        public string? teacher_remarks { get; set; }
    }
}
