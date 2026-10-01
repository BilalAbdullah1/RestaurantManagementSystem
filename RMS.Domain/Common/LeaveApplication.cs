using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("leave_applications")]
    public class LeaveApplication : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        
        public Guid? student_id { get; set; }
        public Guid? staff_id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string leave_type { get; set; } = default!; // Sick, Casual, Urgent
        
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        
        [Required]
        public string reason { get; set; } = default!;
        
        public string? attachment_url { get; set; }
        
        [MaxLength(20)]
        public string status { get; set; } = "Pending"; // Pending, Approved, Rejected
        
        public Guid? approver_id { get; set; }
        public string? approver_notes { get; set; }
        
        public DateTime applied_on { get; set; } = DateTime.UtcNow;
    }
}
