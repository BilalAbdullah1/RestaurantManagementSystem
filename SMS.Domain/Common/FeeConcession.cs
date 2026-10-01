using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("fee_concessions")]
    public class FeeConcession : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        public Guid student_id { get; set; }
        public Guid fee_type_id { get; set; }
        
        [Required]
        public string name { get; set; } = default!;
        
        [Required]
        public string discount_type { get; set; } = default!; // "Percentage" or "FixedAmount"

        [Column(TypeName = "decimal(18,2)")]
        public decimal discount_value { get; set; }
        
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}