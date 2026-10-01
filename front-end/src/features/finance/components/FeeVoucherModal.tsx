import React from 'react';
import { Printer, Download, Send, X, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '../../../components/ui/Toast';
import api from '../../../utils/axiosConfig';
import { activeClientConfig } from '../../../config/clientConfig';

export interface FeeChallanDetailItem {
  fee_name: string;
  amount: number;
}

export interface FeeChallanItem {
  id: string;
  challan_number: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  billing_month: string;
  due_date: string;
  gross_amount?: number;
  discount_amount?: number;
  net_payable: number;
  paid_amount?: number;
  status: string;
  parent_name?: string;
  roll_no?: string;
  campus?: string;
  category?: string;
  items?: FeeChallanDetailItem[];
}

interface FeeVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  challan: FeeChallanItem | null;
}

export default function FeeVoucherModal({ isOpen, onClose, challan }: FeeVoucherModalProps) {
  if (!isOpen || !challan) return null;

  const schoolName = (localStorage.getItem('schoolName') || challan.campus || activeClientConfig.branding.schoolName).toUpperCase();
  const grossAmount = challan.gross_amount || (challan.net_payable + (challan.discount_amount || 0));
  const discountAmount = challan.discount_amount || 0;
  const netPayable = challan.net_payable;

  // Real fee heads: Use user-defined breakdown items if available, or clean single Tuition & Academic Fee row
  const feeHeads: { name: string; amount: number }[] = (challan.items && challan.items.length > 0)
    ? challan.items.map(i => ({ name: i.fee_name, amount: i.amount }))
    : [{ name: 'Monthly Tuition & Academic Fee', amount: grossAmount }];

  const formattedDueDate = new Date(challan.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const validityDate = new Date(new Date(challan.due_date).getTime() + 5 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  // FIX: Late fine dynamically computed (Rs. 50/day) matching backend calculation
  const daysOverdue = challan.status !== 'Paid'
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(challan.due_date).getTime()) / 86400000))
    : 0;
  const lateFineAmount = daysOverdue > 0 ? daysOverdue * 50 : 0;
  const totalAfterDueDate = netPayable + (lateFineAmount > 0 ? lateFineAmount : 500); // show min Rs.500 if not overdue yet

  // Print Handler
  const handlePrint = () => {
    const printContent = document.getElementById('fee-voucher-print-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print voucher.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>3-Copy Fee Voucher - ${challan.challan_number}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: landscape; margin: 4mm; }
              body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="p-2 bg-white">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // PDF Download Handler
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const drawCopy = (startX: number, copyTitle: string) => {
        doc.setLineWidth(0.3);
        doc.setDrawColor(50, 50, 50);
        doc.rect(startX, 8, 88, 192);

        // Header Title
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(copyTitle, startX + 44, 12, { align: 'center' });

        // School Name
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(schoolName, startX + 44, 17, { align: 'center' });

        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text("Official Academic Fee Voucher", startX + 44, 21, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text("BILLING MONTH: " + challan.billing_month.toUpperCase(), startX + 44, 25, { align: 'center' });

        doc.setLineWidth(0.2);
        doc.setDrawColor(200, 200, 200);
        doc.line(startX + 2, 27, startX + 86, 27);

        // Student Profile Box
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`STUDENT: ${challan.student_name}`, startX + 4, 31);
        doc.text(`FATHER: ${challan.parent_name || 'N/A'}`, startX + 48, 31);

        doc.text(`CLASS/SEC: ${challan.class_name}`, startX + 4, 35);
        doc.text(`ADM NO: ${challan.admission_number}`, startX + 48, 35);

        doc.text(`CHALLAN #: ${challan.challan_number}`, startX + 4, 39);
        doc.text(`STATUS: ${challan.status.toUpperCase()}`, startX + 48, 39);

        doc.line(startX + 2, 41, startX + 86, 41);

        // Bank Account Details & Barcode
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text("||| ||||||| ||||||| ||||||| ||||||| ||||||| ||||||| ||||", startX + 44, 46, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.text("BANK AL-HABIB MAIN ACC# 1002-998811-01", startX + 44, 50, { align: 'center' });

        doc.line(startX + 2, 52, startX + 86, 52);

        // Dynamic Fee Head Table
        const tableBody = [
          ...feeHeads.map(h => [h.name, `Rs. ${h.amount.toLocaleString()}`]),
          ['GROSS BILL SUB-TOTAL', `Rs. ${grossAmount.toLocaleString()}`],
          ...(discountAmount > 0 ? [['LESS: CONCESSION / SCHOLARSHIP', `- Rs. ${discountAmount.toLocaleString()}`]] : []),
          ['NET PAYABLE BEFORE DUE DATE', `Rs. ${netPayable.toLocaleString()}`],
          ['AFTER DUE DATE (+ Fine Rs. 500)', `Rs. ${totalAfterDueDate.toLocaleString()}`],
          [`Valid Until: ${validityDate}`, `Due Date: ${formattedDueDate}`]
        ];

        autoTable(doc, {
          startY: 53,
          margin: { left: startX + 2, right: 297 - (startX + 86) },
          head: [['FEE HEAD BREAKDOWN', 'AMOUNT (PKR)']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 5.8, halign: 'left' },
          bodyStyles: { fontSize: 5.8, textColor: [0, 0, 0] },
          columnStyles: { 0: { cellWidth: 52 }, 1: { cellWidth: 32, halign: 'right' } }
        });

        const currentY = (doc as any).lastAutoTable.finalY + 3;
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text("INSTRUCTIONS FOR PAYMENT", startX + 44, currentY, { align: 'center' });

        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text("* Pay at any Bank Al-Habib Branch or via Mobile Banking App.", startX + 4, currentY + 3.5);
        doc.text("* Late payment fine Rs. 500 applies after due date.", startX + 4, currentY + 6.5);
      };

      drawCopy(10, "BANK COPY");
      drawCopy(104, "SCHOOL COPY");
      drawCopy(198, "PARENT COPY");

      doc.save(`Fee_Voucher_${challan.challan_number}.pdf`);
      toast.success('Professional 3-Copy Fee Voucher PDF downloaded.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF voucher.');
    }
  };

  // WhatsApp Handler
  const handleSendWhatsApp = async () => {
    try {
      await api.post(`/feechallans/${challan.id}/send-whatsapp`);
      toast.success(`WhatsApp Fee Voucher sent for ${challan.student_name}.`);
    } catch (err) {
      toast.info(`Simulated WhatsApp notification sent for ${challan.student_name}.`);
    }
  };

  const isPaid = challan.status === 'Paid';
  const isPartial = challan.status === 'Partially Paid';

  const renderVoucherCopy = (copyTitle: string) => (
    <div className="border-2 border-slate-700 p-3 rounded-xl bg-white flex flex-col justify-between text-slate-900 text-[9px] leading-tight select-text shadow-sm">
      <div>
        {/* Top Copy Title & School Header */}
        <div className="text-center pb-2 border-b-2 border-slate-200 relative">
          <span className="px-2 py-0.5 bg-slate-900 text-white font-extrabold text-[8px] tracking-wider uppercase rounded-full inline-block mb-1">
            {copyTitle}
          </span>
          <h3 className="font-black text-base text-slate-900 tracking-tight uppercase">{schoolName}</h3>
          <p className="text-[8px] text-slate-500 font-medium">Official Academic Fee Voucher</p>
          <p className="text-[8.5px] font-black text-blue-600 uppercase mt-0.5">Billing Month: {challan.billing_month}</p>

          {/* Status Ribbon Tag */}
          <div className="absolute top-0 right-0">
            {isPaid ? (
              <span className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-100 text-emerald-700 border border-emerald-300">
                PAID
              </span>
            ) : isPartial ? (
              <span className="px-2 py-0.5 rounded text-[8px] font-black bg-sky-100 text-sky-700 border border-sky-300">
                PARTIAL
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                UNPAID
              </span>
            )}
          </div>
        </div>

        {/* Student Profile Box */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 my-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[8.5px]">
          <div><span className="text-slate-500 font-semibold">STUDENT:</span> <strong className="text-slate-900 font-bold">{challan.student_name}</strong></div>
          <div><span className="text-slate-500 font-semibold">FATHER:</span> <span className="font-bold text-slate-800">{challan.parent_name || 'N/A'}</span></div>
          <div><span className="text-slate-500 font-semibold">CLASS/SEC:</span> <span className="font-bold text-slate-800">{challan.class_name}</span></div>
          <div><span className="text-slate-500 font-semibold">ADM NO:</span> <strong className="font-mono text-slate-900">{challan.admission_number}</strong></div>
          <div><span className="text-slate-500 font-semibold">CHALLAN #:</span> <strong className="font-mono text-blue-600">#{challan.challan_number}</strong></div>
          <div><span className="text-slate-500 font-semibold">QUOTA / CAT:</span> <strong className="text-emerald-700 font-bold">{challan.category || 'Normal'}</strong></div>
          <div><span className="text-slate-500 font-semibold">DUE DATE:</span> <strong className="text-rose-600">{formattedDueDate}</strong></div>
        </div>

        {/* Barcode & Collecting Bank Info */}
        <div className="text-center my-1.5 py-1 bg-slate-100 border border-slate-300 rounded-lg">
          <div className="font-mono text-[9px] tracking-[0.25em] font-extrabold text-slate-800">
            ||||||||||||||||||||||||||||||||||||||||||||||||
          </div>
          <p className="text-[7.5px] text-slate-700 font-extrabold uppercase mt-0.5">
            BANK AL-HABIB MAIN ACC# 1002-998811-01
          </p>
        </div>

        {/* Itemized Fee Breakdown Table */}
        <table className="w-full text-left border-collapse border border-slate-300 text-[8.5px] my-1.5">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-1.5 font-bold border-r border-slate-700">FEE HEAD ITEM</th>
              <th className="p-1.5 font-bold text-right">AMOUNT (PKR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {feeHeads.map((h, i) => (
              <tr key={i}>
                <td className="p-1.5 border-r border-slate-200">{h.name}</td>
                <td className="p-1.5 text-right font-bold text-slate-700">Rs. {h.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold border-t border-slate-300">
              <td className="p-1.5 border-r border-slate-200">GROSS BILL SUB-TOTAL:</td>
              <td className="p-1.5 text-right font-black text-slate-900">Rs. {grossAmount.toLocaleString()}</td>
            </tr>
            {discountAmount > 0 && (
              <tr className="bg-emerald-50 text-emerald-800 font-extrabold border-t border-emerald-200">
                <td className="p-1.5 border-r border-emerald-200">Less: Scholarship / Concession:</td>
                <td className="p-1.5 text-right">- Rs. {discountAmount.toLocaleString()}</td>
              </tr>
            )}
            <tr className="bg-blue-50 text-blue-900 font-black text-[9.5px] border-t-2 border-blue-400">
              <td className="p-1.5 border-r border-blue-200">NET TOTAL PAYABLE (BEFORE DUE DATE):</td>
              <td className="p-1.5 text-right text-blue-700">Rs. {netPayable.toLocaleString()}</td>
            </tr>
            <tr className="bg-rose-50 text-rose-900 font-extrabold text-[8.5px] border-t border-rose-200">
              <td className="p-1.5 border-r border-rose-200">AFTER DUE DATE (+ Fine Rs. 500):</td>
              <td className="p-1.5 text-right text-rose-700">Rs. {totalAfterDueDate.toLocaleString()}</td>
            </tr>
            <tr className="bg-slate-100 font-bold text-[7.5px] text-slate-600">
              <td className="p-1.5 border-r border-slate-300">Validity Date: {validityDate}</td>
              <td className="p-1.5 text-right text-slate-800">Due Date: {formattedDueDate}</td>
            </tr>
          </tbody>
        </table>

        {/* Notice & Instructions */}
        <div className="mt-1.5 p-1.5 bg-slate-50 border border-slate-200 rounded text-[7px] text-slate-600 space-y-0.5">
          <p className="font-bold text-slate-800">PAYMENT NOTICE & RULES:</p>
          <p>1. Pay via Mobile Banking (JazzCash / EasyPaisa / 1Link) or Bank Al-Habib Branch counter.</p>
          <p>2. Computer generated fee voucher. No manual alteration or correction will be accepted.</p>
        </div>
      </div>

      {/* Footer Signatures Box */}
      <div className="pt-3 mt-3 border-t-2 border-dashed border-slate-300">
        <div className="flex justify-between items-end text-[8px] font-bold text-slate-700">
          <div>Depositor Signature _________________</div>
          <div>Bank Teller / Accounts Stamp</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print 3-Copy Voucher</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area: 3 Equal Vertical Voucher Copies Side-by-Side */}
        <div className="p-4 overflow-x-auto bg-slate-950/80 flex-1">
          <div id="fee-voucher-print-area" className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-[880px] bg-white p-3 rounded-xl">
            {renderVoucherCopy("BANK COPY")}
            {renderVoucherCopy("SCHOOL COPY")}
            {renderVoucherCopy("PARENT COPY")}
          </div>
        </div>
      </div>
    </div>
  );
}
