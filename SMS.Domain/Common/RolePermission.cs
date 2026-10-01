using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.Core.Entities
{
    [Table("role_permissions")]
    public class RolePermission
    {
        public Guid role_id { get; set; }
        public Guid permission_id { get; set; }
    }
}