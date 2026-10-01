import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { FileText, Award, ShieldCheck, GraduationCap, Download, Eye } from 'lucide-react';
import jsPDF from 'jspdf';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_name?: string;
  section_name?: string;
  father_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number?: string;
}

type CertificateType = 'Transfer Certificate' | 'Bonafide Certificate' | 'Character Certificate';

interface IssuedRecord {
  id: string;
  studentName: string;
  admissionNo: string;
  certificateType: CertificateType;
  issuedAt: Date;
}

const CERTIFICATE_TYPES: { value: CertificateType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    value: 'Transfer Certificate',
    label: 'Transfer Certificate (TC)',
    icon: <FileText className="w-5 h-5" />,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    value: 'Bonafide Certificate',
    label: 'Bonafide / Student Status Certificate',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    value: 'Character Certificate',
    label: 'Character / Good Conduct Certificate',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-600',
  },
];

function generateCertificatePDF(student: Student, certType: CertificateType, schoolName: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, pageW / 2, 16, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Established · Excellence in Education', pageW / 2, 24, { align: 'center' });
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(certType.toUpperCase(), pageW / 2, 34, { align: 'center' });

  doc.setTextColor(30, 30, 30);
  const studentName = `${student.first_name} ${student.last_name}`;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  let body = '';
  if (certType === 'Transfer Certificate') {
    body = `This is to certify that ${studentName}, son/daughter of ${student.father_name || '—'}, bearing Admission No. ${student.admission_number}, was a bonafide student of this institution. The student has been a student of Class ${student.class_name || '—'}, Section ${student.section_name || '—'}.\n\nThe student is hereby granted this Transfer Certificate for the purpose of seeking admission elsewhere. The student's character and conduct were found to be satisfactory during the period of study in this institution.\n\nThis certificate is issued on ${today}.`;
  } else if (certType === 'Bonafide Certificate') {
    body = `This is to certify that ${studentName}, son/daughter of ${student.father_name || '—'}, bearing Admission No. ${student.admission_number}, is a bonafide student of this institution, currently enrolled in Class ${student.class_name || '—'}, Section ${student.section_name || '—'}.\n\nThis certificate is issued on request for official/educational purposes.\n\nIssued on: ${today}.`;
  } else {
    body = `This is to certify that ${studentName}, son/daughter of ${student.father_name || '—'}, bearing Admission No. ${student.admission_number}, was/is a student of Class ${student.class_name || '—'}, Section ${student.section_name || '—'}.\n\nDuring the course of study in this institution, the student's character and conduct were observed to be of the highest moral standards. The student was disciplined, honest, and respectful to faculty and peers alike.\n\nThis certificate is issued on ${today}.`;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(body, 160);
  doc.text(lines, 25, 60);

  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(25, 130, 160, 40, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('STUDENT DETAILS', 30, 138);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Name: ${studentName}`, 30, 146);
  doc.text(`Adm. No: ${student.admission_number}`, 30, 153);
  doc.text(`Class: ${student.class_name || '—'} — ${student.section_name || '—'}`, 30, 160);
  if (student.date_of_birth) doc.text(`DOB: ${new Date(student.date_of_birth).toLocaleDateString()}`, 120, 146);
  if (student.gender) doc.text(`Gender: ${student.gender}`, 120, 153);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Principal / Head of Institution', pageW - 30, 240, { align: 'right' });
  doc.setDrawColor(30, 30, 30);
  doc.line(pageW - 80, 235, pageW - 25, 235);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Authorized Signature & Official Stamp', pageW - 30, 245, { align: 'right' });

  doc.setFillColor(243, 244, 246);
  doc.rect(0, 275, pageW, 22, 'F');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Issued: ${today} | ${certType} | ${schoolName}`, pageW / 2, 284, { align: 'center' });
  doc.text('This is a computer-generated certificate and does not require a physical signature.', pageW / 2, 290, { align: 'center' });

  doc.save(`${certType.replace(/ /g, '_')}_${student.admission_number}.pdf`);
}

export default function StudentCertificatesReport() {
  const tenantId = localStorage.getItem('tenantId') || '';
  const schoolName = localStorage.getItem('schoolName') || 'School Management System';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCertType, setSelectedCertType] = useState<CertificateType>('Bonafide Certificate');
  const [issuedHistory, setIssuedHistory] = useState<IssuedRecord[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    api.get<Student[]>(`/students/tenant/${tenantId}`)
      .then(r => setStudents(r.data))
      .catch(() => Swal.fire('Error', 'Could not load student list.', 'error'))
      .finally(() => setLoading(false));
  }, [tenantId]);

  const selectedStudent = useMemo(
    () => students.find(s => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const studentOptions = useMemo(() =>
    students.map(s => ({
      value: s.id,
      label: `${s.first_name} ${s.last_name} (${s.admission_number})`
    })), [students]
  );

  const handleGenerate = () => {
    if (!selectedStudent) {
      Swal.fire('Select Student', 'Please select a student first.', 'warning');
      return;
    }
    generateCertificatePDF(selectedStudent, selectedCertType, schoolName);
    const record: IssuedRecord = {
      id: Date.now().toString(),
      studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      admissionNo: selectedStudent.admission_number,
      certificateType: selectedCertType,
      issuedAt: new Date(),
    };
    setIssuedHistory(prev => [record, ...prev]);
    Swal.fire({
      icon: 'success',
      title: 'Certificate Generated! 🎓',
      text: `${selectedCertType} for ${selectedStudent.first_name} has been downloaded.`,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const certCounts = useMemo(() => ({
    tc: issuedHistory.filter(r => r.certificateType === 'Transfer Certificate').length,
    bonafide: issuedHistory.filter(r => r.certificateType === 'Bonafide Certificate').length,
    character: issuedHistory.filter(r => r.certificateType === 'Character Certificate').length,
  }), [issuedHistory]);

  return (
    <div className="w-full space-y-6">
      <div>
        <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Student Certificates Report' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="w-7 h-7 text-amber-500" />
              Student Certificates Report (TC, Bonafide, Character)
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Generate Transfer Certificates (TC), Bonafide Certificates, and Character Certificates.
            </p>
          </div>
        </div>
      </div>

      <StatCards
        stats={[
          { title: 'Transfer Certificates', value: certCounts.tc, icon: <FileText className="w-5 h-5" />, theme: 'brand' },
          { title: 'Bonafide Certificates', value: certCounts.bonafide, icon: <GraduationCap className="w-5 h-5" />, theme: 'success' },
          { title: 'Character Certificates', value: certCounts.character, icon: <ShieldCheck className="w-5 h-5" />, theme: 'warning' },
          { title: 'Total Issued (Session)', value: issuedHistory.length, icon: <Award className="w-5 h-5" />, theme: 'indigo' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              1. Select Certificate Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CERTIFICATE_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => setSelectedCertType(ct.value)}
                  className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedCertType === ct.value
                      ? 'border-transparent bg-gradient-to-br ' + ct.color + ' text-white shadow-lg scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`mb-2 ${selectedCertType === ct.value ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {ct.icon}
                  </div>
                  <p className={`text-xs font-bold leading-snug ${selectedCertType === ct.value ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                    {ct.label}
                  </p>
                  {selectedCertType === ct.value && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              2. Select Student
            </h3>
            {loading ? (
              <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ) : (
              <SearchableSelect
                label="Search & Select Student"
                options={studentOptions}
                value={selectedStudentId}
                onChange={(val) => setSelectedStudentId(val as string)}
                placeholder="Type student name or admission number..."
              />
            )}

            {selectedStudent && (
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {selectedStudent.first_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {selectedStudent.first_name} {selectedStudent.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Adm: {selectedStudent.admission_number} · {selectedStudent.class_name || 'N/A'} — {selectedStudent.section_name || 'N/A'}
                    </p>
                  </div>
                  <Badge variant="light" color="success">Selected</Badge>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              3. Generate & Download
            </h3>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!selectedStudentId}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-0 shadow-lg shadow-amber-500/20 text-base py-3"
            >
              <Download className="w-5 h-5 mr-2" />
              Generate & Download {selectedCertType}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-full">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              Issued Certificates Log
            </h3>

            {issuedHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Award className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-sm font-semibold text-gray-500">No certificates issued yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {issuedHistory.map(record => (
                  <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{record.studentName}</p>
                      <p className="text-xs text-gray-500">Adm: {record.admissionNo}</p>
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">{record.certificateType}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
