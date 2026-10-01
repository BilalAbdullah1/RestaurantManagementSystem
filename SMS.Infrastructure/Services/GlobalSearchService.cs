using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Interfaces;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Services
{
    public class GlobalSearchService : IGlobalSearchService
    {
        private readonly ApplicationDbContext _context;

        public GlobalSearchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GlobalSearchResultDto>> SearchAsync(Guid tenantId, string keyword)
        {
            var results = new List<GlobalSearchResultDto>();

            if (string.IsNullOrWhiteSpace(keyword) || keyword.Length < 2)
                return results;

            var lowerKeyword = keyword.ToLower();

            // 1. Search Menu Items
            var dishes = await _context.MenuItems
                .AsNoTracking()
                .Where(m => m.tenant_id == tenantId && m.name.ToLower().Contains(lowerKeyword))
                .Take(5)
                .ToListAsync();

            results.AddRange(dishes.Select(d => new GlobalSearchResultDto
            {
                Id = d.id,
                Title = d.name,
                Subtitle = $"Price: PKR {d.selling_price} | Prep: {d.preparation_time_minutes}m",
                Type = "Menu Dish",
                Url = "/menu"
            }));

            // 2. Search Orders
            var orders = await _context.Orders
                .AsNoTracking()
                .Where(o => o.tenant_id == tenantId && 
                            (o.order_number.ToLower().Contains(lowerKeyword) || 
                             o.customer_name.ToLower().Contains(lowerKeyword)))
                .Take(5)
                .ToListAsync();

            results.AddRange(orders.Select(o => new GlobalSearchResultDto
            {
                Id = o.id,
                Title = $"Order {o.order_number}",
                Subtitle = $"Guest: {o.customer_name} | PKR {o.total_amount}",
                Type = "Order Receipt",
                Url = "/orders"
            }));

            // 3. Search Staff
            var staffQuery = from s in _context.Staff.AsNoTracking()
                             join u in _context.Users.AsNoTracking() on s.user_id equals u.id
                             where s.tenant_id == tenantId && 
                                   (u.first_name.ToLower().Contains(lowerKeyword) || 
                                    u.last_name.ToLower().Contains(lowerKeyword) || 
                                    s.cnic.ToLower().Contains(lowerKeyword))
                             select new { s.id, u.first_name, u.last_name, s.cnic, s.designation };

            var staff = await staffQuery.Take(5).ToListAsync();

            results.AddRange(staff.Select(s => new GlobalSearchResultDto
            {
                Id = s.id,
                Title = $"{s.first_name} {s.last_name}",
                Subtitle = $"Role: {s.designation} | CNIC: {s.cnic}",
                Type = "Staff Member",
                Url = "/StaffDirectory"
            }));

            // 4. Search Customers
            var customers = await _context.Customers
                .AsNoTracking()
                .Where(c => c.tenant_id == tenantId && 
                            (c.name.ToLower().Contains(lowerKeyword) || 
                             c.phone.Contains(lowerKeyword)))
                .Take(5)
                .ToListAsync();

            results.AddRange(customers.Select(c => new GlobalSearchResultDto
            {
                Id = c.id,
                Title = c.name,
                Subtitle = $"Phone: {c.phone} | Points: {c.loyalty_points}",
                Type = "Customer",
                Url = "/customers"
            }));

            return results;
        }
    }
}
