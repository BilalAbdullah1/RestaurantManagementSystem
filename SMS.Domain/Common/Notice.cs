using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("notices")]
    public class Notice : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? posted_by_user_id { get; set; } // FK to User
        public string title { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public string category { get; set; } = "Academic"; 
        public string target_audience { get; set; } = "All"; 
        public string? attachment_url { get; set; }
        public string posted_by { get; set; } = "Principal Office";
        public bool is_active { get; set; } = true;
        public DateTime published_at { get; set; } = DateTime.UtcNow;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
        public DateTime? expires_at { get; set; }
    }
}
