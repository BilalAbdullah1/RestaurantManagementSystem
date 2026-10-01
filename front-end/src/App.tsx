import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

// Public & Layout Pages (Synchronous for instant core startup)
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";

// Utilities/Components
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./utils/ProtectedRoute";
import RoleProtectedRoute from "./utils/RoleProtectedRoute";
import { Toaster } from "./components/ui/Toast";
import TopProgressBar from "./components/common/TopProgressBar";
import PageSkeletonLoader from "./components/common/PageSkeletonLoader";
import { activeClientConfig, isModuleEnabled } from "./config/clientConfig";

// Lazy Loaded Features
const Home = lazy(() => import("./features/Dashboard/Home"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const PublicAdmissionPortal = lazy(() => import("./features/student-attendance/PublicAdmissionPortal"));

// Academics Module
const AcademicYears = lazy(() => import("./features/academics/AcademicYears"));
const Classes = lazy(() => import("./features/academics/Classes"));
const Sections = lazy(() => import("./features/academics/Sections"));
const Subjects = lazy(() => import("./features/academics/Subjects"));
const Timetable = lazy(() => import("./features/academics/Timetable"));
const ClassSubject = lazy(() => import("./features/academics/ClassSubject"));
const TeacherTimetable = lazy(() => import("./features/academics/TeacherTimetable"));
const SubstituteManagement = lazy(() => import("./features/academics/SubstituteManagement"));
const LessonPlanning = lazy(() => import("./features/academics/LessonPlanning"));
const StudyMaterialRepository = lazy(() => import("./features/academics/StudyMaterialRepository"));
const LiveClassesManager = lazy(() => import("./features/academics/LiveClassesManager"));
const StudentDiaryManager = lazy(() => import("./features/academics/StudentDiaryManager"));
const HouseSystemDashboard = lazy(() => import("./features/academics/HouseSystemDashboard"));

// Students & Attendance Module
const StudentDirectory = lazy(() => import("./features/students/StudentDirectory"));
const StudentPromotions = lazy(() => import("./features/students/StudentPromotions"));
const StudentEnrollments = lazy(() => import("./features/student-attendance/StudentEnrollments"));
const StudentAttendance = lazy(() => import("./features/student-attendance/StudentAttendance"));
const ProxyAttendance = lazy(() => import("./features/student-attendance/ProxyAttendance"));
const SubjectWiseAttendance = lazy(() => import("./features/student-attendance/SubjectWiseAttendance"));
const AdmissionEnquiries = lazy(() => import("./features/student-attendance/AdmissionEnquiries"));
const StudentBehaviorLogs = lazy(() => import("./features/students/StudentBehaviorLogs"));
const ParentDirectory = lazy(() => import("./features/parents/ParentDirectory"));
const AlumniDirectory = lazy(() => import("./features/students/AlumniDirectory"));
const StudentLeaveApplication = lazy(() => import("./features/students/StudentLeaveApplication"));

// Staff & HR / Payroll
const StaffDashboard = lazy(() => import("./features/hrPayroll/StaffDashboard"));
const StaffDirectory = lazy(() => import("./features/hrPayroll/StaffDirectory"));
const StaffAttendance = lazy(() => import("./features/hrPayroll/StaffAttendance"));
const PayrollSlips = lazy(() => import("./features/hrPayroll/PayrollSlips"));
const StaffLeaveApplication = lazy(() => import("./features/hrPayroll/StaffLeaveApplication"));
const LeaveApprovals = lazy(() => import("./features/hrPayroll/LeaveApprovals"));
const StaffLoansManager = lazy(() => import("./features/hrPayroll/StaffLoansManager"));
const StaffAppraisalsManager = lazy(() => import("./features/hrPayroll/StaffAppraisalsManager"));
const StaffClearanceManager = lazy(() => import("./features/hrPayroll/StaffClearanceManager"));

// Finance Module
const FeeSetup = lazy(() => import("./features/finance/FeeSetup"));
const FeeStructures = lazy(() => import("./features/finance/FeeStructures"));
const FeeConcessionsManager = lazy(() => import("./features/finance/FeeConcessionsManager"));
const FeeDefaultersManager = lazy(() => import("./features/finance/FeeDefaultersManager"));
const ChartOfAccountsManager = lazy(() => import("./features/finance/ChartOfAccountsManager"));
const GeneralLedger = lazy(() => import("./features/finance/GeneralLedger"));
const StudentWalletManager = lazy(() => import("./features/finance/StudentWalletManager"));
const FinancialAuditLogsManager = lazy(() => import("./features/finance/FinancialAuditLogsManager"));
const FeeChallans = lazy(() => import("./features/finance/FeeChallans"));
const SchoolExpensesTracker = lazy(() => import("./features/finance/SchoolExpensesTracker"));
const SalarySlipsManager = lazy(() => import("./features/finance/SalarySlipsManager"));

// Exams Module
const ExamSetups = lazy(() => import("./features/exams/ExamSetups"));
const GradingScales = lazy(() => import("./features/exams/GradingScales"));
const ExamSchedules = lazy(() => import("./features/exams/ExamSchedules"));
const MarksEntryDashboard = lazy(() => import("./features/exams/MarksEntryDashboard"));
const AdmitCardGenerator = lazy(() => import("./features/exams/AdmitCardGenerator"));
const QuestionBank = lazy(() => import("./features/exams/QuestionBank"));
const OnlineExams = lazy(() => import("./features/exams/OnlineExams"));
const StudentCBT = lazy(() => import("./features/exams/StudentCBT"));
const TakeOnlineExam = lazy(() => import("./features/exams/TakeOnlineExam"));

// LMS Module
const HomeworkManagement = lazy(() => import("./features/lms/HomeworkManagement"));
const HomeworkSubmissions = lazy(() => import("./features/lms/HomeworkSubmissions"));
const StudentHomeworkPortal = lazy(() => import("./features/lms/StudentHomeworkPortal"));

// Transport & Hostel Modules
const TransportSetup = lazy(() => import("./features/transport/TransportSetup"));
const TransportRoutes = lazy(() => import("./features/transport/TransportRoutes"));
const StudentTransport = lazy(() => import("./features/transport/StudentTransport"));
const HostelSetup = lazy(() => import("./features/hostel/HostelSetup"));
const HostelAllocations = lazy(() => import("./features/hostel/HostelAllocations"));

// Inventory & Library Modules
const StockCatalog = lazy(() => import("./features/inventory/StockCatalog"));
const StockLedger = lazy(() => import("./features/inventory/StockLedger"));
const ExpenseLogs = lazy(() => import("./features/inventory/ExpenseLogs"));
const BookCatalog = lazy(() => import("./features/library/BookCatalog"));
const IssueBooks = lazy(() => import("./features/library/IssueBooks"));
const LibraryFines = lazy(() => import("./features/library/LibraryFines"));

// Communication & Portal
const CommunicationBroadcaster = lazy(() => import("./features/communication/CommunicationBroadcaster"));
const DigitalNoticeBoard = lazy(() => import("./features/communication/DigitalNoticeBoard"));
const PtmScheduler = lazy(() => import("./features/communication/PtmScheduler"));
const HelpdeskTicketsManager = lazy(() => import("./features/communication/HelpdeskTicketsManager"));
const BirthdayWishesManager = lazy(() => import("./features/communication/BirthdayWishesManager"));
const FeedbackSuggestionsManager = lazy(() => import("./features/communication/FeedbackSuggestionsManager"));
const EventCalendarManager = lazy(() => import("./features/communication/EventCalendarManager"));
const StaffChatPlatform = lazy(() => import("./features/communication/StaffChatPlatform"));
const Noticeboard = lazy(() => import("./features/communications/Noticeboard"));
const ParentDashboard = lazy(() => import("./features/parent-portal/ParentDashboard"));
const ApplyLeave = lazy(() => import("./features/parent-portal/ApplyLeave"));
const FeePaymentHistory = lazy(() => import("./features/parent-portal/FeePaymentHistory"));
const StudentDashboard = lazy(() => import("./features/student-portal/StudentDashboard"));
const ParentPortalDashboard = lazy(() => import("./features/portals/ParentPortalDashboard"));

// Front Office Module
const VisitorsLog = lazy(() => import("./features/front-office/Visitors"));
const CertificatesManager = lazy(() => import("./features/front-office/Certificates"));
const NotificationsInbox = lazy(() => import("./features/front-office/Notifications"));
const PtmSlotsPage = lazy(() => import("./features/front-office/PtmSlots"));

// Settings & Security Module
const Tenants = lazy(() => import("./features/settings/Tenants"));
const UserManagement = lazy(() => import("./features/settings/UserManagement"));
const PermissionsMatrixManager = lazy(() => import("./features/settings/PermissionsMatrixManager"));
const BiometricDevicesManager = lazy(() => import("./features/settings/BiometricDevicesManager"));
const DataMigrationManager = lazy(() => import("./features/settings/DataMigrationManager"));
const DatabaseBackupManager = lazy(() => import("./features/settings/DatabaseBackupManager"));
const ExecutiveMasterDashboard = lazy(() => import("./features/settings/ExecutiveMasterDashboard"));
const Roles = lazy(() => import("./features/settings/Roles"));
const SystemAudits = lazy(() => import("./features/settings/SystemAudits"));
const SecuritySettings = lazy(() => import("./features/settings/SecuritySettings"));
const HolidayCalendar = lazy(() => import("./features/settings/HolidayCalendar"));
const UserProfileHub = lazy(() => import("./features/profile/UserProfileHub"));

// Reports Center & Individual Reports
const ReportsCenter = lazy(() => import("./features/reports/ReportsCenter"));
const BroadsheetReport = lazy(() => import("./features/reports/BroadsheetReport"));
const FeeChallanReport = lazy(() => import("./features/reports/FeeChallanReport"));
const SlcCertificateReport = lazy(() => import("./features/reports/SlcCertificateReport"));
const StaffPayrollReport = lazy(() => import("./features/reports/StaffPayrollReport"));
const StudentIdCardsReport = lazy(() => import("./features/reports/StudentIdCardsReport"));
const AttendanceReport = lazy(() => import("./features/reports/AttendanceReport"));
const FeeDefaultersReport = lazy(() => import("./features/reports/FeeDefaultersReport"));
const ProfitLossReport = lazy(() => import("./features/reports/ProfitLossReport"));
const DailyCollectionReport = lazy(() => import("./features/reports/DailyCollectionReport"));
const BalanceSheetReport = lazy(() => import("./features/reports/BalanceSheetReport"));
const TrialBalanceReport = lazy(() => import("./features/reports/TrialBalanceReport"));
const ExamReportCardsReport = lazy(() => import("./features/reports/ExamReportCardsReport"));
const StudentCertificatesReport = lazy(() => import("./features/reports/StudentCertificatesReport"));

const RootRedirect = () => {
  const roleName = localStorage.getItem("roleName");
  if (roleName === "Parent") {
    return <Navigate to="/parent-dashboard" replace />;
  }
  if (roleName === "Student") {
    return <Navigate to="/student-dashboard" replace />;
  }
  if (roleName === "Staff" || roleName === "Teacher") {
    return <Navigate to="/staff-dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Router>
      <TopProgressBar />
      <Toaster />
      <ScrollToTop />
      <Suspense fallback={<PageSkeletonLoader />}>
        <Routes>
          {/* PUBLIC ROUTES (No Login Required) */}
          <Route path="/signin" element={<SignIn />} />
          <Route 
            path="/signup" 
            element={activeClientConfig.allowPublicSignup ? <SignUp /> : <Navigate to="/signin" replace />} 
          />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/PublicAdmissionPortal/:tenantId" element={<PublicAdmissionPortal />} />
          <Route path="/PublicAdmissionPortal" element={<PublicAdmissionPortal />} />

          {/* PROTECTED ROUTES (Login Required) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>

              {/* ── All Authenticated Users ── */}
              <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Teacher", "Student", "Parent", "Staff"]} />}>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/dashboard" element={<Home />} />
                <Route path="/profile" element={<UserProfileHub />} />
                <Route path="/StudentHomeworkPortal" element={<StudentHomeworkPortal />} />
                <Route path="/StudentLeaveApplication" element={<StudentLeaveApplication />} />
                <Route path="/StaffLeaveApplication" element={<StaffLeaveApplication />} />
                <Route path="/Noticeboard" element={<Noticeboard />} />
                <Route path="/error-404" element={<NotFound />} />
              </Route>

              {/* ── Admin, Teacher & Staff Access ── */}
              <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Teacher", "Staff"]} />}>
                {/* Reports & Analytics Module */}
                <Route path="/ReportsCenter" element={<ReportsCenter />} />
                <Route path="/reports/broadsheet" element={<BroadsheetReport />} />
                <Route path="/reports/fee-voucher" element={<FeeChallanReport />} />
                <Route path="/reports/slc-certificate" element={<SlcCertificateReport />} />
                <Route path="/reports/staff-payroll" element={<StaffPayrollReport />} />
                <Route path="/reports/student-id-cards" element={<StudentIdCardsReport />} />
                <Route path="/reports/attendance" element={<AttendanceReport />} />
                <Route path="/reports/fee-defaulters" element={<FeeDefaultersReport />} />
                <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
                <Route path="/reports/daily-collection" element={<DailyCollectionReport />} />
                <Route path="/reports/balance-sheet" element={<BalanceSheetReport />} />
                <Route path="/reports/trial-balance" element={<TrialBalanceReport />} />
                <Route path="/reports/report-cards" element={<ExamReportCardsReport />} />
                <Route path="/reports/student-certificates" element={<StudentCertificatesReport />} />

                {/* Academics Module */}
                <Route path="/AcademicYears" element={<AcademicYears />} />
                <Route path="/Classes" element={<Classes />} />
                <Route path="/Sections" element={<Sections />} />
                <Route path="/Subjects" element={<Subjects />} />
                <Route path="/ClassSubject" element={<ClassSubject />} />
                <Route path="/Timetable" element={<Timetable />} />
                <Route path="/TeacherTimetable" element={<TeacherTimetable />} />
                <Route path="/SubstituteManagement" element={<SubstituteManagement />} />
                <Route path="/LessonPlanning" element={<LessonPlanning />} />
                <Route path="/StudyMaterialRepository" element={<StudyMaterialRepository />} />
                <Route path="/LiveClassesManager" element={<LiveClassesManager />} />
                <Route path="/StudentDiaryManager" element={<StudentDiaryManager />} />
                <Route path="/HouseSystemDashboard" element={<HouseSystemDashboard />} />

                {/* LMS Module */}
                <Route path="/HomeworkManagement" element={<HomeworkManagement />} />
                <Route path="/HomeworkSubmissions" element={<HomeworkSubmissions />} />

                {/* Students & Parents */}
                <Route path="/students" element={<StudentDirectory />} />
                <Route path="/parents" element={<ParentDirectory />} />
                <Route path="/StudentBehaviorLogs" element={<StudentBehaviorLogs />} />
                <Route path="/StudentEnrollments" element={<StudentEnrollments />} />
                <Route path="/StudentPromotions" element={<StudentPromotions />} />
                <Route path="/StudentAttendance" element={<StudentAttendance />} />
                <Route path="/ProxyAttendance" element={<ProxyAttendance />} />
                <Route path="/SubjectWiseAttendance" element={<SubjectWiseAttendance />} />
                <Route path="/AdmissionEnquiries" element={<AdmissionEnquiries />} />
                <Route path="/PublicAdmissionPortalDesk" element={<PublicAdmissionPortal />} />
                <Route path="/AlumniDirectory" element={<AlumniDirectory />} />
                
                {/* Exams */}
                <Route path="/ExamSetups" element={<ExamSetups />} />
                <Route path="/GradingScales" element={<GradingScales />} />
                <Route path="/ExamSchedules" element={<ExamSchedules />} />
                <Route path="/MarksEntryDashboard" element={<MarksEntryDashboard />} />
                <Route path="/AdmitCardGenerator" element={<AdmitCardGenerator />} />
                <Route path="/QuestionBank" element={<QuestionBank />} />
                <Route path="/OnlineExams" element={<OnlineExams />} />
                <Route path="/TakeOnlineExam" element={<TakeOnlineExam />} />

                {/* Staff / HR */}
                <Route path="/staff-dashboard" element={<StaffDashboard />} />
                <Route path="/StaffDirectory" element={<StaffDirectory />} />
                <Route path="/StaffAttendance" element={<StaffAttendance />} />
                <Route path="/PayrollSlips" element={<PayrollSlips />} />
                <Route path="/LeaveApprovals" element={<LeaveApprovals />} />
                <Route path="/StaffLoans" element={<StaffLoansManager />} />
                <Route path="/StaffAppraisals" element={<StaffAppraisalsManager />} />
                <Route path="/StaffClearance" element={<StaffClearanceManager />} />
                <Route path="/CommunicationBroadcaster" element={<CommunicationBroadcaster />} />
                <Route path="/DigitalNoticeBoard" element={<DigitalNoticeBoard />} />
                <Route path="/PtmScheduler" element={<PtmScheduler />} />
                <Route path="/HelpdeskTickets" element={<HelpdeskTicketsManager />} />
                <Route path="/BirthdayWishes" element={<BirthdayWishesManager />} />
                <Route path="/FeedbackSuggestions" element={<FeedbackSuggestionsManager />} />
                <Route path="/EventCalendar" element={<EventCalendarManager />} />
                <Route path="/StaffChat" element={<StaffChatPlatform />} />

                {/* Finance */}
                <Route path="/FeeSetup" element={<FeeSetup />} />
                <Route path="/FeeStructures" element={<FeeStructures />} />
                <Route path="/FeeConcessions" element={<FeeConcessionsManager />} />
                <Route path="/FeeChallans" element={<FeeChallans />} />
                <Route path="/FeeDefaulters" element={<FeeDefaultersManager />} />
                <Route path="/SchoolExpensesTracker" element={<SchoolExpensesTracker />} />
                <Route path="/ChartOfAccounts" element={<ChartOfAccountsManager />} />
                <Route path="/GeneralLedger" element={<GeneralLedger />} />
                <Route path="/SalarySlipsManager" element={<SalarySlipsManager />} />
                <Route path="/StudentWallets" element={<StudentWalletManager />} />
                <Route path="/FinancialAuditLogs" element={<FinancialAuditLogsManager />} />

                {/* Settings */}
                <Route path="/Tenants" element={activeClientConfig.lockToSingleSchool ? <Navigate to="/" replace /> : <Tenants />} />
                <Route path="/UserManagement" element={<UserManagement />} />
                <Route path="/PermissionsMatrix" element={<PermissionsMatrixManager />} />
                <Route path="/BiometricDevices" element={<BiometricDevicesManager />} />
                <Route path="/DataMigration" element={<DataMigrationManager />} />
                <Route path="/DatabaseBackup" element={activeClientConfig.lockToSingleSchool ? <Navigate to="/" replace /> : <DatabaseBackupManager />} />
                <Route path="/ExecutiveMasterDashboard" element={activeClientConfig.lockToSingleSchool ? <Navigate to="/" replace /> : <ExecutiveMasterDashboard />} />
                <Route path="/ParentPortal" element={<ParentPortalDashboard />} />
                <Route path="/Roles" element={<Roles />} />
                <Route path="/SystemAudits" element={<SystemAudits />} />
                <Route path="/SecuritySettings" element={<SecuritySettings />} />
                <Route path="/HolidayCalendar" element={<HolidayCalendar />} />

                {/* Front Office Module */}
                <Route path="/VisitorsLog" element={isModuleEnabled("frontoffice") ? <VisitorsLog /> : <Navigate to="/" replace />} />
                <Route path="/CertificatesManager" element={isModuleEnabled("frontoffice") ? <CertificatesManager /> : <Navigate to="/" replace />} />
                <Route path="/NotificationsInbox" element={isModuleEnabled("frontoffice") ? <NotificationsInbox /> : <Navigate to="/" replace />} />
                <Route path="/PtmSlots" element={isModuleEnabled("frontoffice") ? <PtmSlotsPage /> : <Navigate to="/" replace />} />

                {/* Other Modules */}
                <Route path="/HostelSetup" element={isModuleEnabled("hostels") ? <HostelSetup /> : <Navigate to="/" replace />} />
                <Route path="/HostelAllocations" element={isModuleEnabled("hostels") ? <HostelAllocations /> : <Navigate to="/" replace />} />
                <Route path="/TransportSetup" element={isModuleEnabled("transport") ? <TransportSetup /> : <Navigate to="/" replace />} />
                <Route path="/TransportRoutes" element={isModuleEnabled("transport") ? <TransportRoutes /> : <Navigate to="/" replace />} />
                <Route path="/StudentTransport" element={isModuleEnabled("transport") ? <StudentTransport /> : <Navigate to="/" replace />} />
                <Route path="/StockCatalog" element={isModuleEnabled("inventory") ? <StockCatalog /> : <Navigate to="/" replace />} />
                <Route path="/StockLedger" element={isModuleEnabled("inventory") ? <StockLedger /> : <Navigate to="/" replace />} />
                <Route path="/ExpenseLogs" element={isModuleEnabled("inventory") ? <ExpenseLogs /> : <Navigate to="/" replace />} />
                <Route path="/BookCatalog" element={isModuleEnabled("library") ? <BookCatalog /> : <Navigate to="/" replace />} />
                <Route path="/IssueBooks" element={isModuleEnabled("library") ? <IssueBooks /> : <Navigate to="/" replace />} />
                <Route path="/LibraryFines" element={isModuleEnabled("library") ? <LibraryFines /> : <Navigate to="/" replace />} />
              </Route>

              {/* ── Parent Only ── */}
              <Route element={<RoleProtectedRoute allowedRoles={["Parent", "Admin", "Student"]} />}>
                <Route path="/parent-dashboard" element={<ParentDashboard />} />
                <Route path="/ApplyLeave" element={<ApplyLeave />} />
                <Route path="/FeePaymentHistory" element={<FeePaymentHistory />} />
              </Route>

              {/* ── Student & Admin Access ── */}
              <Route element={<RoleProtectedRoute allowedRoles={["Student", "Admin"]} />}>
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/StudentCBT" element={<StudentCBT />} />
              </Route>

            </Route>
          </Route>

          {/* Catch-all Route for 404 (Handles undefined URLs) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}