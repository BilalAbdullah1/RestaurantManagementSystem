import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router"; 
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  User, Mail, Lock, Building, Shield, Loader2, AlertCircle, ChevronDown, Eye, EyeOff, UserPlus 
} from "lucide-react"; 
import api from "../../utils/axiosConfig";
import axios from "axios";
import backgroundImage from "../../assets/images/Image1.jpeg";
import { useTheme } from "../../context/ThemeContext";
import { getFileBaseUrl } from "../../utils/apiConfig";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { setTenantPrimaryColor } = useTheme();

  // 1. UI States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State & Ref for Workspace Dropdown
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // State & Ref for Role Dropdown
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  // 2. Data States
  const [tenants, setTenants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    schoolCode: "",
    roleName: "" 
  });

  const rolesList = [
    { id: "Admin", label: "School Administrator" },
    { id: "Teacher", label: "Teaching Faculty" },
    { id: "Student", label: "Student Enrollee" },
    { id: "Parent", label: "Parent / Guardian" },
    { id: "Staff", label: "Administrative Staff" }
  ];

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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial data once
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
          if (brandingRes?.data?.is_custom && brandingRes?.data?.school_name) {
            const matchedTenant = response.data.find((t: any) => t.school_name === brandingRes.data.school_name);
            if (matchedTenant) {
              setFormData(prev => ({ ...prev, schoolCode: matchedTenant.id }));
            }
          }
        } else {
          setTenants([]);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        setTenants([]);
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleTenantSelect = (tenantId: string) => {
    setFormData((prev) => ({ ...prev, schoolCode: tenantId }));
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

  const handleRoleSelect = (roleId: string) => {
    setFormData((prev) => ({ ...prev, roleName: roleId }));
    setIsRoleOpen(false);
    if (error) setError(null);
  };

  const getThemeColor = () => customBranding?.primary_color || "#8b5cf6";
  const getBackgroundImage = () => customBranding?.login_background_url ? `url(${getFileBaseUrl(customBranding.login_background_url)})` : `url(${backgroundImage})`;

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 

    if (!formData.firstName || !formData.lastName || !formData.schoolCode || !formData.roleName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post("/users/register", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        tenant_id: formData.schoolCode,
        role_name: formData.roleName
      });

      navigate("/signin"); 
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
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
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
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

      {/* Floating Ambient Orbs */}
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
        className="w-full max-w-[520px] rounded-[32px] overflow-hidden z-10 relative bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] p-8 sm:p-10 my-auto"
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
              <UserPlus className="w-9 h-9 text-white" strokeWidth={1.5} />
            )}
          </motion.div>
          
          <h2 className="text-3xl font-medium tracking-tight text-white mb-2">
            Create an Account
          </h2>
          <p className="text-sm font-light text-white/60">
            {customBranding?.school_name ? `Register to join ${customBranding.school_name}` : 'Enter your details to request workspace access.'}
          </p>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
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
        <motion.form variants={staggerContainer} initial="hidden" animate="show" onSubmit={handleSignUp} className="space-y-4">
          
          {/* Custom Workspace Selection */}
          {!customBranding?.is_custom && (
            <motion.div variants={fadeInUp} className="relative z-50" ref={workspaceRef}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                <Building className="w-5 h-5" />
              </div>
              
              <button
                type="button"
                onClick={() => { setIsWorkspaceOpen(!isWorkspaceOpen); setIsRoleOpen(false); }}
                className="w-full pl-12 pr-12 py-3.5 text-sm text-left text-white bg-white/5 rounded-2xl border border-white/10 outline-none hover:bg-white/10 focus:border-white/30 focus:bg-white/10 transition-all shadow-inner relative flex items-center justify-between"
              >
                <span className={`block truncate ${!formData.schoolCode ? "text-white/40" : "text-white"}`}>
                  {formData.schoolCode 
                    ? tenants.find(t => t.id === formData.schoolCode)?.school_name || "Select workspace" 
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

          {/* First Name & Last Name Grid */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 z-40">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name *"
                className={`w-full pl-11 pr-4 py-3.5 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name *"
                className={`w-full pl-11 pr-4 py-3.5 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
              />
            </div>
          </motion.div>

          {/* Role Dropdown */}
          <motion.div variants={fadeInUp} className="relative z-30" ref={roleRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
              <Shield className="w-5 h-5" />
            </div>
            
            <button
              type="button"
              onClick={() => { setIsRoleOpen(!isRoleOpen); setIsWorkspaceOpen(false); }}
              className="w-full pl-12 pr-12 py-3.5 text-sm text-left text-white bg-white/5 rounded-2xl border border-white/10 outline-none hover:bg-white/10 focus:border-white/30 focus:bg-white/10 transition-all shadow-inner relative flex items-center justify-between"
            >
              <span className={`block truncate ${!formData.roleName ? "text-white/40" : "text-white"}`}>
                {formData.roleName 
                  ? rolesList.find(r => r.id === formData.roleName)?.label || formData.roleName
                  : "Select your role *"}
              </span>
              <ChevronDown className={`w-4 h-4 text-white/40 absolute right-4 transition-transform duration-300 ${isRoleOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isRoleOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 8, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute w-full bg-[#0B0F19]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 top-full left-0 max-h-48 overflow-y-auto"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
                >
                  {rolesList.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`w-full text-left px-4 py-3 text-sm transition-all hover:bg-white/10 flex items-center ${
                        formData.roleName === role.id ? 'bg-white/10 text-white font-medium' : 'text-white/70'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-colors ${formData.roleName === role.id ? 'bg-white' : 'bg-transparent'}`} style={{ backgroundColor: formData.roleName === role.id ? getThemeColor() : 'transparent' }} />
                      {role.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Email Input */}
          <motion.div variants={fadeInUp} className="relative group z-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address *"
              className={`w-full pl-12 pr-4 py-3.5 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={fadeInUp} className="relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password *"
              className={`w-full pl-12 pr-12 py-3.5 text-sm text-white bg-white/5 rounded-2xl border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-inner placeholder-white/40 ${autofillHackClasses}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fadeInUp} className="pt-3">
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
                  CREATING ACCOUNT...
                </span>
              ) : (
                <span className="flex items-center justify-center relative z-10">
                  Create Account
                </span>
              )}
            </motion.button>
          </motion.div>

        </motion.form>

        {/* Footer Link */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-6 text-center relative z-20"
        >
          <p className="text-[13px] text-white/50">
            Already have an account?{" "}
            <Link to="/signin" className="text-white font-medium hover:underline underline-offset-4 transition-all">
              Sign in
            </Link>
          </p>
        </motion.div>

      </motion.div>

      {/* Global Bottom Watermark */}
      <div className="absolute bottom-6 w-full text-center text-white/30 text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center space-x-3 pointer-events-none z-0">
        <span>Voke RMS Restaurant System</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span>v1.0</span>
      </div>

    </div>
  );
}