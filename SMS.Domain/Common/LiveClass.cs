using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("live_classes")]
    public class LiveClass : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid teacher_id { get; set; }
        public string topic { get; set; } = string.Empty;
        public string platform { get; set; } = "Zoom"; // Zoom, Google Meet, Teams
        public string meeting_link { get; set; } = string.Empty;
        public DateTime start_time { get; set; }
        public int duration_minutes { get; set; } = 40;
        public string status { get; set; } = "Scheduled"; // Scheduled, Live, Ended
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
