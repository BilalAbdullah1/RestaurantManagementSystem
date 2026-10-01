using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("inventory_items")]
    public class InventoryItem : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string item_name { get; set; } = string.Empty;
        public string category { get; set; } = string.Empty; // Furniture, Stationery, Electronics, Sports, etc.
        public string? description { get; set; }
        public int quantity { get; set; }
        public int reorder_level { get; set; } = 5;
        public string unit { get; set; } = string.Empty; // Pcs, Box, Kg, Litre
        public decimal unit_price { get; set; }
        public string? supplier_name { get; set; }
        public string? location { get; set; } // Shelf, Room, Store
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
