using System;
using System.Threading.Tasks;

namespace RMS.Application.Interfaces
{
    public interface IDataExportService
    {
        Task<byte[]> ExportMenuItemsToCsvAsync(Guid tenantId);
        Task<byte[]> ExportStaffToCsvAsync(Guid tenantId);
    }
}
