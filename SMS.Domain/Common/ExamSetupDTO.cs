using System;
using System.ComponentModel.DataAnnotations;

namespace SMS.Application.DTOs
{
    public class CreateExamSetupDto
    {
        [Required]
        public Guid tenant_id { get; set; }
        
        [Required]
        public string title { get; set; } = default!;
        
        [Required]
        public DateTime start_date { get; set; }
        
        [Required]
        public DateTime end_date { get; set; }
        
        public string? description { get; set; } = default!;

        // Advanced Pro Features
        public decimal? weightage_percentage { get; set; }
        public DateTime? marks_entry_deadline { get; set; }
        public string? target_class_ids { get; set; }
        public string? academic_session { get; set; }
        public bool? is_published { get; set; }
    }

    public class UpdateExamSetupDto
    {
        [Required]
        public string title { get; set; } = default!;
        
        [Required]
        public DateTime start_date { get; set; }
        
        [Required]
        public DateTime end_date { get; set; }
        
        [Required]
        public string status { get; set; } = default!; // Allowed values: Upcoming, Ongoing, Completed
        
        public string? description { get; set; } = default!;

        // Advanced Pro Features
        public decimal? weightage_percentage { get; set; }
        public DateTime? marks_entry_deadline { get; set; }
        public string? target_class_ids { get; set; }
        public string? academic_session { get; set; }
        public bool? is_published { get; set; }
    }
}