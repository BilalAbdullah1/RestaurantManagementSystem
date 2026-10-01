using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("class_subjects")]
    public class ClassSubject : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal passing_marks { get; set; } = 33.00m;

        [Column(TypeName = "decimal(5,2)")]
        public decimal total_marks { get; set; } = 100.00m;
    }
}