using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface IDataExportService
    {
        Task<byte[]> ExportStudentsToCsvAsync(Guid tenantId);
        Task<byte[]> ExportStaffToCsvAsync(Guid tenantId);
    }
}
