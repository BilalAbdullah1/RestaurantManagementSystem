using RMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Repositories
{
    public interface IRestaurantExpenseRepository
    {
        Task<IEnumerable<RestaurantExpense>> GetExpensesAsync(Guid tenantId, int? month, int? year);
        Task<RestaurantExpense> GetByIdAsync(Guid id);
        Task AddAsync(RestaurantExpense expense);
        void Update(RestaurantExpense expense);
        void Delete(RestaurantExpense expense);
        Task<bool> SaveChangesAsync();
    }
}
