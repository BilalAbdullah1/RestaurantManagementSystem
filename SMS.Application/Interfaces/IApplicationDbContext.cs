using Microsoft.EntityFrameworkCore;
using SMS.Core.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Tenant> Tenants { get; }
        DbSet<Role> Roles { get; }
        DbSet<User> Users { get; }
        DbSet<RolePermission> RolePermissions { get; }
        DbSet<Student> Students { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<AcademicYear> AcademicYears { get; }
        DbSet<SchoolClass> Classes { get; }
        DbSet<Section> Sections { get; }
        DbSet<Subject> Subjects { get; }
        DbSet<ClassSubject> ClassSubjects { get; }
        DbSet<StudentEnrollment> StudentEnrollments { get; }
        DbSet<Staff> Staff { get; }
        DbSet<StudentAttendance> StudentAttendances { get; }
        DbSet<StudentSubjectAttendance> StudentSubjectAttendances { get; }
        DbSet<StaffAttendance> StaffAttendances { get; }
        DbSet<StudentBehaviorLog> StudentBehaviorLogs { get; }
        DbSet<SalarySlip> SalarySlips { get; }
        DbSet<StaffLoan> StaffLoans { get; }
        DbSet<StaffAppraisal> StaffAppraisals { get; }
        DbSet<StaffClearance> StaffClearances { get; }
        DbSet<Notice> Notices { get; }
        DbSet<PtmSlot> PtmSlots { get; }
        DbSet<HelpdeskTicket> HelpdeskTickets { get; }
        DbSet<FeedbackSuggestion> FeedbackSuggestions { get; }
        DbSet<EventCalendarItem> EventCalendarItems { get; }
        DbSet<StaffChatMessage> StaffChatMessages { get; }
        DbSet<FeeType> FeeTypes { get; }
        DbSet<FeeStructure> FeeStructures { get; }
        DbSet<FeeConcession> FeeConcessions { get; }
        DbSet<FeeChallan> FeeChallans { get; }
        DbSet<ChartOfAccount> ChartOfAccounts { get; }
        DbSet<AdmissionEnquiry> AdmissionEnquiries { get; }
        DbSet<AlumniProfile> AlumniProfiles { get; }
        DbSet<SchoolExpense> SchoolExpenses { get; }
        DbSet<ExamSetup> ExamSetups { get; }
        DbSet<GradingScale> GradingScales { get; }
        DbSet<ExamSchedule> ExamSchedules { get; }
        DbSet<ExamMark> ExamMarks { get; }
        DbSet<ExamResult> ExamResults { get; }
        DbSet<QuestionBank> QuestionBanks { get; }
        DbSet<OnlineExam> OnlineExams { get; }
        DbSet<OnlineExamQuestion> OnlineExamQuestions { get; }
        DbSet<StudentExamAttempt> StudentExamAttempts { get; }

        // Hostel Module
        DbSet<HostelRoom> HostelRooms { get; }
        DbSet<HostelAllocation> HostelAllocations { get; }

        // Transport Module
        DbSet<TransportVehicle> TransportVehicles { get; }
        DbSet<TransportRoute> TransportRoutes { get; }
        DbSet<StudentTransport> StudentTransports { get; }

        // Inventory Module
        DbSet<InventoryItem> InventoryItems { get; }
        DbSet<InventoryTransaction> InventoryTransactions { get; }

        // Library Module
        DbSet<LibraryBook> LibraryBooks { get; }
        DbSet<BookIssuance> BookIssuances { get; }

        DbSet<Holiday> Holidays { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}