using System;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("audit_logs")]
    public class AuditLog : IMustHaveTenant
    {
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        
        public Guid? user_id { get; set; }
        public string action { get; set; } = string.Empty; // Create, Update, Delete
        public string table_name { get; set; } = string.Empty;
        public string record_id { get; set; } = string.Empty;
        
        [Column(TypeName = "jsonb")]
        public string? old_values { get; set; }
        
        [Column(TypeName = "jsonb")]
        public string? new_values { get; set; }
        
        public string? ip_address { get; set; }
        
        public DateTimeOffset created_at { get; set; } = DateTimeOffset.UtcNow;
    }
}
