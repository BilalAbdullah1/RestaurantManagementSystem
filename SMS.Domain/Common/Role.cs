using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Entities;
using SMS.Core.Interfaces;

[Table("roles")]
public class Role : IMustHaveTenant
{
    [Key]
    public Guid id { get; set; }

    public Guid tenant_id { get; set; }

    [Required]
    public string name { get; set; } = string.Empty;

    public string? description { get; set; }
    public bool is_system_role { get; set; } = false;
    public DateTime created_at { get; set; } = DateTime.UtcNow;
    public DateTime? updated_at { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class AssignPermissionsRequest
{
    public List<Guid> permission_ids { get; set; } = new List<Guid>();
}