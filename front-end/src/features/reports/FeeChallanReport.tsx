import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import { toast } from '../../components/ui/Toast';
import { Receipt, Printer, RefreshCw } from 'lucide-react';
import { activeClientConfig } from '../../config/clientConfig';

export default function FeeChallanReport() {
  const tenantId = localStorage.getItem('tenantId') || '';

  const [feeChallans, setFeeChallans] = useState<any[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [selectedChallanId, setSelectedChallanId] = useState('');
  const [loading, setLoading] = useState(false);

  const [challanForm, setChallanForm] = useState({
    studentName: '',
    fatherName: '',
    rollNo: '',
    className: '',
    month: 'August 2026',
    dueDate: '10-08-2026',
    challanNo: 'FC-10001',
    tuitionFee: 10000,
    labFee: 1000,
    examFee: 500,
    fine: 0,
    concession: 0
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
      const [challanRes, tenantRes] = await Promise.all([
        api.get(`/feechallans/tenant/${activeTenant}`).catch(() => ({ data: [] })),
        api.get(`/tenants/${activeTenant}`).catch(() => ({ data: null }))
      ]);

      const challanData = challanRes.data || [];
      setFeeChallans(challanData);
      if (tenantRes.data) setTenantInfo(tenantRes.data);

      if (challanData.length > 0) selectFeeChallanForView(challanData[0]);
    } catch (err) {
      toast.error('Failed to load fee vouchers.');
    } finally {
      setLoading(false);
    }
  };

  const selectFeeChallanForView = (ch: any) => {
    if (!ch) return;
    setChallanForm({
      studentName: ch.student_name || 'Student Name',
      fatherName: ch.father_name || 'Guardian Name',
      rollNo: ch.roll_number?.toString() || ch.admission_number || 'N/A',
      className: ch.class_name || 'Class Registered',
      month: ch.billing_month || 'Current Month',
      dueDate: ch.due_date ? new Date(ch.due_date).toLocaleDateString() : '10th of Month',
      challanNo: ch.challan_number || `FC-${ch.id?.slice(0, 6)}`,
      tuitionFee: ch.tuition_fee || ch.amount || 10000,
      labFee: ch.lab_fee || 1000,
      examFee: ch.exam_fee || 500,
      fine: ch.fine_amount || 0,
      concession: ch.concession_amount || 0
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageMeta title="3-Copy Fee Voucher Slip Report" description="Printable 3-Copy Fee Payment Voucher" />

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
          <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: '3-Copy Fee Voucher Slip' }]} />
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Receipt className="w-6 h-6 text-brand-500" /> 3-Copy Fee Voucher Slip Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Official A4 3-part printable fee collection vouchers (Bank, School, and Parent Copy).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchInitialLiveData} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print Vouchers
            </Button>
          </div>
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Select Active Fee Challan from Database</h3>
            <span className="text-xs text-gray-500">Live Fee Records: {feeChallans.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="Select Active Database Challan"
              options={feeChallans.map((ch: any) => ({
                value: ch.id,
                label: `Challan #${ch.challan_number || ch.id?.slice(0, 8)} - ${ch.student_name || 'Student'} (${ch.billing_month || 'Fee'}) - Rs. ${ch.amount || ch.tuition_fee || 10000}`
              }))}
              value={selectedChallanId}
              onChange={(val) => {
                setSelectedChallanId(val as string);
                const found = feeChallans.find((c: any) => c.id === val);
                if (found) selectFeeChallanForView(found);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <Label>Student Name</Label>
              <Input value={challanForm.studentName} onChange={e => setChallanForm({ ...challanForm, studentName: e.target.value })} />
            </div>
            <div>
              <Label>Roll / Adm #</Label>
              <Input value={challanForm.rollNo} onChange={e => setChallanForm({ ...challanForm, rollNo: e.target.value })} />
            </div>
            <div>
              <Label>Tuition Fee (PKR)</Label>
              <Input type="number" value={challanForm.tuitionFee} onChange={e => setChallanForm({ ...challanForm, tuitionFee: +e.target.value })} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input value={challanForm.dueDate} onChange={e => setChallanForm({ ...challanForm, dueDate: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Printable 3-Copy Voucher Layout */}
        <div className="printable-area bg-white text-black p-4 rounded-xl shadow-sm border space-y-4">
          <div className="text-center font-bold text-xs uppercase tracking-wider text-gray-600 mb-2">
            Official 3-Part Fee Payment Voucher (A4 Printable Copy)
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-t pt-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-300">
            {['BANK COPY', 'SCHOOL COPY', 'PARENT COPY'].map((copyTitle, copyIdx) => {
              const totalPayable = challanForm.tuitionFee + challanForm.labFee + challanForm.examFee + challanForm.fine - challanForm.concession;
              const instName = tenantInfo?.name || tenantInfo?.school_name || activeClientConfig.branding.schoolName;

              return (
                <div key={copyIdx} className="p-3 space-y-3">
                  <div className="text-center border-b pb-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-200 text-gray-800 uppercase block mb-1">
                      {copyTitle}
                    </span>
                    <h4 className="font-extrabold text-sm text-gray-900 uppercase">{instName}</h4>
                    <p className="text-[10px] text-gray-600">Official Fee Collection Copy</p>
                    <p className="text-[10px] font-mono font-bold mt-1">Challan #: {challanForm.challanNo}</p>
                  </div>

                  <div className="text-[11px] space-y-1">
                    <div className="flex justify-between"><span className="text-gray-600">Student:</span> <span className="font-bold">{challanForm.studentName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Father:</span> <span>{challanForm.fatherName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Class:</span> <span>{challanForm.className}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Roll #:</span> <span className="font-mono">{challanForm.rollNo}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Billing Month:</span> <span className="font-bold text-brand-600">{challanForm.month}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Due Date:</span> <span className="font-bold text-rose-600">{challanForm.dueDate}</span></div>
                  </div>

                  <table className="w-full text-[11px] border-t border-b border-gray-300 py-1 my-2">
                    <tbody>
                      <tr><td>Tuition Fee</td><td className="text-right font-mono">Rs. {challanForm.tuitionFee}</td></tr>
                      <tr><td>Lab / Computer Fee</td><td className="text-right font-mono">Rs. {challanForm.labFee}</td></tr>
                      <tr><td>Exam Fee</td><td className="text-right font-mono">Rs. {challanForm.examFee}</td></tr>
                      <tr><td>Concession</td><td className="text-right font-mono text-emerald-600">- Rs. {challanForm.concession}</td></tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center font-bold text-sm bg-gray-100 p-2 rounded">
                    <span>NET PAYABLE:</span>
                    <span className="font-mono text-brand-900">Rs. {totalPayable}</span>
                  </div>

                  <div className="pt-4 text-[10px] text-center text-gray-500 space-y-1">
                    <p>Bank Cashier Stamp & Signature</p>
                    <div className="w-full h-8 border-b border-dashed"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
