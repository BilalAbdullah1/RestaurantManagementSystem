using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("homework_comments")]
    public class HomeworkComment : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        
        public Guid tenant_id { get; set; }
        
        [Required]
        public Guid homework_id { get; set; }
        
        [Required]
        public Guid user_id { get; set; } // Can be student or staff
        
        [Required]
        public string comment_text { get; set; } = string.Empty;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
