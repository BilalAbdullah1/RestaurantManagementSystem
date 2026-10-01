using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("menu_items")]
    public class MenuItem : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public Guid category_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? description { get; set; }
        public decimal selling_price { get; set; }
        public decimal cost_price { get; set; }
        public string dietary_type { get; set; } = "Non-Veg"; // Veg, Non-Veg, Beverage
        public int preparation_time_minutes { get; set; } = 15;
        public int calories { get; set; } = 0;
        public string? image_url { get; set; }
        public bool is_available { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("category_id")]
        public virtual Category? Category { get; set; }
    }
}
