using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ISchoolExpenseRepository
    {
        Task<IEnumerable<SchoolExpense>> GetExpensesAsync(Guid tenantId, int? month, int? year);
        Task<SchoolExpense> GetByIdAsync(Guid id);
        Task AddAsync(SchoolExpense expense);
        void Update(SchoolExpense expense);
        void Delete(SchoolExpense expense);
        Task<bool> SaveChangesAsync();
    }
}