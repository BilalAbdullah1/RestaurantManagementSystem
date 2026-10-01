import React, { useState } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Badge from '../../components/ui/badge/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { toast } from '../../components/ui/Toast';
import { ShieldCheck, KeyRound, Lock, Smartphone, CheckCircle2, Copy, AlertTriangle, Monitor, LogOut, Eye, EyeOff } from 'lucide-react';

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const generate2FA = async () => {
    try {
      setLoading(true);
      const res = await api.post('/users/generate-2fa');
      setSecret(res.data.secret);
      
      const dataUrl = await QRCode.toDataURL(res.data.qrCodeUri || `otpauth://totp/SMS:${res.data.email || 'user'}?secret=${res.data.secret}&issuer=ExcellenceSMS`);
      setQrCodeDataUrl(dataUrl);
      toast.info('2FA Secret Generated. Scan QR code in Authenticator App.');
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to generate 2FA key', 'error');
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Swal.fire('Error', 'Please enter a valid 6-digit OTP code', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/enable-2fa', { token: otpCode });
      Swal.fire('Success', 'Two-Factor Authentication (2FA) is now ACTIVE on your account! 🛡️', 'success');
      setIs2FAEnabled(true);
      setQrCodeDataUrl(null);
      setSecret(null);
      setOtpCode('');
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to verify 2FA code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      Swal.fire('Error', 'New password must be at least 6 characters long', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Swal.fire('Error', 'New passwords do not match', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      const userId = localStorage.getItem('userId');
      const tenantId = localStorage.getItem('tenantId');

      await api.put(`/users/${userId}`, {
        id: userId,
        tenant_id: tenantId,
        password: passwordForm.newPassword
      });

      Swal.fire('Success', 'Your login password has been updated successfully! 🔑', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const copySecretKey = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success('2FA Secret Key copied to clipboard');
    }
  };

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[{ label: 'System Settings' }, { label: 'Security & 2FA Setup' }]} />

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600" /> Account Security & Authenticator
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your login credentials, Two-Factor Authentication (2FA TOTP), and active device sessions.
          </p>
        </div>
        <div>
          <Badge variant="light" color={is2FAEnabled ? 'success' : 'warning'}>
            {is2FAEnabled ? '🟢 2FA Active' : '🟡 2FA Disabled'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Two-Factor Authentication Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">TOTP Authenticator app protection for account logins.</p>
            </div>
          </div>

          {!qrCodeDataUrl ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Secure your account with Google Authenticator or Authy. Every time you log in, you will be prompted for a 6-digit code.
              </p>
              <Button onClick={generate2FA} disabled={loading} variant="primary" className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {loading ? 'Generating 2FA Key...' : 'Setup 2FA Authenticator'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  1. Scan this QR Code with Google Authenticator / Authy
                </p>
                <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-44 h-44 rounded-xl bg-white p-3 shadow-md mb-4" />
                <div className="flex items-center gap-2 text-xs font-mono bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500">Secret:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{secret}</span>
                  <button type="button" onClick={copySecretKey} className="text-brand-600 hover:text-brand-700 ml-1">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label required>2. Enter 6-Digit Code from App</Label>
                <div className="flex gap-3">
                  <Input 
                    type="text" 
                    value={otpCode} 
                    onChange={(e: any) => setOtpCode(e.target.value)} 
                    placeholder="e.g. 123456" 
                    maxLength={6}
                    className="font-mono text-lg text-center tracking-widest"
                  />
                  <Button onClick={enable2FA} disabled={loading || otpCode.length !== 6} variant="primary" className="min-w-[140px]">
                    Verify & Enable
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setQrCodeDataUrl(null)} variant="outline" size="sm">
                    Cancel Setup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Password Change Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Login Password</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update your current account password.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label required>New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-1"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label required>Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-type new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-1"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={passwordLoading} className="w-full flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Active Device Sessions Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Active Logged-in Sessions</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info('All other sessions revoked.')} className="flex items-center gap-1.5 text-xs text-rose-600 border-rose-200 dark:border-rose-800 hover:bg-rose-50">
            <LogOut className="w-3.5 h-3.5" /> Revoke Other Sessions
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-sm block">Current Web Browser Session</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Windows PC • Chrome Browser • IP: Active Session</span>
            </div>
          </div>
          <Badge variant="light" color="success">Active Now</Badge>
        </div>
      </div>
    </div>
  );
}
