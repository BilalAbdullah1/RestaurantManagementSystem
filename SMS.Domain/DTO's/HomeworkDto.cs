using System;
using System.ComponentModel.DataAnnotations;

namespace SMS.Domain.DTOs
{
    public class HomeworkRequestDto
    {
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid section_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid staff_id { get; set; }
        public string title { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public DateTime homework_date { get; set; }
        public DateTime due_date { get; set; }
        public int? max_marks { get; set; }
        public string? attachment_urls { get; set; }
    }

    public class HomeworkResponseDto : HomeworkRequestDto
    {
        public Guid id { get; set; }
        public DateTime created_at { get; set; }
        
        // These can be populated if we join tables, but for now we keep it simple
        public string? class_name { get; set; }
        public string? section_name { get; set; }
        public string? subject_name { get; set; }
        public string? staff_name { get; set; }
    }
}
