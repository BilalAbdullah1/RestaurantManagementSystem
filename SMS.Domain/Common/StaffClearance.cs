using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("staff_clearances")]
    public class StaffClearance : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid staff_id { get; set; }

        public DateTime resignation_date { get; set; } = DateTime.UtcNow;
        public DateTime relieving_date { get; set; } = DateTime.UtcNow.AddDays(30);

        public int notice_period_days { get; set; } = 30;

        [Column(TypeName = "decimal(18,2)")]
        public decimal unpaid_salary_amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal leave_encashment_amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal loan_deduction_amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal net_settlement_amount { get; set; }

        public string clearance_status { get; set; } = "Completed"; // Pending, Approved, Completed
        public string remarks { get; set; } = string.Empty;

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
