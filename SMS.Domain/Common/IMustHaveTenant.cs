using System;

namespace SMS.Core.Interfaces
{
    public interface IMustHaveTenant
    {
        public Guid tenant_id { get; set; }
    }
}
