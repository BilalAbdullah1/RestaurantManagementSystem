using RMS.Application.DTOs;
using System.Threading.Tasks;

namespace RMS.Application.Interfaces
{
    public interface INotificationDispatcher
    {
        Task DispatchToUserAsync(string userId, NotificationDto notification);
        Task DispatchToRoleAsync(string roleName, NotificationDto notification);
        Task DispatchToAllAsync(NotificationDto notification);
    }
}
