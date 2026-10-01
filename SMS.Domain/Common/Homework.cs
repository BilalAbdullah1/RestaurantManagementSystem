using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("homeworks")]
    public class Homework : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        
        public Guid tenant_id { get; set; }
        
        [Required]
        public Guid class_id { get; set; }
        
        [Required]
        public Guid section_id { get; set; }
        
        [Required]
        public Guid subject_id { get; set; }
        
        [Required]
        public Guid staff_id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string title { get; set; } = string.Empty;
        
        public string? description { get; set; } = string.Empty;
        
        [Required]
        public DateTime homework_date { get; set; }
        
        [Required]
        public DateTime due_date { get; set; }
        
        public int? max_marks { get; set; }
        
        // Storing JSON string array of URLs
        public string? attachment_urls { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
