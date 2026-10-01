using System;
using System.ComponentModel.DataAnnotations;

namespace SMS.Application.DTOs
{
    public class CreateGradingScaleDto
    {
        [Required]
        public Guid tenant_id { get; set; }
        
        [Required]
        public string grade_name { get; set; } = default!;
        
        [Required]
        public decimal min_percentage { get; set; }
        
        [Required]
        public decimal max_percentage { get; set; }
        
        [Required]
        public decimal gpa_point { get; set; }
        
        public string? remarks { get; set; } = default!;

        // Pro Features
        public bool? is_passing_grade { get; set; } = true;
        public string? badge_color { get; set; } = "success";
        public string? education_level { get; set; } = "General";
    }

    public class UpdateGradingScaleDto
    {
        [Required]
        public string grade_name { get; set; } = default!;
        
        [Required]
        public decimal min_percentage { get; set; }
        
        [Required]
        public decimal max_percentage { get; set; }
        
        [Required]
        public decimal gpa_point { get; set; }
        
        public string? remarks { get; set; } = default!;

        // Pro Features
        public bool? is_passing_grade { get; set; } = true;
        public string? badge_color { get; set; } = "success";
        public string? education_level { get; set; } = "General";
    }
}