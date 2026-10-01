using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using SMS.Core.Interfaces;
using SMS.Infrastructure.Services;
using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        private readonly ITenantProvider _tenantProvider;
        private readonly Microsoft.AspNetCore.Http.IHttpContextAccessor _httpContextAccessor;
        public Guid TenantId { get; }

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options, 
            ITenantProvider tenantProvider,
            Microsoft.AspNetCore.Http.IHttpContextAccessor httpContextAccessor) : base(options)
        {
            _tenantProvider = tenantProvider;
            _httpContextAccessor = httpContextAccessor;
            TenantId = _tenantProvider.GetTenantId();
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }
        
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Tenant> Tenants { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<AcademicYear> AcademicYears { get; set; }
        public DbSet<SchoolClass> Classes { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<ClassSubject> ClassSubjects { get; set; }
        public DbSet<StudentEnrollment> StudentEnrollments { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<StudentAttendance> StudentAttendances { get; set; }
        public DbSet<StudentSubjectAttendance> StudentSubjectAttendances { get; set; }
        public DbSet<StaffAttendance> StaffAttendances { get; set; }
        public DbSet<StudentBehaviorLog> StudentBehaviorLogs { get; set; }
        public DbSet<SalarySlip> SalarySlips { get; set; }
        public DbSet<StaffLoan> StaffLoans { get; set; }
        public DbSet<StaffAppraisal> StaffAppraisals { get; set; }
        public DbSet<StaffClearance> StaffClearances { get; set; }
        public DbSet<Notice> Notices { get; set; }
        public DbSet<PtmSlot> PtmSlots { get; set; }
        public DbSet<HelpdeskTicket> HelpdeskTickets { get; set; }
        public DbSet<FeedbackSuggestion> FeedbackSuggestions { get; set; }
        public DbSet<EventCalendarItem> EventCalendarItems { get; set; }
        public DbSet<StaffChatMessage> StaffChatMessages { get; set; }
        public DbSet<FeeType> FeeTypes { get; set; }
        public DbSet<FeeStructure> FeeStructures { get; set; }
        public DbSet<FeeConcession> FeeConcessions { get; set; }
        public DbSet<FeeChallan> FeeChallans { get; set; }
        public DbSet<FeeChallanDetail> FeeChallanDetails { get; set; }
        public DbSet<FeePayment> FeePayments { get; set; }
        public DbSet<ChartOfAccount> ChartOfAccounts { get; set; }
        public DbSet<AdmissionEnquiry> AdmissionEnquiries { get; set; }
        public DbSet<AlumniProfile> AlumniProfiles { get; set; }
        public DbSet<StudentMedicalRecord> StudentMedicalRecords { get; set; }
        public DbSet<StudentSubject> StudentSubjects { get; set; }
        public DbSet<LessonPlan> LessonPlans { get; set; }
        public DbSet<StudyMaterial> StudyMaterials { get; set; }
        public DbSet<LiveClass> LiveClasses { get; set; }
        public DbSet<StudentDiary> StudentDiaries { get; set; }
        public DbSet<HousePointLog> HousePointLogs { get; set; }
        public DbSet<SchoolExpense> SchoolExpenses { get; set; }
        public DbSet<ExamSetup> ExamSetups { get; set; }
        public DbSet<GradingScale> GradingScales { get; set; }
        public DbSet<ExamSchedule> ExamSchedules { get; set; }
        public DbSet<TimetablePeriod> TimetablePeriods { get; set; } = null!;
        public DbSet<TimetableProxyAllocation> TimetableProxyAllocations { get; set; } = null!;
        public DbSet<ExamMark> ExamMarks { get; set; }
        public DbSet<ExamResult> ExamResults { get; set; }
        public DbSet<QuestionBank> QuestionBanks { get; set; }
        public DbSet<OnlineExam> OnlineExams { get; set; }
        public DbSet<OnlineExamQuestion> OnlineExamQuestions { get; set; }
        public DbSet<StudentExamAttempt> StudentExamAttempts { get; set; }
        
        // LMS / Homework Module
        public DbSet<Homework> Homeworks { get; set; }
        public DbSet<HomeworkSubmission> HomeworkSubmissions { get; set; }
        public DbSet<HomeworkComment> HomeworkComments { get; set; }
        public DbSet<LeaveApplication> LeaveApplications { get; set; }

        // Hostel Module
        public DbSet<HostelRoom> HostelRooms { get; set; }
        public DbSet<HostelAllocation> HostelAllocations { get; set; }

        // Transport Module
        public DbSet<TransportVehicle> TransportVehicles { get; set; }
        public DbSet<TransportRoute> TransportRoutes { get; set; }
        public DbSet<StudentTransport> StudentTransports { get; set; }

        // Inventory Module
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }

        // Library Module
        public DbSet<LibraryBook> LibraryBooks { get; set; }
        public DbSet<BookIssuance> BookIssuances { get; set; }

        // Notifications
        public DbSet<SMS.Domain.Common.Notification> Notifications { get; set; }

        public DbSet<Holiday> Holidays { get; set; }

        // Front Office Module
        public DbSet<Visitor> Visitors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Composite Key for RolePermission
            modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.role_id, rp.permission_id });

            // Dynamic Loop for Multi-Tenancy Filter & DateTime UTC Conversion
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // 1. Multi-Tenant Global Query Filter Setup
                if (typeof(IMustHaveTenant).IsAssignableFrom(entityType.ClrType))
                {
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var tenantProp = Expression.Property(parameter, "tenant_id");
                    var currentTenantProp = Expression.Property(Expression.Constant(this), nameof(TenantId));
                    var emptyGuidConst = Expression.Constant(Guid.Empty);

                    var isTenantEmpty = Expression.Equal(currentTenantProp, emptyGuidConst);
                    var isMatchingTenant = Expression.Equal(tenantProp, currentTenantProp);
                    var combinedBody = Expression.OrElse(isTenantEmpty, isMatchingTenant);
                    var lambda = Expression.Lambda(combinedBody, parameter);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }

                // 2. DateTime UTC Value Converter (Using standard .HasConversion)
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        modelBuilder.Entity(entityType.ClrType)
                                    .Property(property.Name)
                                    .HasConversion(new ValueConverter<DateTime, DateTime>(
                                        v => v.Kind == DateTimeKind.Utc ? v : DateTime.SpecifyKind(v, DateTimeKind.Utc),
                                        v => v
                                    ));
                    }
                }
            }

            // Configure Many-to-Many Join Table Relationships
            modelBuilder.Entity<RolePermission>()
                .HasOne<Role>()
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.role_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne<Permission>()
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.permission_id)
                .OnDelete(DeleteBehavior.Cascade);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var auditEntries = new System.Collections.Generic.List<AuditLog>();
            var userIdStr = _httpContextAccessor?.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = Guid.TryParse(userIdStr, out var uid) ? uid : null;
            var ipAddress = _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString();

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                    continue;

                if (entry.Entity is IMustHaveTenant tenantEntity && entry.State == EntityState.Added)
                {
                    if (tenantEntity.tenant_id == Guid.Empty && TenantId != Guid.Empty)
                    {
                        tenantEntity.tenant_id = TenantId;
                    }
                }

                var auditEntry = new AuditLog
                {
                    id = Guid.NewGuid(),
                    table_name = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                    action = entry.State.ToString(),
                    user_id = userId,
                    ip_address = ipAddress,
                    tenant_id = TenantId,
                    created_at = DateTimeOffset.UtcNow
                };

                var oldValues = new System.Collections.Generic.Dictionary<string, object>();
                var newValues = new System.Collections.Generic.Dictionary<string, object>();

                foreach (var property in entry.Properties)
                {
                    if (property.IsTemporary) continue;
                    
                    string propertyName = property.Metadata.Name;
                    
                    if (property.Metadata.IsPrimaryKey())
                    {
                        auditEntry.record_id = property.CurrentValue?.ToString() ?? string.Empty;
                    }

                    switch (entry.State)
                    {
                        case EntityState.Added:
                            newValues[propertyName] = property.CurrentValue;
                            break;

                        case EntityState.Deleted:
                            oldValues[propertyName] = property.OriginalValue;
                            break;

                        case EntityState.Modified:
                            if (property.IsModified)
                            {
                                oldValues[propertyName] = property.OriginalValue;
                                newValues[propertyName] = property.CurrentValue;
                            }
                            break;
                    }
                }

                if (oldValues.Count > 0)
                    auditEntry.old_values = System.Text.Json.JsonSerializer.Serialize(oldValues);
                
                if (newValues.Count > 0)
                    auditEntry.new_values = System.Text.Json.JsonSerializer.Serialize(newValues);

                auditEntries.Add(auditEntry);
            }

            foreach (var auditEntry in auditEntries)
            {
                AuditLogs.Add(auditEntry);
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}