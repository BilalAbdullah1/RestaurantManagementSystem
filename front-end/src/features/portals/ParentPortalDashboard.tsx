import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import SearchableSelect, { SearchableSelectOption } from '../../components/form/select/SearchableSelect';
import { UserCheck, DollarSign, Award, Calendar, Bell, ChevronRight, CheckCircle2, BookOpen, Download, CreditCard, Clock } from 'lucide-react';

interface StudentProfile {
  id: string;
  name: string;
  classSection: string;
  rollNo: string;
  attendancePercent: string;
  feeStatus: 'PAID' | 'UNPAID';
  challanNo: string;
  feeAmount: number;
  latestGrade: string;
  latestExam: string;
}

export default function ParentPortalDashboard() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams, setSearchParams] = useSearchParams();

  const students: StudentProfile[] = [
    {
      id: '1',
      name: 'Ali Hamza',
      classSection: 'Class 9 - Section A',
      rollNo: '104',
      attendancePercent: '94.2%',
      feeStatus: 'UNPAID',
      challanNo: 'CHLN-2026-1004',
      feeAmount: 4500,
      latestGrade: 'Grade A+ (89.4%)',
      latestExam: 'Mid-Term Exam 2026',
    },
    {
      id: '2',
      name: 'Fatima Hamza',
      classSection: 'Class 6 - Section B',
      rollNo: '082',
      attendancePercent: '97.8%',
      feeStatus: 'PAID',
      challanNo: 'CHLN-2026-0982',
      feeAmount: 0,
      latestGrade: 'Grade A (82.1%)',
      latestExam: 'Mid-Term Exam 2026',
    }
  ];

  const [selectedStudentId, setSelectedStudentId] = useState<string>('1');

  useEffect(() => {
    const childParam = searchParams.get('child') || searchParams.get('student');
    if (childParam && students.some(s => s.id === childParam)) {
      setSelectedStudentId(childParam);
    }
  }, [searchParams]);

  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const studentSelectOptions: SearchableSelectOption[] = students.map(s => ({
    value: s.id,
    label: `${s.name} (${s.classSection} - Roll #${s.rollNo})`
  }));

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    setSearchParams({ child: id });
  };

  const handleOnlinePayment = () => {
    Swal.fire({
      title: 'Pay Fee Online 💳',
      html: `
        <div class="text-left text-sm space-y-2 p-2">
          <p><strong>Student:</strong> ${activeStudent.name} (${activeStudent.classSection})</p>
          <p><strong>Voucher:</strong> <span class="font-mono">${activeStudent.challanNo}</span></p>
          <p><strong>Amount:</strong> <span class="text-rose-600 font-extrabold text-base">Rs. ${activeStudent.feeAmount.toLocaleString()}</span></p>
          <hr class="my-2 border-gray-200" />
          <p class="text-xs text-gray-500">Select payment channel:</p>
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div class="p-2 border rounded-lg text-center font-bold text-xs bg-emerald-50 text-emerald-700 border-emerald-300">JazzCash / EasyPaisa</div>
            <div class="p-2 border rounded-lg text-center font-bold text-xs bg-indigo-50 text-indigo-700 border-indigo-300">1Link 1Bill / Debit Card</div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Proceed with JazzCash',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981'
    }).then(result => {
      if (result.isConfirmed) {
        Swal.fire('Processing Payment...', 'Redirecting to digital gateway payment window.', 'info');
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      
      {/* BREADCRUMB & HEADER */}
      <div>
        <Breadcrumb items={[{ label: 'Portals', href: '#' }, { label: 'Parent & Guardian Mobile Portal' }]} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-7 h-7 text-indigo-600" />
              Parent & Guardian Dedicated Portal
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mobile-optimized dashboard for parents to pay fees online, inspect attendance, & view report cards.</p>
          </div>
          
          {/* CHILD SWITCHER (Multi-Student Family Support) */}
          <div className="w-full sm:w-72">
            <SearchableSelect
              options={studentSelectOptions}
              value={selectedStudentId}
              onChange={handleStudentChange}
              placeholder="Switch Child..."
            />
          </div>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: `${activeStudent.name}'s Attendance`, value: `${activeStudent.attendancePercent} Present`, icon: <UserCheck className="w-5 h-5" />, theme: 'success' },
          { 
            title: 'Fee Challan Status', 
            value: activeStudent.feeStatus === 'UNPAID' ? `Rs. ${activeStudent.feeAmount.toLocaleString()} Unpaid` : 'Cleared (Rs. 0 Due)', 
            icon: <DollarSign className="w-5 h-5" />, 
            theme: activeStudent.feeStatus === 'UNPAID' ? 'error' : 'success' 
          },
          { title: 'Academic Performance', value: activeStudent.latestGrade, icon: <Award className="w-5 h-5" />, theme: 'purple' },
        ]}
      />

      {/* QUICK ACTION SHORTCUTS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button 
          onClick={() => Swal.fire('Student Timetable', `Weekly schedule for ${activeStudent.classSection} is synchronized.`, 'info')}
          className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-all text-left flex items-center gap-2.5 shadow-sm"
        >
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Class Timetable</p>
            <p className="text-[10px] text-gray-400">View weekly periods</p>
          </div>
        </button>

        <button 
          onClick={() => Swal.fire('Homework Diary', `All daily homework for ${activeStudent.name} is up to date.`, 'info')}
          className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-all text-left flex items-center gap-2.5 shadow-sm"
        >
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Daily Homework</p>
            <p className="text-[10px] text-gray-400">Diary tasks & assignments</p>
          </div>
        </button>

        <button 
          onClick={() => Swal.fire('Leave Application', `Submit online medical / urgent leave request for ${activeStudent.name}.`, 'info')}
          className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-all text-left flex items-center gap-2.5 shadow-sm"
        >
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Request Leave</p>
            <p className="text-[10px] text-gray-400">Apply for online leave</p>
          </div>
        </button>

        <button 
          onClick={() => Swal.fire('Exam Report Card', `Downloading term exam report card for ${activeStudent.name}...`, 'success')}
          className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 transition-all text-left flex items-center gap-2.5 shadow-sm"
        >
          <Download className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Report Card</p>
            <p className="text-[10px] text-gray-400">Download PDF marksheet</p>
          </div>
        </button>
      </div>

      {/* PORTAL WIDGETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WIDGET 1: ONLINE FEE CHALLAN PAYMENTS */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Fee Challan & Online Payment
            </h3>
            <Badge variant="light" color={activeStudent.feeStatus === 'UNPAID' ? 'error' : 'success'}>
              {activeStudent.feeStatus}
            </Badge>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Student:</span>
              <span className="font-bold text-gray-900 dark:text-white">{activeStudent.name} ({activeStudent.classSection})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Challan Voucher #:</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">{activeStudent.challanNo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Billing Month:</span>
              <span className="font-bold text-gray-900 dark:text-white">October 2026</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Net Payable Dues:</span>
              <span className={`font-extrabold ${activeStudent.feeAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {activeStudent.feeAmount > 0 ? `Rs. ${activeStudent.feeAmount.toLocaleString()}` : 'Rs. 0 (Fully Cleared)'}
              </span>
            </div>
          </div>

          {activeStudent.feeStatus === 'UNPAID' ? (
            <Button 
              variant="primary" 
              onClick={handleOnlinePayment} 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              Pay Fee Online Now (JazzCash / EasyPaisa / Card)
            </Button>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              All dues for this academic billing cycle have been cleared.
            </div>
          )}
        </div>

        {/* WIDGET 2: RECENT ACADEMIC NOTICES */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              School Announcements & Notices
            </h3>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline">View All</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <p className="font-bold text-xs text-gray-900 dark:text-white">🔔 Mid-Term Examination Date Sheet Released</p>
              <p className="text-xs text-gray-500 mt-1">Mid-Term exams commence from 15th October. Please download the date sheet slip.</p>
            </div>
            <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
              <p className="font-bold text-xs text-gray-900 dark:text-white">👨‍🏫 Parent-Teacher Meeting (PTM) Scheduled</p>
              <p className="text-xs text-gray-500 mt-1">PTM for {activeStudent.classSection} will be held on Saturday between 9:00 AM - 1:00 PM.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
