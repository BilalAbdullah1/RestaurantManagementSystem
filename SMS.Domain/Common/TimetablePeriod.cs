using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("timetable_periods")]
    public class TimetablePeriod : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? academic_year_id { get; set; } // Link timetable to specific academic session
        
        [Required]
        public Guid class_id { get; set; }
        
        [Required]
        public Guid section_id { get; set; }
        
        [Required]
        public Guid subject_id { get; set; }
        
        [Required]
        public Guid staff_id { get; set; }
        
        [Required]
        public int day_of_week { get; set; }
        
        [Required]
        public TimeSpan start_time { get; set; }
        
        [Required]
        public TimeSpan end_time { get; set; }
        
        public string? room_name { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
