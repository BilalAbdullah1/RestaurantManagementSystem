using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Domain.Common;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimetableProxiesController : ControllerBase
    {
        private readonly ITimetableProxyRepository _repository;

        public TimetableProxiesController(ITimetableProxyRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("tenant/{tenantId}/date/{date}")]
        public async Task<IActionResult> GetProxiesForDate(Guid tenantId, DateTime date)
        {
            var proxies = await _repository.GetProxiesForDateAsync(tenantId, date);
            
            var result = proxies.Select(p => new TimetableProxyResponseDto
            {
                id = p.id,
                tenant_id = p.tenant_id,
                timetable_period_id = p.timetable_period_id,
                date_of_proxy = p.date_of_proxy,
                absent_staff_id = p.absent_staff_id,
                substitute_staff_id = p.substitute_staff_id,
                allocated_by = p.allocated_by,
                created_at = p.created_at
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AllocateProxy([FromBody] CreateTimetableProxyDto dto)
        {
            var allocation = new TimetableProxyAllocation
            {
                tenant_id = dto.tenant_id,
                timetable_period_id = dto.timetable_period_id,
                date_of_proxy = dto.date_of_proxy,
                absent_staff_id = dto.absent_staff_id,
                substitute_staff_id = dto.substitute_staff_id,
                allocated_by = dto.allocated_by
            };

            var created = await _repository.AllocateProxyAsync(allocation);
            return Ok(created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProxy(Guid id)
        {
            var success = await _repository.DeleteProxyAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
