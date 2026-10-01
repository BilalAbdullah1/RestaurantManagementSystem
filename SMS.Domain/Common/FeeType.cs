using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("fee_types")]
    public class FeeType : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        [Required]
        public string name { get; set; } = default!; // e.g., "Tuition Fee", "Library Fee"
        
        public string? description { get; set; } = default!;
        
        [Required]
        public string frequency { get; set; } = default!; // "Monthly", "Annually", "One-Time"
        
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}