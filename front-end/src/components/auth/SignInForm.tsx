import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router"; 
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Eye, EyeOff, Mail, User, Lock, Building, ShieldCheck, Loader2, AlertCircle, ChevronDown
} from "lucide-react"; 
import api from "../../utils/axiosConfig";
import axios from "axios";
import { saveAuthData } from "../../utils/authUtils";
import backgroundImage from "../../assets/images/Image1.jpeg";
import { useTheme } from "../../context/ThemeContext";
import { getFileBaseUrl } from "../../utils/apiConfig";
import { activeClientConfig } from "../../config/clientConfig";

export default function SignInForm() {
  const navigate = useNavigate();
  const { setTenantPrimaryColor } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionReason] = useState<string>(() => {
    return sessionStorage.getItem("session_expired_reason") || "Session Expired: You were automatically logged out due to inactivity.";
  });

  const [showSessionExpired, setShowSessionExpired] = useState<boolean>(
    searchParams.get("reason") === "session_expired" || !!sessionStorage.getItem("session_expired_reason")
  );

  // 1. UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State and Ref for Custom Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close custom dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean URL query param so message is not persisted on reload
  useEffect(() => {
    if (searchParams.get("reason") === "session_expired") {
      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.delete("reason");
      setSearchParams(updatedParams, { replace: true });
    }
  }, []);

  // 2. Data States
  const [tenants, setTenants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    schoolCode: activeClientConfig.targetTenantId || "",
    otp_code: ""
  });

  const [requires2FA, setRequires2FA] = useState(false);

  // Custom Branding State
  const [customBranding, setCustomBranding] = useState<{
    is_custom: boolean;
    school_name?: string;
    logo_url?: string;
    primary_color?: string;
    login_background_url?: string;
  } | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [customBranding?.logo_url]);

  // Fetch tenants & branding once
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const brandingRes = await api.get("/Tenants/current-branding").catch(() => null);
        if (brandingRes?.data?.is_custom) {
          setCustomBranding(brandingRes.data);
        }

        const response = await api.get("/tenants").catch(() => null);
        if (response?.data && Array.isArray(response.data)) {
          setTenants(response.data);

          let matchedTenant = null;

          // Priority 1: Direct URL query param ?branch=RMS-01 or ?restaurant=VOKE or ?school=VOKE
          const urlSchool = searchParams.get("branch") || searchParams.get("restaurant") || searchParams.get("school") || searchParams.get("tenant") || searchParams.get("code");
          if (urlSchool) {
            const param = urlSchool.toLowerCase().trim();
            matchedTenant = response.data.find(
              (t: any) =>
                t.school_code?.toLowerCase().trim() === param ||
                t.subdomain?.toLowerCase().trim() === param ||
                t.id?.toLowerCase() === param ||
                t.school_name?.toLowerCase().includes(param)
            );
          }

          // Priority 2: Subdomain detection (e.g. happypalace.yoursms.com)
          if (!matchedTenant) {
            const host = window.location.hostname;
            if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
              const parts = host.split('.');
              if (parts.length >= 2 && parts[0] !== "www" && parts[0] !== "app") {
                const sub = parts[0].toLowerCase();
                matchedTenant = response.data.find(
                  (t: any) => t.subdomain?.toLowerCase() === sub || t.school_code?.toLowerCase() === sub
                );
              }
            }
          }

          // Priority 3: Match configured client school if lockToSingleSchool is enabled (bypassed if ?switch=true)
          const isMasterSwitchMode = searchParams.get("switch") === "true" || searchParams.get("admin") === "true";
          if (!matchedTenant && activeClientConfig.lockToSingleSchool && !isMasterSwitchMode) {
            matchedTenant = response.data.find(
              (t: any) =>
                t.id === activeClientConfig.targetTenantId ||
                t.school_name?.toLowerCase().trim() === activeClientConfig.branding.schoolName.toLowerCase().trim() ||
                t.school_code?.toLowerCase().trim() === activeClientConfig.branding.shortCode.toLowerCase().trim()
            );
          }

          // Priority 4: Match current custom branding school name
          if (!matchedTenant && brandingRes?.data?.is_custom && brandingRes?.data?.school_name) {
            matchedTenant = response.data.find((t: any) => t.school_name === brandingRes.data.school_name);
          }

          // Priority 5: Fallback if only 1 tenant exists in DB
          if (!matchedTenant && response.data.length === 1) {
            matchedTenant = response.data[0];
          }

          if (matchedTenant) {
            setFormData(prev => ({ ...prev, schoolCode: matchedTenant.id }));
            setCustomBranding({
              is_custom: true,
              school_name: matchedTenant.school_name,
              logo_url: matchedTenant.logo_url,
              primary_color: matchedTenant.primary_color || "#1e40af",
              login_background_url: matchedTenant.login_background_url
            });
            if (matchedTenant.primary_color) {
              setTenantPrimaryColor(matchedTenant.primary_color);
            }
          } else if (activeClientConfig.lockToSingleSchool) {
            setCustomBranding({
              is_custom: true,
              school_name: activeClientConfig.branding.schoolName,
              primary_color: "#1e40af"
            });
            setTenantPrimaryColor("#1e40af");
          }
        } else {
          setTenants([]);
          if (activeClientConfig.lockToSingleSchool) {
            setCustomBranding({
              is_custom: true,
              school_name: activeClientConfig.branding.schoolName,
              primary_color: "#1e40af"
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        setTenants([]);
        setError("Failed to load workspace list. Check connection.");
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (showSessionExpired) setShowSessionExpired(false);
  };

  // Custom handler for our new animated dropdown
  const handleTenantSelect = (tenantId: string) => {
    setFormData((prev) => ({ ...prev, schoolCode: tenantId }));
    setIsDropdownOpen(false);
    if (error) setError(null);
    if (showSessionExpired) setShowSessionExpired(false);

    const selectedTenant = tenants.find((t) => t.id === tenantId);
    if (selectedTenant && selectedTenant.primary_color) {
      setTenantPrimaryColor(selectedTenant.primary_color);
      setCustomBranding({
        is_custom: false, 
        school_name: selectedTenant.school_name,
        logo_url: selectedTenant.logo_url,
        primary_color: selectedTenant.primary_color,
        login_background_url: selectedTenant.login_background_url
      });
    } else {
      setTenantPrimaryColor("#8b5cf6"); // Default vibrant purple
      setCustomBranding(null);
    }
  };

  const getThemeColor = () => customBranding?.primary_color || "#8b5cf6";
  const getBackgroundImage = () => customBranding?.login_background_url ? `url(${getFileBaseUrl(customBranding.login_background_url)})` : `url(${backgroundImage})`;

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (showSessionExpired) setShowSessionExpired(false);

    const targetTenant = formData.schoolCode || activeClientConfig.targetTenantId || (tenants.length > 0 ? tenants[0].id : "");

    if (!targetTenant || !formData.email.trim() || (!formData.password && !requires2FA)) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post("/users/login", {
        email: formData.email.trim(),
        password: formData.password,
        tenant_id: targetTenant,
        otp_code: formData.otp_code
      });

      if (response.data.requires_2fa) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      const { token, refresh_token, tenant_id, role_id, user_id, role_name, profile_picture_url, school_name } = response.data;
      
      saveAuthData(token, refresh_token, { tenant_id, role_id, user_id, role_name, profilePicture: profile_picture_url });
      localStorage.setItem("tenantId", tenant_id);
      localStorage.setItem("userRole", role_id);
      localStorage.setItem("userId", user_id);
      localStorage.setItem("roleName", role_name);

      const effectiveSchoolName = school_name 
        || customBranding?.school_name 
        || tenants.find(t => t.id === tenant_id)?.school_name 
        || activeClientConfig.branding.schoolName;
      localStorage.setItem("schoolName", effectiveSchoolName);

      sessionStorage.removeItem("session_expired_reason");

      navigate("/"); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("API endpoint not found (404). Backend URL must end with /api.");
        } else {
          setError(err.response?.data?.message || "Invalid credentials.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Animations ---
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  // The Magic Autofill CSS Classes
  const autofillHackClasses = "caret-white [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-sans py-8 px-4 sm:px-6 lg:px-8 bg-[#0B0F19]">
      
      {/* ── Immersive Full-Screen Background ── */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-screen pointer-events-none" 
        style={{ backgroundImage: getBackgroundImage() }}
      />
      {/* Vignette / Dark Overlay to make the center pop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, #000000 100%)' }} />

      {/* Floating Ambient Glowing Orbs */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1], x: [0, 30, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40 pointer-events-none" 
        style={{ background: getThemeColor() }}
      />
      <motion.div 
        animate={{ rotate: -360, scale: [1, 1.2, 1], y: [0, 40, 0] }} 
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 pointer-events-none" 
        style={{ background: "#e80a89" }}
      />

      {/* ── Main Centered Glass Card ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="w-full max-w-[480px] rounded-[32px] overflow-hidden z-10 relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-8 sm:p-12"
      >
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", delay: 0.2 }} 
            className="inline-flex justify-center items-center mb-6 p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md"
          >
            {!logoFailed && customBranding?.logo_url ? (
              <img 
                src={getFileBaseUrl(customBranding.logo_url)} 
                alt="Logo" 
                className="h-12 object-contain filter drop-shadow-lg" 
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
            )}
          </motion.div>
          
          <h2 className="text-3xl font-medium tracking-tight text-white mb-2">
            Welcome back 
          </h2>
          <p className="text-sm font-light text-white/60">
            Sign in to {customBranding?.school_name || activeClientConfig.branding.schoolName}
          </p>
        </div>

        {/* Alerts & Notifications */}
        <AnimatePresence>
          {showSessionExpired && !error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="p-4 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{sessionReason}</p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="p-4 text-xs text-rose-200 bg-rose-500/10 border border-rose-500/20 backdrop-blur-md rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Fields */}
        <motion.form variants={staggerContainer} initial="hidden" animate="show" onSubmit={handleSignIn} className="space-y-5">
          
          {/* Custom Animated Workspace Selection - Hidden in single-client mode unless ?switch=true */}
          {(!activeClientConfig.lockToSingleSchool || searchParams.get("switch") === "true" || searchParams.get("admin") === "true") && !customBranding?.is_custom && (
            <motion.div variants={fadeInUp} className="relative z-50" ref={dropdownRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                <Building className="w-5 h-5" />
              </div>
              
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full pl-12 pr-12 py-4 text-sm text-left text-white bg-white/5 rounded-2xl border border-white/10 outline-none hover:bg-white/10 focus:border-white/30 focus:bg-white/10 transition-all shadow-inner relative flex items-center justify-between"
              >
                <span className={`block truncate ${!formData.schoolCode ? "text-white/40" : "text-white"}`}>
                  {formData.schoolCode 
                    ? tenants.find(t => t.id === formData.schoolCode)?.school_name || "Select your workspace" 
                    : "Select your workspace"}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/40 absolute right-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 8, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute w-full bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 top-full left-0 max-h-56 overflow-y-auto"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
                  >
                    {tenants.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-white/40">No workspaces available</div>
                    ) : (
                      tenants.map((tenant) => (
                        <button
                          key={tenant.id}
                          type="button"
                          onClick={() => handleTenantSelect(tenant.id)}
                          className={`w-full text-left px-4 py-3 text-sm transition-all hover:bg-white/10 flex items-center ${
                            formData.schoolCode === tenant.id ? 'bg-white/10 text-white font-medium' : 'text-white/70'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-colors ${formData.schoolCode === tenant.id ? 'bg-white' : 'bg-transparent'}`} style={{ backgroundColor: formData.schoolCode === tenant.id ? getThemeColor() : 'transparent' }} />
                          {tenant.school_name}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Username / Email / Student ID Input */}
          <motion.div variants={fadeInUp} className="relative group z-40">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Username, Email or Student ID"
              autoComplete="username"
              className={`w-full pl-12 pr-4 py-4 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
            />
          </motion.div>
          
          {/* Dynamic Password / OTP Fields */}
          <div className="relative z-30">
            <AnimatePresence mode="wait">
              {!requires2FA ? (
                <motion.div key="password" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className={`w-full pl-12 pr-12 py-4 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">2FA Code required</span>
                    <button type="button" onClick={() => setRequires2FA(false)} className="text-[10px] text-white/80 hover:text-white hover:underline transition-all">Go Back</button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      name="otp_code"
                      value={formData.otp_code}
                      onChange={handleChange}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className={`w-full pl-12 pr-4 py-4 text-center tracking-[0.4em] text-lg font-mono font-bold text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/20 ${autofillHackClasses}`}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Links Row */}
          <motion.div variants={fadeInUp} className="flex justify-between items-center text-[13px] font-medium pt-1 px-1 z-20">
            <label className="flex items-center cursor-pointer text-white/60 hover:text-white transition-colors group select-none">
              <input type="checkbox" className="mr-2.5 w-4 h-4 rounded-md border-white/20 bg-white/10 checked:bg-white checked:border-white focus:ring-0 transition-all cursor-pointer appearance-none" />
              <span>Remember me</span>
            </label>
            <Link to="/ForgotPassword" className="text-white/60 hover:text-white transition-all">
              Forgot password?
            </Link>
          </motion.div>

          {/* Glowing Submit Button */}
          <motion.div variants={fadeInUp} className="pt-4 z-20">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-semibold flex justify-center items-center text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-70 transition-all overflow-hidden relative group border border-white/10"
              style={{ background: getThemeColor() }}
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              
              {loading ? (
                <span className="flex items-center relative z-10">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  AUTHENTICATING...
                </span>
              ) : (
                <span className="flex items-center justify-center relative z-10">
                  {requires2FA ? "Verify Code" : "Sign In"}
                </span>
              )}
            </motion.button>
          </motion.div>

        </motion.form>

        {/* Footer Text Inside Card - Hidden when allowPublicSignup is false */}
        {activeClientConfig.allowPublicSignup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-8 text-center relative z-20"
          >
            <p className="text-[13px] text-white/50">
              Don't have an account?{" "}
              <Link to="/signup" className="text-white font-medium hover:underline underline-offset-4 transition-all">
                Sign up
              </Link>
            </p>
          </motion.div>
        )}

      </motion.div>

      {/* Global Bottom Branding */}
      <div className="absolute bottom-6 w-full text-center text-white/30 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center space-x-3 pointer-events-none z-0">
        <span>{activeClientConfig.branding.restaurantName || activeClientConfig.branding.schoolName}</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>v1.0</span>
      </div>
    </div>
  );
}