import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import DatePicker from '../../components/form/date-picker';
import { toast } from '../../components/ui/Toast';
import { GraduationCap, Printer, RefreshCw } from 'lucide-react';

export default function SlcCertificateReport() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const [slcForm, setSlcForm] = useState({
    studentId: '',
    studentName: '',
    fatherName: '',
    admissionNo: '',
    className: '',
    dateOfAdmission: '',
    dateOfLeaving: new Date().toISOString().slice(0, 10),
    conduct: 'Excellent',
    reasonForLeaving: 'Passed Examination & Relocating.',
    remarks: 'Demonstrated high academic performance and active participation.'
  });

  useEffect(() => {
    if (!tenantId) return;
    fetchInitialLiveData();
  }, [tenantId]);

  const fetchInitialLiveData = async () => {
    const activeTenant = tenantId || localStorage.getItem("tenantId") || "";
    if (!activeTenant) return;
    setLoading(true);
    try {
      const [classRes, studentRes, tenantRes] = await Promise.all([
        api.get(`/classes/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/students/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/tenants/${activeTenant}`).catch(() => ({ data: null }))
      ]);

      const classData = classRes.data || [];
      const studentData = studentRes.data || [];
      setClasses(classData.map((c: any) => ({ value: c.id, label: c.name })));
      setStudents(studentData);
      if (tenantRes.data) setTenantInfo(tenantRes.data);

      if (studentData.length > 0) selectStudentForSlc(studentData[0], classData);
    } catch (err) {
      toast.error('Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  const selectStudentForSlc = (st: any, currentClasses = classes) => {
    if (!st) return;
    const clsName = currentClasses.find(c => c.value === st.class_id)?.label || 'Class Registered';
    setSlcForm({
      studentId: st.id,
      studentName: `${st.first_name || ''} ${st.last_name || ''}`.trim() || 'Student Name',
      fatherName: st.father_name || st.guardian_name || 'Guardian Name',
      admissionNo: st.admission_number || 'ADM-OFFICIAL',
      className: clsName,
      dateOfAdmission: st.admission_date ? new Date(st.admission_date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      dateOfLeaving: new Date().toISOString().slice(0, 10),
      conduct: 'Excellent',
      reasonForLeaving: 'Passed Examination & Relocating.',
      remarks: 'Demonstrated high academic performance and good moral character.'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageMeta title="School Leaving Certificate (SLC) Report" description="Official Printable School Leaving & Character Certificate" />

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <div className="no-print">
          <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'School Leaving Certificate (SLC)' }]} />
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-brand-500" /> School Leaving Certificate (SLC) Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Generate and print official School Leaving and Character Certificates with official signatures and seal.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchInitialLiveData} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print SLC Certificate
            </Button>
          </div>
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Select Student for SLC Generation</h3>
            <span className="text-xs text-gray-500">Live Database Students: {students.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect
              label="Select Database Student"
              options={students.map((st: any) => ({
                value: st.id,
                label: `${st.first_name || ''} ${st.last_name || ''} (${st.admission_number || 'N/A'})`
              }))}
              value={selectedStudentId}
              onChange={(val) => {
                setSelectedStudentId(val as string);
                const found = students.find((s: any) => s.id === val);
                if (found) selectStudentForSlc(found);
              }}
            />
            <div>
              <Label>Conduct & Behavior</Label>
              <Input value={slcForm.conduct} onChange={e => setSlcForm({ ...slcForm, conduct: e.target.value })} />
            </div>
            <div>
              <Label>Date of Leaving</Label>
              <DatePicker id="slc-leaving-date" value={slcForm.dateOfLeaving} onChange={(e: any) => setSlcForm({ ...slcForm, dateOfLeaving: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Printable Official SLC Certificate Layout */}
        <div className="printable-area bg-amber-50/40 text-gray-900 p-8 rounded-xl border-4 border-double border-amber-800/60 shadow-lg space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2 border-b-2 border-amber-800/40 pb-6">
            <h1 className="text-3xl font-serif font-extrabold text-amber-950 tracking-wider uppercase">
              {tenantInfo?.name || tenantInfo?.school_name || "SCHOOL MANAGEMENT SYSTEM"}
            </h1>
            <p className="text-xs font-serif text-amber-900 uppercase tracking-widest">Recognized Board of Intermediate & Secondary Education</p>
            <div className="inline-block bg-amber-900 text-amber-100 font-serif px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest mt-2">
              School Leaving & Character Certificate
            </div>
          </div>

          <div className="text-sm font-serif leading-relaxed space-y-6 px-4">
            <div className="flex justify-between text-xs font-bold text-amber-900">
              <span>Certificate No: <strong className="font-mono text-black">SLC-2026-0941</strong></span>
              <span>Admission No: <strong className="font-mono text-black">{slcForm.admissionNo}</strong></span>
            </div>

            <p className="text-base text-justify">
              This is to certify that <u className="font-bold text-amber-950 px-2">{slcForm.studentName}</u>, 
              Son/Daughter of <u className="font-bold text-amber-950 px-2">{slcForm.fatherName}</u>, 
              was a bonafide student of this institution in <u className="font-bold text-amber-950 px-2">{slcForm.className}</u>.
            </p>

            <div className="grid grid-cols-2 gap-4 bg-white/80 p-4 rounded-xl border border-amber-200">
              <div>
                <span className="text-xs text-gray-500 block">Date of Admission:</span>
                <strong className="font-mono">{slcForm.dateOfAdmission}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Date of Leaving School:</span>
                <strong className="font-mono">{slcForm.dateOfLeaving}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">General Conduct & Character:</span>
                <strong className="text-emerald-800 font-bold">{slcForm.conduct}</strong>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">School Dues Paid Clearance:</span>
                <strong className="text-emerald-800 font-bold">ALL DUES CLEARED 🟢</strong>
              </div>
            </div>

            <p>
              <strong>Reason for Leaving School:</strong> <span className="italic">{slcForm.reasonForLeaving}</span>
            </p>

            <p>
              <strong>Remarks / Achievements:</strong> <span className="italic">{slcForm.remarks}</span>
            </p>
          </div>

          <div className="flex justify-between items-end pt-12 text-xs font-serif font-bold text-amber-950 border-t border-amber-800/40">
            <div className="text-center">
              <div className="w-36 border-b border-gray-800 mb-1"></div>
              <p>Checked By (Registrar)</p>
            </div>
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-800 flex items-center justify-center text-[10px] text-amber-800 text-center uppercase font-bold p-1">
              Official School Seal
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-gray-800 mb-1"></div>
              <p>Principal Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
