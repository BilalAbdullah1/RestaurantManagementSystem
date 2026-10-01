using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("event_calendar_items")]
    public class EventCalendarItem : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }

        public string title { get; set; } = string.Empty;
        public string event_type { get; set; } = "Academics"; // Sports, Academics, Cultural, Holiday, Exam
        public DateTime start_date { get; set; } = DateTime.UtcNow;
        public DateTime end_date { get; set; } = DateTime.UtcNow;
        public string location { get; set; } = "School Auditorium";
        public string description { get; set; } = string.Empty;

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
