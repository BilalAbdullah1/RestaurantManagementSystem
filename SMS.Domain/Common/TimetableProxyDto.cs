using System;

namespace SMS.Domain.Common
{
    public class CreateTimetableProxyDto
    {
        public Guid tenant_id { get; set; }
        public Guid timetable_period_id { get; set; }
        public DateTime date_of_proxy { get; set; }
        public Guid absent_staff_id { get; set; }
        public Guid substitute_staff_id { get; set; }
        public Guid? allocated_by { get; set; }
    }

    public class TimetableProxyResponseDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid timetable_period_id { get; set; }
        public DateTime date_of_proxy { get; set; }
        public Guid absent_staff_id { get; set; }
        public Guid substitute_staff_id { get; set; }
        public Guid? allocated_by { get; set; }
        public DateTime created_at { get; set; }
    }
}
