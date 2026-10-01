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
    public class AdmissionEnquiryRepository : IAdmissionEnquiryRepository
    {
        private readonly ApplicationDbContext _context;

        public AdmissionEnquiryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<object>> GetAllEnquiriesAsync(Guid tenantId)
        {
            return await (from e in _context.AdmissionEnquiries.AsNoTracking()
                          where e.tenant_id == tenantId
                          join c in _context.Classes.AsNoTracking() on e.class_id equals c.id into classGroup
                          from c in classGroup.DefaultIfEmpty()
                          orderby e.created_at descending
                          select new
                          {
                              id = e.id,
                              tenant_id = e.tenant_id,
                              child_name = e.child_name,
                              father_name = e.father_name,
                              phone_number = e.phone_number,
                              class_id = e.class_id,
                              class_name = c != null ? c.name : "Unassigned",
                              status = e.status,
                              remarks = e.remarks,
                              created_at = e.created_at
                          }).ToListAsync();
        }

        public async Task<AdmissionEnquiry> GetByIdAsync(Guid id)
        {
            return await _context.AdmissionEnquiries.FindAsync(id)!;
        }

        public async Task AddAsync(AdmissionEnquiry enquiry)
        {
            await _context.AdmissionEnquiries.AddAsync(enquiry);
        }

        public void Update(AdmissionEnquiry enquiry)
        {
            _context.AdmissionEnquiries.Update(enquiry);
        }

        public void Delete(AdmissionEnquiry enquiry)
        {
            _context.AdmissionEnquiries.Remove(enquiry);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}