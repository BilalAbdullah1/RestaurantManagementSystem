using System;

namespace SMS.Application.DTOs
{
    public class RoleDto
    {
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string name { get; set; } = string.Empty;
        public string? description { get; set; }
        public bool is_system_role { get; set; } = false;
        public int users_count { get; set; } = 0;
        public DateTime created_at { get; set; }
        public DateTime? updated_at { get; set; }
    }
}
