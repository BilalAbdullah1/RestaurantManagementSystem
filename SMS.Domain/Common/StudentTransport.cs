using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_transport")]
    public class StudentTransport : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid route_id { get; set; }
        public string pickup_point { get; set; } = string.Empty;
        public DateTime start_date { get; set; }
        public DateTime? end_date { get; set; }
        public string status { get; set; } = "Active"; // Active, Inactive
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
