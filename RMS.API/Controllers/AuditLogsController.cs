using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using RMS.Infrastructure.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuditLogsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("audit.view")]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogsByTenant(Guid tenantId)
        {
            var logs = await _context.AuditLogs
                .Where(a => a.tenant_id == tenantId)
                .OrderByDescending(a => a.created_at)
                .Take(500)
                .ToListAsync();

            return Ok(logs);
        }
    }
}
