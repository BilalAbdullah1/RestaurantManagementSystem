using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorsController : ControllerBase
    {
        private readonly IVisitorRepository _visitorRepository;

        public VisitorsController(IVisitorRepository visitorRepository)
        {
            _visitorRepository = visitorRepository;
        }

        // GET: api/visitors/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var visitors = await _visitorRepository.GetByTenantAsync(tenantId);
            return Ok(visitors);
        }

        // GET: api/visitors/today/{tenantId}
        [HttpGet("today/{tenantId}")]
        public async Task<IActionResult> GetTodayVisitors(Guid tenantId)
        {
            var visitors = await _visitorRepository.GetTodayVisitorsAsync(tenantId);
            return Ok(visitors);
        }

        // GET: api/visitors/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var visitor = await _visitorRepository.GetByIdAsync(id);
            if (visitor == null) return NotFound(new { message = "Visitor record not found." });
            return Ok(visitor);
        }

        // POST: api/visitors
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Visitor visitor)
        {
            if (visitor == null) return BadRequest(new { message = "Visitor data is required." });

            visitor.id = Guid.NewGuid();
            visitor.check_in_time = DateTime.UtcNow;
            visitor.created_at = DateTime.UtcNow;
            visitor.status = "Checked In";

            await _visitorRepository.AddAsync(visitor);
            await _visitorRepository.SaveChangesAsync();

            return Ok(new { message = "Visitor checked in successfully.", data = visitor });
        }

        // PUT: api/visitors/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Visitor updatedVisitor)
        {
            var visitor = await _visitorRepository.GetByIdAsync(id);
            if (visitor == null) return NotFound(new { message = "Visitor record not found." });

            visitor.visitor_name = updatedVisitor.visitor_name;
            visitor.phone_number = updatedVisitor.phone_number;
            visitor.purpose = updatedVisitor.purpose;
            visitor.host_name = updatedVisitor.host_name;
            visitor.host_department = updatedVisitor.host_department;
            visitor.vehicle_number = updatedVisitor.vehicle_number;
            visitor.id_card_type = updatedVisitor.id_card_type;
            visitor.id_card_number = updatedVisitor.id_card_number;
            visitor.remarks = updatedVisitor.remarks;

            _visitorRepository.Update(visitor);
            await _visitorRepository.SaveChangesAsync();

            return Ok(new { message = "Visitor record updated.", data = visitor });
        }

        // PUT: api/visitors/{id}/checkout
        [HttpPut("{id}/checkout")]
        public async Task<IActionResult> CheckOut(Guid id)
        {
            var visitor = await _visitorRepository.GetByIdAsync(id);
            if (visitor == null) return NotFound(new { message = "Visitor record not found." });

            if (visitor.status == "Checked Out")
                return BadRequest(new { message = "Visitor has already checked out." });

            visitor.status = "Checked Out";
            visitor.check_out_time = DateTime.UtcNow;

            _visitorRepository.Update(visitor);
            await _visitorRepository.SaveChangesAsync();

            return Ok(new { message = "Visitor checked out successfully.", data = visitor });
        }

        // DELETE: api/visitors/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var visitor = await _visitorRepository.GetByIdAsync(id);
            if (visitor == null) return NotFound(new { message = "Visitor not found." });

            _visitorRepository.Delete(visitor);
            await _visitorRepository.SaveChangesAsync();

            return Ok(new { message = "Visitor record deleted." });
        }
    }
}
