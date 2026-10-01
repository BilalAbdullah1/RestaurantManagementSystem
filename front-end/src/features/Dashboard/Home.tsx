import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  UtensilsCrossed, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Pizza, 
  Coffee, 
  Users, 
  Calendar,
  Printer,
  Download,
  Layers,
  ChefHat
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { activeClientConfig } from "../../config/clientConfig";
import { toast } from "../../components/ui/Toast";

const todayStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 250, damping: 20 } }
};

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains("dark"));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Restaurant Sales Trend (Hourly)
  const hourlySales = [
    { hour: '12 PM', sales: 18500, orders: 8 },
    { hour: '01 PM', sales: 34200, orders: 16 },
    { hour: '02 PM', sales: 48900, orders: 22 },
    { hour: '03 PM', sales: 21400, orders: 11 },
    { hour: '04 PM', sales: 14200, orders: 7 },
    { hour: '05 PM', sales: 19800, orders: 9 },
    { hour: '06 PM', sales: 31000, orders: 14 },
    { hour: '07 PM', sales: 54000, orders: 25 },
    { hour: '08 PM', sales: 78500, orders: 36 },
    { hour: '09 PM', sales: 92000, orders: 42 },
    { hour: '10 PM', sales: 65400, orders: 29 },
  ];

  // Category Distribution
  const categoryData = [
    { name: 'Main Course', value: 45, color: '#4f46e5' },
    { name: 'Burgers & Pizza', value: 25, color: '#06b6d4' },
    { name: 'Starters', value: 15, color: '#f59e0b' },
    { name: 'Beverages', value: 10, color: '#10b981' },
    { name: 'Desserts', value: 5, color: '#ec4899' },
  ];

  // Active Floor Tables
  const floorTables = [
    { id: 'T-01', zone: 'Ground Floor', seats: 4, status: 'Occupied', order: '#RMS-1027', amount: 4850, time: '25m' },
    { id: 'T-02', zone: 'Ground Floor', seats: 2, status: 'Available', order: null, amount: 0, time: null },
    { id: 'T-03', zone: 'Ground Floor', seats: 6, status: 'Occupied', order: '#RMS-1028', amount: 8200, time: '10m' },
    { id: 'T-04', zone: 'Ground Floor', seats: 4, status: 'Billing', order: '#RMS-1019', amount: 6400, time: '65m' },
    { id: 'T-05', zone: 'First Floor', seats: 8, status: 'Reserved', order: null, amount: 0, time: null },
    { id: 'VIP-01', zone: 'VIP Lounge', seats: 10, status: 'Occupied', order: '#RMS-1024', amount: 24500, time: '80m' },
  ];

  // Recent Live Orders
  const recentOrders = [
    { id: '#RMS-1028', type: 'Dine-in (T-03)', items: 'Mutton Karahi, Roghni Naan, Wings', amount: 8200, status: 'Cooking', time: '10 mins ago' },
    { id: '#RMS-1027', type: 'Dine-in (T-01)', items: 'Chicken Steak, Parmesan Fries, Mocktails', amount: 4850, status: 'Served', time: '25 mins ago' },
    { id: '#RMS-1026', type: 'Takeaway', items: 'Pepperoni Pizza, Blue Lagoon Mocktail', amount: 2350, status: 'Ready', time: '35 mins ago' },
    { id: '#RMS-1025', type: 'Delivery', items: 'Double Smash Beef Burger, Fries, Coke', amount: 1850, status: 'Dispatched', time: '50 mins ago' },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const restaurantName = "ROYAL BISTRO & RESTAURANT";
    const generatedDate = new Date().toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });
    const generatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    doc.setFillColor(10, 15, 36);
    doc.rect(0, 0, pageW, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(restaurantName, pageW / 2, 16, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 184, 166);
    doc.text("EXECUTIVE DAILY SHIFT & POS SALES AUDIT REPORT", pageW / 2, 25, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(180, 190, 210);
    doc.text(`Generated: ${generatedDate} at ${generatedTime} | Branch: Islamabad Flagship Outlet`, pageW / 2, 33, { align: "center" });

    autoTable(doc, {
      startY: 48,
      head: [["Order #", "Order Type", "Items Ordered", "Total Bill", "Order Status", "Timestamp"]],
      body: recentOrders.map(r => [
        r.id,
        r.type,
        r.items,
        `PKR ${r.amount.toLocaleString()}`,
        r.status,
        r.time
      ]),
      theme: "grid",
      headStyles: { fillColor: [10, 15, 36], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { cellPadding: 3.5, fontSize: 8.5 }
    });

    doc.save(`RMS_Daily_Sales_Audit_${Date.now()}.pdf`);
    toast.success("Restaurant Daily Sales Audit PDF downloaded!");
  };

  return (
    <>
      <PageMeta title="Restaurant Dashboard" description="Executive Restaurant Management & POS Control" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-8 animate-in fade-in duration-300 max-w-[1700px] mx-auto pb-16"
      >
        {/* HERO BANNER */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0A0F24] via-[#111836] to-[#0A0F24] p-8 md:p-10 shadow-2xl border border-gray-800/80">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[35%] h-[90%] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-brand-300 text-xs font-bold mb-3 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Live Restaurant Control Center
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {getGreeting()}, Executive Chef & Manager 🍽️
                </h1>
                <p className="text-gray-300 text-sm md:text-base font-medium mt-1 leading-relaxed">
                  Real-time sales monitoring, live kitchen orders, table turnover and POS operations for <span className="text-white font-bold">{todayStr}</span>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/pos')}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Open POS Terminal
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Export Shift PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 PRIMARY STAT CARDS */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Today POS Revenue", value: "PKR 142,850", sub: "+18.4% vs Yesterday", icon: <Receipt className="w-6 h-6 text-brand-500" />, bg: "from-brand-500/10 to-indigo-500/5", border: "border-brand-200 dark:border-brand-900/60" },
            { title: "Occupied Floor Tables", value: "18 / 24 Seated", sub: "75% Table Occupancy", icon: <UtensilsCrossed className="w-6 h-6 text-emerald-500" />, bg: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-200 dark:border-emerald-900/60" },
            { title: "Active KDS Kitchen Tickets", value: "7 Orders", sub: "Avg Cooking: 14 mins", icon: <Flame className="w-6 h-6 text-amber-500" />, bg: "from-amber-500/10 to-orange-500/5", border: "border-amber-200 dark:border-amber-900/60" },
            { title: "Average Ticket Value", value: "PKR 2,460", sub: "58 Billed Orders Today", icon: <TrendingUp className="w-6 h-6 text-purple-500" />, bg: "from-purple-500/10 to-violet-500/5", border: "border-purple-200 dark:border-purple-900/60" },
          ].map((st, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl bg-white dark:bg-gray-900 border ${st.border} shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300`}
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {st.title}
                </p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  {st.value}
                </h3>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {st.sub}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {st.icon}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CHARTS ROW (8 COLS SALES TREND + 4 COLS CATEGORY MIX) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* HOURLY SALES REVENUE AREA CHART */}
          <motion.div variants={itemVariants} className="lg:col-span-8 p-6 md:p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-500" />
                  Hourly Sales & Rush Hour Peaks
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Peak rush occurred at 09:00 PM (PKR 92,000)</p>
              </div>
              <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-extrabold text-xs rounded-xl">
                Live POS Stream
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₨${v / 1000}k`} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: isDark ? "#ffffff" : "#000000"
                    }}
                    formatter={(val: any) => [`PKR ${Number(val).toLocaleString()}`, "Hourly Sales"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* MENU CATEGORY CONTRIBUTION PIE CHART */}
          <motion.div variants={itemVariants} className="lg:col-span-4 p-6 md:p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Pizza className="w-5 h-5 text-amber-500" />
                Category Sales Mix
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Top revenue contributors today</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              {categoryData.map(c => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="font-extrabold text-gray-900 dark:text-white">{c.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* BOTTOM SECTION: LIVE OCCUPIED TABLES + RECENT ORDERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* FLOOR STATUS MINI-GRID (5 COLS) */}
          <motion.div variants={itemVariants} className="lg:col-span-5 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-brand-500" />
                Floor Seating Summary
              </h3>
              <button
                type="button"
                onClick={() => navigate('/tables')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                View Full Floor Plan →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {floorTables.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigate('/tables')}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    t.status === 'Available'
                      ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : t.status === 'Occupied'
                      ? 'bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                      : t.status === 'Reserved'
                      ? 'bg-purple-50/40 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800'
                      : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">{t.id}</span>
                    <span className="text-[10px] font-bold uppercase">{t.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{t.zone} • {t.seats} Seats</p>
                  {t.order && (
                    <div className="mt-2 pt-1.5 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-[11px]">
                      <span>{t.order}</span>
                      <span className="text-brand-600">PKR {t.amount}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* RECENT ORDERS TABLE (7 COLS) */}
          <motion.div variants={itemVariants} className="lg:col-span-7 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                Live Orders Feed
              </h3>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                All Orders History →
              </button>
            </div>

            <div className="space-y-3">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                        {order.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 font-bold text-[10px] text-gray-700 dark:text-gray-300">
                        {order.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate max-w-sm">
                      {order.items}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white block">
                      PKR {order.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {order.status} • {order.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </motion.div>
    </>
  );
}