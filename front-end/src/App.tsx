import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";

// Public & Layout Pages
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

// Lazy Loaded Restaurant Features
const Home = lazy(() => import("./features/Dashboard/Home"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));

// Core Restaurant Operations
const PosTerminal = lazy(() => import("./features/pos/PosTerminal"));
const TableManagement = lazy(() => import("./features/tables/TableManagement"));
const MenuCatalog = lazy(() => import("./features/menu/MenuCatalog"));
const KitchenDisplay = lazy(() => import("./features/kds/KitchenDisplay"));
const OrdersList = lazy(() => import("./features/orders/OrdersList"));
const ReservationsList = lazy(() => import("./features/reservations/ReservationsList"));
const CustomerDirectory = lazy(() => import("./features/customers/CustomerDirectory"));

// Restaurant Staff & HR / Payroll
const StaffDirectory = lazy(() => import("./features/hrPayroll/StaffDirectory"));
const StaffAttendance = lazy(() => import("./features/hrPayroll/StaffAttendance"));
const PayrollSlips = lazy(() => import("./features/hrPayroll/PayrollSlips"));
const StaffLeaveApplication = lazy(() => import("./features/hrPayroll/StaffLeaveApplication"));
const LeaveApprovals = lazy(() => import("./features/hrPayroll/LeaveApprovals"));
const StaffLoansManager = lazy(() => import("./features/hrPayroll/StaffLoansManager"));
const StaffAppraisalsManager = lazy(() => import("./features/hrPayroll/StaffAppraisalsManager"));
const StaffClearanceManager = lazy(() => import("./features/hrPayroll/StaffClearanceManager"));

// Restaurant Inventory & Supplies
const StockCatalog = lazy(() => import("./features/inventory/StockCatalog"));
const StockLedger = lazy(() => import("./features/inventory/StockLedger"));
const ExpenseLogs = lazy(() => import("./features/inventory/ExpenseLogs"));

// Finance & Accounting
const ChartOfAccountsManager = lazy(() => import("./features/finance/ChartOfAccountsManager"));
const GeneralLedger = lazy(() => import("./features/finance/GeneralLedger"));
const FinancialAuditLogsManager = lazy(() => import("./features/finance/FinancialAuditLogsManager"));
const RestaurantExpensesTracker = lazy(() => import("./features/finance/RestaurantExpensesTracker"));
const SalarySlipsManager = lazy(() => import("./features/finance/SalarySlipsManager"));

// Restaurant Reports
const ReportsCenter = lazy(() => import("./features/reports/ReportsCenter"));
const ProfitLossReport = lazy(() => import("./features/reports/ProfitLossReport"));
const DailyCollectionReport = lazy(() => import("./features/reports/DailyCollectionReport"));
const BalanceSheetReport = lazy(() => import("./features/reports/BalanceSheetReport"));
const TrialBalanceReport = lazy(() => import("./features/reports/TrialBalanceReport"));
const StaffPayrollReport = lazy(() => import("./features/reports/StaffPayrollReport"));

// Settings & Security
const Tenants = lazy(() => import("./features/settings/Tenants"));
const UserManagement = lazy(() => import("./features/settings/UserManagement"));
const PermissionsMatrixManager = lazy(() => import("./features/settings/PermissionsMatrixManager"));
const BiometricDevicesManager = lazy(() => import("./features/settings/BiometricDevicesManager"));
const Roles = lazy(() => import("./features/settings/Roles"));
const SystemAudits = lazy(() => import("./features/settings/SystemAudits"));
const SecuritySettings = lazy(() => import("./features/settings/SecuritySettings"));
const UserProfileHub = lazy(() => import("./features/profile/UserProfileHub"));

export default function App() {
  return (
    <Router>
      <TopProgressBar />
      <Toaster />
      <ScrollToTop />
      <Suspense fallback={<PageSkeletonLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />

          {/* PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Home />} />
              <Route path="/profile" element={<UserProfileHub />} />

              {/* Restaurant Core Operations */}
              <Route path="/pos" element={<PosTerminal />} />
              <Route path="/tables" element={<TableManagement />} />
              <Route path="/menu" element={<MenuCatalog />} />
              <Route path="/kds" element={<KitchenDisplay />} />
              <Route path="/orders" element={<OrdersList />} />
              <Route path="/reservations" element={<ReservationsList />} />
              <Route path="/customers" element={<CustomerDirectory />} />

              {/* Inventory & Food Stock */}
              <Route path="/StockCatalog" element={<StockCatalog />} />
              <Route path="/StockLedger" element={<StockLedger />} />
              <Route path="/ExpenseLogs" element={<ExpenseLogs />} />

              {/* Restaurant Staff & HR */}
              <Route path="/StaffDirectory" element={<StaffDirectory />} />
              <Route path="/StaffAttendance" element={<StaffAttendance />} />
              <Route path="/SalarySlipsManager" element={<SalarySlipsManager />} />
              <Route path="/PayrollSlips" element={<PayrollSlips />} />
              <Route path="/StaffLoans" element={<StaffLoansManager />} />
              <Route path="/StaffAppraisals" element={<StaffAppraisalsManager />} />
              <Route path="/StaffClearance" element={<StaffClearanceManager />} />
              <Route path="/LeaveApprovals" element={<LeaveApprovals />} />
              <Route path="/StaffLeaveApplication" element={<StaffLeaveApplication />} />

              {/* Financial Accounting */}
              <Route path="/expenses" element={<RestaurantExpensesTracker />} />
              <Route path="/restaurant-expenses" element={<RestaurantExpensesTracker />} />
              <Route path="/RestaurantExpensesTracker" element={<RestaurantExpensesTracker />} />
              <Route path="/SchoolExpensesTracker" element={<RestaurantExpensesTracker />} />
              <Route path="/ChartOfAccounts" element={<ChartOfAccountsManager />} />
              <Route path="/GeneralLedger" element={<GeneralLedger />} />
              <Route path="/FinancialAuditLogs" element={<FinancialAuditLogsManager />} />

              {/* Reports & Analytics */}
              <Route path="/ReportsCenter" element={<ReportsCenter />} />
              <Route path="/reports/daily-collection" element={<DailyCollectionReport />} />
              <Route path="/reports/profit-loss" element={<ProfitLossReport />} />
              <Route path="/reports/balance-sheet" element={<BalanceSheetReport />} />
              <Route path="/reports/trial-balance" element={<TrialBalanceReport />} />
              <Route path="/reports/staff-payroll" element={<StaffPayrollReport />} />

              {/* Settings */}
              <Route path="/Tenants" element={<Tenants />} />
              <Route path="/UserManagement" element={<UserManagement />} />
              <Route path="/PermissionsMatrix" element={<PermissionsMatrixManager />} />
              <Route path="/BiometricDevices" element={<BiometricDevicesManager />} />
              <Route path="/Roles" element={<Roles />} />
              <Route path="/SystemAudits" element={<SystemAudits />} />
              <Route path="/SecuritySettings" element={<SecuritySettings />} />
            </Route>
          </Route>

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}