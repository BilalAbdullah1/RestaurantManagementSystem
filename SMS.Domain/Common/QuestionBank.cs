using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("question_banks")]
    public class QuestionBank : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid class_id { get; set; }

        [Required]
        public string question_text { get; set; } = default!;
        
        [Required]
        public string option_a { get; set; } = default!;
        [Required]
        public string option_b { get; set; } = default!;
        [Required]
        public string option_c { get; set; } = default!;
        [Required]
        public string option_d { get; set; } = default!;
        
        [Required]
        public string correct_option { get; set; } = default!; // "A", "B", "C", or "D"
        
        public int marks { get; set; } = 1;
        public string difficulty_level { get; set; } = "Medium"; // "Easy", "Medium", "Hard"

        // Pro Features
        public string? topic_name { get; set; }
        public string? explanation { get; set; }
        public string question_type { get; set; } = "MCQ"; // "MCQ", "TrueFalse", "ShortAnswer"
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
