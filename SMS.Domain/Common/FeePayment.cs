using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("fee_payments")]
    public class FeePayment : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid challan_id { get; set; }
        public DateTime payment_date { get; set; }
        public decimal amount { get; set; }
        public string payment_method { get; set; } = string.Empty;
        public string? remarks { get; set; }
        public string? receipt_number { get; set; }
        public Guid? received_by_user_id { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
