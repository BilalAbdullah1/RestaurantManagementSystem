using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("transport_routes")]
    public class TransportRoute : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string route_name { get; set; } = string.Empty;
        public string start_point { get; set; } = string.Empty;
        public string end_point { get; set; } = string.Empty;
        public string? stops { get; set; } // Comma-separated or JSON list of stops
        public decimal monthly_fee { get; set; }
        public Guid? vehicle_id { get; set; }
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
