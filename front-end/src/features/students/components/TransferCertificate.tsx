import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Printer, Download, GraduationCap } from 'lucide-react';
import Input from '../../../components/form/input/InputField';
import SearchableSelect from '../../../components/form/select/SearchableSelect';
import DatePicker from '../../../components/form/date-picker';
import Label from '../../../components/form/Label';
import Button from '../../../components/ui/button/Button';
import jsPDF from 'jspdf';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  father_name: string;
  father_cnic: string;
  date_of_birth: string;
  address: string;
  gender: string;
  b_form_number: string;
  blood_group?: string;
}

interface TransferCertificateProps {
  student: Student | null;
  schoolName: string;
  enrolledClass: string;
  isOpen: boolean;
  onClose: () => void;
}

const REASON_OPTIONS = [
  { value: 'Transfer to Another City', label: 'Transfer to Another City' },
  { value: 'Transfer to Another School', label: 'Transfer to Another School' },
  { value: 'Completion of Studies', label: 'Completion of Studies' },
  { value: 'Family Relocation', label: 'Family Relocation' },
  { value: 'Financial Reasons', label: 'Financial Reasons' },
  { value: 'Medical Reasons', label: 'Medical Reasons' },
  { value: 'Request of Parents', label: 'Request of Parents' },
  { value: 'Admitted to Another Institution', label: 'Admitted to Another Institution' },
  { value: 'Other', label: 'Other' },
];

const CONDUCT_OPTIONS = [
  { value: 'Excellent', label: '⭐ Excellent' },
  { value: 'Very Good', label: '✅ Very Good' },
  { value: 'Good', label: '👍 Good' },
  { value: 'Satisfactory', label: '🆗 Satisfactory' },
];

export default function TransferCertificate({ student, schoolName, enrolledClass, isOpen, onClose }: TransferCertificateProps) {
  const today = new Date().toISOString().split('T')[0];
  const [leavingDate, setLeavingDate] = useState(today);
  const [reason, setReason] = useState('Request of Parents');
  const [conduct, setConduct] = useState('Good');
  const [feesCleared, setFeesCleared] = useState('Yes');

  if (!isOpen || !student) return null;

  const fullName = `${student.first_name} ${student.last_name}`;

  const generatePDF = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w = 210;

    // Page border
    pdf.setDrawColor(30, 58, 138);
    pdf.setLineWidth(2);
    pdf.rect(8, 8, w - 16, 280);

    // Header
    pdf.setFillColor(30, 58, 138);
    pdf.rect(8, 8, w - 16, 30, 'F');
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text(schoolName.toUpperCase(), w / 2, 24, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('School Management System', w / 2, 32, { align: 'center' });

    // TC Title
    pdf.setFillColor(239, 246, 255);
    pdf.rect(8, 38, w - 16, 12, 'F');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 58, 138);
    pdf.text('SCHOOL LEAVING CERTIFICATE (TRANSFER CERTIFICATE)', w / 2, 47, { align: 'center' });

    // Divider
    pdf.setDrawColor(30, 58, 138);
    pdf.setLineWidth(0.5);
    pdf.line(15, 55, w - 15, 55);

    // Content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);

    const lineSpacing = 10;
    let y = 68;

    const formatDate = (d: string) => {
      try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
      catch { return d; }
    };

    const addRow = (label: string, value: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 58, 138);
      pdf.text(label + ':', 18, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(40, 40, 40);
      pdf.text(value || 'N/A', 80, y);
      y += lineSpacing;
    };

    addRow('GR / Admission No', student.admission_number);
    addRow('Full Name of Student', fullName);
    addRow('Father\'s Full Name', student.father_name);
    addRow('Father\'s CNIC', student.father_cnic);
    addRow('Date of Birth', formatDate(student.date_of_birth));
    addRow('B-Form Number', student.b_form_number);
    addRow('Gender', student.gender);
    addRow('Blood Group', student.blood_group || 'Not Specified');
    addRow('Residential Address', student.address);
    addRow('Last Class Attended', enrolledClass || 'N/A');
    addRow('Date of Leaving', formatDate(leavingDate));
    addRow('Reason for Leaving', reason);
    addRow('Conduct during Study', conduct);
    addRow('Dues / Fees Cleared', feesCleared);

    y += 5;

    // Certification paragraph
    pdf.setFillColor(239, 246, 255);
    pdf.roundedRect(15, y, w - 30, 22, 2, 2, 'F');
    y += 7;
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(30, 58, 138);
    pdf.text(`This is to certify that the above-named student was a bonafide student of ${schoolName}.`, w / 2, y, { align: 'center' });
    y += 6;
    pdf.text('All dues have been cleared and there are no disciplinary proceedings pending against the student.', w / 2, y, { align: 'center' });
    y += 15;

    // Signatures
    pdf.setLineWidth(0.3);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    const sig1X = 25, sig2X = w / 2 - 10, sig3X = w - 70;
    const sigY = y + 15;

    [sig1X, sig2X, sig3X].forEach(sx => {
      pdf.line(sx, sigY, sx + 40, sigY);
    });

    pdf.text('Class Teacher', sig1X + 5, sigY + 5);
    pdf.text('Accountant', sig2X + 5, sigY + 5);
    pdf.text('Principal / Head', sig3X + 3, sigY + 5);

    y = sigY + 20;

    // Date issued
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Date Issued: ${formatDate(today)}`, 18, y);
    pdf.text('Official Seal:', w - 50, y);

    pdf.save(`TC_${fullName.replace(' ', '_')}_${student.admission_number}.pdf`);
  };

  const content = (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col z-[9999] animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="relative h-36 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-bl-3xl shrink-0 flex flex-col justify-center px-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Transfer Certificate</h2>
              <p className="text-white/80 text-sm">{fullName} • {student.admission_number}</p>
            </div>
          </div>
        </div>

        {/* Preview Summary */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Student Information (Auto-filled)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['GR No.', student.admission_number],
                ['Name', fullName],
                ["Father's Name", student.father_name],
                ['Gender', student.gender],
                ['Blood Group', student.blood_group || 'N/A'],
                ['Class', enrolledClass || 'N/A'],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-gray-500 dark:text-gray-400">{label}: </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TC Specific Fields */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="font-bold text-gray-700 dark:text-gray-200">TC Details</h4>
            <div>
              <Label>Date of Leaving *</Label>
              <DatePicker id="tc-leaving-date" value={leavingDate} placeholder="Select leaving date" onChange={e => setLeavingDate(e.target.value)} />
            </div>
            <div>
              <SearchableSelect
                label="Reason for Leaving *"
                options={REASON_OPTIONS}
                value={reason}
                onChange={val => setReason(val as string)}
              />
            </div>
            <div>
              <SearchableSelect
                label="Conduct During Studies"
                options={CONDUCT_OPTIONS}
                value={conduct}
                onChange={val => setConduct(val as string)}
              />
            </div>
            <div>
              <SearchableSelect
                label="All Dues / Fees Cleared?"
                options={[{ value: 'Yes', label: '✅ Yes - All Cleared' }, { value: 'No', label: '❌ No - Pending Dues' }]}
                value={feesCleared}
                onChange={val => setFeesCleared(val as string)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={generatePDF} className="flex-1">
            <Download className="w-4 h-4 mr-2" /> Generate TC PDF
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
