using SMS.Domain.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IDashboardRepository
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(Guid tenantId);
        Task<IEnumerable<FinanceTrendDto>> GetFinanceTrendAsync(Guid tenantId);
    }
}
