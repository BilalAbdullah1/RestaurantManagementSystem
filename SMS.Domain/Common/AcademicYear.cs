using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("academic_years")]
    public class AcademicYear : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string title { get; set; } = string.Empty;
        
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public bool is_current { get; set; } = false;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}