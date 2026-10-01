using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("students")] 
    public class Student : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid? user_id { get; set; }
        public string b_form_number { get; set; } = string.Empty;
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string gender { get; set; } = string.Empty;
        public DateTime date_of_birth { get; set; }
        public DateTime admission_date { get; set; }
        public string admission_number { get; set; } = string.Empty;
        public string father_name { get; set; } = string.Empty;
        public string father_cnic { get; set; } = string.Empty;
        public string guardian_phone { get; set; } = string.Empty;
        public string address { get; set; } = string.Empty;
        public string? blood_group { get; set; }
        public bool is_active { get; set; } = true;
        public Guid? parent_id { get; set; }
        public string? profile_picture_url { get; set; }
        public string? house_name { get; set; }
        
        // Biometric & RFID Integration
        public string? rfid_card_id { get; set; }
        public string? biometric_id { get; set; }

        public decimal wallet_balance { get; set; } = 0;
        public string category { get; set; } = "Normal"; // Normal, Staff Child, Orphan, Merit
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}