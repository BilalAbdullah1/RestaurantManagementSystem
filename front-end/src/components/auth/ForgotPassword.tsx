import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router"; 
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Mail, Building, KeyRound, Loader2, AlertCircle, ChevronDown, ArrowLeft, CheckCircle2 
} from "lucide-react"; 
import api from "../../utils/axiosConfig";
import backgroundImage from "../../assets/images/Image1.jpeg";
import { useTheme } from "../../context/ThemeContext";
import { getFileBaseUrl } from "../../utils/apiConfig";
import { activeClientConfig } from "../../config/clientConfig";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTenantPrimaryColor } = useTheme();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [branchCode, setbranchCode] = useState(activeClientConfig.targetTenantId || '');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State & Ref for Workspace Dropdown
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [tenants, setTenants] = useState<any[]>([]);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial data
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

          // Priority 1: Direct URL query param ?school=HPGS
          const urlBranch = searchParams.get("school") || searchParams.get("tenant") || searchParams.get("code");
          if (urlBranch) {
            const param = urlBranch.toLowerCase().trim();
            matchedTenant = response.data.find(
              (t: any) =>
                t.school_code?.toLowerCase().trim() === param ||
                t.subdomain?.toLowerCase().trim() === param ||
                t.id?.toLowerCase() === param ||
                t.school_name?.toLowerCase().includes(param)
            );
          }

          // Priority 2: Match configured client school if lockToSingleSchool is enabled (bypassed if ?switch=true)
          const isMasterSwitch = searchParams.get("switch") === "true" || searchParams.get("admin") === "true";
          if (!matchedTenant && activeClientConfig.lockToSingleSchool && !isMasterSwitch) {
            matchedTenant = response.data.find(
              (t: any) =>
                t.id === activeClientConfig.targetTenantId ||
                t.school_name?.toLowerCase().trim() === activeClientConfig.branding.restaurantName.toLowerCase().trim() ||
                t.school_code?.toLowerCase().trim() === activeClientConfig.branding.shortCode.toLowerCase().trim()
            );
          }

          // Priority 2: Match custom branding school name
          if (!matchedTenant && brandingRes?.data?.is_custom && brandingRes?.data?.school_name) {
            matchedTenant = response.data.find((t: any) => t.school_name === brandingRes.data.school_name);
          }

          // Priority 3: Fallback to first available tenant
          if (!matchedTenant && response.data.length > 0) {
            matchedTenant = response.data[0];
          }

          if (matchedTenant) {
            setbranchCode(matchedTenant.id);
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
          }
        } else {
          setTenants([]);
          if (activeClientConfig.lockToSingleSchool) {
            setCustomBranding({
              is_custom: true,
              school_name: activeClientConfig.branding.restaurantName,
              primary_color: "#1e40af"
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        setTenants([]);
      }
    };
    fetchInitialData();
  }, []);

  const handleTenantSelect = (tenantId: string) => {
    setbranchCode(tenantId);
    setIsWorkspaceOpen(false);
    if (error) setError(null);

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
      setTenantPrimaryColor("#8b5cf6");
      setCustomBranding(null);
    }
  };

  const getThemeColor = () => customBranding?.primary_color || "#8b5cf6";
  const getBackgroundImage = () => customBranding?.login_background_url ? `url(${getFileBaseUrl(customBranding.login_background_url)})` : `url(${backgroundImage})`;

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTenant = branchCode || activeClientConfig.targetTenantId || (tenants.length > 0 ? tenants[0].id : "");

    if (!email || !targetTenant) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.post('/users/forgot-password', {
        email: email.trim(),
        tenant_id: targetTenant
      });

      setSuccessMessage("Token sent! Please check your email inbox (and spam folder).");
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset token.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Token
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError("Please enter your verification token.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.post('/users/verify-token', { token: tokenInput.trim() });
      navigate(`/ResetPassword?token=${encodeURIComponent(tokenInput.trim())}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
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

  const autofillHackClasses = "caret-white [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-sans py-8 px-4 sm:px-6 lg:px-8 bg-[#0B0F19]">
      
      {/* Immersive Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 mix-blend-screen pointer-events-none" 
        style={{ backgroundImage: getBackgroundImage() }}
      />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, #000000 100%)' }} />

      {/* Ambient Orbs */}
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

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="w-full max-w-[480px] rounded-[32px] overflow-hidden z-10 relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-8 sm:p-12 my-auto"
      >
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", delay: 0.2 }} 
            className="inline-flex justify-center items-center mb-5 p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md"
          >
            {!logoFailed && customBranding?.logo_url ? (
              <img 
                src={getFileBaseUrl(customBranding.logo_url)} 
                alt="Logo" 
                className="h-10 object-contain filter drop-shadow-lg" 
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <KeyRound className="w-9 h-9 text-white" strokeWidth={1.5} />
            )}
          </motion.div>
          
          <h2 className="text-3xl font-medium tracking-tight text-white mb-2">
            {step === 1 ? "Forgot Password?" : "Verify Reset Token"}
          </h2>
          <p className="text-sm font-light text-white/60">
            {step === 1 
              ? `Enter your email to recover your account for ${customBranding?.school_name || activeClientConfig.branding.restaurantName}.` 
              : "Enter the token code sent to your email inbox."}
          </p>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {successMessage && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="p-4 text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{successMessage}</p>
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

        {/* Form */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form key="step1" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0, x: -20 }} onSubmit={handleRequestToken} className="space-y-5">
              
              {/* Custom Workspace Selection - Hidden in single-client mode unless ?switch=true */}
              {(!activeClientConfig.lockToSingleSchool || searchParams.get("switch") === "true" || searchParams.get("admin") === "true") && !customBranding?.is_custom && (
                <motion.div variants={fadeInUp} className="relative z-50" ref={workspaceRef}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <Building className="w-5 h-5" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                    className="w-full pl-12 pr-12 py-4 text-sm text-left text-white bg-white/5 rounded-2xl border border-white/10 outline-none hover:bg-white/10 focus:border-white/30 focus:bg-white/10 transition-all shadow-inner relative flex items-center justify-between"
                  >
                    <span className={`block truncate ${!branchCode ? "text-white/40" : "text-white"}`}>
                      {branchCode 
                        ? tenants.find(t => t.id === branchCode)?.school_name || "Select your workspace" 
                        : "Select your workspace *"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/40 absolute right-4 transition-transform duration-300 ${isWorkspaceOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isWorkspaceOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 8, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute w-full bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 top-full left-0 max-h-48 overflow-y-auto"
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
                                branchCode === tenant.id ? 'bg-white/10 text-white font-medium' : 'text-white/70'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-colors ${branchCode === tenant.id ? 'bg-white' : 'bg-transparent'}`} style={{ backgroundColor: branchCode === tenant.id ? getThemeColor() : 'transparent' }} />
                              {tenant.school_name}
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Email Input */}
              <motion.div variants={fadeInUp} className="relative group z-40">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  placeholder="Registered Email *"
                  className={`w-full pl-12 pr-4 py-4 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
                />
              </motion.div>

              {/* Action Button */}
              <motion.div variants={fadeInUp} className="pt-2 z-20">
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
                      SENDING TOKEN...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center relative z-10">
                      Send Reset Token
                    </span>
                  )}
                </motion.button>
              </motion.div>

            </motion.form>
          ) : (
            <motion.form key="step2" variants={staggerContainer} initial="hidden" animate="show" exit={{ opacity: 0, x: 20 }} onSubmit={handleVerifyToken} className="space-y-5">
              
              {/* Token Code Input */}
              <motion.div variants={fadeInUp} className="relative group z-40">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => { setTokenInput(e.target.value); if (error) setError(null); }}
                  placeholder="Enter token code"
                  className={`w-full pl-12 pr-4 py-4 text-center tracking-[0.3em] font-mono text-base font-bold text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/30 ${autofillHackClasses}`}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeInUp} className="pt-2 z-20">
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
                      VERIFYING...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center relative z-10">
                      Verify Token & Proceed
                    </span>
                  )}
                </motion.button>
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); setSuccessMessage(null); }}
                  className="text-xs text-white/60 hover:text-white transition-all inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Email or Workspace
                </button>
              </motion.div>

            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer Link */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-6 text-center relative z-20"
        >
          <Link to="/signin" className="text-xs text-white/60 hover:text-white font-medium hover:underline underline-offset-4 transition-all inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </motion.div>

      </motion.div>

      {/* Global Watermark */}
      <div className="absolute bottom-6 w-full text-center text-white/30 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center space-x-3 pointer-events-none z-0">
        <span>{customBranding?.school_name || activeClientConfig.branding.restaurantName}</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>v1.0</span>
      </div>

    </div>
  );
}