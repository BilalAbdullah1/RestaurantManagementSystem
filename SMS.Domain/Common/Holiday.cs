using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("holidays")]
    public class Holiday : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string name { get; set; } = string.Empty;
        
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        
        public bool is_active { get; set; } = true;
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
