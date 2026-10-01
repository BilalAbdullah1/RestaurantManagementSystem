using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("users")]
    public class User : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid role_id { get; set; }
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string password_hash { get; set; } = string.Empty;
        public string? phone_number { get; set; }
        public bool is_active { get; set; } = true;
        public string? refresh_token { get; set; }
        public DateTime? refresh_token_expiry { get; set; }
        public string? profile_picture_url { get; set; }
        public bool two_factor_enabled { get; set; } = false;
        public string? two_factor_secret { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}