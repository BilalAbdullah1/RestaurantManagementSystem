
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.Core.Entities
{
    [Table("tenants")]
    public class Tenant
    {
        public Guid id { get; set; }
        public string school_name { get; set; } = string.Empty;
        public string school_code { get; set; } = string.Empty;
        public string? subdomain { get; set; }

        public string? phone { get; set; }
        public string? email { get; set; }
        public string? address { get; set; }
        public string? principal_name { get; set; }
        public string? registration_no { get; set; }
        public string? website { get; set; }

        public string? logo_url { get; set; }

        public string currency { get; set; } = "PKR";
        public string fiscal_year_start { get; set; } = "04-01";

        public string? primary_color { get; set; }
        public string? login_background_url { get; set; }

        public bool is_active { get; set; } = true;
        public DateTimeOffset created_at { get; set; } = DateTimeOffset.UtcNow;
    }
}