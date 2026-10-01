using SMS.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface IPromotionService
    {
        Task PromoteStudentsAsync(Guid tenantId, PromotionRequestDto request);
    }
}
