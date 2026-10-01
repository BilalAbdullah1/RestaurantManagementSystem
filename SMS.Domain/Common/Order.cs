using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("orders")]
    public class Order : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public string order_number { get; set; } = string.Empty; // e.g. #RMS-1028
        public string order_type { get; set; } = "DineIn"; // DineIn, Takeaway, Delivery
        public Guid? table_id { get; set; }
        public string? table_number { get; set; }
        public Guid? server_id { get; set; }
        public string? server_name { get; set; }
        public string customer_name { get; set; } = "Walk-in Guest";
        public string? customer_phone { get; set; }
        public decimal subtotal { get; set; }
        public decimal tax_amount { get; set; }
        public decimal discount_amount { get; set; }
        public decimal total_amount { get; set; }
        public string payment_method { get; set; } = "Cash"; // Cash, Card, Online
        public string payment_status { get; set; } = "Paid"; // Paid, Unpaid, Refunded
        public string order_status { get; set; } = "Completed"; // Pending, Cooking, Ready, Served, Completed, Cancelled
        public string? notes { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
