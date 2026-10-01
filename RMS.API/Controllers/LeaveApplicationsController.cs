using Microsoft.AspNetCore.Mvc;
using RMS.Application.DTOs;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveApplicationsController : ControllerBase
    {
        private readonly ILeaveApplicationRepository _repository;
        private readonly RMS.Application.Interfaces.INotificationService _notificationService;

        public LeaveApplicationsController(ILeaveApplicationRepository repository, RMS.Application.Interfaces.INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        [HttpPost]
        public async Task<IActionResult> ApplyForLeave([FromBody] CreateLeaveApplicationDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var leaveApp = new LeaveApplication
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                student_id = dto.student_id,
                staff_id = dto.staff_id,
                leave_type = dto.leave_type,
                start_date = dto.start_date,
                end_date = dto.end_date,
                reason = dto.reason,
                attachment_url = dto.attachment_url,
                status = "Pending",
                applied_on = DateTime.UtcNow
            };

            await _repository.AddAsync(leaveApp);  

            // Notify Admin about the new leave application
            await _notificationService.SendNotificationAsync(new RMS.Application.DTOs.CreateNotificationDto
            {
                Title = "New Leave Application",
                Message = $"A new {dto.leave_type} leave application has been submitted and is pending approval.",
                Type = "Leave",
                TargetRole = "Admin"
            });

            return Ok(leaveApp);
        }

        [HttpGet("tenant/{tenantId}/student/{studentId}")]
        public async Task<IActionResult> GetStudentLeaves(Guid tenantId, Guid studentId)
        {
            var leaves = await _repository.GetByStudentIdAsync(tenantId, studentId);
            return Ok(leaves);
        }

        [HttpGet("tenant/{tenantId}/staff/{staffId}")]
        public async Task<IActionResult> GetStaffLeaves(Guid tenantId, Guid staffId)
        {
            var leaves = await _repository.GetByStaffIdAsync(tenantId, staffId);
            return Ok(leaves);
        }

        [HttpGet("tenant/{tenantId}/pending")]
        public async Task<IActionResult> GetPendingLeaves(Guid tenantId)
        {
            var pending = await _repository.GetPendingByTenantIdAsync(tenantId);
            return Ok(pending);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLeaveStatusDto dto)
        {
            var leaveApp = await _repository.GetByIdAsync(id);
            if (leaveApp == null) return NotFound();

            leaveApp.status = dto.status;
            leaveApp.approver_id = dto.approver_id;
            leaveApp.approver_notes = dto.approver_notes;

            await _repository.UpdateAsync(leaveApp);

            // Notify the applicant about the status update
            Guid? targetUserId = leaveApp.staff_id ?? leaveApp.student_id;
            if (targetUserId.HasValue)
            {
                await _notificationService.SendNotificationAsync(new RMS.Application.DTOs.CreateNotificationDto
                {
                    Title = $"Leave Application {dto.status}",
                    Message = $"Your leave application has been {dto.status.ToLower()}.",
                    Type = "Leave",
                    TargetUserId = targetUserId
                });
            }

            return Ok(leaveApp);
        }
    }
}
