/**
 * Client Configuration Engine - Restaurant Management System (RMS)
 * 
 * Allows modular toggling of Restaurant Management System modules per client/branch.
 */

export interface ClientModuleFlags {
  // Core Restaurant Modules
  dashboard: boolean;
  pos: boolean;
  tables: boolean;
  menu: boolean;
  kds: boolean;
  orders: boolean;
  reservations: boolean;
  customers: boolean;
  inventory: boolean;
  hrPayroll: boolean;
  finance: boolean;
  reportsAndAnalytics: boolean;

  // Administrative
  systemSettings: boolean;
  authentication: boolean;

  // Compatibility flags (safe fallbacks)
  noticeBoard?: boolean;
  students?: boolean;
  academics?: boolean;
  lms?: boolean;
  myPortal?: boolean;
  financeAndFees?: boolean;
  communication?: boolean;
  examinations?: boolean;
  hostels?: boolean;
  transport?: boolean;
  library?: boolean;
  frontOffice?: boolean;
}

export interface ClientBranding {
  restaurantName: string;
  schoolName: string; // Compatibility alias
  tagline: string;
  shortCode: string;
  currency: string;
}

export interface ClientConfig {
  branding: ClientBranding;
  targetTenantId?: string;
  lockToSingleSchool: boolean; // Compatibility flag
  lockToSingleBranch?: boolean;
  allowPublicSignup: boolean;
  modules: ClientModuleFlags;
}

// ─── 1. DEMO PROFILE (VOKE Solutions Master Demo) ──────────────────────────
export const DEMO_PROFILE: ClientConfig = {
  branding: {
    restaurantName: "VOKE Gourmet & POS System",
    schoolName: "VOKE Gourmet & POS System",
    tagline: "Enterprise Multi-Branch Dining & POS Operating System",
    shortCode: "RMS",
    currency: "PKR",
  },
  targetTenantId: undefined,
  lockToSingleSchool: false,
  lockToSingleBranch: false,
  allowPublicSignup: true,
  modules: {
    dashboard: true,
    pos: true,
    tables: true,
    menu: true,
    kds: true,
    orders: true,
    reservations: true,
    customers: true,
    inventory: true,
    hrPayroll: true,
    finance: true,
    reportsAndAnalytics: true,
    systemSettings: true,
    authentication: true,
  },
};

// ─── 2. BISTRO PROFILE (Cafe & Quick Service Restaurant) ───────────────────
export const BISTRO_PROFILE: ClientConfig = {
  branding: {
    restaurantName: "Urban Bistro & Cafe",
    schoolName: "Urban Bistro & Cafe",
    tagline: "Artisan Coffee, Bakery & Gourmet Dining",
    shortCode: "UBC",
    currency: "PKR",
  },
  targetTenantId: "fd2e2634-28a1-4b7e-abd5-2d9c1cd85075",
  lockToSingleSchool: true,
  lockToSingleBranch: true,
  allowPublicSignup: false,
  modules: {
    dashboard: true,
    pos: true,
    tables: true,
    menu: true,
    kds: true,
    orders: true,
    reservations: false,
    customers: true,
    inventory: true,
    hrPayroll: true,
    finance: true,
    reportsAndAnalytics: true,
    systemSettings: true,
    authentication: true,
  },
};

// ─── 3. STEAKHOUSE & GRILL PROFILE ─────────────────────────────────────────
export const GRILL_PROFILE: ClientConfig = {
  branding: {
    restaurantName: "Royal Steakhouse & Grill",
    schoolName: "Royal Steakhouse & Grill",
    tagline: "Prime Cuts & Fine Dining Experience",
    shortCode: "RSG",
    currency: "PKR",
  },
  targetTenantId: undefined,
  lockToSingleSchool: true,
  lockToSingleBranch: true,
  allowPublicSignup: false,
  modules: {
    dashboard: true,
    pos: true,
    tables: true,
    menu: true,
    kds: true,
    orders: true,
    reservations: true,
    customers: true,
    inventory: true,
    hrPayroll: true,
    finance: true,
    reportsAndAnalytics: true,
    systemSettings: true,
    authentication: true,
  },
};

// Aliases for backward compatibility
export const HPGS_PROFILE = BISTRO_PROFILE;
export const ALHIDAYAH_PROFILE = GRILL_PROFILE;

function resolveActiveConfig(): ClientConfig {
  const envProfile = import.meta.env.VITE_CLIENT_PROFILE?.toLowerCase()?.trim();
  if (envProfile === "bistro" || envProfile === "hpgs") {
    return BISTRO_PROFILE;
  }
  if (envProfile === "grill" || envProfile === "steakhouse" || envProfile === "aha") {
    return GRILL_PROFILE;
  }
  if (envProfile === "demo" || envProfile === "voke") {
    return DEMO_PROFILE;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host.includes("bistro") || host.includes("cafe")) {
      return BISTRO_PROFILE;
    }
    if (host.includes("grill") || host.includes("steakhouse")) {
      return GRILL_PROFILE;
    }
  }

  return DEMO_PROFILE;
}

export const activeClientConfig: ClientConfig = resolveActiveConfig();

export function isModuleEnabled(moduleName?: string): boolean {
  if (!moduleName) return true;

  const normalized = moduleName.toLowerCase().replace(/[^a-z]/g, "");

  const moduleMap: Record<string, keyof ClientModuleFlags> = {
    dashboard: "dashboard",
    pos: "pos",
    posterminal: "pos",
    tables: "tables",
    tablemanagement: "tables",
    menu: "menu",
    menucatalog: "menu",
    kds: "kds",
    kitchendisplay: "kds",
    orders: "orders",
    reservations: "reservations",
    customers: "customers",
    inventory: "inventory",
    hrpayroll: "hrPayroll",
    staff: "hrPayroll",
    finance: "finance",
    expenses: "finance",
    reports: "reportsAndAnalytics",
    reportsandanalytics: "reportsAndAnalytics",
    systemsettings: "systemSettings",
    authentication: "authentication",
  };

  const key = moduleMap[normalized];
  if (key && activeClientConfig.modules[key] !== undefined) {
    return !!activeClientConfig.modules[key];
  }

  return true;
}
