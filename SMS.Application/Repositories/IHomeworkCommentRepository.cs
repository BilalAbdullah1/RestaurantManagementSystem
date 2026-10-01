using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IHomeworkCommentRepository
    {
        Task<HomeworkComment?> GetByIdAsync(Guid id);
        Task<IEnumerable<HomeworkComment>> GetByHomeworkIdAsync(Guid tenantId, Guid homeworkId);
        Task AddAsync(HomeworkComment comment);
        void Delete(HomeworkComment comment);
        Task SaveChangesAsync();
    }
}
