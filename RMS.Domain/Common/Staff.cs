using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RMS.Core.Interfaces;

namespace RMS.Core.Entities
{
    [Table("staff")]
    public class Staff : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid user_id { get; set; } // Non-nullable foreign key referencing application user account

        public string cnic { get; set; } = string.Empty;
        public string staff_type { get; set; } = "Teaching"; // Teaching, Non-Teaching, Management
        public string designation { get; set; } = string.Empty;
        public string qualification { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal basic_salary { get; set; }

        public DateTime joining_date { get; set; }
        public bool is_active { get; set; } = true;

        // Document Vault (Contracts, CNIC, Degrees)
        public string? cnic_doc_url { get; set; }
        public string? degree_doc_url { get; set; }
        public string? contract_doc_url { get; set; }

        // Biometric & RFID Integration
        public string? rfid_card_id { get; set; }
        public string? biometric_id { get; set; }

        // Leave Quota System
        public int casual_leave_quota { get; set; } = 14;
        public int medical_leave_quota { get; set; } = 8;
        public int casual_leaves_used { get; set; } = 0;
        public int medical_leaves_used { get; set; } = 0;
    }
}