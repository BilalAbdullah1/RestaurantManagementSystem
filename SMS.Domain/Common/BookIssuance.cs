using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("book_issuances")]
    public class BookIssuance : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid book_id { get; set; }
        public Guid? student_id { get; set; }
        public Guid? staff_id { get; set; }
        public string borrower_type { get; set; } = string.Empty; // Student, Staff
        public DateTime issue_date { get; set; }
        public DateTime due_date { get; set; }
        public DateTime? return_date { get; set; }
        public string status { get; set; } = "Issued"; // Issued, Returned, Overdue
        public decimal? fine_amount { get; set; }
        public string? remarks { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
