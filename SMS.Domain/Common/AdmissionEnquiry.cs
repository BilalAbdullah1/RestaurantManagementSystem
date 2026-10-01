using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("admission_enquiries")]
    public class AdmissionEnquiry : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string child_name { get; set; } = default!;
        public string father_name { get; set; } = default!;
        public string phone_number { get; set; } = default!;
        public Guid class_id { get; set; }
        public string status { get; set; } = "Enquiry"; 
        public string remarks { get; set; } = default!;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}