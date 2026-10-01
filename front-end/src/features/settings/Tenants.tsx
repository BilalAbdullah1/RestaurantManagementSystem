import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Building, Globe, CheckCircle, ShieldCheck } from 'lucide-react';

import { getFileBaseUrl } from '../../utils/apiConfig';
import { compressImage, resolveSafeImageUrl } from '../../utils/imageUtils';
import { activeClientConfig } from '../../config/clientConfig';
import { Navigate, useSearchParams } from 'react-router';

interface Tenant {
  id: string;
  school_name: string;
  school_code: string;
  subdomain?: string;
  email?: string;
  phone?: string;
  address?: string;
  principal_name?: string;
  registration_no?: string;
  website?: string;
  logo_url?: string;
  currency: string;
  is_active: boolean;
  primary_color?: string;
  login_background_url?: string;
  created_at: string;
}

export default function Tenants() {
  if (activeClientConfig.lockToSingleSchool) {
    return <Navigate to="/" replace />;
  }

  const [searchParams] = useSearchParams();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState({
    school_name: '', school_code: '', subdomain: '', email: '', phone: '',
    address: '', principal_name: '', registration_no: '', website: '',
    currency: 'PKR', is_active: true, primary_color: '#3b82f6', login_background_url: ''
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  // Deep linking: Handle ?action=new
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openAddTab();
    }
  }, [searchParams]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get<Tenant[]>('/tenants');
      setTenants(response.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load tenants', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper utility to target the backend domain safely
  const resolveLogoUrl = (url: string | null) => {
    return resolveSafeImageUrl(url);
  };

  const resetForm = () => {
    setFormData({
      school_name: '', school_code: '', subdomain: '', email: '', phone: '',
      address: '', principal_name: '', registration_no: '', website: '',
      currency: 'PKR', is_active: true, primary_color: '#3b82f6', login_background_url: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const openAddTab = () => {
    setEditingTenant(null);
    resetForm();
    setActiveTab('form');
  };

  const openEditTab = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      school_name: tenant.school_name,
      school_code: tenant.school_code,
      subdomain: tenant.subdomain || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      address: tenant.address || '',
      principal_name: tenant.principal_name || '',
      registration_no: tenant.registration_no || '',
      website: tenant.website || '',
      currency: tenant.currency,
      is_active: tenant.is_active,
      primary_color: tenant.primary_color || '#3b82f6',
      login_background_url: tenant.login_background_url || ''
    });
    setLogoPreview(tenant.logo_url || null);
    setLogoFile(null);
    setActiveTab('form');
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { blob, dataUrl } = await compressImage(file, 500, 500, 0.85);
        setLogoPreview(dataUrl);
        const compressedFile = new File([blob], file.name, { type: blob.type });
        setLogoFile(compressedFile);
      } catch {
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value.toString());
      });

      if (logoFile) {
        form.append('logo', logoFile);
      }
      if (logoPreview && logoPreview.startsWith('data:')) {
        form.append('logo_url', logoPreview);
      }

      if (editingTenant) {
        form.append('id', editingTenant.id);
        await api.put(`/tenants/${editingTenant.id}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/tenants', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      Swal.fire({
        icon: 'success',
        title: editingTenant ? 'School Updated!' : 'School Created Successfully!',
        timer: 2000
      });

      setActiveTab('list');
      fetchTenants();
      resetForm();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to save tenant', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/tenants/${id}/toggle-status`);

      Swal.fire({
        icon: 'success',
        title: 'Status Updated!',
        timer: 1500
      });

      fetchTenants(); // Table refresh
    } catch (err) {
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'System Settings', href: '#' }, { label: 'Multi-Tenant Campus Provisioner' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="w-7 h-7 text-indigo-600" />
              Multi-Tenant Campus Isolation & Subdomains
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Provision isolated school database schemas, custom subdomains, and branding themes.</p>
          </div>
          <Button variant="primary" onClick={openAddTab} className="bg-indigo-600 hover:bg-indigo-700">
            + Provision New School Tenant
          </Button>
        </div>
      </div>

      <StatCards
        stats={[
          { title: 'Provisioned Tenants', value: tenants.length, icon: <Building className="w-5 h-5" />, theme: 'brand' },
          { title: 'Active School Campuses', value: tenants.filter(t => t.is_active).length, icon: <CheckCircle className="w-5 h-5" />, theme: 'success' },
          { title: 'Subdomain Mappings', value: tenants.filter(t => t.subdomain).length, icon: <Globe className="w-5 h-5" />, theme: 'indigo' },
        ]}
      />

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 -mb-px 
            ${activeTab === 'list'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
        >
          All Schools ({tenants.length})
        </button>
        <button
          onClick={openAddTab}
          className={`px-6 py-3 text-sm font-bold transition-colors border-b-2 -mb-px 
            ${activeTab === 'form'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'}`}
        >
          {editingTenant ? 'Edit School Tenant' : '+ Add New School Tenant'}
        </button>
      </div>

      {/* LIST VIEW */}
      {activeTab === 'list' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">

          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Logo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">School Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">School Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Email</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-3 shadow-inner">
                          <Building className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
                          No School Tenants Configured
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                          Provision isolated multi-branch schemas, custom school codes, subdomains, and campus themes.
                        </p>
                        <Button variant="primary" onClick={openAddTab} className="bg-indigo-600 hover:bg-indigo-700">
                          + Provision First School Tenant
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {tenant.logo_url ? (
                        <img
                          src={resolveLogoUrl(tenant.logo_url)}
                          alt="logo"
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        style={{ display: tenant.logo_url ? 'none' : 'flex' }}
                        className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-bold rounded-lg items-center justify-center text-sm border border-brand-200 dark:border-brand-800"
                      >
                        {tenant.school_name ? tenant.school_name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tenant.school_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{tenant.school_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{tenant.email || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full 
                        ${tenant.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400'}`}>
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => openEditTab(tenant)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(tenant.id)}
                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold"
                      >
                        {tenant.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORM VIEW */}
      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex justify-between items-center pb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingTenant ? 'Edit School' : 'Add New School'}
            </h2>
            <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>
              ← Back
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm p-10 space-y-8">
            {/* Logo Upload */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-slate-300">School Logo</label>
              <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800">
                {logoPreview ? (
                  <img src={resolveLogoUrl(logoPreview)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm">No Logo</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Click to upload logo (Max 5MB)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">School Name *</label>
                <Input type="text" required value={formData.school_name} onChange={(e) => setFormData({ ...formData, school_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">School Code *</label>
                <Input type="text" required value={formData.school_code} onChange={(e) => setFormData({ ...formData, school_code: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Subdomain</label>
                <Input type="text" value={formData.subdomain} onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })} placeholder="school-name" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Address</label>
              <Input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Principal Name</label>
                <Input type="text" value={formData.principal_name} onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Phone</label>
                <Input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            {/* BRANDING SECTION */}
            <div className="border-t border-gray-200 dark:border-slate-800 pt-8 mt-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">White-labeling & Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Primary Brand Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={formData.primary_color} 
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <Input type="text" value={formData.primary_color} onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-gray-700 dark:text-slate-300">Login Background Image URL</label>
                  <Input type="text" value={formData.login_background_url} onChange={(e) => setFormData({ ...formData, login_background_url: e.target.value })} placeholder="https://example.com/bg.jpg" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 accent-blue-600"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">School is Active</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8">
            <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitLoading}>
              {submitLoading ? 'Saving...' : editingTenant ? 'Update School' : 'Create School'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}