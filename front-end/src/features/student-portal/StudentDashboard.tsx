import React, { useEffect, useState } from 'react';
import { StudentPortalService } from './StudentPortalService';
import { ParentDashboardSummary, PendingFee } from '../parent-portal/ParentPortalService';
import { GraduationCap, BookOpen, Clock, FileText, User, Activity, DollarSign, Download, CreditCard, Banknote, CheckSquare, Square, Printer, CheckCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import InputField from '../../components/form/input/InputField';
import { Modal } from '../../components/ui/modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const StudentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ParentDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Payment State
  const [selectedChallans, setSelectedChallans] = useState<string[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payingChallans, setPayingChallans] = useState<PendingFee[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bankReceiptUrl, setBankReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Attendance State
  const [attendanceEvents, setAttendanceEvents] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await StudentPortalService.getMyDashboardSummary();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard summary', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!dashboardData?.student_id) return;
    const fetchAttendance = async () => {
      const month = calendarDate.getMonth() + 1;
      const year = calendarDate.getFullYear();
      try {
        const records = await StudentPortalService.getMyMonthlyAttendance(dashboardData.student_id, month, year);
        const events = records.map(r => {
          let color = '#9ca3af'; // gray / leave
          if (r.status === 'Present') color = '#22c55e'; // green
          else if (r.status === 'Absent') color = '#ef4444'; // red
          else if (r.status === 'Late') color = '#eab308'; // yellow
          
          return {
            title: r.status,
            date: r.date.split('T')[0],
            backgroundColor: color,
            borderColor: color,
            allDay: true
          };
        });
        setAttendanceEvents(events);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAttendance();
  }, [dashboardData?.student_id, calendarDate]);

  const calculateLateFee = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (today > due) {
      return 500; 
    }
    return 0;
  };

  const downloadChallanPdf = async (fee: PendingFee) => {
    if (!dashboardData) return;
    const doc = new jsPDF('landscape'); 

    const lateFee = calculateLateFee(fee.due_date);
    const totalAmount = fee.amount + lateFee;

    const qrDataUrl = await QRCode.toDataURL(`CHALLAN:${fee.challan_number}|AMT:${totalAmount}|STD:${dashboardData.student_id}`);

    const drawChallanPart = (xOffset: number, title: string) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("EXCELLENCE SCHOOLING", xOffset + 10, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Copy: ${title}`, xOffset + 10, 28);
      
      doc.addImage(qrDataUrl, 'PNG', xOffset + 70, 15, 20, 20);

      doc.setFontSize(9);
      doc.text(`Challan #: ${fee.challan_number}`, xOffset + 10, 45);
      doc.text(`Student: ${dashboardData.student_name}`, xOffset + 10, 52);
      doc.text(`Due Date: ${new Date(fee.due_date).toLocaleDateString()}`, xOffset + 10, 59);
      
      if (lateFee > 0) {
        doc.setTextColor(220, 38, 38); 
        doc.text(`OVERDUE`, xOffset + 70, 59);
        doc.setTextColor(0, 0, 0);
      }

      autoTable(doc, {
        startY: 75,
        margin: { left: xOffset + 10 },
        tableWidth: 80,
        theme: 'grid',
        head: [['Description', 'Amount']],
        body: [
          ['Tuition & Regular Fee', `Rs ${fee.amount.toLocaleString()}`],
          ['Late Fee Surcharge', `Rs ${lateFee.toLocaleString()}`],
          [{ content: 'Total Payable', styles: { fontStyle: 'bold' } }, { content: `Rs ${totalAmount.toLocaleString()}`, styles: { fontStyle: 'bold' } }]
        ],
        styles: { fontSize: 8, cellPadding: 3 }
      });

      doc.setFontSize(8);
      doc.text("Bank Teller Signature", xOffset + 10, 160);
      doc.line(xOffset + 10, 162, xOffset + 45, 162);
      
      doc.text("Parent Signature", xOffset + 55, 160);
      doc.line(xOffset + 55, 162, xOffset + 90, 162);
    };

    drawChallanPart(0, "Bank Copy");
    doc.setLineDashPattern([2, 2], 0);
    doc.line(99, 5, 99, 200); 
    doc.setLineDashPattern([], 0); 
    
    drawChallanPart(99, "School Copy");
    doc.setLineDashPattern([2, 2], 0);
    doc.line(198, 5, 198, 200);
    doc.setLineDashPattern([], 0);
    
    drawChallanPart(198, "Parent Copy");

    doc.save(`Challan_${fee.challan_number}.pdf`);
  };

  const downloadPaidReceipt = async (fee: PendingFee) => {
    if (!dashboardData) return;
    const doc = new jsPDF();

    doc.setTextColor(240, 253, 244); 
    doc.setFontSize(100);
    doc.setFont("helvetica", "bold");
    doc.text("PAID", 40, 150, { angle: 45 });
    
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(18);
    doc.text("EXCELLENCE SCHOOLING", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("PAYMENT RECEIPT", 105, 30, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Challan #: ${fee.challan_number}`, 20, 50);
    doc.text(`Student: ${dashboardData.student_name}`, 20, 60);
    
    doc.text(`Status: PAID`, 140, 50);
    
    autoTable(doc, {
      startY: 85,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      head: [['Description', 'Amount Paid']],
      body: [
        ['Fee Amount', `Rs ${fee.amount.toLocaleString()}`]
      ],
      headStyles: { fillColor: [22, 163, 74] } 
    });

    doc.text("Thank you for your payment.", 20, 150);
    doc.save(`Receipt_${fee.challan_number}.pdf`);
  };

  const downloadReportCardPdf = () => {
    if (!dashboardData || dashboardData.recent_exams.length === 0) {
       Swal.fire('Info', 'No exam records found to generate a report.', 'info');
       return;
    }
    
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EXCELLENCE SCHOOLING", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("TERM REPORT CARD", 105, 30, { align: "center" });

    // Student Info Box
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.rect(14, 38, 182, 30);
    doc.text(`Student Name: ${dashboardData.student_name}`, 20, 46);
    doc.text(`Term: Auto-Generated Report`, 20, 54);

    // Calculate totals
    const exams = dashboardData.recent_exams;
    const totalObtained = exams.reduce((sum, e) => sum + e.marks_obtained, 0);
    const totalMax = exams.reduce((sum, e) => sum + e.total_marks, 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    let overallGrade = 'F';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B';
    else if (percentage >= 60) overallGrade = 'C';
    else if (percentage >= 50) overallGrade = 'D';

    // Table
    const tableBody = exams.map(e => [
      e.subject_name,
      e.exam_title,
      e.total_marks.toString(),
      e.marks_obtained.toString(),
      e.grade
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Subject', 'Exam Title', 'Max Marks', 'Obtained Marks', 'Grade']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] } // Blue header
    });

    // Summary Box
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Marks: ${totalObtained} / ${totalMax}`, 20, finalY + 15);
    doc.text(`Percentage: ${percentage.toFixed(2)}%`, 110, finalY + 15);
    doc.text(`Overall Grade: ${overallGrade}`, 20, finalY + 25);

    // Signatures
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.line(20, finalY + 60, 80, finalY + 60);
    doc.text("Class Teacher Signature", 25, finalY + 65);

    doc.line(130, finalY + 60, 190, finalY + 60);
    doc.text("Principal Signature", 140, finalY + 65);

    doc.save(`ReportCard_${dashboardData.student_name}.pdf`);
  };

  const handlePayNow = (fees: PendingFee[]) => {
    setPayingChallans(fees);
    setPaymentModalOpen(true);
  };

  const handleBulkPay = () => {
    if (!dashboardData) return;
    const feesToPay = dashboardData.pending_fees.filter(f => selectedChallans.includes(f.challan_id));
    if (feesToPay.length > 0) {
      handlePayNow(feesToPay);
    }
  };

  const toggleChallanSelection = (id: string) => {
    if (selectedChallans.includes(id)) {
      setSelectedChallans(selectedChallans.filter(c => c !== id));
    } else {
      setSelectedChallans([...selectedChallans, id]);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploadingReceipt(true);
    try {
      const res = await api.post('/uploads', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.url;
      setBankReceiptUrl(newUrl);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Receipt upload failed', 'error');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessing(true);
    
    try {
      for (const fee of payingChallans) {
         await StudentPortalService.payMyChallan(fee.challan_id, {
             payment_method: paymentMethod,
             receipt_url: bankReceiptUrl
         });
      }
      
      Swal.fire('Success', paymentMethod === 'card' ? 'Payment processed successfully!' : 'Receipt uploaded. Pending Admin verification.', 'success');
      setPaymentModalOpen(false);
      setSelectedChallans([]);
      setBankReceiptUrl('');
      
      const data = await StudentPortalService.getMyDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Payment failed to process', 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Student Dashboard" />

      {/* Profile Header */}
      {!loading && dashboardData && (
        <div className="mb-6 flex items-center space-x-4 bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
           <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
             <User size={32} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
               Welcome, {dashboardData.student_name}!
             </h2>
             <p className="text-sm text-gray-500 dark:text-gray-400">
               Student Portal
             </p>
           </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      )}

      {!loading && !dashboardData && (
        <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <User size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Profile Not Found</h2>
          <p className="text-gray-500 mt-2 text-center">Your user account is not linked to any active student profile. Please contact administration.</p>
        </div>
      )}

      {!loading && dashboardData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance</p>
                  <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {dashboardData.attendance_percentage}%
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Activity size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Fees</p>
                  <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    Rs {dashboardData.total_pending_fees.toLocaleString()}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Exams</p>
                  <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {dashboardData.recent_exams.length}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <GraduationCap size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Homeworks</p>
                  <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
                    {dashboardData.recent_homework.length}
                  </h4>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <BookOpen size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Interactive Attendance Calendar Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden lg:col-span-2 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-blue-500" /> Interactive Attendance Calendar
                </h3>
              </div>
              <div className="p-5">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={attendanceEvents}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: ''
                  }}
                  height={450}
                  datesSet={(arg) => {
                     setCalendarDate(arg.view.currentStart);
                  }}
                  eventContent={(eventInfo) => {
                    return (
                      <div className="flex justify-center items-center h-full w-full py-0.5">
                         <span className="text-xs font-semibold text-white px-1 shadow-sm rounded-sm">{eventInfo.event.title}</span>
                      </div>
                    )
                  }}
                />
              </div>
            </div>

            {/* Pending Fees Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden lg:col-span-2 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <FileText size={20} className="text-orange-500" /> Pending Fee Challans
                </h3>
                {selectedChallans.length > 0 && (
                  <Button size="sm" onClick={handleBulkPay} className="bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-2 shadow-sm">
                    <CreditCard size={16} /> Pay Selected ({selectedChallans.length})
                  </Button>
                )}
              </div>
              <div className="p-0 overflow-x-auto">
                {dashboardData.pending_fees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                     <CheckCircle size={48} className="text-green-400 mb-3" />
                     <p className="text-lg font-medium text-gray-700 dark:text-gray-300">All Clear!</p>
                     <p className="text-sm">No pending fee challans found.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left w-10"></th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challan Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-gray-800">
                      {dashboardData.pending_fees.map((fee) => {
                        const lateFee = calculateLateFee(fee.due_date);
                        const isOverdue = lateFee > 0;

                        return (
                          <tr key={fee.challan_id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                            <td className="px-6 py-4">
                              <button onClick={() => toggleChallanSelection(fee.challan_id)} className="text-gray-400 hover:text-brand-500">
                                {selectedChallans.includes(fee.challan_id) ? <CheckSquare className="text-brand-600" /> : <Square />}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900 dark:text-white">#{fee.challan_number}</div>
                              {isOverdue && <div className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12}/> Overdue</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {new Date(fee.due_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">Rs {(fee.amount + lateFee).toLocaleString()}</div>
                              {isOverdue && <div className="text-xs text-red-500">Includes Rs {lateFee} penalty</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-3">
                                <button onClick={() => downloadChallanPdf(fee)} className="text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 flex items-center gap-1 transition-colors" title="Download PDF Challan">
                                  <Download size={18} /> <span className="hidden sm:inline text-xs">PDF</span>
                                </button>
                                <Button size="sm" onClick={() => handlePayNow([fee])} className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-800 shadow-sm">
                                  Pay Now
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Paid Receipts History Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden lg:col-span-2 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <Printer size={20} className="text-green-500" /> Payment History & Receipts
                </h3>
              </div>
              <div className="p-0 overflow-x-auto">
                {dashboardData?.paid_fees && dashboardData.paid_fees.length === 0 ? (
                   <p className="text-gray-500 text-center py-6 text-sm">No payment history found.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    <tbody className="bg-white dark:bg-transparent divide-y divide-gray-50 dark:divide-gray-800/50">
                      {dashboardData?.paid_fees?.map((fee) => (
                        <tr key={fee.challan_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">#{fee.challan_number}</td>
                          <td className="px-6 py-3 text-gray-500">Paid Amount: <span className="font-semibold text-gray-800 dark:text-white">Rs {fee.amount.toLocaleString()}</span></td>
                          <td className="px-6 py-3 text-right">
                             <button onClick={() => downloadPaidReceipt(fee)} className="text-brand-600 hover:text-brand-800 text-xs font-medium flex items-center gap-1 justify-end w-full">
                               <Download size={14} /> Receipt
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Homework Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <BookOpen size={20} className="text-brand-500" /> Recent Homework
                </h3>
              </div>
              <div className="p-5">
                {dashboardData.recent_homework.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent homework found.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {dashboardData.recent_homework.map((hw) => (
                      <li key={hw.homework_id} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white/90">{hw.title}</p>
                          <p className="text-xs text-gray-500">{hw.subject_name} • Due: {new Date(hw.due_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hw.status === 'Submitted' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
                        }`}>
                          {hw.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Exam Results Widget */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <GraduationCap size={20} className="text-purple-500" /> Recent Exam Results
                </h3>
                <Button size="sm" onClick={downloadReportCardPdf} variant="outline" className="flex items-center gap-2 text-xs">
                  <Download size={14} /> Report Card
                </Button>
              </div>
              <div className="p-5">
                {dashboardData.recent_exams.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent exam results found.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {dashboardData.recent_exams.map((exam, idx) => (
                      <li key={idx} className="py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white/90">{exam.exam_title}</p>
                          <p className="text-xs text-gray-500">{exam.subject_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 dark:text-white/90">{exam.marks_obtained} / {exam.total_marks}</p>
                          <p className="text-xs text-green-500 font-medium">Grade {exam.grade}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Payment Checkout Modal */}
      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} className="max-w-lg">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
           <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <CreditCard className="text-brand-500" /> Secure Checkout
           </h3>
           <p className="text-sm text-gray-500 mt-1">Paying {payingChallans.length} challan(s)</p>
        </div>

        <form onSubmit={processPayment} className="p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900/20">
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
             <span className="text-gray-600 dark:text-gray-400 font-medium">Total Amount Payable</span>
             <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs {payingChallans.reduce((sum, f) => sum + f.amount + calculateLateFee(f.due_date), 0).toLocaleString()}
             </span>
          </div>

          <div className="space-y-3">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Payment Method</label>
             <div className="grid grid-cols-2 gap-3">
               <button type="button" onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-300' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'}`}>
                  <CreditCard size={28} className="mb-2" />
                  <span className="text-sm font-medium">Credit / Debit Card</span>
               </button>
               <button type="button" onClick={() => setPaymentMethod('bank')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'bank' ? 'border-brand-500 bg-brand-50/50 text-brand-700 dark:bg-brand-900/20 dark:border-brand-500 dark:text-brand-300' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800'}`}>
                  <Banknote size={28} className="mb-2" />
                  <span className="text-sm font-medium">Bank / EasyPaisa</span>
               </button>
             </div>
          </div>

          {paymentMethod === 'card' ? (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Card Information</label>
                  <InputField placeholder="0000 0000 0000 0000" type="text" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField placeholder="MM/YY" type="text" required />
                  <InputField placeholder="CVC" type="text" required />
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle size={12}/> Instant processing. Fake dummy integration.</p>
             </div>
          ) : (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm mb-4 border border-blue-100 dark:border-blue-800/50">
                   Please deposit the amount to <strong>Bank Al-Habib: 1234-5678-9012</strong> and upload the receipt/screenshot below.
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Upload Deposit Slip</label>
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center">
                    <input type="file" id="receipt-file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleReceiptUpload} required />
                    <div className="flex flex-col items-center pointer-events-none">
                       {uploadingReceipt ? (
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-2"></div>
                       ) : (
                         <Download className="text-gray-400 mb-2" size={24} />
                       )}
                       <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                         {bankReceiptUrl ? 'Receipt Uploaded Successfully!' : 'Click to browse or drag file here'}
                       </span>
                    </div>
                  </div>
                </div>
             </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
             <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>Cancel</Button>
             <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white min-w-[140px]" disabled={paymentProcessing || (paymentMethod === 'bank' && !bankReceiptUrl)}>
               {paymentProcessing ? 'Processing...' : `Confirm Payment`}
             </Button>
          </div>
        </form>
      </Modal>

    </>
  );
};

export default StudentDashboard;
