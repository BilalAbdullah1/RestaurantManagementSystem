import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { GraduationCap, CheckCircle2, ChevronRight, ChevronLeft, User, Phone, BookOpen, FileText, Loader2 } from 'lucide-react';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import DatePicker from '../../components/form/date-picker';

const API_BASE = '/api';

import api from '../../utils/axiosConfig';
import { getFileBaseUrl } from '../../utils/apiConfig';
import { activeClientConfig } from '../../config/clientConfig';

interface SchoolClass {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  school_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
}

type Step = 'child' | 'parent' | 'class' | 'success';

export default function PublicAdmissionPortal() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const effectiveTenantId = tenantId || localStorage.getItem('tenantId') || '';

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [step, setStep] = useState<Step>('child');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
  }, [tenant?.logo_url]);

  const [formData, setFormData] = useState({
    child_name: '',
    child_dob: '',
    child_gender: '',
    child_bform: '',
    father_name: '',
    father_cnic: '',
    phone_number: '',
    address: '',
    class_id: '',
    remarks: '',
    tenant_id: effectiveTenantId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPublicData();
  }, [effectiveTenantId]);

  const fetchPublicData = async () => {
    if (!effectiveTenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tenantRes, classesRes] = await Promise.all([
        api.get(`/tenants/${effectiveTenantId}`),
        api.get(`/classes/tenant/${effectiveTenantId}`),
      ]);
      setTenant(tenantRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      console.error('Failed to load school info', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = (currentStep: Step) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 'child') {
      if (!formData.child_name.trim()) newErrors.child_name = 'Child name is required';
      if (!formData.child_gender) newErrors.child_gender = 'Please select gender';
    }
    if (currentStep === 'parent') {
      if (!formData.father_name.trim()) newErrors.father_name = "Father's name is required";
      if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    }
    if (currentStep === 'class') {
      if (!formData.class_id) newErrors.class_id = 'Please select a class';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'child' && validate('child')) setStep('parent');
    else if (step === 'parent' && validate('parent')) setStep('class');
    else if (step === 'class' && validate('class')) handleSubmit();
  };

  const handleBack = () => {
    if (step === 'parent') setStep('child');
    else if (step === 'class') setStep('parent');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        tenant_id: effectiveTenantId,
        child_name: formData.child_name,
        father_name: formData.father_name,
        phone_number: formData.phone_number,
        class_id: formData.class_id,
        remarks: `DOB: ${formData.child_dob || 'N/A'} | Gender: ${formData.child_gender} | BForm: ${formData.child_bform || 'N/A'} | CNIC: ${formData.father_cnic || 'N/A'} | Address: ${formData.address || 'N/A'} | ${formData.remarks}`,
      };
      const res = await api.post(`/admissionenquiries/public-apply`, payload);
      setReferenceId(res.data.reference_id);
      setStep('success');
    } catch (err) {
      console.error('Submission failed', err);
      setErrors({ submit: 'Submission failed. Please try again or contact the school directly.' });
    } finally {
      setSubmitting(false);
    }
  };

  const schoolName = tenant?.school_name || 'School';
  const primaryColor = '#4F46E5';

  const stepList = [
    { id: 'child', label: "Child's Info", icon: User },
    { id: 'parent', label: "Parent Info", icon: Phone },
    { id: 'class', label: "Class & Notes", icon: BookOpen },
  ];

  const currentStepIdx = stepList.findIndex(s => s.id === step);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col animate-pulse">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 py-10 px-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4" />
          <div className="h-8 bg-white/20 rounded-lg w-64 mx-auto mb-2" />
          <div className="h-4 bg-white/20 rounded w-48 mx-auto" />
        </div>
        <div className="flex-1 flex items-start justify-center p-6 pt-10">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-10 px-6 text-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm overflow-hidden">
            {!logoFailed && tenant?.logo_url ? (
              <img 
                src={getFileBaseUrl(tenant.logo_url)} 
                alt="Logo" 
                className="w-full h-full object-contain p-1" 
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <GraduationCap className="w-9 h-9 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{schoolName}</h1>
          <p className="text-indigo-200 text-lg">Online Admission Application Portal</p>
          <p className="text-indigo-300 text-sm mt-1">Academic Year {new Date().getFullYear()} – {new Date().getFullYear() + 1}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-xl">

          {step !== 'success' && (
            <>
              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                {stepList.map((s, idx) => {
                  const Icon = s.icon;
                  const isActive = s.id === step;
                  const isDone = idx < currentStepIdx;
                  return (
                    <React.Fragment key={s.id}>
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                          isDone ? 'bg-green-500 text-white' :
                          isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <p className={`text-xs mt-1 font-medium ${isActive ? 'text-indigo-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</p>
                      </div>
                      {idx < stepList.length - 1 && (
                        <div className={`h-0.5 w-16 mx-2 mb-5 transition-all duration-300 ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 pt-8 pb-2">
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{errors.submit}</div>
                  )}

                  {/* Step 1: Child Info */}
                  {step === 'child' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Child's Information</h2>
                        <p className="text-gray-500 text-sm mt-1">Tell us about your child who is applying</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Child's Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ahmed Ali"
                          value={formData.child_name}
                          onChange={e => setFormData(p => ({ ...p, child_name: e.target.value }))}
                          className={`w-full rounded-xl border ${errors.child_name ? 'border-red-400' : 'border-gray-300'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all`}
                        />
                        {errors.child_name && <p className="text-red-500 text-xs mt-1">{errors.child_name}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <DatePicker
                            label="Date of Birth"
                            placeholder="Select DOB..."
                            value={formData.child_dob}
                            onChange={(e) => setFormData(p => ({ ...p, child_dob: e.target.value }))}
                          />
                        </div>
                        <div>
                          <SearchableSelect
                            label="Gender *"
                            options={[
                              { value: 'Male', label: 'Male' },
                              { value: 'Female', label: 'Female' }
                            ]}
                            value={formData.child_gender}
                            onChange={val => setFormData(p => ({ ...p, child_gender: val as string }))}
                          />
                          {errors.child_gender && <p className="text-red-500 text-xs mt-1">{errors.child_gender}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Child's B-Form / Bay Form Number (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 42101-1234567-1"
                          value={formData.child_bform}
                          onChange={e => setFormData(p => ({ ...p, child_bform: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Parent Info */}
                  {step === 'parent' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Parent / Guardian Details</h2>
                        <p className="text-gray-500 text-sm mt-1">We need your contact information</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Father's / Guardian's Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Muhammad Ali"
                          value={formData.father_name}
                          onChange={e => setFormData(p => ({ ...p, father_name: e.target.value }))}
                          className={`w-full rounded-xl border ${errors.father_name ? 'border-red-400' : 'border-gray-300'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all`}
                        />
                        {errors.father_name && <p className="text-red-500 text-xs mt-1">{errors.father_name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="e.g. 0300-1234567"
                          value={formData.phone_number}
                          onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                          className={`w-full rounded-xl border ${errors.phone_number ? 'border-red-400' : 'border-gray-300'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all`}
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Father's CNIC</label>
                        <input
                          type="text"
                          placeholder="e.g. 42101-1234567-1"
                          value={formData.father_cnic}
                          onChange={e => setFormData(p => ({ ...p, father_cnic: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Residential Address</label>
                        <textarea
                          rows={3}
                          placeholder="Enter your full residential address"
                          value={formData.address}
                          onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Class Selection */}
                  {step === 'class' && (
                    <div className="space-y-5">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Class & Additional Notes</h2>
                        <p className="text-gray-500 text-sm mt-1">Which class is your child applying for?</p>
                      </div>
                      <div>
                        <SearchableSelect
                          label="Applying for Class *"
                          options={classes.map(c => ({ value: c.id, label: c.name }))}
                          value={formData.class_id}
                          onChange={val => setFormData(p => ({ ...p, class_id: val as string }))}
                        />
                        {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes / Message</label>
                        <textarea
                          rows={4}
                          placeholder="Any additional information you'd like the school to know..."
                          value={formData.remarks}
                          onChange={e => setFormData(p => ({ ...p, remarks: e.target.value }))}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                        />
                      </div>

                      {/* Summary */}
                      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <h4 className="font-semibold text-indigo-900 text-sm mb-2">Application Summary</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-indigo-600 font-medium">Child:</span> {formData.child_name} ({formData.child_gender})</p>
                          <p><span className="text-indigo-600 font-medium">Father:</span> {formData.father_name}</p>
                          <p><span className="text-indigo-600 font-medium">Phone:</span> {formData.phone_number}</p>
                          <p><span className="text-indigo-600 font-medium">Class:</span> {classes.find(c => c.id === formData.class_id)?.name || 'Not selected'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="px-8 py-6 flex justify-between items-center">
                  <button
                    onClick={handleBack}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all ${step === 'child' ? 'invisible' : ''}`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all disabled:opacity-70"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : step === 'class' ? (
                      <><CheckCircle2 className="w-4 h-4" /> Submit Application</>
                    ) : (
                      <>Next <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Success Screen */}
          {step === 'success' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted! 🎉</h2>
              <p className="text-gray-600 mb-6">Your admission application for <strong>{schoolName}</strong> has been received. Our admissions team will contact you within <strong>24-48 hours</strong>.</p>
              <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-indigo-600 font-medium">Application Reference ID</p>
                <p className="font-mono text-indigo-900 font-bold text-lg mt-1">{referenceId}</p>
                <p className="text-xs text-indigo-500 mt-1">Save this for your records</p>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <p>📞 You can also contact us directly for faster response</p>
                {tenant?.phone && <p className="font-semibold text-gray-700">{tenant.phone}</p>}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Powered by <span className="text-indigo-500 font-semibold">{tenant?.school_name || activeClientConfig.branding.schoolName}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
