using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly ApplicationDbContext _context;
        public StaffRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<StaffFormDto>> GetByTenantAsync(Guid tenantId)
        {
            var query = from staff in _context.Staff
                        join user in _context.Users on staff.user_id equals user.id
                        where staff.tenant_id == tenantId
                        select new StaffFormDto
                        {
                            id = staff.id,
                            tenant_id = staff.tenant_id,
                            user_id = staff.user_id,
                            first_name = user.first_name,
                            last_name = user.last_name,
                            email = user.email,
                            phone = user.phone_number,
                            cnic = staff.cnic,
                            designation = staff.designation,
                            qualification = staff.qualification,
                            basic_salary = staff.basic_salary,
                            joining_date = staff.joining_date,
                            is_active = staff.is_active,
                            profile_picture_url = user.profile_picture_url
                        };
            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<StaffFormDto?> GetByIdAsync(Guid id)
        {
            var query = from staff in _context.Staff
                        join user in _context.Users on staff.user_id equals user.id
                        where staff.id == id
                        select new StaffFormDto
                        {
                            id = staff.id,
                            tenant_id = staff.tenant_id,
                            user_id = staff.user_id,
                            first_name = user.first_name,
                            last_name = user.last_name,
                            email = user.email,
                            phone = user.phone_number,
                            cnic = staff.cnic,
                            designation = staff.designation,
                            qualification = staff.qualification,
                            basic_salary = staff.basic_salary,
                            joining_date = staff.joining_date,
                            is_active = staff.is_active,
                            profile_picture_url = user.profile_picture_url
                        };
            return await query.AsNoTracking().FirstOrDefaultAsync();
        }

        public async Task<bool> ExistsCnicAsync(Guid tenantId, string cnic) =>
            await _context.Staff.AsNoTracking().AnyAsync(s => s.tenant_id == tenantId && s.cnic == cnic);

        public async Task<StaffFormDto> CreateStaffWithUserAsync(StaffFormDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Ensure we use the 'Staff' role, not whatever the frontend sent (which is usually the Admin's role due to a bug)
                var staffRole = await _context.Roles.FirstOrDefaultAsync(r => r.tenant_id == dto.tenant_id && r.name == "Staff");
                Guid targetRoleId = staffRole != null ? staffRole.id : dto.role_id;

                var user = new User
                {
                    id = Guid.NewGuid(),
                    tenant_id = dto.tenant_id,
                    role_id = targetRoleId, 
                    first_name = dto.first_name,
                    last_name = dto.last_name,
                    email = dto.email,
                    phone_number = dto.phone,
                    password_hash = "", 
                    is_active = dto.is_active,
                    profile_picture_url = dto.profile_picture_url,
                    created_at = DateTime.UtcNow
                };
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                var staff = new Staff
                {
                    id = Guid.NewGuid(),
                    tenant_id = dto.tenant_id,
                    user_id = user.id,
                    cnic = dto.cnic,
                    designation = dto.designation,
                    qualification = dto.qualification,
                    basic_salary = dto.basic_salary,
                    joining_date = dto.joining_date,
                    is_active = dto.is_active
                };
                await _context.Staff.AddAsync(staff);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                dto.id = staff.id;
                dto.user_id = user.id;
                return dto;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task UpdateStaffWithUserAsync(StaffFormDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var staff = await _context.Staff.FindAsync(dto.id);
                if (staff != null)
                {
                    staff.cnic = dto.cnic;
                    staff.designation = dto.designation;
                    staff.qualification = dto.qualification;
                    staff.basic_salary = dto.basic_salary;
                    staff.joining_date = dto.joining_date;
                    staff.is_active = dto.is_active;
                    _context.Staff.Update(staff);

                    var user = await _context.Users.FindAsync(staff.user_id);
                    if (user != null)
                    {
                        user.first_name = dto.first_name;
                        user.last_name = dto.last_name;
                        user.email = dto.email;
                        user.phone_number = dto.phone;
                        user.is_active = dto.is_active;
                        user.profile_picture_url = dto.profile_picture_url;
                        _context.Users.Update(user);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var staff = await _context.Staff.FindAsync(id);
                if (staff != null)
                {
                    var user = await _context.Users.FindAsync(staff.user_id);
                    _context.Staff.Remove(staff);
                    if (user != null)
                    {
                        _context.Users.Remove(user);
                    }
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}