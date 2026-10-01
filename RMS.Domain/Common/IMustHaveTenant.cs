using System;

namespace RMS.Core.Interfaces
{
    public interface IMustHaveTenant
    {
        public Guid tenant_id { get; set; }
    }
}
