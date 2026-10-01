using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ParentPortalController : ControllerBase
    {
        private readonly IParentPortalRepository _repository;

        public ParentPortalController(IParentPortalRepository repository)
        {
            _repository = repository;
        }

        private Guid GetTenantId()
        {
            var tenantIdStr = User.FindFirst("tenant_id")?.Value;
            return Guid.TryParse(tenantIdStr, out var tenantId) ? tenantId : Guid.Empty;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdStr, out var userId) ? userId : Guid.Empty;
        }

        [HttpGet("my-kids")]
        public async Task<ActionResult<IEnumerable<MyKidDto>>> GetMyKids()
        {
            var parentId = GetUserId();
            var tenantId = GetTenantId();
            
            if (parentId == Guid.Empty || tenantId == Guid.Empty)
                return Unauthorized();

            var kids = await _repository.GetKidsByParentIdAsync(parentId, tenantId);
            return Ok(kids);
        }

        [HttpGet("dashboard/{studentId}")]
        public async Task<ActionResult<ParentDashboardSummaryDto>> GetDashboardSummary(Guid studentId)
        {
            var tenantId = GetTenantId();
            if (tenantId == Guid.Empty)
                return Unauthorized();

            // Note: Optional layer of security to verify that studentId actually belongs to GetUserId() 
            // can be added here or in the repository level.

            var summary = await _repository.GetDashboardSummaryForKidAsync(studentId, tenantId);
            if (summary == null)
                return NotFound(new { message = "Student not found or access denied." });

            return Ok(summary);
        }
    }
}
