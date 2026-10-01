using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface IGlobalSearchService
    {
        Task<IEnumerable<GlobalSearchResultDto>> SearchAsync(Guid tenantId, string keyword);
    }
}
