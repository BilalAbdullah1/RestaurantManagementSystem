using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("transport_vehicles")]
    public class TransportVehicle : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string vehicle_number { get; set; } = string.Empty;
        public string vehicle_type { get; set; } = string.Empty; // Bus, Van, Minibus
        public string model { get; set; } = string.Empty;
        public int capacity { get; set; }
        public string driver_name { get; set; } = string.Empty;
        public string driver_phone { get; set; } = string.Empty;
        public string? driver_license_number { get; set; }
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
