using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentPortalController : ControllerBase
    {
        private readonly IParentPortalRepository _repository;
        private readonly ApplicationDbContext _context;

        public StudentPortalController(IParentPortalRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
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

        [HttpGet("my-dashboard")]
        public async Task<IActionResult> GetMyDashboard()
        {
            var tenantId = GetTenantId();
            var userId = GetUserId();

            if (tenantId == Guid.Empty || userId == Guid.Empty)
                return Unauthorized();

            // Find the Student ID linked to this User ID
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.user_id == userId && s.tenant_id == tenantId);

            if (student == null)
                return NotFound(new { message = "Student profile not found for this user." });

            // Reuse the Parent Portal Repository logic to fetch student dashboard data
            var summary = await _repository.GetDashboardSummaryForKidAsync(student.id, tenantId);
            if (summary == null)
                return NotFound(new { message = "Dashboard data not found." });

            return Ok(summary);
        }
    }
}
