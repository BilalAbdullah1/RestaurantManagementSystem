using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("fee_structures")]
    public class FeeStructure : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid class_id { get; set; }
        public Guid fee_type_id { get; set; }
        public string category { get; set; } = "Normal";

        [Column(TypeName = "decimal(18,2)")]
        public decimal amount { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}