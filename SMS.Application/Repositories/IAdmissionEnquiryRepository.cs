using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IAdmissionEnquiryRepository
    {
        Task<IEnumerable<object>> GetAllEnquiriesAsync(Guid tenantId);
        Task<AdmissionEnquiry> GetByIdAsync(Guid id);
        Task AddAsync(AdmissionEnquiry enquiry);
        void Update(AdmissionEnquiry enquiry);
        void Delete(AdmissionEnquiry enquiry);
        Task<bool> SaveChangesAsync();
    }
}