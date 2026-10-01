using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("menu_categories")]
    public class Category : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? description { get; set; }
        public string? icon_name { get; set; }
        public int display_order { get; set; } = 0;
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
