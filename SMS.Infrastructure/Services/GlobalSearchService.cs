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

            // 1. Search Students
            var students = await _context.Students
                .AsNoTracking()
                .Where(s => s.tenant_id == tenantId && 
                            (s.first_name.ToLower().Contains(lowerKeyword) || 
                             s.last_name.ToLower().Contains(lowerKeyword) || 
                             s.admission_number.ToLower().Contains(lowerKeyword)))
                .Take(5)
                .ToListAsync();

            results.AddRange(students.Select(s => new GlobalSearchResultDto
            {
                Id = s.id,
                Title = $"{s.first_name} {s.last_name}",
                Subtitle = $"Reg No: {s.admission_number}",
                Type = "Student",
                Url = $"/students/{s.id}"
            }));

            // 2. Search Staff
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
                Subtitle = $"Desig: {s.designation} | CNIC: {s.cnic}",
                Type = "Staff",
                Url = $"/staff/{s.id}"
            }));

            // 3. Search Fee Challans (Invoices)
            var challans = await _context.FeeChallans
                .AsNoTracking()
                .Where(c => c.tenant_id == tenantId && 
                            c.challan_number.ToLower().Contains(lowerKeyword))
                .Take(5)
                .ToListAsync();

            results.AddRange(challans.Select(c => new GlobalSearchResultDto
            {
                Id = c.id,
                Title = $"Challan #{c.challan_number}",
                Subtitle = $"Amount: {c.total_amount}",
                Type = "Invoice",
                Url = $"/fees/challans/{c.id}"
            }));

            // 4. Search Library Books
            var books = await _context.LibraryBooks
                .AsNoTracking()
                .Where(b => b.tenant_id == tenantId && 
                            (b.title.ToLower().Contains(lowerKeyword) || 
                             b.author.ToLower().Contains(lowerKeyword) || 
                             b.isbn.ToLower().Contains(lowerKeyword)))
                .Take(5)
                .ToListAsync();

            results.AddRange(books.Select(b => new GlobalSearchResultDto
            {
                Id = b.id,
                Title = b.title,
                Subtitle = $"Author: {b.author}",
                Type = "Book",
                Url = $"/library/books" // Library page doesn't usually have details page, just goes to list
            }));

            return results;
        }
    }
}
