using RMS.Core.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("permissions")]
public class Permission
{
    [Key]
    public Guid id { get; set; }

    [Required]
    public string name { get; set; } = string.Empty;

    public string? description { get; set; }        // ← New
    public string module_name { get; set; } = string.Empty;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}