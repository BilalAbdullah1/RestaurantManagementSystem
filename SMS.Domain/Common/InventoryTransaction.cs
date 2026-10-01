using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("inventory_transactions")]
    public class InventoryTransaction : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid item_id { get; set; }
        public string transaction_type { get; set; } = string.Empty; // Purchase, Issue, Return, Adjustment
        public int quantity { get; set; }
        public string? issued_to { get; set; } // Name/Department
        public string? purpose { get; set; }
        public string? reference_number { get; set; }
        public DateTime transaction_date { get; set; }
        public string? remarks { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
