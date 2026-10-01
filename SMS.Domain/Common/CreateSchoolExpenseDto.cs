using System;

namespace SMS.Application.DTOs
{
    public class CreateSchoolExpenseDto
    {
        public Guid tenant_id { get; set; }
        public string category { get; set; } = default!;
        public string title { get; set; } = default!;
        public decimal amount { get; set; }
        public DateTime expense_date { get; set; }
        public string description { get; set; } = default!;
        public string? paid_to { get; set; }
        public string? payment_method { get; set; }
        public string? receipt_no { get; set; }
        public string? receipt_image_url { get; set; }
        public string? approval_status { get; set; }
        public Guid? recorded_by_user_id { get; set; }
    }

    public class UpdateSchoolExpenseDto
    {
        public string category { get; set; } = default!;
        public string title { get; set; } = default!;
        public decimal amount { get; set; }
        public DateTime expense_date { get; set; }
        public string description { get; set; } = default!;
        public string? paid_to { get; set; }
        public string? payment_method { get; set; }
        public string? receipt_no { get; set; }
        public string? receipt_image_url { get; set; }
        public string? approval_status { get; set; }
    }
}