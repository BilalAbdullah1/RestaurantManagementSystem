
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SMS.Application.Interfaces;
using SMS.Application.Repositories;
using SMS.Infrastructure.Persistence;
using SMS.Infrastructure.Repositories;
using SMS.Infrastructure.Services;

namespace SMS.Infrastructure.DependencyInjection
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<IApplicationDbContext>(provider =>
                provider.GetRequiredService<ApplicationDbContext>());

            services.AddScoped<IStudentRepository, StudentRepository>();
            services.AddScoped<ITenantRepository, TenantRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPermissionRepository, PermissionRepository>();
            services.AddScoped<IAcademicYearRepository, AcademicYearRepository>();
            services.AddScoped<IClassRepository, ClassRepository>();
            services.AddScoped<ISectionRepository, SectionRepository>();
            services.AddScoped<ISubjectRepository, SubjectRepository>();
            services.AddScoped<IClassSubjectRepository, ClassSubjectRepository>();
            services.AddScoped<IStudentEnrollmentRepository, StudentEnrollmentRepository>();
            services.AddScoped<IStaffRepository, StaffRepository>();
            services.AddScoped<IStudentAttendanceRepository, StudentAttendanceRepository>();
            services.AddScoped<IStaffAttendanceRepository, StaffAttendanceRepository>();
            services.AddScoped<IStudentBehaviorLogRepository, StudentBehaviorLogRepository>();
            services.AddScoped<ISalarySlipRepository, SalarySlipRepository>();
            services.AddScoped<IFeeTypeRepository, FeeTypeRepository>(); 
            services.AddScoped<IFeeStructureRepository, FeeStructureRepository>();
            services.AddScoped<IFeeConcessionRepository, FeeConcessionRepository>();
            services.AddScoped<IFeeChallanRepository, FeeChallanRepository>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IWhatsAppService, WhatsAppService>();
            services.AddHttpContextAccessor();
            services.AddScoped<ITenantProvider, TenantProvider>();
            services.AddScoped<IAdmissionEnquiryRepository, AdmissionEnquiryRepository>();
            services.AddScoped<IAlumniProfileRepository, AlumniProfileRepository>();
            services.AddScoped<IStudentMedicalRepository, StudentMedicalRepository>();
            services.AddScoped<ISchoolExpenseRepository, SchoolExpenseRepository>();
            services.AddScoped<IExamSetupRepository, ExamSetupRepository>();
            services.AddScoped<IGradingScaleRepository, GradingScaleRepository>();
            services.AddScoped<IExamScheduleRepository, ExamScheduleRepository>();
            services.AddScoped<ITimetablePeriodRepository, TimetablePeriodRepository>();
            services.AddScoped<ITimetableProxyRepository, TimetableProxyRepository>();
            services.AddScoped<IExamMarkRepository, ExamMarkRepository>();
            services.AddScoped<IExamResultRepository, ExamResultRepository>();

            // Homework & LMS Modules
            services.AddScoped<IHomeworkRepository, HomeworkRepository>();
            services.AddScoped<IHomeworkSubmissionRepository, HomeworkSubmissionRepository>();
            services.AddScoped<IHomeworkCommentRepository, HomeworkCommentRepository>();
            services.AddScoped<ILeaveApplicationRepository, LeaveApplicationRepository>();
            services.AddScoped<INoticeRepository, NoticeRepository>();
            services.AddScoped<IHolidayRepository, HolidayRepository>();

            // Hostel Module
            services.AddScoped<IHostelRoomRepository, HostelRoomRepository>();
            services.AddScoped<IHostelAllocationRepository, HostelAllocationRepository>();

            // Transport Module
            services.AddScoped<ITransportVehicleRepository, TransportVehicleRepository>();
            services.AddScoped<ITransportRouteRepository, TransportRouteRepository>();
            services.AddScoped<IStudentTransportRepository, StudentTransportRepository>();

            // Inventory Module
            services.AddScoped<IInventoryItemRepository, InventoryItemRepository>();
            services.AddScoped<IInventoryTransactionRepository, InventoryTransactionRepository>();

            // Library Module
            services.AddScoped<ILibraryBookRepository, LibraryBookRepository>();
            services.AddScoped<IBookIssuanceRepository, BookIssuanceRepository>(); 

            services.AddScoped<IDashboardRepository, DashboardRepository>();

            // Parent Portal Module
            services.AddScoped<IParentPortalRepository, ParentPortalRepository>();

            // Finance Reports & Accounts
            services.AddScoped<IFinanceReportRepository, FinanceReportRepository>();
            services.AddScoped<IChartOfAccountRepository, ChartOfAccountRepository>();

            // Notifications
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<SMS.Application.Interfaces.INotificationService, SMS.Application.Services.NotificationService>();
            services.AddScoped<IGlobalSearchService, GlobalSearchService>();
            services.AddScoped<IDataExportService, DataExportService>();
            services.AddHostedService<DatabaseBackupService>();
            services.AddHostedService<AttendanceAlertService>();

            // Front Office Module
            services.AddScoped<IVisitorRepository, VisitorRepository>();

            return services;
        }
    }
}