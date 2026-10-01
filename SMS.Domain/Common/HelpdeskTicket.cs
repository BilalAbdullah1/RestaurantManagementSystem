using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("helpdesk_tickets")]
    public class HelpdeskTicket : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }

        public string ticket_number { get; set; } = string.Empty;
        public string raised_by_name { get; set; } = string.Empty;
        public string raised_by_role { get; set; } = "Parent"; // Parent, Student, Staff
        public string category { get; set; } = "Facilities"; // Facilities, Academic, Fee Billing, IT / Portal
        public string subject { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public string priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
        public string status { get; set; } = "Open"; // Open, In Progress, Resolved, Closed
        public string? resolution_remarks { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
