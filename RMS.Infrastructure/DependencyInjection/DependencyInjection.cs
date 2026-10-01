using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RMS.Application.Interfaces;
using RMS.Application.Repositories;
using RMS.Infrastructure.Persistence;
using RMS.Infrastructure.Repositories;
using RMS.Infrastructure.Services;

namespace RMS.Infrastructure.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<IApplicationDbContext>(provider =>
                provider.GetRequiredService<ApplicationDbContext>());

            // Tenant, Security & Identity
            services.AddScoped<ITenantRepository, TenantRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();

            // Restaurant Staff & HR / Payroll
            services.AddScoped<IStaffRepository, StaffRepository>();
            services.AddScoped<IStaffAttendanceRepository, StaffAttendanceRepository>();
            services.AddScoped<ILeaveApplicationRepository, LeaveApplicationRepository>();

            // Inventory & Supplies
            services.AddScoped<IInventoryItemRepository, InventoryItemRepository>();
            services.AddScoped<IInventoryTransactionRepository, InventoryTransactionRepository>();

            // Accounting & Expenses
            services.AddScoped<IRestaurantExpenseRepository, RestaurantExpenseRepository>();
            services.AddScoped<IChartOfAccountRepository, ChartOfAccountRepository>();
            services.AddScoped<IFinanceReportRepository, FinanceReportRepository>();

            // System Services
            services.AddScoped<IHolidayRepository, HolidayRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<RMS.Application.Interfaces.INotificationService, RMS.Application.Services.NotificationService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IWhatsAppService, WhatsAppService>();
            services.AddHttpContextAccessor();
            services.AddScoped<ITenantProvider, TenantProvider>();
            services.AddScoped<IDashboardRepository, DashboardRepository>();

            services.AddScoped<IGlobalSearchService, GlobalSearchService>();
            services.AddScoped<IDataExportService, DataExportService>();

            return services;
        }
    }
}