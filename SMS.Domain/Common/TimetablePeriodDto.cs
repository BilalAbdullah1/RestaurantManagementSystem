using System;

namespace SMS.Domain.Common
{
    public class CreateTimetablePeriodDto
    {
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid section_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid staff_id { get; set; }
        public int day_of_week { get; set; }
        public TimeSpan start_time { get; set; }
        public TimeSpan end_time { get; set; }
        public string? room_name { get; set; }
    }

    public class TimetablePeriodResponseDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid section_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid staff_id { get; set; }
        public int day_of_week { get; set; }
        public TimeSpan start_time { get; set; }
        public TimeSpan end_time { get; set; }
        public string? room_name { get; set; }
        public DateTime created_at { get; set; }
    }
}
