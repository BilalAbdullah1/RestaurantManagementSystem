using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("dining_tables")]
    public class DiningTable : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public string table_number { get; set; } = string.Empty; // e.g. T-01, VIP-01
        public string floor_zone { get; set; } = "GroundFloor"; // GroundFloor, FirstFloor, OutdoorLawn, Rooftop, VIPLounge
        public int seating_capacity { get; set; } = 4;
        public string status { get; set; } = "Available"; // Available, Occupied, Reserved, Billing
        public string? qr_code_url { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
