using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("kitchen_order_tickets")]
    public class KitchenOrderTicket : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public Guid order_id { get; set; }
        public string ticket_number { get; set; } = string.Empty; // e.g. #KOT-104
        public string kitchen_station { get; set; } = "MainKitchen"; // MainKitchen, Grill, Fryer, Beverages, Bakery
        public string status { get; set; } = "Cooking"; // Cooking, Ready, Served
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("order_id")]
        public virtual Order? Order { get; set; }
    }
}
