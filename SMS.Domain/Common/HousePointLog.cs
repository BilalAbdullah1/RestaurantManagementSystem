using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("house_point_logs")]
    public class HousePointLog : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string house_name { get; set; } = string.Empty; // Red, Blue, Green, Yellow
        public Guid? student_id { get; set; }
        public int points { get; set; } = 0;
        public string reason { get; set; } = string.Empty;
        public string? awarded_by { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
