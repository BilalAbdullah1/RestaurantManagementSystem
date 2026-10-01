using System;
using System.ComponentModel.DataAnnotations;

namespace SMS.Core.Entities
{
    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string email { get; set; } = string.Empty;

        [Required]
        public Guid tenant_id { get; set; }
    }

    public class ResetPasswordRequest
    {
        [Required]
        public string token { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
        public string newPassword { get; set; } = string.Empty;
    }
}