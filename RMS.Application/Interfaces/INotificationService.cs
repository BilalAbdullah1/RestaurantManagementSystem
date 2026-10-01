using RMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendNotificationAsync(CreateNotificationDto createDto);
        Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(Guid userId, string roleName);
        Task<int> GetUnreadCountAsync(Guid userId, string roleName);
        Task MarkAsReadAsync(Guid notificationId);
        Task MarkAllAsReadAsync(Guid userId, string roleName);
    }
}
