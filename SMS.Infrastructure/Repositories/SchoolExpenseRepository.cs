using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class SchoolExpenseRepository : ISchoolExpenseRepository
    {
        private readonly ApplicationDbContext _context;

        public SchoolExpenseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SchoolExpense>> GetExpensesAsync(Guid tenantId, int? month, int? year)
        {
            var query = _context.SchoolExpenses.Where(e => e.tenant_id == tenantId);

            // Optional filters (for monthly reports)
            if (month.HasValue && month.Value > 0)
            {
                query = query.Where(e => e.expense_date.Month == month.Value);
            }
            if (year.HasValue && year.Value > 0)
            {
                query = query.Where(e => e.expense_date.Year == year.Value);
            }

            return await query.OrderByDescending(e => e.expense_date).ToListAsync();
        }

        public async Task<SchoolExpense> GetByIdAsync(Guid id)
        {
            return await _context.SchoolExpenses.FindAsync(id)!;
        }

        public async Task AddAsync(SchoolExpense expense)
        {
            await _context.SchoolExpenses.AddAsync(expense);
        }

        public void Update(SchoolExpense expense)
        {
            _context.SchoolExpenses.Update(expense);
        }

        public void Delete(SchoolExpense expense)
        {
            _context.SchoolExpenses.Remove(expense);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}