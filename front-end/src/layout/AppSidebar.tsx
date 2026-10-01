import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { getFileBaseUrl } from "../utils/apiConfig";
import {
  Settings,
  UserCircle,
  LayoutDashboard,
  GraduationCap,
  Wallet,
  FileText,
  Users,
  BusFront,
  ChevronDownIcon,
  Building,
  Package,
  BookOpen,
  Megaphone,
  MessageSquare,
  DollarSign,
  ConciergeBell,
  Award,
  BellRing,
  CalendarCheck2,
  Receipt,
  IdCard,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Scale,
  UserCheck,
  Briefcase,
  Clock,
  CreditCard,
  FileSpreadsheet,
  Percent,
  Activity,
  Sparkles,
  BookMarked,
  Video,
  NotebookPen,
  CheckSquare,
  HelpCircle,
  Send,
  CalendarDays,
  Gift,
  Ticket,
  ShieldCheck,
  Database,
  Cpu,
  Lock,
  History,
  UserPlus,
  FileUp,
  UserCog,
  Layers,
  MapPin,
  BookCheck,
  UserX,
  FileBadge,
  LogOut,
  KeyRound
} from "lucide-react";
import { HorizontaLDots } from "../icons";
import { getUserRoleName } from "../utils/authUtils";
import api from "../utils/axiosConfig";
import { isModuleEnabled, activeClientConfig } from "../config/clientConfig";

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  moduleKey?: string;
  subItems?: { name: string; path: string; icon?: React.ReactNode; pro?: boolean; new?: boolean; allowedRoles?: string[] }[];
  allowedRoles?: string[]; // RBAC array
};

export function isRoleAllowed(allowedRoles?: string[], currentRole?: string): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!currentRole) return true;
  const normalizedCurrent = currentRole.toLowerCase().trim();

  if (normalizedCurrent.includes("admin")) {
    if (allowedRoles.some(r => r.toLowerCase().includes("admin"))) return true;
  }

  return allowedRoles.some(r => r.toLowerCase().trim() === normalizedCurrent);
}

// --- RESTAURANT MANAGEMENT NAVIGATION ---
export const navItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <UtensilsCrossed className="w-5 h-5 text-brand-500" />,
    name: "Point of Sale (POS)",
    path: "/pos",
  },
  {
    icon: <Building className="w-5 h-5 text-indigo-500" />,
    name: "Dining Tables & Floors",
    path: "/tables",
  },
  {
    icon: <Layers className="w-5 h-5 text-amber-500" />,
    name: "Menu & Food Catalog",
    path: "/menu",
  },
  {
    icon: <Flame className="w-5 h-5 text-rose-500" />,
    name: "Kitchen Display (KDS)",
    path: "/kds",
  },
  {
    icon: <Receipt className="w-5 h-5 text-emerald-500" />,
    name: "Orders & Receipts",
    path: "/orders",
  },
  {
    icon: <CalendarCheck2 className="w-5 h-5 text-purple-500" />,
    name: "Table Reservations",
    path: "/reservations",
  },
  {
    icon: <Users className="w-5 h-5 text-sky-500" />,
    name: "Customers & Loyalty",
    path: "/customers",
  },
  {
    icon: <Package className="w-5 h-5 text-teal-500" />,
    name: "Inventory & Stock",
    subItems: [
      { name: "Stock Catalog", path: "/StockCatalog", icon: <Package className="w-4 h-4" /> },
      { name: "Stock Ledger", path: "/StockLedger", icon: <FileSpreadsheet className="w-4 h-4" /> },
      { name: "Expense Logs", path: "/ExpenseLogs", icon: <DollarSign className="w-4 h-4" /> },
    ],
  },
  {
    icon: <Briefcase className="w-5 h-5 text-blue-500" />,
    name: "Restaurant Staff & HR",
    subItems: [
      { name: "Staff Directory", path: "/StaffDirectory", icon: <Users className="w-4 h-4" /> },
      { name: "Staff Attendance", path: "/StaffAttendance", icon: <CalendarCheck2 className="w-4 h-4" /> },
      { name: "Payroll Engine", path: "/SalarySlipsManager", icon: <DollarSign className="w-4 h-4" /> },
      { name: "Advance Loans", path: "/StaffLoans", icon: <Wallet className="w-4 h-4" /> },
      { name: "Performance Appraisals", path: "/StaffAppraisals", icon: <Award className="w-4 h-4" /> },
      { name: "Resignation & Clearance", path: "/StaffClearance", icon: <UserX className="w-4 h-4" /> },
      { name: "Leave Approvals", path: "/LeaveApprovals", icon: <CheckSquare className="w-4 h-4" /> },
      { name: "My Leaves", path: "/StaffLeaveApplication", icon: <Clock className="w-4 h-4" /> },
    ],
  },
  {
    icon: <DollarSign className="w-5 h-5 text-emerald-500" />,
    name: "Finance & Accounting",
    subItems: [
      { name: "Restaurant Expenses", path: "/expenses", icon: <DollarSign className="w-4 h-4" /> },
      { name: "Chart of Accounts", path: "/ChartOfAccounts", icon: <FileSpreadsheet className="w-4 h-4" /> },
      { name: "General Ledger", path: "/GeneralLedger", icon: <BookOpen className="w-4 h-4" /> },
      { name: "Financial Audit Trail", path: "/FinancialAuditLogs", icon: <Activity className="w-4 h-4" /> },
    ],
  },
  {
    icon: <FileText className="w-5 h-5 text-indigo-500" />,
    name: "Reports & Analytics",
    subItems: [
      { name: "Reports Hub", path: "/ReportsCenter", icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" /> },
      { name: "Daily Sales & Collections", path: "/reports/daily-collection", icon: <CalendarDays className="w-4 h-4 text-sky-500" /> },
      { name: "Profit & Loss Statement", path: "/reports/profit-loss", icon: <TrendingUp className="w-4 h-4 text-emerald-600" /> },
      { name: "Balance Sheet Statement", path: "/reports/balance-sheet", icon: <Scale className="w-4 h-4 text-indigo-600" /> },
      { name: "Trial Balance Statement", path: "/reports/trial-balance", icon: <BookOpen className="w-4 h-4 text-cyan-600" /> },
      { name: "Staff Payroll Summary", path: "/reports/staff-payroll", icon: <DollarSign className="w-4 h-4 text-purple-500" /> },
    ],
  },
];

// --- SETTINGS & AUTHENTICATION ---
export const othersItems: NavItem[] = [
  {
    icon: <Settings className="w-5 h-5" />,
    name: "System Settings",
    allowedRoles: ["Admin"],
    subItems: [
      { name: "Tenants (Campuses)", path: "/Tenants", icon: <Building className="w-4 h-4" /> },
      { name: "User Management", path: "/UserManagement", icon: <UserCog className="w-4 h-4" /> },
      { name: "Permissions Matrix (RBAC)", path: "/PermissionsMatrix", icon: <ShieldCheck className="w-4 h-4" /> },
      { name: "Biometric Hardware (IoT)", path: "/BiometricDevices", icon: <Cpu className="w-4 h-4" /> },
      { name: "Bulk CSV Data Importer", path: "/DataMigration", icon: <FileUp className="w-4 h-4" /> },
      { name: "Database Backup Scheduler", path: "/DatabaseBackup", icon: <Database className="w-4 h-4" /> },
      { name: "Executive Master Aggregator", path: "/ExecutiveMasterDashboard", icon: <Activity className="w-4 h-4" /> },
      { name: "Parent & Student Mobile Portal", path: "/ParentPortal", icon: <UserCircle className="w-4 h-4" /> },
      { name: "Roles & Permissions", path: "/Roles", icon: <ShieldCheck className="w-4 h-4" /> },
      { name: "Holiday Calendar", path: "/HolidayCalendar", icon: <Calendar className="w-4 h-4" /> },
      { name: "System Audits", path: "/SystemAudits", icon: <History className="w-4 h-4" /> },
      { name: "Security Settings", path: "/SecuritySettings", icon: <Lock className="w-4 h-4" /> },
    ],
  },
  {
    icon: <Lock className="w-5 h-5" />,
    name: "Authentication",
    allowedRoles: ["Admin"],
    subItems: [
      { name: "Sign In", path: "/signin", icon: <KeyRound className="w-4 h-4" /> },
      { name: "Sign Up", path: "/signup", icon: <UserPlus className="w-4 h-4" /> },
      { name: "Forgot Password", path: "/ForgotPassword", icon: <Lock className="w-4 h-4" /> },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const roleName = getUserRoleName() || localStorage.getItem("roleName") || "";

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [branding, setBranding] = useState<{ school_name?: string, logo_url?: string } | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [branding?.logo_url]);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('/Tenants/current-branding');
        if (res.data.is_custom) {
          setBranding(res.data);
        }
      } catch (err) {
        console.error("Failed to load branding:", err);
      }
    };
    fetchBranding();
  }, []);

  const isActive = useCallback(
    (path: string) => {
      if (path === "/" && (location.pathname === "/dashboard" || location.pathname === "/parent-dashboard" || location.pathname === "/student-dashboard" || location.pathname === "/")) {
        return true;
      }
      if (path === "/") return location.pathname === "/";
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    },
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav) => {
        if (isRoleAllowed(nav.allowedRoles, roleName) && isModuleEnabled(nav.moduleKey || nav.name) && nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isRoleAllowed(subItem.allowedRoles, roleName) && isActive(subItem.path)) {
              if (!submenuMatched) {
                setOpenSubmenu(nav.name);
                submenuMatched = true;
              }
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, roleName]);

  const handleSubmenuToggle = (navName: string) => {
    setOpenSubmenu((prev) => (prev === navName ? null : navName));
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-3">
      {items.filter((nav) => isRoleAllowed(nav.allowedRoles, roleName) && isModuleEnabled(nav.moduleKey || nav.name)).map((nav) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(nav.name)}
              className={`menu-item group ${openSubmenu === nav.name
                  ? "menu-item-active"
                  : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size ${openSubmenu === nav.name
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu === nav.name
                      ? "rotate-180 text-brand-500"
                      : "text-gray-400"
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {/* SUBMENU ITEMS WITH ICONS */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              className={`grid transition-all duration-300 ease-in-out ${openSubmenu === nav.name
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
                }`}
            >
              <div className="overflow-hidden">
                <ul className="mt-2 space-y-1 ml-9 border-l border-gray-200 dark:border-gray-800 pl-2 pb-1">
                  {nav.subItems
                    .filter((subItem: any) => {
                      if (!isRoleAllowed(subItem.allowedRoles, roleName)) return false;
                      if (activeClientConfig.lockToSingleSchool) {
                        if (subItem.path === "/Tenants" || subItem.path === "/DatabaseBackup" || subItem.path === "/ExecutiveMasterDashboard") {
                          return false;
                        }
                        if (subItem.path === "/signup" && !activeClientConfig.allowPublicSignup) {
                          return false;
                        }
                      }
                      return true;
                    })
                    .map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item text-sm flex items-center gap-2.5 ${isActive(subItem.path)
                              ? "menu-dropdown-item-active text-brand-600 font-bold"
                              : "menu-dropdown-item-inactive text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                          {subItem.icon && (
                            <span className="w-4 h-4 shrink-0 flex items-center justify-center text-current">
                              {subItem.icon}
                            </span>
                          )}
                          <span className="truncate">{subItem.name}</span>

                          {/* BADGES */}
                          <span className="flex items-center gap-1 ml-auto shrink-0">
                            {subItem.new && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                                NEW
                              </span>
                            )}
                            {subItem.pro && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 rounded-full">
                                PRO
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const getFullUrl = (url: string) => {
    return getFileBaseUrl(url);
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* LOGO AREA */}
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/" className="flex items-center gap-2">
          {!logoFailed && branding?.logo_url ? (
            <img 
              src={getFullUrl(branding.logo_url)} 
              alt="" 
              className="w-8 h-8 object-contain rounded-lg shrink-0" 
              onError={() => setLogoFailed(true)}
            />
          ) : branding?.school_name?.toLowerCase().includes('voke') ? (
            <img 
              src="/images/logo/vokelogo.jpg" 
              alt="Voke" 
              className="w-8 h-8 object-contain rounded-lg shadow-sm shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
              {branding?.school_name ? branding.school_name.charAt(0).toUpperCase() : activeClientConfig.branding.shortCode.slice(0, 2)}
            </div>
          )}

          {(isExpanded || isHovered || isMobileOpen) && (
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-1 break-all">
              {branding?.school_name || activeClientConfig.branding.restaurantName || activeClientConfig.branding.schoolName}
            </h1>
          )}
        </Link>
      </div>

      {/* NAVIGATION AREA */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar pb-8">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">

            {/* MAIN MENU */}
            <div>
              <h2
                className={`mb-3 text-[11px] font-bold uppercase tracking-wider flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Core Modules"
                ) : (
                  <HorizontaLDots className="size-5" />
                )}
              </h2>
              {renderMenuItems(
                navItems.filter((nav) => isRoleAllowed(nav.allowedRoles, roleName) && isModuleEnabled(nav.moduleKey || nav.name)),
                "main"
              )}
            </div>

            {/* OTHERS / SETTINGS MENU */}
            {othersItems.filter((nav) => isRoleAllowed(nav.allowedRoles, roleName) && isModuleEnabled(nav.moduleKey || nav.name)).length > 0 && (
              <div>
                <h2
                  className={`mb-3 text-[11px] font-bold uppercase tracking-wider flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Administration"
                  ) : (
                    <HorizontaLDots className="size-5" />
                  )}
                </h2>
                {renderMenuItems(
                  othersItems.filter((nav) => isRoleAllowed(nav.allowedRoles, roleName) && isModuleEnabled(nav.moduleKey || nav.name)),
                  "others"
                )}
              </div>
            )}

          </div>
        </nav>

        {/* SIDEBAR WIDGET */}
        {(isExpanded || isHovered || isMobileOpen) ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;