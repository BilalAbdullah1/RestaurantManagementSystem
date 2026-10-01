using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("chart_of_accounts")]
    public class ChartOfAccount : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? parent_id { get; set; } // Self-referencing FK for tree hierarchy
        
        [Required]
        public string code { get; set; } = default!;
        
        [Required]
        public string name { get; set; } = default!;
        
        [Required]
        public string type { get; set; } = "Asset"; // Asset, Liability, Equity, Income, Expense
        
        public string sub_category { get; set; } = "General";
        public int level { get; set; } = 1; // 1 = Main Head, 2 = Sub Head, 3 = Ledger Account
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal balance { get; set; } = 0;
        
        public string? currency { get; set; } = "PKR";

        [Column(TypeName = "decimal(18,4)")]
        public decimal? exchange_rate { get; set; } = 1.0m;

        public bool is_reconciled { get; set; } = true;
        public bool is_active { get; set; } = true;
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
