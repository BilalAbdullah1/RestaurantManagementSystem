using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("ptm_slots")]
    public class PtmSlot : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid teacher_id { get; set; }

        public string teacher_name { get; set; } = string.Empty;
        public DateTime meeting_date { get; set; } = DateTime.UtcNow;
        public string start_time { get; set; } = "10:00 AM";
        public string end_time { get; set; } = "10:15 AM";

        public bool is_booked { get; set; } = false;
        public string? booked_by_parent_name { get; set; }
        public string? booked_by_student_name { get; set; }
        public string? meeting_notes { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
