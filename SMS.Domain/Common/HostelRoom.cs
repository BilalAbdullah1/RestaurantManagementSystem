using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("hostel_rooms")]
    public class HostelRoom : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string room_number { get; set; } = string.Empty;
        public string room_type { get; set; } = string.Empty; // Single, Double, Triple, Dormitory
        public int capacity { get; set; }
        public decimal monthly_fee { get; set; }
        public bool is_available { get; set; } = true;
        public string? description { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
