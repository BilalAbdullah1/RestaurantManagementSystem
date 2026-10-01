using System;
using System.ComponentModel.DataAnnotations;

namespace RMS.Domain.Common
{
    public class Notification : BaseEntity
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public Guid? TargetUserId { get; set; } // Null if it's a broadcast to a role

        [MaxLength(50)]
        public string? TargetRole { get; set; } // Null if targeted to a specific user

        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // e.g., "Fee", "Attendance", "System", "Homework", "Result"

        public bool IsRead { get; set; } = false;
        
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
