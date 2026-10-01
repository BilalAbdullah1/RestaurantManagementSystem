using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("hostel_allocations")]
    public class HostelAllocation : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid room_id { get; set; }
        public DateTime allocation_date { get; set; }
        public DateTime? vacating_date { get; set; }
        public string status { get; set; } = "Active"; // Active, Vacated
        public string? remarks { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
