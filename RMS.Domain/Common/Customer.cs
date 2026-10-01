using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("customers")]
    public class Customer : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string phone { get; set; } = string.Empty;
        public string? email { get; set; }
        public string? address { get; set; }
        public int loyalty_points { get; set; } = 0;
        public int total_orders { get; set; } = 0;
        public decimal total_spend { get; set; } = 0;
        public DateTime? last_visit { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
