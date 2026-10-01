using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("salary_slips")]
    public class SalarySlip : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid staff_id { get; set; }
        
        public string salary_month { get; set; } = default!;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal basic_salary { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal house_rent_allowance { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal medical_allowance { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal allowance_amount { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal deduction_amount { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal provident_fund_deduction { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal loan_deduction { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal income_tax_deduction { get; set; } = 0;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal net_salary { get; set; }
        
        public string status { get; set; } = "Unpaid";
        public DateTime? payment_date { get; set; }
        
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}