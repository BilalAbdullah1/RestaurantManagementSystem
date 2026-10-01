using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class RestaurantExpenseRepository : IRestaurantExpenseRepository
    {
        private readonly ApplicationDbContext _context;

        public RestaurantExpenseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RestaurantExpense>> GetExpensesAsync(Guid tenantId, int? month, int? year)
        {
            var query = _context.RestaurantExpenses.Where(e => e.tenant_id == tenantId);

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

        public async Task<RestaurantExpense> GetByIdAsync(Guid id)
        {
            return (await _context.RestaurantExpenses.FindAsync(id))!;
        }

        public async Task AddAsync(RestaurantExpense expense)
        {
            await _context.RestaurantExpenses.AddAsync(expense);
        }

        public void Update(RestaurantExpense expense)
        {
            _context.RestaurantExpenses.Update(expense);
        }

        public void Delete(RestaurantExpense expense)
        {
            _context.RestaurantExpenses.Remove(expense);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
