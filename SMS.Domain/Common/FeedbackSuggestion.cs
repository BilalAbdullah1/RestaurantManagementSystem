using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("feedback_suggestions")]
    public class FeedbackSuggestion : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }

        public bool is_anonymous { get; set; } = true;
        public string? submitted_by_name { get; set; }
        public string category { get; set; } = "General"; // Academic Quality, Infrastructure, Discipline, General
        public string subject { get; set; } = string.Empty;
        public string feedback_text { get; set; } = string.Empty;
        public string? admin_response { get; set; }
        public string status { get; set; } = "Under Review"; // Under Review, Reviewed, Action Taken

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
