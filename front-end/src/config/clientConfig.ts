/**
 * Client Configuration Engine
 * 
 * Allows modular toggling of School Management System modules per client.
 * Disabling a module safely hides it from navigation and menus without
 * deleting or altering underlying codebase, making it easily re-enabled
 * or customized for future clients.
 */

export interface ClientModuleFlags {
  // Core Modules (Demanded by Client)
  dashboard: boolean;
  noticeBoard: boolean;
  reportsAndAnalytics: boolean;
  students: boolean;
  academics: boolean;
  lms: boolean;
  myPortal: boolean;
  hrPayroll: boolean;
  financeAndFees: boolean;
  communication: boolean;
  examinations: boolean;

  // Auxiliary Modules (Toggleable per Client)
  hostels: boolean;
  transport: boolean;
  inventory: boolean;
  library: boolean;
  frontOffice: boolean;

  // Administrative
  systemSettings: boolean;
  authentication: boolean;
}

export interface ClientBranding {
  schoolName: string;
  tagline: string;
  shortCode: string;
  currency: string;
}

export interface ClientConfig {
  branding: ClientBranding;
  targetTenantId?: string;
  lockToSingleSchool: boolean;
  allowPublicSignup: boolean;
  modules: ClientModuleFlags;
}

// ─── 1. DEMO PROFILE (VOKE Solutions Master Demo) ──────────────────────────
// Full 100+ screens, all 14 modules active, all campuses switchable, public signup enabled
export const DEMO_PROFILE: ClientConfig = {
  branding: {
    schoolName: "VOKE School Management System",
    tagline: "Enterprise Multi-Campus Educational Operating System",
    shortCode: "VOKE",
    currency: "PKR",
  },
  targetTenantId: undefined, // Allows picking any school/workspace
  lockToSingleSchool: false, // Dropdown visible, can switch to any campus!
  allowPublicSignup: true,   // Public registration open for demo
  modules: {
    dashboard: true,
    noticeBoard: true,
    reportsAndAnalytics: true,
    students: true,
    academics: true,
    lms: true,
    myPortal: true,
    hrPayroll: true,
    financeAndFees: true,
    communication: true,
    examinations: true,

    // Auxiliary Modules all ENABLED in Demo:
    hostels: true,
    transport: true,
    inventory: true,
    library: true,
    frontOffice: true,

    systemSettings: true,
    authentication: true,
  },
};

// ─── 2. HAPPY PALACE GROUP OF SCHOOL PROFILE (Client White-Labeled) ──────────
// 9 Core modules active, 5 auxiliary modules disabled, locked single school
export const HPGS_PROFILE: ClientConfig = {
  branding: {
    schoolName: "Happy Palace Group Of School",
    tagline: "Empowering Minds, Inspiring Futures",
    shortCode: "HPGS",
    currency: "PKR",
  },
  targetTenantId: "fd2e2634-28a1-4b7e-abd5-2d9c1cd85075", // Happy Palace Group Of School UUID
  lockToSingleSchool: true,
  allowPublicSignup: false,
  modules: {
    dashboard: true,
    noticeBoard: true,
    reportsAndAnalytics: true,
    students: true,
    academics: true,
    lms: true,
    myPortal: true,
    hrPayroll: true,
    financeAndFees: true,
    communication: true,
    examinations: true,

    // Excluded Modules for this Client:
    hostels: false,
    transport: false,
    inventory: false,
    library: false,
    frontOffice: false,

    systemSettings: true,
    authentication: true,
  },
};

// ─── 3. AL HIDAYAH ACADEMY PROFILE (Client White-Labeled) ────────────────────
// Core modules active, auxiliary modules toggleable, locked single school
export const ALHIDAYAH_PROFILE: ClientConfig = {
  branding: {
    schoolName: "Al Hidayah Academy",
    tagline: "Excellence in Knowledge & Character",
    shortCode: "AHA",
    currency: "PKR",
  },
  targetTenantId: undefined, // Dynamically matched via school_code ('AHA') or name from DB
  lockToSingleSchool: true,
  allowPublicSignup: false,
  modules: {
    dashboard: true,
    noticeBoard: true,
    reportsAndAnalytics: true,
    students: true,
    academics: true,
    lms: true,
    myPortal: true,
    hrPayroll: true,
    financeAndFees: true,
    communication: true,
    examinations: true,

    // Auxiliary Modules (toggleable per client request):
    hostels: false,
    transport: false,
    inventory: false,
    library: false,
    frontOffice: false,

    systemSettings: true,
    authentication: true,
  },
};

// ─── 4. DYNAMIC PROFILE RESOLVER ─────────────────────────────────────────────
// Automatically determines whether to run in DEMO mode or CLIENT mode
function resolveActiveConfig(): ClientConfig {
  // A. Priority 1: Environment variable in Vercel (.env or project settings)
  const envProfile = import.meta.env.VITE_CLIENT_PROFILE?.toLowerCase()?.trim();
  if (envProfile === "hpgs" || envProfile === "happypalace") {
    return HPGS_PROFILE;
  }
  if (envProfile === "alhidayah" || envProfile === "al-hidayah" || envProfile === "aha" || envProfile === "hidayah") {
    return ALHIDAYAH_PROFILE;
  }
  if (envProfile === "demo" || envProfile === "voke") {
    return DEMO_PROFILE;
  }

  // B. Priority 2: Hostname detection (e.g. happy-palace-sms.vercel.app -> HPGS, al-hidayah-sms.vercel.app -> AHA)
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("happy-palace") || host.includes("happypalace") || host.includes("hpgs")) {
      return HPGS_PROFILE;
    }
    if (host.includes("alhidayah") || host.includes("al-hidayah") || host.includes("hidayah") || host.includes("aha-sms")) {
      return ALHIDAYAH_PROFILE;
    }
  }

  // C. Priority 3: Default is DEMO (Full system with all 100 screens and VOKE branding)
  return DEMO_PROFILE;
}

export const activeClientConfig: ClientConfig = resolveActiveConfig();

/**
 * Checks if a specific module is active in the current client configuration.
 * Maps navigation item names or custom module keys cleanly to config flags.
 */
export function isModuleEnabled(moduleName?: string): boolean {
  if (!moduleName) return true;

  const normalized = moduleName.toLowerCase().replace(/[^a-z]/g, "");

  const moduleMap: Record<string, keyof ClientModuleFlags> = {
    dashboard: "dashboard",
    noticeboard: "noticeBoard",
    notice: "noticeBoard",
    reportsanalytics: "reportsAndAnalytics",
    reports: "reportsAndAnalytics",
    students: "students",
    student: "students",
    academics: "academics",
    academic: "academics",
    lms: "lms",
    myportal: "myPortal",
    hrpayroll: "hrPayroll",
    payroll: "hrPayroll",
    staff: "hrPayroll",
    financefees: "financeAndFees",
    finance: "financeAndFees",
    fees: "financeAndFees",
    communication: "communication",
    communications: "communication",
    examinations: "examinations",
    examination: "examinations",
    exams: "examinations",
    hostels: "hostels",
    hostel: "hostels",
    transport: "transport",
    inventory: "inventory",
    library: "library",
    frontoffice: "frontOffice",
    systemsettings: "systemSettings",
    authentication: "authentication",
  };

  const key = moduleMap[normalized];
  if (key && activeClientConfig.modules[key] !== undefined) {
    return activeClientConfig.modules[key];
  }

  return true;
}
