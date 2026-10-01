using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("school_expenses")]
    public class SchoolExpense : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? account_id { get; set; } // FK to ChartOfAccount
        
        [Required]
        public string category { get; set; } = default!;
        
        [Required]
        public string title { get; set; } = default!;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal amount { get; set; }
        
        public DateTime expense_date { get; set; }
        public string? description { get; set; } = default!;
        public string? paid_to { get; set; }
        public string? payment_method { get; set; }
        public string? receipt_no { get; set; }
        public string? receipt_image_url { get; set; }
        public string? approval_status { get; set; }
        
        public Guid? recorded_by_user_id { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}