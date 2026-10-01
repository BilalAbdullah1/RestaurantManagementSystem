using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IParentPortalRepository
    {
        Task<IEnumerable<MyKidDto>> GetKidsByParentIdAsync(Guid parentId, Guid tenantId);
        Task<ParentDashboardSummaryDto> GetDashboardSummaryForKidAsync(Guid studentId, Guid tenantId);
    }
}
