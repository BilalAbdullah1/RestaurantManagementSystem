using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Infrastructure.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffRepository _repository;
        private readonly IUserRepository _userRepository;
        public StaffController(IStaffRepository repository, IUserRepository userRepository)
        {
            _repository = repository;
            _userRepository = userRepository;
        }

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("staff.view")]
        public async Task<ActionResult<IEnumerable<StaffFormDto>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        [HasPermission("staff.view")]
        public async Task<ActionResult<StaffFormDto>> GetById(Guid id)
        {
            var staffMember = await _repository.GetByIdAsync(id);
            if (staffMember == null) return NotFound(new { message = "Staff record not found" });
            return Ok(staffMember);
        }

        [HttpPost]
        [HasPermission("staff.manage")]
        public async Task<ActionResult<StaffFormDto>> Create(StaffFormDto dto)
        {
            if (await _repository.ExistsCnicAsync(dto.tenant_id, dto.cnic))
            {
                return BadRequest(new { message = $"Staff registration failed. CNIC number '{dto.cnic}' is already registered within this school." });
            }

            var createdStaff = await _repository.CreateStaffWithUserAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdStaff.id }, createdStaff);
        }

        [HttpPut("{id}")]
        [HasPermission("staff.manage")]
        public async Task<IActionResult> Update(Guid id, StaffFormDto dto)
        {
            if (id != dto.id) return BadRequest(new { message = "Parameter configuration mismatch" });

            var record = await _repository.GetByIdAsync(id);
            if (record == null) return NotFound(new { message = "Staff target profile not found" });

            await _repository.UpdateStaffWithUserAsync(dto);
            return Ok(new { message = "Staff identity update deployed safely", data = dto });
        }

        [HttpDelete("{id}")]
        [HasPermission("staff.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null) return NotFound(new { message = "Staff profile not found" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Staff record completely removed from system database" });
        }

        [HttpPost("{id}/generate-account")]
        [HasPermission("staff.manage")]
        public async Task<IActionResult> GenerateAccount(Guid id)
        {
            var staffMember = await _repository.GetByIdAsync(id);
            if (staffMember == null) return NotFound(new { message = "Staff profile not found" });

            if (staffMember.user_id == null || staffMember.user_id == Guid.Empty)
            {
                return BadRequest(new { message = "Staff profile is not linked to a user account." });
            }

            var user = await _userRepository.GetByIdAsync(staffMember.user_id.Value);
            if (user == null) return NotFound(new { message = "Linked user account not found" });

            var defaultPassword = "Staff@" + DateTime.Now.Year.ToString();
            user.password_hash = PasswordHasher.HashPassword(defaultPassword);

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(new
            {
                message = "Account login generated successfully.",
                username = user.email,
                password = defaultPassword
            });
        }
    }
}