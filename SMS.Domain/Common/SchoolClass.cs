using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("classes")]
    public class SchoolClass : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? code { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}