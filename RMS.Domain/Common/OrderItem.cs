using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RMS.Core.Entities
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid order_id { get; set; }
        public Guid menu_item_id { get; set; }
        public string item_name { get; set; } = string.Empty;
        public int quantity { get; set; } = 1;
        public decimal unit_price { get; set; }
        public decimal total_price { get; set; }
        public string? special_instructions { get; set; }
        public string status { get; set; } = "Cooking"; // Cooking, Ready, Served

        [ForeignKey("order_id")]
        public virtual Order? Order { get; set; }

        [ForeignKey("menu_item_id")]
        public virtual MenuItem? MenuItem { get; set; }
    }
}
