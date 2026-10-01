using System;
using System.Collections.Generic;
using System.Text;

namespace RMS.Domain.DTO_s
{
    public class RegisterRequest
    {
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string? phone_number { get; set; }
        public string password { get; set; } = string.Empty;
        public Guid tenant_id { get; set; }
        public string role_name { get; set; } = string.Empty;
    }

   public class LoginRequest
    {
        public Guid tenant_id { get; set; }
        public string email { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public string? otp_code { get; set; }
    }
    public class TokenRefreshRequest
    {
        public Guid tenant_id { get; set; }
        public string email { get; set; } = string.Empty;
        public string refresh_token { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool requires_2fa { get; set; }
        public string token { get; set; } = string.Empty;
        public string refresh_token { get; set; } = string.Empty;
        public DateTime refresh_token_expiry { get; set; }
        public Guid user_id { get; set; }
        public string email { get; set; } = string.Empty;
         public Guid tenant_id { get; set; }
         public Guid role_id { get; set; }
         public string role_name { get; set; } = string.Empty;
         public string? profile_picture_url { get; set; }
    }
}
