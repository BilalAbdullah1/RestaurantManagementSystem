using RMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Interfaces
{
    public interface INotificationRepository
    {
        Task<Notification> CreateNotificationAsync(Notification notification);
        Task<IEnumerable<Notification>> GetNotificationsForUserAsync(Guid userId, string roleName);
        Task<Notification?> GetNotificationByIdAsync(Guid id);
        Task MarkAsReadAsync(Guid id);
        Task MarkAllAsReadAsync(Guid userId, string roleName);
        Task<int> GetUnreadCountAsync(Guid userId, string roleName);
    }
}
