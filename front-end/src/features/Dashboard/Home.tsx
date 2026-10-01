import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  Users, GraduationCap, Wallet, UserCheck, TrendingUp, TrendingDown, BookOpen, Clock, DollarSign, RefreshCw, WifiOff, Megaphone, Download, PlusCircle, ArrowRight, CheckCircle2, AlertCircle, Calendar, IdCard, FileText, Sparkles, Receipt, Award, ArrowUpRight
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useDashboard } from "./useDashboard";
import type { DashboardStatsDto } from "./dashboardTypes";
import api from "../../utils/axiosConfig";
import { useNavigate } from "react-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { activeClientConfig } from "../../config/clientConfig";

// ─── Helpers ─────────────────────────────────────────────────────────────
const todayStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function activityIcon(type: string) {
  switch (type) {
    case "student": return <CheckCircle2 className="w-4 h-4 text-teal-600" />;
    case "fee": return <DollarSign className="w-4 h-4 text-emerald-500" />;
    case "attendance": return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case "exam": return <BookOpen className="w-4 h-4 text-cyan-600" />;
    case "payroll": return <Clock className="w-4 h-4 text-violet-500" />;
    default: return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
  }
}

// ─── Animation Variants ───────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 250, damping: 20 } }
};

// ─── Skeleton & Error States ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 p-6 h-[140px]">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="h-3 w-32 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800 p-12 text-center gap-4">
      <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-full">
        <WifiOff className="w-8 h-8 text-rose-500" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Connection Interrupted</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{message}</p>
      </div>
      <button onClick={onRetry} className="mt-2 flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-950 dark:bg-white dark:text-slate-900 rounded-xl hover:scale-105 transition-transform">
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{message}</p>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useDashboard("", "", "");
  const [isDark, setIsDark] = useState(false);
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const tenantId = localStorage.getItem("tenantId") || "";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    api.get(`/notices/active/tenant/${tenantId}`)
      .then(res => setRecentNotices(res.data.slice(0, 3)))
      .catch(err => console.error("Could not fetch notices", err));
  }, [tenantId]);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const fmtMoney = (val: number) => {
    if (val >= 100000) return `₨ ${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₨ ${(val / 1000).toFixed(1)}K`;
    return `₨ ${val}`;
  };

  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const schoolName = localStorage.getItem("schoolName") || activeClientConfig.branding.schoolName;
    const generatedDate = new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
    const generatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ── 1. HEADER BANNER ───────────────────────────────────────────
    doc.setFillColor(10, 15, 36); // #0A0F24 Dark Navy
    doc.rect(0, 0, pageW, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(schoolName.toUpperCase(), pageW / 2, 16, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(13, 148, 136); // Teal-500 Accent
    doc.text("EXECUTIVE MANAGEMENT ANALYTICS & AUDIT REPORT", pageW / 2, 24, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(180, 190, 210);
    doc.text(`Generated: ${generatedDate} at ${generatedTime} | Ref No: EXEC-SMS-${Date.now().toString().slice(-6)}`, pageW / 2, 32, { align: "center" });

    // Accent line under banner
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 42, pageW, 2, "F");

    // ── 2. EXECUTIVE KPI CARDS (2x2 Grid) ─────────────────────────
    let currentY = 50;

    // Card 1: Students
    doc.setFillColor(240, 253, 250); // Teal light background
    doc.setDrawColor(13, 148, 136);
    doc.roundedRect(14, currentY, 86, 26, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136);
    doc.text("TOTAL STUDENT ENROLLMENT", 20, currentY + 7);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(data.totalStudents.toLocaleString(), 20, currentY + 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Attendance: ${data.studentAttendancePctToday}% present today`, 20, currentY + 22);

    // Card 2: Staff
    doc.setFillColor(245, 243, 255); // Purple light background
    doc.setDrawColor(147, 51, 234);
    doc.roundedRect(108, currentY, 86, 26, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(147, 51, 234);
    doc.text("ACTIVE STAFF MEMBERS", 114, currentY + 7);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(data.totalActiveStaff.toString(), 114, currentY + 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`On-Duty: ${data.staffPresentToday} staff on campus`, 114, currentY + 22);

    currentY += 32;

    // Card 3: Revenue MTD
    doc.setFillColor(236, 253, 245); // Emerald light background
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(14, currentY, 86, 26, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text("MONTHLY REVENUE (MTD)", 20, currentY + 7);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${data.feeCollectedThisMonth.toLocaleString()}`, 20, currentY + 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Target Achieved: ${data.feeCollectionPct}%`, 20, currentY + 22);

    // Card 4: Classes & Presence
    doc.setFillColor(239, 246, 255); // Blue light background
    doc.setDrawColor(37, 99, 235);
    doc.roundedRect(108, currentY, 86, 26, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text("ACTIVE CLASSES & SECTIONS", 114, currentY + 7);
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(data.totalClasses.toString(), 114, currentY + 16);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Daily Presence Rate: ${data.studentAttendancePctToday}%`, 114, currentY + 22);

    currentY += 34;

    // ── 3. SECTION 1: CLASS FEE COLLECTION STATUS ────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Class-wise Fee Collection & Pending Status", 14, currentY);

    if (data.feePendingPerClass && data.feePendingPerClass.length > 0) {
      autoTable(doc, {
        startY: currentY + 4,
        head: [["Class / Grade", "Total Students", "Fee Paid", "Fee Pending", "Collection %"]],
        body: data.feePendingPerClass.map(r => [
          r.className,
          r.totalStudents.toString(),
          `${r.paidCount} Students`,
          `${r.pendingCount} Students`,
          `${r.paidPct}%`
        ]),
        theme: "grid",
        headStyles: { fillColor: [10, 15, 36], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
        styles: { cellPadding: 4, fontSize: 8.5 },
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "center" },
          2: { halign: "right", textColor: [16, 185, 129], fontStyle: "bold" },
          3: { halign: "right", textColor: [225, 29, 72], fontStyle: "bold" },
          4: { halign: "right", fontStyle: "bold" },
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 12;
    } else {
      currentY += 10;
    }

    // ── 4. SECTION 2: ENROLLMENT DISTRIBUTION ────────────────────
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Student Enrollment Distribution per Class", 14, currentY);

    if (data.studentsPerClass && data.studentsPerClass.length > 0) {
      autoTable(doc, {
        startY: currentY + 4,
        head: [["Class Name", "Enrolled Students Count", "Share of Total Enrollment"]],
        body: data.studentsPerClass.map(c => {
          const sharePct = data.totalStudents > 0 ? ((c.studentCount / data.totalStudents) * 100).toFixed(1) : "0";
          return [c.className, c.studentCount.toString(), `${sharePct}%`];
        }),
        theme: "striped",
        headStyles: { fillColor: [13, 148, 136], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
        styles: { cellPadding: 4, fontSize: 8.5 },
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: "center", fontStyle: "bold" },
          2: { halign: "right" },
        }
      });
      currentY = (doc as any).lastAutoTable.finalY + 16;
    } else {
      currentY += 10;
    }

    // ── 5. OFFICIAL SIGN-OFF BLOCK ─────────────────────────────────
    if (currentY > 230) {
      doc.addPage();
      currentY = 30;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(14, currentY + 20, 80, currentY + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("System Audit Officer", 14, currentY + 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Voke SMS Verified", 14, currentY + 29);

    doc.line(pageW - 80, currentY + 20, pageW - 14, currentY + 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Principal / Head of Institution", pageW - 14, currentY + 25, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Authorized Signature & Stamp", pageW - 14, currentY + 29, { align: "right" });

    // ── FOOTER ────────────────────────────────────────────────────
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 280, pageW, 17, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Confidential Executive Document · ${schoolName} · Verified Institutional Record`, pageW / 2, 289, { align: "center" });

    doc.save(`Executive_Management_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (error) return <ErrorState message="Check your network connection and try again." onRetry={refetch} />;

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants} 
      className="space-y-8 pb-16 max-w-[1600px] mx-auto"
    >
      <PageMeta title="Overview | Master Executive Dashboard" description="School Analytics Dashboard" />

      {/* ── HEADER BAR ────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Dashboard Overview
            <span className="px-3 py-1 text-xs font-bold bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded-full">
              Live Real-Time
            </span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            {todayStr} · <span className="font-bold text-slate-700 dark:text-slate-200">{currentTime}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/ReportsCenter')}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl hover:bg-teal-100 transition-colors"
          >
            <FileText className="w-4 h-4" /> Reports Hub
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-950 dark:bg-white dark:text-slate-900 rounded-xl hover:shadow-teal-500/30 hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" /> Export Executive PDF
          </motion.button>
        </div>
      </motion.div>

      {/* ── WELCOME HERO BANNER ────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[32px] bg-[#0A0F24] p-8 md:p-10 shadow-2xl border border-slate-800/80">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-teal-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[80%] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-teal-200 text-xs font-semibold mb-4 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              System Online & Fully Operational
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              {getGreeting()}, Admin 👋
            </h2>
            <p className="text-slate-200/80 text-base font-medium leading-relaxed">
              Here is what’s happening across your school campus today. Monitor live student enrollments, staff presence, daily fee collections, and academic progress at a glance.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="text-left bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-teal-500/30 transition-colors group">
              <p className="text-white font-bold text-3xl tracking-tight group-hover:text-teal-400 transition-colors">{loading ? "..." : (data?.totalStudents ?? 0)}</p>
              <p className="text-teal-200 font-medium text-xs uppercase tracking-wider mt-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Enrolled Students
              </p>
            </div>
            <div className="text-left bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 hover:border-teal-500/30 transition-colors group">
              <p className="text-white font-bold text-3xl tracking-tight group-hover:text-teal-400 transition-colors">{loading ? "..." : `${data?.studentAttendancePctToday ?? 0}%`}</p>
              <p className="text-teal-200 font-medium text-xs uppercase tracking-wider mt-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Campus Presence
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STAT CARDS ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : data && (
        <motion.div variants={itemVariants}>
          <StatCards data={data} fmtMoney={fmtMoney} />
        </motion.div>
      )}

      {/* ── RICH QUICK ACTIONS TOOLBAR ────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Quick Actions & Shortcuts
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "New Admission", icon: PlusCircle, path: "/students?action=new", color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
            { label: "Fee Voucher", icon: Receipt, path: "/reports/fee-voucher", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
            { label: "Attendance", icon: UserCheck, path: "/StudentAttendance", color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
            { label: "Noticeboard", icon: Megaphone, path: "/Noticeboard", color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
            { label: "Reports Hub", icon: FileText, path: "/ReportsCenter", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
            { label: "Date Sheets", icon: Calendar, path: "/ExamSchedules", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
            { label: "Bulk ID Cards", icon: IdCard, path: "/reports/student-id-cards", color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
            { label: "Profit & Loss", icon: TrendingUp, path: "/reports/profit-loss", color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
          ].map((action, idx) => (
            <motion.button 
              key={idx}
              whileHover={{ y: -3, scale: 1.03 }} 
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)} 
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all group text-center"
            >
              <div className={`p-3 rounded-2xl ${action.color} group-hover:scale-110 transition-transform mb-2`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 transition-colors leading-tight">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── FRESH CAMPUS ONBOARDING GUIDE (Shows when enrollment is 0) ── */}
      {data && data.totalStudents === 0 && (
        <motion.div variants={itemVariants} className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🚀</span> Getting Started with Your Campus Portal
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Follow these 3 quick steps to launch your school session and start managing students:
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/AcademicYears')}
              className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-110 transition-transform">
                1
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-emerald-600 transition-colors">
                Setup Academic Year
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Activate your current school session (e.g. 2026–2027) so terms and grades are initialized.
              </p>
            </div>

            <div 
              onClick={() => navigate('/Classes')}
              className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-teal-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-110 transition-transform">
                2
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-teal-600 transition-colors">
                Add Classes & Sections
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Configure your school grades (e.g. Nursery, Grade 1 to 10) and assign sections (A, B).
              </p>
            </div>

            <div 
              onClick={() => navigate('/students?action=new')}
              className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-cyan-500 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 flex items-center justify-center font-bold text-sm mb-3 group-hover:scale-110 transition-transform">
                3
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-cyan-600 transition-colors">
                Admit First Student
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Admit your students, upload photos, assign parents, and generate fee challans.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── CHARTS & ANALYTICS ROW ────────────────────────────────────── */}
      {data && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Area Chart */}
          <div className="xl:col-span-2 rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Revenue & Fee Insights</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Monthly fee collection vs targeted goal</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 text-xs font-bold rounded-full ${data.feeCollectionPct >= 80 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                  {data.feeCollectionPct}% Target Achieved
                </span>
              </div>
            </div>
            <div className="h-[320px] w-full [&_.recharts-wrapper]:outline-none [&_svg]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyFeeTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1E293B" : "#F1F5F9"} />
                  <XAxis dataKey="month" stroke={isDark ? "#64748B" : "#94A3B8"} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke={isDark ? "#64748B" : "#94A3B8"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₨${val/1000}K`} dx={-10} />
                  <RechartsTooltip 
                    cursor={{ stroke: isDark ? '#334155' : '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }}
                    contentStyle={{ backgroundColor: isDark ? "#0A0F24" : "#FFFFFF", borderRadius: "16px", border: isDark ? "1px solid #1E293B" : "1px solid #F1F5F9", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ color: isDark ? "#F8FAFC" : "#0F172A", fontWeight: "700" }}
                    formatter={(value: any) => fmtMoney(value)}
                  />
                  <Area type="monotone" name="Collected" dataKey="collected" stroke="#0D9488" strokeWidth={4} fillOpacity={1} fill="url(#colorCollected)" />
                  <Area type="monotone" name="Target" dataKey="target" stroke="#94A3B8" strokeWidth={3} strokeDasharray="6 6" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Donut */}
          <div className="rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Daily Attendance</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Live campus presence breakdown</p>
              </div>
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: data.studentsPresentToday },
                        { name: 'Late', value: data.studentsLateToday },
                        { name: 'Absent', value: data.studentsAbsentToday },
                      ]}
                      cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                      animationDuration={1500}
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: isDark ? "#0A0F24" : "#FFFFFF", borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      itemStyle={{ color: isDark ? "#F8FAFC" : "#0F172A", fontWeight: "700" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Present", val: data.studentsPresentToday, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
                { label: "Late",    val: data.studentsLateToday,    color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
                { label: "Absent",  val: data.studentsAbsentToday,  color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10" },
              ].map((x) => (
                <div key={x.label} className={`rounded-2xl p-3 text-center ${x.color}`}>
                  <p className="text-xl font-bold">{x.val}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mt-1">{x.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── TABLES ROW ────────────────────────────────────── */}
      {data && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Fee Pending Table */}
          <div className="rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm overflow-hidden flex flex-col">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Fee Status by Class</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Current month overview</p>
              </div>
              <button onClick={() => navigate('/FeeChallans')} className="text-sm font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 group">
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            {data.feePendingPerClass.length === 0 ? (
              <div className="flex-1 flex items-center justify-center"><EmptyState message="No fee data available" /></div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-4 rounded-l-xl">Class</th>
                      <th className="px-4 py-4 text-center">Total</th>
                      <th className="px-4 py-4 text-right">Paid</th>
                      <th className="px-4 py-4 text-right">Pending</th>
                      <th className="px-4 py-4 rounded-r-xl text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {data.feePendingPerClass.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">{row.className}</td>
                        <td className="px-4 py-4 text-center font-medium text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{row.totalStudents}</td>
                        <td className="px-4 py-4 text-right font-bold text-emerald-500">{row.paidCount}</td>
                        <td className="px-4 py-4 text-right font-bold text-rose-500">{row.pendingCount}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${row.paidPct}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-teal-500" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 w-8 text-right group-hover:text-teal-600 transition-colors">{row.paidPct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Activity Feed</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Live system events & audit logs</p>
              </div>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            {data.recentActivities.length === 0 ? (
              <div className="flex-1 flex items-center justify-center"><EmptyState message="No recent activity to show" /></div>
            ) : (
              <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar feed-timeline">
                {data.recentActivities.map((act, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="flex gap-4 group">
                    <div className="relative mt-1">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm z-10 relative group-hover:scale-110 transition-transform group-hover:border-teal-500/30">
                        {activityIcon(act.type)}
                      </div>
                      {i !== data.recentActivities.length - 1 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-10 bg-slate-100 dark:bg-slate-800 timeline-line"></div>
                      )}
                    </div>
                    <div className="pt-1.5 pb-4">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 transition-colors">{act.message}</p>
                      <p className="text-xs font-medium text-slate-400 mt-1 group-hover:text-slate-500 transition-colors">{act.timeAgo}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}

// ─── Stat Cards Component ──────────────────────────────────────
function StatCards({ data, fmtMoney }: { data: DashboardStatsDto; fmtMoney: (v: number) => string }) {
  const cards = [
    {
      title: "Total Enrollment", value: data.totalStudents.toLocaleString(),
      change: data.studentsPresentToday > 0 ? `${data.studentAttendancePctToday}% present today` : "No attendance yet",
      changeType: data.studentAttendancePctToday >= 80 ? "up" : "down",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Staff Members", value: data.totalActiveStaff.toString(),
      change: data.staffPresentToday > 0 ? `${data.staffPresentToday} present today` : "No attendance yet",
      changeType: "up",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      title: "Revenue (MTD)", value: fmtMoney(data.feeCollectedThisMonth),
      change: `${data.feeCollectionPct}% of monthly target`,
      changeType: data.feeCollectionPct >= 80 ? "up" : "down",
      icon: <Wallet className="w-6 h-6" />,
    },
    {
      title: "Live Attendance", value: `${data.studentAttendancePctToday}%`,
      change: data.studentsAbsentToday > 0 ? `${data.studentsAbsentToday} students absent` : "All clear today",
      changeType: data.studentAttendancePctToday >= 90 ? "up" : "down",
      icon: <UserCheck className="w-6 h-6" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, i) => (
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          key={i} 
          className="group rounded-3xl bg-white dark:bg-[#0A0F24] border border-slate-100 dark:border-slate-800/60 p-6 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 transition-transform duration-300 group-hover:scale-110`}>
              {card.icon}
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg">
              {card.changeType === "up" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
              <span className={`text-[11px] font-bold ${card.changeType === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {card.changeType === "up" ? "High" : "Low"}
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 transition-colors">{card.value}</p>
            <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">{card.title}</p>
            <p className="text-xs font-medium text-slate-400 mt-2 group-hover:text-slate-500 transition-colors">{card.change}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}