using RMS.Application.DTOs;
using RMS.Application.Interfaces;
using RMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repository;
        private readonly INotificationDispatcher _dispatcher;

        public NotificationService(INotificationRepository repository, INotificationDispatcher dispatcher)
        {
            _repository = repository;
            _dispatcher = dispatcher;
        }

        public async Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(Guid userId, string roleName)
        {
            var notifications = await _repository.GetNotificationsForUserAsync(userId, roleName);
            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            });
        }

        public async Task<int> GetUnreadCountAsync(Guid userId, string roleName)
        {
            return await _repository.GetUnreadCountAsync(userId, roleName);
        }

        public async Task MarkAllAsReadAsync(Guid userId, string roleName)
        {
            await _repository.MarkAllAsReadAsync(userId, roleName);
        }

        public async Task MarkAsReadAsync(Guid notificationId)
        {
            await _repository.MarkAsReadAsync(notificationId);
        }

        public async Task SendNotificationAsync(CreateNotificationDto createDto)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                Title = createDto.Title,
                Message = createDto.Message,
                TargetUserId = createDto.TargetUserId,
                TargetRole = createDto.TargetRole,
                Type = createDto.Type,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _repository.CreateNotificationAsync(notification);

            var dto = new NotificationDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                IsRead = false,
                CreatedAt = notification.CreatedAt
            };

            if (notification.TargetUserId.HasValue)
            {
                await _dispatcher.DispatchToUserAsync(notification.TargetUserId.Value.ToString(), dto);
            }
            else if (!string.IsNullOrEmpty(notification.TargetRole))
            {
                await _dispatcher.DispatchToRoleAsync(notification.TargetRole, dto);
            }
            else
            {
                await _dispatcher.DispatchToAllAsync(dto);
            }
        }
    }
}
