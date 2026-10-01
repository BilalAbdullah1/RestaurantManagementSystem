import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, AlertTriangle, Phone, User, Syringe, FileText, Stethoscope, Save } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import api from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';

interface StudentMedicalRecord {
  id?: string;
  student_id: string;
  tenant_id: string;
  allergies?: string;
  chronic_conditions?: string;
  vaccination_status?: string;
  family_medical_history?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  doctor_name?: string;
  doctor_phone?: string;
  additional_notes?: string;
}

interface StudentMedicalFormProps {
  studentId: string;
  studentName: string;
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

const VACCINATION_OPTIONS = [
  { value: 'Fully Vaccinated', label: '✅ Fully Vaccinated' },
  { value: 'Partially Vaccinated', label: '⚠️ Partially Vaccinated' },
  { value: 'Not Vaccinated', label: '❌ Not Vaccinated' },
  { value: 'Unknown', label: '❓ Unknown' },
];

const RELATION_OPTIONS = [
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Guardian', label: 'Guardian' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Other', label: 'Other' },
];

export default function StudentMedicalForm({ studentId, studentName, tenantId, isOpen, onClose }: StudentMedicalFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<StudentMedicalRecord>({
    student_id: studentId,
    tenant_id: tenantId,
    allergies: '',
    chronic_conditions: '',
    vaccination_status: 'Unknown',
    family_medical_history: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: 'Father',
    doctor_name: '',
    doctor_phone: '',
    additional_notes: '',
  });

  useEffect(() => {
    if (!isOpen || !studentId) return;
    fetchRecord();
  }, [isOpen, studentId]);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/studentmedical/student/${studentId}`);
      if (res.data) {
        setRecord({ ...res.data });
      } else {
        setRecord(prev => ({ ...prev, student_id: studentId, tenant_id: tenantId }));
      }
    } catch (err) {
      console.error('Failed to load medical record', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/studentmedical', record);
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Medical record saved!', showConfirmButton: false, timer: 2500 });
      onClose();
    } catch (err) {
      Swal.fire('Error', 'Failed to save medical record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col z-[9999] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="relative h-36 bg-gradient-to-r from-rose-500 to-pink-600 rounded-bl-3xl shrink-0 flex flex-col justify-center px-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Medical Profile</h2>
              <p className="text-white/80 text-sm">{studentName}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* Health Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" /> Health Details
                </h4>
                <div>
                  <Label>Allergies</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Penicillin, Peanuts, Dust"
                    value={record.allergies || ''}
                    onChange={e => setRecord(prev => ({ ...prev, allergies: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Chronic Conditions</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Asthma, Diabetes, Epilepsy"
                    value={record.chronic_conditions || ''}
                    onChange={e => setRecord(prev => ({ ...prev, chronic_conditions: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Family Medical History</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Heart disease, Diabetes"
                    value={record.family_medical_history || ''}
                    onChange={e => setRecord(prev => ({ ...prev, family_medical_history: e.target.value }))}
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="Vaccination Status"
                    options={VACCINATION_OPTIONS}
                    value={record.vaccination_status || 'Unknown'}
                    onChange={val => setRecord(prev => ({ ...prev, vaccination_status: val as string }))}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" /> Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Contact Name *</Label>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={record.emergency_contact_name || ''}
                      onChange={e => setRecord(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <SearchableSelect
                      label="Relation"
                      options={RELATION_OPTIONS}
                      value={record.emergency_contact_relation || 'Father'}
                      onChange={val => setRecord(prev => ({ ...prev, emergency_contact_relation: val as string }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Emergency Phone *</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 0300-1234567"
                    value={record.emergency_contact_phone || ''}
                    onChange={e => setRecord(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-500" /> Doctor / Physician
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Doctor Name</Label>
                    <Input
                      type="text"
                      placeholder="Dr. Ahmed Ali"
                      value={record.doctor_name || ''}
                      onChange={e => setRecord(prev => ({ ...prev, doctor_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Doctor Phone</Label>
                    <Input
                      type="text"
                      placeholder="0300-1234567"
                      value={record.doctor_phone || ''}
                      onChange={e => setRecord(prev => ({ ...prev, doctor_phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label>Additional Notes</Label>
                <textarea
                  rows={3}
                  placeholder="Any other medical information..."
                  value={record.additional_notes || ''}
                  onChange={e => setRecord(prev => ({ ...prev, additional_notes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || loading} className="flex-1">
            {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" />Save Medical Record</>}
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
