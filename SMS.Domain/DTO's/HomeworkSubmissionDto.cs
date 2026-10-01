using System;

namespace SMS.Domain.DTOs
{
    public class HomeworkSubmissionRequestDto
    {
        public Guid tenant_id { get; set; }
        public Guid homework_id { get; set; }
        public Guid student_id { get; set; }
        public string status { get; set; } = "Pending";
        public string? student_notes { get; set; }
        public string? attachment_urls { get; set; }
        public int? marks_obtained { get; set; }
        public string? teacher_remarks { get; set; }
    }

    public class HomeworkSubmissionResponseDto : HomeworkSubmissionRequestDto
    {
        public Guid id { get; set; }
        public DateTime submission_date { get; set; }
        
        public string? student_name { get; set; }
    }
}
