using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public CustomersController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var query = _context.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.name.Contains(search) || c.phone.Contains(search));
            }

            var customers = await query
                .OrderByDescending(c => c.created_at)
                .ToListAsync();

            return Ok(customers);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer model)
        {
            if (string.IsNullOrWhiteSpace(model.name) || string.IsNullOrWhiteSpace(model.phone))
                return BadRequest(new { message = "Customer name and phone are required" });

            model.id = Guid.NewGuid();
            model.created_at = DateTime.UtcNow;
            model.loyalty_points = 50; // Welcome points bonus

            _context.Customers.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Customer model)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return NotFound(new { message = "Customer not found" });

            customer.name = model.name;
            customer.phone = model.phone;
            customer.email = model.email;
            customer.address = model.address;

            await _context.SaveChangesAsync();
            return Ok(customer);
        }
    }
}
