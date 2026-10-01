using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.Application.DTOs;
using RMS.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GlobalSearchController : ControllerBase
    {
        private readonly IGlobalSearchService _globalSearchService;

        public GlobalSearchController(IGlobalSearchService globalSearchService)
        {
            _globalSearchService = globalSearchService;
        }

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<GlobalSearchResultDto>>> Search(Guid tenantId, [FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Ok(new List<GlobalSearchResultDto>());

            var results = await _globalSearchService.SearchAsync(tenantId, query);
            return Ok(results);
        }
    }
}
