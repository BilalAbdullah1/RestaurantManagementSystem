using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HousePointsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HousePointsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/housepoints/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var logs = await (from hp in _context.HousePointLogs.AsNoTracking()
                              where hp.tenant_id == tenantId
                              join st in _context.Students on hp.student_id equals st.id into stGroup
                              from st in stGroup.DefaultIfEmpty()
                              select new
                              {
                                  hp.id,
                                  hp.tenant_id,
                                  hp.house_name,
                                  hp.student_id,
                                  hp.points,
                                  hp.reason,
                                  hp.awarded_by,
                                  hp.created_at,
                                  student_name = st != null ? $"{st.first_name} {st.last_name}" : ""
                              }).ToListAsync();

            // Calculate House Totals
            var houseSummary = new[] { "Red", "Blue", "Green", "Yellow" }.Select(house => new {
                house_name = house,
                total_points = logs.Where(l => l.house_name == house).Sum(l => l.points),
                student_count = _context.Students.Count(s => s.tenant_id == tenantId && s.house_name == house)
            }).ToList();

            return Ok(new { summary = houseSummary, logs = logs });
        }

        // POST: api/housepoints
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HousePointLog log)
        {
            log.id = Guid.NewGuid();
            log.created_at = DateTime.UtcNow;

            await _context.HousePointLogs.AddAsync(log);
            await _context.SaveChangesAsync();

            return Ok(new { message = "House points awarded successfully.", data = log });
        }

        // DELETE: api/housepoints/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _context.HousePointLogs.FindAsync(id);
            if (item == null) return NotFound(new { message = "Point log entry not found." });

            _context.HousePointLogs.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "House point entry removed." });
        }
    }
}
