using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("staff_loans")]
    public class StaffLoan : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid staff_id { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal loan_amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal monthly_installment { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal remaining_balance { get; set; }

        public string status { get; set; } = "Approved"; // Pending, Approved, Repaid, Rejected
        public string reason { get; set; } = string.Empty;

        public DateTime issue_date { get; set; } = DateTime.UtcNow;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
