using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("alumni_profiles")]
    public class AlumniProfile : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        
        public int graduation_year { get; set; }
        public string? current_occupation { get; set; } = default!;
        public string? current_organization { get; set; } = default!;
        public string? higher_education_details { get; set; } = default!;
    }
}