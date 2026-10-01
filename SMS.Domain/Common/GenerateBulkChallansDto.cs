using System;
using System.Collections.Generic;

namespace SMS.Application.DTOs
{
    public class GenerateBulkChallansDto
    {
        public Guid tenant_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid? class_id { get; set; }
        public string billing_month { get; set; } = default!; // e.g. "October 2026"
        public DateTime issue_date { get; set; }
        public DateTime due_date { get; set; }
    }

    public class FeeChallanDetailDto
    {
        public string fee_name { get; set; } = default!;
        public decimal amount { get; set; }
    }

    // Frontend par Grid dikhane ke liye
    public class FeeChallanResponseDto
    {
        public Guid id { get; set; }
        public string challan_number { get; set; } = default!;
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        public string guardian_phone { get; set; } = string.Empty; // FIX: needed by FeeDefaultersManager
        public string class_name { get; set; } = default!;
        public string billing_month { get; set; } = default!;
        public DateTime due_date { get; set; }
        public decimal gross_amount { get; set; }
        public decimal discount_amount { get; set; }
        public decimal net_payable { get; set; }
        public decimal paid_amount { get; set; }
        public decimal late_fine { get; set; } = 0; // FIX: dynamic overdue fine from backend
        public string status { get; set; } = default!;
        public string category { get; set; } = "Normal";
        public string? payment_method { get; set; }
        public DateTime? payment_date { get; set; }
        public string? transaction_ref { get; set; }
        public List<FeeChallanDetailDto> items { get; set; } = new List<FeeChallanDetailDto>();
    }
}