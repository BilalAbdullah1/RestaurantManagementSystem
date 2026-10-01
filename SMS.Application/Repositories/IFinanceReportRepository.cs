using SMS.Domain.DTOs;
using System;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IFinanceReportRepository
    {
        Task<DefaulterReportDto> GetDefaultersAsync(Guid tenantId);
        Task<ProfitAndLossDto> GetProfitAndLossAsync(Guid tenantId, DateTime startDate, DateTime endDate);
        Task<DailyCollectionDto> GetDailyCollectionAsync(Guid tenantId, DateTime date);
        Task<List<GeneralLedgerTransactionDto>> GetGeneralLedgerAsync(Guid tenantId, DateTime? startDate, DateTime? endDate);
    }
}

