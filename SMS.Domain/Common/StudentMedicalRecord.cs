using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("student_medical_records")]
    public class StudentMedicalRecord : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public string? allergies { get; set; }
        public string? chronic_conditions { get; set; }
        public string? vaccination_status { get; set; }
        public string? family_medical_history { get; set; }
        public string? emergency_contact_name { get; set; }
        public string? emergency_contact_phone { get; set; }
        public string? emergency_contact_relation { get; set; }
        public string? doctor_name { get; set; }
        public string? doctor_phone { get; set; }
        public string? additional_notes { get; set; }
        public DateTime last_updated { get; set; } = DateTime.UtcNow;
    }
}
