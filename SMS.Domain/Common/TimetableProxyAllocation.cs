using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("timetable_proxy_allocations")]
    public class TimetableProxyAllocation : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        [Required]
        public Guid timetable_period_id { get; set; }
        
        [Required]
        public DateTime date_of_proxy { get; set; } // Representing the specific date
        
        [Required]
        public Guid absent_staff_id { get; set; }
        
        [Required]
        public Guid substitute_staff_id { get; set; }
        
        public Guid? allocated_by { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
