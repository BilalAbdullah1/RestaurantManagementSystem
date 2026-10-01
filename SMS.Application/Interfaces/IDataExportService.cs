using System;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface IDataExportService
    {
        Task<byte[]> ExportMenuItemsToCsvAsync(Guid tenantId);
        Task<byte[]> ExportStaffToCsvAsync(Guid tenantId);
    }
}
