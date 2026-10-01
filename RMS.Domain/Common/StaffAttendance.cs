using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("staff_attendance")]
    public class StaffAttendance : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid staff_id { get; set; }

        public DateTime date { get; set; }
        public string status { get; set; } = "Present"; 
        
        public DateTime? check_in { get; set; }
        public DateTime? check_out { get; set; }

        public bool is_late { get; set; } = false;
        public bool is_half_day { get; set; } = false;
        public decimal fine_amount { get; set; } = 0;

        // Mobile App GPS Attendance
        public decimal? latitude { get; set; }
        public decimal? longitude { get; set; }
        public string? location_address { get; set; }
    }
}