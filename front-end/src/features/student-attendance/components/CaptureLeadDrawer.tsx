import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';
import api from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';

interface LookupItem {
  id: string;
  name: string;
}

interface CaptureLeadDrawerProps {
  onClose: () => void;
  classes: LookupItem[];
  tenantId: string;
  onSuccess: () => void;
}

export default function CaptureLeadDrawer({ onClose, classes, tenantId, onSuccess }: CaptureLeadDrawerProps) {
  const [formData, setFormData] = useState({
    child_name: '',
    father_name: '',
    b_form: '',
    phone_number: '',
    class_id: '',
    remarks: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const classOptions = classes.map(c => ({ value: c.id, label: c.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const formattedRemarks = `BForm: ${formData.b_form || 'N/A'} | ${formData.remarks}`;
      await api.post('/admissionenquiries', {
        child_name: formData.child_name,
        father_name: formData.father_name,
        phone_number: formData.phone_number,
        class_id: formData.class_id,
        remarks: formattedRemarks,
        tenant_id: tenantId
      });
      Swal.fire({ 
        icon: 'success', 
        title: 'Lead Captured!', 
        text: 'New admission enquiry saved successfully.', 
        timer: 1500, 
        showConfirmButton: false 
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      Swal.fire('Error', err.response?.data?.message || 'Failed to save enquiry.', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-bl-3xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="absolute -bottom-8 left-5">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-3xl text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 shadow-lg">
              ✨
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-10 px-5 pb-5 custom-scrollbar">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Capture New Lead</h2>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">Register a prospective student</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label required>Child / Student Name</Label>
              <Input 
                type="text" 
                required 
                placeholder="e.g. Ali Khan" 
                value={formData.child_name} 
                onChange={e => setFormData({...formData, child_name: e.target.value})} 
              />
            </div>
            <div>
              <Label required>Father / Guardian Name</Label>
              <Input 
                type="text" 
                required 
                placeholder="e.g. Tariq Khan" 
                value={formData.father_name} 
                onChange={e => setFormData({...formData, father_name: e.target.value})} 
              />
            </div>
            <div>
              <Label>B-Form / Bay Form Number (Optional)</Label>
              <Input 
                type="text" 
                placeholder="e.g. 42101-1234567-1" 
                value={formData.b_form} 
                onChange={e => setFormData({...formData, b_form: e.target.value})} 
              />
            </div>
            <div>
              <Label required>Phone / WhatsApp</Label>
              <Input 
                type="tel" 
                required 
                placeholder="03XXXXXXXXX" 
                value={formData.phone_number} 
                onChange={e => setFormData({...formData, phone_number: e.target.value})} 
              />
            </div>
            <div>
              <SearchableSelect 
                label="Target Class *"
                options={classOptions} 
                value={formData.class_id} 
                onChange={val => setFormData({...formData, class_id: val as string})} 
              />
            </div>
            <div>
              <Label>Remarks / Inquiry Source</Label>
              <textarea 
                rows={4} 
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm text-gray-800 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:border-emerald-500 outline-none transition-all resize-none shadow-theme-xs"
                placeholder="e.g. Visited school today, heard from Facebook ad..."
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                loading={submitLoading}
                loadingText="Saving..."
                disabled={!formData.class_id}
              >
                Save Enquiry
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
