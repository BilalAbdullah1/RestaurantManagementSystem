using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("sections")]
    public class Section : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid? class_teacher_id { get; set; } // FK to Staff for designated class teacher
        public string name { get; set; } = string.Empty;
        public string? room_number { get; set; }
        public int max_capacity { get; set; } = 40;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}