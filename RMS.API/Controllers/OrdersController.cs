using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public OrdersController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? type)
        {
            var query = _context.Orders
                .Include(o => o.OrderItems)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                query = query.Where(o => o.order_status == status);
            }

            if (!string.IsNullOrWhiteSpace(type) && type != "All")
            {
                query = query.Where(o => o.order_type == type);
            }

            var orders = await query
                .OrderByDescending(o => o.created_at)
                .Take(50)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.id == id);

            if (order == null) return NotFound(new { message = "Order not found" });
            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order model)
        {
            if (model.OrderItems == null || !model.OrderItems.Any())
                return BadRequest(new { message = "Order must contain at least one item" });

            model.id = Guid.NewGuid();
            model.order_number = $"#RMS-{new Random().Next(1000, 9999)}";
            model.created_at = DateTime.UtcNow;

            // Recalculate totals
            decimal subtotal = 0;
            foreach (var item in model.OrderItems)
            {
                item.id = Guid.NewGuid();
                item.order_id = model.id;
                item.total_price = item.unit_price * item.quantity;
                subtotal += item.total_price;
            }

            model.subtotal = subtotal;
            model.tax_amount = Math.Round(subtotal * 0.16m, 2);
            model.total_amount = model.subtotal + model.tax_amount - model.discount_amount;

            _context.Orders.Add(model);

            // Automatically Generate KOT Ticket
            var kot = new KitchenOrderTicket
            {
                id = Guid.NewGuid(),
                tenant_id = model.tenant_id,
                order_id = model.id,
                ticket_number = $"#KOT-{new Random().Next(100, 999)}",
                kitchen_station = "MainKitchen",
                status = "Cooking",
                created_at = DateTime.UtcNow
            };
            _context.KitchenOrderTickets.Add(kot);

            // If dine-in, mark table as Occupied
            if (model.table_id.HasValue && model.table_id != Guid.Empty)
            {
                var table = await _context.DiningTables.FindAsync(model.table_id.Value);
                if (table != null)
                {
                    table.status = "Occupied";
                }
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.id }, model);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Order not found" });

            order.order_status = status;

            // If order completed or cancelled and was dine-in, free the table
            if ((status == "Completed" || status == "Cancelled") && order.table_id.HasValue)
            {
                var table = await _context.DiningTables.FindAsync(order.table_id.Value);
                if (table != null)
                {
                    table.status = "Available";
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Order status updated", status = order.order_status });
        }
    }
}
