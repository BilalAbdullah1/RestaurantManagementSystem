using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IHomeworkSubmissionRepository
    {
        Task<HomeworkSubmission?> GetByIdAsync(Guid id);
        Task<IEnumerable<HomeworkSubmission>> GetByHomeworkIdAsync(Guid tenantId, Guid homeworkId);
        Task<IEnumerable<HomeworkSubmission>> GetByStudentIdAsync(Guid tenantId, Guid studentId);
        Task<HomeworkSubmission?> GetByHomeworkAndStudentAsync(Guid tenantId, Guid homeworkId, Guid studentId);
        Task AddAsync(HomeworkSubmission submission);
        void Update(HomeworkSubmission submission);
        void Delete(HomeworkSubmission submission);
        Task SaveChangesAsync();
    }
}
