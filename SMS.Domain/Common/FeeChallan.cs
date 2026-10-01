using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("fee_challans")]
    public class FeeChallan : IMustHaveTenant
    {
        [Key] public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid student_id { get; set; }
        public Guid class_id { get; set; }
        
        public string challan_number { get; set; } = default!;
        public string billing_month { get; set; } = default!;
        public DateTime issue_date { get; set; }
        public DateTime due_date { get; set; }
        
        public decimal total_amount { get; set; }
        public decimal discount_amount { get; set; }
        public decimal net_payable { get; set; }
        public decimal paid_amount { get; set; } = 0;
        public decimal late_fine { get; set; } = 0;
        public string status { get; set; } = "Unpaid";
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        // Navigation property for Details
        [NotMapped] // Assuming you manage details manually, or remove this if EF handles relations
        public List<FeeChallanDetail> Details { get; set; } = new List<FeeChallanDetail>();
    }

    [Table("fee_challan_details")]
    public class FeeChallanDetail
    {
        [Key] public Guid id { get; set; }
        public Guid challan_id { get; set; }
        public Guid fee_type_id { get; set; }
        
        public string fee_name { get; set; } = default!;
        public decimal base_amount { get; set; }
        public decimal discount_amount { get; set; }
        public decimal net_amount { get; set; } 
    }
}