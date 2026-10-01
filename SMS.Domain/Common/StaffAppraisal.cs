using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("staff_appraisals")]
    public class StaffAppraisal : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid staff_id { get; set; }

        public int appraisal_year { get; set; } = DateTime.UtcNow.Year;

        [Column(TypeName = "decimal(18,2)")]
        public decimal performance_rating { get; set; } = 4.0m; // 1.0 to 5.0 rating

        public bool is_teacher_of_the_month { get; set; } = false;
        public string? award_month { get; set; } // e.g. "October 2026"

        [Column(TypeName = "decimal(18,2)")]
        public decimal recommended_increment_pct { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal previous_basic_salary { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal new_basic_salary { get; set; }

        public bool is_increment_applied { get; set; } = false;
        public string comments { get; set; } = string.Empty;

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
