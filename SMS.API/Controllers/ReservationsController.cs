using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public ReservationsController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reservations = await _context.TableReservations
                .Include(r => r.Table)
                .OrderByDescending(r => r.reservation_date)
                .ToListAsync();

            return Ok(reservations);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TableReservation model)
        {
            if (string.IsNullOrWhiteSpace(model.customer_name) || string.IsNullOrWhiteSpace(model.contact_number))
                return BadRequest(new { message = "Customer name and contact number are required" });

            model.id = Guid.NewGuid();
            model.created_at = DateTime.UtcNow;
            model.status = "Confirmed";

            if (model.table_id.HasValue && model.table_id != Guid.Empty)
            {
                var table = await _context.DiningTables.FindAsync(model.table_id.Value);
                if (table != null)
                {
                    table.status = "Reserved";
                    model.table_number = table.table_number;
                }
            }

            _context.TableReservations.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var res = await _context.TableReservations.FindAsync(id);
            if (res == null) return NotFound(new { message = "Reservation not found" });

            res.status = status;

            if (res.table_id.HasValue)
            {
                var table = await _context.DiningTables.FindAsync(res.table_id.Value);
                if (table != null)
                {
                    if (status == "Seated") table.status = "Occupied";
                    else if (status == "Cancelled") table.status = "Available";
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Reservation updated", status = res.status });
        }
    }
}
