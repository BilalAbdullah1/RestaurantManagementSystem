import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import ImageUpload from '../../components/form/ImageUpload';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import QRCode from 'qrcode';
import { 
  User as UserIcon, 
  ShieldCheck, 
  LifeBuoy, 
  KeyRound, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  EyeOff, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Send,
  MessageSquare,
  Headphones
} from 'lucide-react';
import { getStoredUser } from '../../utils/authUtils';
import { getFileBaseUrl } from '../../utils/apiConfig';
import { activeClientConfig } from '../../config/clientConfig';

interface UserProfileData {
  id: string;
  tenant_id: string;
  role_id: string;
  role_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_picture_url?: string | null;
  two_factor_enabled: boolean;
  created_at?: string;
}

interface HelpdeskTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  resolution_remarks?: string;
  created_at: string;
}

export default function UserProfileHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'edit';

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);

  // Form State for Profile
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    profile_picture_url: '' as string | null
  });

  // Form State for Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // 2FA State
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');

  // Support / Helpdesk State
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: 'General Inquiry',
    subject: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    description: ''
  });

  const categoryOptions: SearchableSelectOption[] = [
    { value: 'General Inquiry', label: 'General Inquiry' },
    { value: 'Academics & Timetable', label: 'Academics & Timetable' },
    { value: 'Fee & Billing', label: 'Fee & Billing' },
    { value: 'Technical / Portal Issue', label: 'Technical / Portal Issue' },
    { value: 'Transport & Facilities', label: 'Transport & Facilities' },
    { value: 'Exam & Results', label: 'Exam & Results' }
  ];

  const priorityOptions: SearchableSelectOption[] = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  // Fetch initial profile
  const fetchUserProfile = async () => {
    try {
      const res = await api.get<UserProfileData>('/users/profile/me');
      setProfileData(res.data);
      setProfileForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone_number: res.data.phone_number || '',
        profile_picture_url: res.data.profile_picture_url || null
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load user profile.');
    }
  };

  // Fetch helpdesk tickets for this tenant
  const fetchTickets = async () => {
    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) return;
    try {
      setTicketsLoading(true);
      const res = await api.get<HelpdeskTicket[]>(`/helpdesk/tenant/${tenantId}`);
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'support') {
      fetchTickets();
    }
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // ── Profile Update Handler ───────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.first_name.trim()) {
      toast.error('First Name is required.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.put('/users/profile/me', {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone_number: profileForm.phone_number,
        profile_picture_url: profileForm.profile_picture_url
      });

      const updated = res.data.user;
      setProfileData(updated);

      // Update LocalStorage and trigger navbar re-render
      const currentStored = getStoredUser() || {};
      const updatedStored = {
        ...currentStored,
        firstName: updated.first_name,
        lastName: updated.last_name,
        name: `${updated.first_name} ${updated.last_name}`.trim(),
        profilePicture: updated.profile_picture_url
      };
      localStorage.setItem('authUser', JSON.stringify(updatedStored));
      window.dispatchEvent(new CustomEvent('user_profile_updated', { detail: updatedStored }));

      toast.success('Your profile has been updated successfully! ✨');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password Change Handler ──────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/users/profile/me', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      toast.success('Password changed successfully! 🔑');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // ── 2FA Setup Handlers ───────────────────────────────────────────────────────
  const handleGenerate2FA = async () => {
    try {
      setTwoFactorLoading(true);
      const res = await api.post('/users/generate-2fa');
      setTwoFactorSecret(res.data.secret);

      const qrUrl = await QRCode.toDataURL(
        res.data.qrCodeUri || `otpauth://totp/RMS:${profileData?.email}?secret=${res.data.secret}&issuer=${encodeURIComponent(activeClientConfig.branding.shortCode + "_RMS")}`
      );
      setQrCodeDataUrl(qrUrl);
      toast.info('Scan the QR code with Google Authenticator or Microsoft Authenticator.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate 2FA key.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP from your authenticator app.');
      return;
    }

    try {
      setTwoFactorLoading(true);
      await api.post('/users/enable-2fa', { token: otpCode.trim() });
      toast.success('Two-Factor Authentication is now ACTIVE on your account! 🛡️');
      setProfileData(prev => prev ? { ...prev, two_factor_enabled: true } : null);
      setQrCodeDataUrl(null);
      setTwoFactorSecret(null);
      setOtpCode('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const copySecret = () => {
    if (twoFactorSecret) {
      navigator.clipboard.writeText(twoFactorSecret);
      toast.success('Secret key copied to clipboard.');
    }
  };

  // ── Support Ticket Submission ────────────────────────────────────────────────
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast.error('Please fill in both Subject and Description.');
      return;
    }

    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) return;

    try {
      setSubmittingTicket(true);
      const fullName = `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || 'User';
      await api.post('/helpdesk', {
        tenant_id: tenantId,
        raised_by_name: fullName,
        raised_by_role: profileData?.role_name || 'Staff',
        category: ticketForm.category,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
        priority: ticketForm.priority
      });

      toast.success('Support ticket submitted successfully! Our helpdesk will respond shortly. 🚀');
      setTicketForm({
        category: 'General Inquiry',
        subject: '',
        priority: 'Medium',
        description: ''
      });
      fetchTickets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit support ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const getFullUrl = (url: string) => {
    return getFileBaseUrl(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'User Center', path: '/profile' },
          { 
            label: activeTab === 'edit' ? 'Edit Profile' : activeTab === 'security' ? 'Account Settings' : 'Support & Helpdesk' 
          }
        ]}
      />

      {/* Header Profile Summary Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar with Ring */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl bg-white/20 flex items-center justify-center shrink-0">
            {profileData?.profile_picture_url ? (
              <img
                src={getFullUrl(profileData.profile_picture_url)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-bold uppercase">
                {(profileData?.first_name || 'U').charAt(0)}
              </span>
            )}
          </div>

          {/* Profile Overview */}
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {profileData?.first_name} {profileData?.last_name}
              </h1>
              <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                {profileData?.role_name || 'User'}
              </span>
              {profileData?.two_factor_enabled && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> 2FA Active
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-white/80 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-white/70" /> {profileData?.email}
              </span>
              {profileData?.phone_number && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-white/70" /> {profileData.phone_number}
                </span>
              )}
              {profileData?.created_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white/70" /> Member since {new Date(profileData.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/20 pt-4">
          <button
            onClick={() => handleTabChange('edit')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              activeTab === 'edit'
                ? 'bg-white text-brand-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Edit Profile
          </button>

          <button
            onClick={() => handleTabChange('security')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              activeTab === 'security'
                ? 'bg-white text-brand-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Account & Security
          </button>

          <button
            onClick={() => handleTabChange('support')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              activeTab === 'support'
                ? 'bg-white text-brand-700 shadow-md'
                : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'
            }`}
          >
            <LifeBuoy className="w-4 h-4" /> Support & Helpdesk
          </button>
        </div>
      </div>

      {/* ── TAB 1: EDIT PROFILE ────────────────────────────────────────────── */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Upload Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Profile Photo</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              This photo will be displayed across your restaurant portal and directory.
            </p>

            <ImageUpload
              label=""
              currentImageUrl={profileForm.profile_picture_url}
              onUploadSuccess={(url) => setProfileForm(prev => ({ ...prev, profile_picture_url: url }))}
              className="w-full flex justify-center"
            />

            <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Account Type</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{profileData?.role_name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Account Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Personal Details Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update your personal name and contact information.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label required>First Name</Label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <Label>Last Name</Label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label>Email Address</Label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profileData?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">To change login email, please contact restaurant management.</p>
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <input
                    type="tel"
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl font-semibold shadow-md bg-brand-600 hover:bg-brand-700 text-white"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACCOUNT & SECURITY ───────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Update your account password regularly for enhanced security.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label required>Current Password</Label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label required>New Password</Label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label required>Confirm New Password</Label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={changingPassword}
                className="w-full py-2.5 rounded-xl font-semibold shadow-md bg-amber-600 hover:bg-amber-700 text-white"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
          </div>

          {/* Two-Factor Authentication (2FA) Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Auth (2FA)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security via TOTP Authenticator.</p>
                </div>
              </div>

              {profileData?.two_factor_enabled ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Disabled
                </span>
              )}
            </div>

            {profileData?.two_factor_enabled ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-sm space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Account Protected with 2FA
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Your account requires a 6-digit TOTP code from Google Authenticator or Microsoft Authenticator whenever you sign in.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {!qrCodeDataUrl ? (
                  <div className="text-center py-6 space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      Scan a QR code using Google Authenticator, Authy, or Microsoft Authenticator to generate login codes.
                    </p>
                    <Button
                      onClick={handleGenerate2FA}
                      disabled={twoFactorLoading}
                      className="px-5 py-2.5 rounded-xl font-semibold shadow-md bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {twoFactorLoading ? 'Generating Key...' : 'Setup Two-Factor Authentication'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                        <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-44 h-44" />
                      </div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        1. Scan this QR code with your Authenticator App
                      </p>
                      
                      {twoFactorSecret && (
                        <div className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span className="text-gray-500">Secret:</span>
                          <code className="font-mono font-bold text-purple-600 dark:text-purple-400">{twoFactorSecret}</code>
                          <button onClick={copySecret} className="text-gray-400 hover:text-gray-600">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Label required>2. Enter 6-digit OTP Code to Confirm</Label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 123456"
                          className="w-full text-center tracking-widest font-mono text-lg font-bold px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <Button
                          onClick={handleEnable2FA}
                          disabled={twoFactorLoading || otpCode.length !== 6}
                          className="px-5 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                        >
                          Verify & Activate
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: SUPPORT & HELPDESK ──────────────────────────────────────── */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Ticket Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit a Support Ticket</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Experiencing an issue or need assistance? Our IT & RMS Support team is here to help.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Category</Label>
                  <SearchableSelect
                    options={categoryOptions}
                    value={ticketForm.category}
                    onChange={(val) => setTicketForm({ ...ticketForm, category: val as string })}
                    placeholder="Select Issue Category"
                  />
                </div>

                <div>
                  <Label required>Priority Level</Label>
                  <SearchableSelect
                    options={priorityOptions}
                    value={ticketForm.priority}
                    onChange={(val) => setTicketForm({ ...ticketForm, priority: val as any })}
                    placeholder="Select Priority"
                  />
                </div>
              </div>

              <div>
                <Label required>Subject / Issue Summary</Label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="e.g. Cannot view timetable schedule for Grade 8"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <Label required>Detailed Description</Label>
                <textarea
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Please describe the steps or details of your query or problem..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-6 py-2.5 rounded-xl font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> {submittingTicket ? 'Submitting Ticket...' : 'Submit Support Ticket'}
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Help Channels & FAQs */}
          <div className="space-y-6">
            {/* Quick Contacts Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Headphones className="w-4 h-4 text-brand-600" /> Direct IT & Admin Help
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                For urgent emergencies, you can directly reach the restaurant management desk.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs text-gray-400">Support Helpline</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">+92 (042) 111-888-999</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-400">Official Support Email</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">support@{activeClientConfig.branding.shortCode.toLowerCase()}.edu.pk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Ticket Status Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" /> Recent Tickets
                </span>
                <span className="text-xs font-normal text-gray-400">{tickets.length} total</span>
              </h4>

              {ticketsLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50" />
                  <p>No open support tickets.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {tickets.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{t.ticket_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          t.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                          t.status === 'Closed' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{t.subject}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
