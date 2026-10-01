using System;

namespace RMS.Application.DTOs
{
    public class GenerateBulkSalarySlipsDto
    {
        public Guid tenant_id { get; set; }
        public string salary_month { get; set; } = default!; // e.g. "October 2026"
        public int month { get; set; } // e.g. 10
        public int year { get; set; } // e.g. 2026
        
        // Rules configuration
        public int lates_per_absent { get; set; } = 3;
        public int half_days_per_absent { get; set; } = 2;
        public int allowed_leaves { get; set; } = 2;
    }

    public class SalarySlipResponseDto
    {
        public Guid id { get; set; }
        public Guid staff_id { get; set; }
        public string staff_name { get; set; } = default!;
        public string designation { get; set; } = default!;
        public string salary_month { get; set; } = default!;
        public decimal basic_salary { get; set; }
        public decimal house_rent_allowance { get; set; }
        public decimal medical_allowance { get; set; }
        public decimal allowance_amount { get; set; }
        public decimal deduction_amount { get; set; }
        public decimal provident_fund_deduction { get; set; }
        public decimal loan_deduction { get; set; }
        public decimal income_tax_deduction { get; set; }
        public decimal net_salary { get; set; }
        public string status { get; set; } = default!;
        public DateTime? payment_date { get; set; }
    }
}