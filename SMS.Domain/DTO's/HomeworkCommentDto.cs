using System;

namespace SMS.Domain.DTOs
{
    public class HomeworkCommentDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid homework_id { get; set; }
        public Guid user_id { get; set; }
        public string comment_text { get; set; } = string.Empty;
        public DateTime created_at { get; set; }
        
        public string? user_name { get; set; }
    }
}
