using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("subjects")]
    public class Subject : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? code { get; set; }
        public bool is_elective { get; set; } = false;
        public string? elective_group_name { get; set; }
    }
}