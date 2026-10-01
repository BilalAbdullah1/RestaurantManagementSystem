// ─── Auth Utility Functions ────────────────────────────────────────────────────
// Yahan sab auth-related helpers hain — ek jagah se manage karna easy hai

const TOKEN_KEY         = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY          = "authUser";

// ── Store user data after login ────────────────────────────────────────────────
export function saveAuthData(token: string, refreshToken?: string, user?: object) {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user)         localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ── Get stored token ───────────────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// ── Get stored user ────────────────────────────────────────────────────────────
export function getStoredUser(): Record<string, unknown> | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Get user role from JWT token ───────────────────────────────────────────────
export function getUserRoleName(): string | null {
  const token = getToken();
  if (!token) return null;
  
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  
  return (payload.role_name as string) || null;
}

// ── Clear everything on logout ─────────────────────────────────────────────────
export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Decode JWT payload (no library needed) ─────────────────────────────────────
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ── Check if token is expired (client-side check) ─────────────────────────────
// Returns true ONLY if token EXISTS but is expired
// Returns false if token is absent (no-token ≠ expired-token)
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return false;  // No token — let ProtectedRoute handle redirect

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true; // Malformed token = treat as expired

  // payload.exp is in seconds, Date.now() is in milliseconds
  // Adding 10 seconds buffer so we logout slightly before actual expiry
  const isExpired = payload.exp * 1000 < Date.now() + 10_000;
  return isExpired;
}

// ── Get token expiry time in ms (how many ms until expiry) ────────────────────
export function getTokenExpiryMs(): number {
  const token = getToken();
  if (!token) return 0;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return 0;

  return payload.exp * 1000 - Date.now();
}

// ── Central logout — clears storage and redirects ─────────────────────────────
export function logout(reason?: "expired" | "inactivity" | "unauthorized" | string) {
  clearAuthData();

  if (reason === "inactivity") {
    sessionStorage.setItem("session_expired_reason", "Session Expired: You were automatically logged out due to 15 minutes of inactivity.");
  } else if (reason === "expired") {
    sessionStorage.setItem("session_expired_reason", "Session Expired: Your authentication session has expired. Please login again.");
  } else if (reason && reason !== "unauthorized") {
    sessionStorage.setItem("session_expired_reason", reason);
  }

  setTimeout(() => {
    const redirectUrl = reason ? "/signin?reason=session_expired" : "/signin";
    window.location.replace(redirectUrl);
  }, 100);
}
