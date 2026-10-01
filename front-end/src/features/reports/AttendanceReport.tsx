import { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import DatePicker from '../../components/form/date-picker';
import { 
  Calendar as CalendarIcon, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Download, 
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SearchableSelect from '../../components/form/select/SearchableSelect';

// --- TYPES ---
interface LookupItem {
  id: string;
  name?: string;
  title?: string;
  class_id?: string;
}

interface HeatmapDay {
  date: string; // yyyy-MM-dd
  presentCount: number;
  totalCount: number;
  percentage: number;
}

interface StudentReportRow {
  student_id: string;
  student_name: string;
  admission_number: string;
  roll_number: number;
  total_days: number;
  presents: number;
  absents: number;
  leaves: number;
  lates: number;
  attendance_percentage: number;
}

export default function AttendanceReport() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // Metadata
  const [academicYears, setAcademicYears] = useState<LookupItem[]>([]);
  const [classes, setClasses] = useState<LookupItem[]>([]);
  const [allSections, setAllSections] = useState<LookupItem[]>([]);

  // Selected filters
  const [yearId, setYearId] = useState<string>('');
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  
  // Date range (Default to last 30 days)
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Data states
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [reportRows, setReportRows] = useState<StudentReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- METADATA FETCH ---
  useEffect(() => {
    if (!tenantId) return;
    const fetchMeta = async () => {
      try {
        const [yearsRes, classesRes, sectionsRes] = await Promise.all([
          api.get<LookupItem[]>(`/academicyears/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/classes/tenant/${tenantId}`),
          api.get<LookupItem[]>(`/sections/tenant/${tenantId}`)
        ]);
        setAcademicYears(yearsRes.data);
        setClasses(classesRes.data);
        setAllSections(sectionsRes.data);

        const currentYear = yearsRes.data.find((y: any) => y.is_current) || yearsRes.data[0];
        if (currentYear) setYearId(currentYear.id);
        if (classesRes.data.length > 0) setClassId(classesRes.data[0].id);
      } catch (err) {
        console.error("Failed to load layout metadata", err);
      }
    };
    fetchMeta();
  }, [tenantId]);

  // Filter sections by class
  const filteredSections = useMemo(() => allSections.filter(s => s.class_id === classId), [allSections, classId]);
  useEffect(() => {
    if (filteredSections.length > 0) {
      setSectionId(filteredSections[0].id);
    } else {
      setSectionId('');
    }
  }, [filteredSections]);

  // --- FETCH ANALYTICS DATA ---
  const fetchAnalytics = async () => {
    if (!tenantId || !yearId || !classId || !sectionId) return;
    setLoading(true);
    try {
      // 1. Fetch Heatmap dataset (primary live route with fallback)
      let heatmapDataRes: HeatmapDay[] = [];
      try {
        const heatmapUrl = `/StudentAttendances/heatmap/tenant/${tenantId}?classId=${classId}&sectionId=${sectionId}&startDate=${startDate}&endDate=${endDate}`;
        const heatmapRes = await api.get(heatmapUrl).catch(() =>
          api.get(`/StudentAttendances/heatmap-stats?classId=${classId}&sectionId=${sectionId}&startDate=${startDate}&endDate=${endDate}`)
        );
        heatmapDataRes = ((heatmapRes?.data as any[]) || []).map((d: any) => ({
          date: d.date || d.Date || '',
          presentCount: Number(d.presentCount ?? d.PresentCount ?? 0),
          totalCount: Number(d.totalCount ?? d.TotalCount ?? 0),
          percentage: Number(d.percentage ?? d.Percentage ?? 0),
        }));
      } catch (hErr) {
        console.warn("Could not retrieve heatmap dataset:", hErr);
      }

      // 2. Fetch Class Report dataset (primary live route with fallback)
      let reportDataRes: StudentReportRow[] = [];
      try {
        const reportUrl = `/StudentAttendances/report?academicYearId=${yearId}&classId=${classId}&sectionId=${sectionId}&startDate=${startDate}&endDate=${endDate}`;
        const reportRes = await api.get(reportUrl).catch(() =>
          api.get(`/StudentAttendances/report-stats?academicYearId=${yearId}&classId=${classId}&sectionId=${sectionId}&startDate=${startDate}&endDate=${endDate}`)
        );
        reportDataRes = ((reportRes?.data as any[]) || []).map((r: any) => ({
          student_id: r.student_id || r.studentId || '',
          student_name: r.student_name || r.studentName || '',
          admission_number: r.admission_number || r.admissionNumber || '',
          roll_number: Number(r.roll_number ?? r.rollNumber ?? 0),
          total_days: Number(r.total_days ?? r.totalDays ?? 0),
          presents: Number(r.presents ?? 0),
          absents: Number(r.absents ?? 0),
          leaves: Number(r.leaves ?? 0),
          lates: Number(r.lates ?? 0),
          attendance_percentage: Number(r.attendance_percentage ?? r.attendancePercentage ?? 0),
        }));
      } catch (rErr: any) {
        console.error("Failed to load student attendance report:", rErr);
        throw rErr;
      }

      setHeatmapData(heatmapDataRes);
      setReportRows(reportDataRes);
    } catch (err: any) {
      console.error("Attendance query failed:", err);
      Swal.fire({
        icon: 'error',
        title: 'Query Failed',
        text: err?.response?.data?.message || 'Failed to retrieve attendance reporting datasets. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Run search when criteria change
  useEffect(() => {
    fetchAnalytics();
  }, [yearId, classId, sectionId, startDate, endDate]);

  // --- DERIVED METRICS ---
  const overallAverage = useMemo(() => {
    if (reportRows.length === 0) return 0;
    const sum = reportRows.reduce((a, b) => a + b.attendance_percentage, 0);
    return Math.round((sum / reportRows.length) * 10) / 10;
  }, [reportRows]);

  const lowAttendanceDaysCount = useMemo(() => {
    return heatmapData.filter(d => d.percentage < 75).length;
  }, [heatmapData]);

  const filteredReportRows = useMemo(() => {
    return reportRows.filter(r => 
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reportRows, searchQuery]);

  // Get color code for heatmap status
  const getHeatmapColor = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500 hover:bg-emerald-600 text-white';
    if (pct >= 75) return 'bg-success-400 hover:bg-success-500 text-white';
    if (pct >= 60) return 'bg-amber-400 hover:bg-amber-500 text-slate-900';
    return 'bg-error-500 hover:bg-error-600 text-white animate-pulse';
  };

  // --- PDF EXPORT ---
  const exportPDF = () => {
    const doc = new jsPDF();
    const activeClass = classes.find(c => c.id === classId)?.name || 'Class';
    const activeSection = allSections.find(s => s.id === sectionId)?.name || 'Section';

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Student Attendance Report — ${activeClass} (${activeSection})`, 14, 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Timeline: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 14, 21);
    doc.text(`Average Class Attendance: ${overallAverage}%`, 14, 27);

    autoTable(doc, {
      startY: 33,
      head: [['Adm. #', 'Name', 'Total Days', 'Presents', 'Absents', 'Late', 'Leaves', 'Attendance %']],
      body: reportRows.map(r => [
        r.admission_number,
        r.student_name,
        r.total_days,
        r.presents,
        r.absents,
        r.lates,
        r.leaves,
        `${r.attendance_percentage}%`
      ]),
      headStyles: { fillColor: [70, 95, 255] }
    });

    doc.save(`Attendance_Report_${activeClass}_${activeSection}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-brand-500" /> Attendance Reports & Heatmaps
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Identify low attendance days, track statistics, and analyze student analytics.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={fetchAnalytics}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <button
            disabled={reportRows.length === 0}
            onClick={exportPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-50">
          
          <div>
            <SearchableSelect
              label="Academic Year *"
              value={yearId}
              onChange={val => setYearId(val as string)}
              options={academicYears.map(y => ({ value: y.id, label: y.title || '' }))}
              placeholder="Select Year"
            />
          </div>

          <div>
            <SearchableSelect
              label="Class *"
              value={classId}
              onChange={val => setClassId(val as string)}
              options={classes.map(c => ({ value: c.id, label: c.name || '' }))}
              placeholder="Select Class"
            />
          </div>

          <div>
            <SearchableSelect
              label="Section *"
              value={sectionId}
              onChange={val => setSectionId(val as string)}
              options={filteredSections.length === 0 ? [] : filteredSections.map(s => ({ value: s.id, label: s.name || '' }))}
              placeholder={filteredSections.length === 0 ? "No Sections Defined" : "Select Section"}
            />
          </div>

          <div>
            <DatePicker label="From Date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div>
            <DatePicker label="To Date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        
        {/* KPI 1 */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-theme-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Attendance</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {loading ? '—' : `${overallAverage}%`}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {overallAverage >= 85 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-success-500" />
                  <span className="text-success-600 font-semibold">Exceeds standard threshold</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-error-500" />
                  <span className="text-error-600 font-semibold">Below optimal standard</span>
                </>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-theme-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Critical Low Days (&lt;75%)</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {loading ? '—' : lowAttendanceDaysCount}
            </p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-warning-500 shrink-0" />
              <span>Days requiring staff reviews</span>
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lowAttendanceDaysCount > 0 ? 'bg-error-500/10 text-error-500' : 'bg-success-500/10 text-success-500'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-theme-xs flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tracked Class Size</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              {loading ? '—' : `${reportRows.length} Students`}
            </p>
            <p className="text-xs text-gray-400 mt-1">Active class roll listings</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* HEATMAP GRID VISUALIZER */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs">
        <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Attendance Heatmap</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hover over cards to see detailed daily percentages</p>
          </div>
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="font-semibold text-gray-400">Legend:</span>
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" /> <span>&ge; 90%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-success-400 inline-block" /> <span>75% - 90%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" /> <span>60% - 75%</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-error-500 inline-block" /> <span>&lt; 60%</span></div>
          </div>
        </div>

        {loading ? (
          <div className="h-28 flex items-center justify-center text-brand-500 font-bold animate-pulse">
            Compiling attendance logs...
          </div>
        ) : heatmapData.length === 0 ? (
          <div className="py-8 text-center text-gray-400 font-medium border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
            No attendance datasets generated in this timeline.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-10 gap-3">
            {heatmapData.map((day) => (
              <div 
                key={day.date} 
                className={`p-3 rounded-xl border border-transparent shadow-theme-xs transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-theme-md flex flex-col items-center justify-center text-center group cursor-pointer ${getHeatmapColor(day.percentage)}`}
              >
                <span className="text-xs opacity-80 font-bold">
                  {new Date(day.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-lg font-black mt-1">
                  {day.percentage}%
                </span>
                <span className="text-[10px] opacity-0 group-hover:opacity-100 mt-0.5 font-medium transition-opacity duration-200">
                  {day.presentCount} / {day.totalCount} Present
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STUDENT REPORT GRID */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-theme-xs overflow-hidden">
        
        {/* Table header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Individual Student Summary</h3>
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Search student or roll #..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-transparent py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-800 dark:text-white/90"
            />
          </div>
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-5 py-4">Roll</th>
                <th className="px-5 py-4">Adm #</th>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4 text-center text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4 inline mr-1" />Pres.</th>
                <th className="px-5 py-4 text-center text-rose-500"><XCircle className="w-4 h-4 inline mr-1" />Abs.</th>
                <th className="px-5 py-4 text-center text-amber-500"><Clock className="w-4 h-4 inline mr-1" />Late</th>
                <th className="px-5 py-4 text-center text-blue-500"><HelpCircle className="w-4 h-4 inline mr-1" />Leave</th>
                <th className="px-5 py-4 text-right">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-brand-500 font-bold animate-pulse">
                    Populating analytical dataset...
                  </td>
                </tr>
              ) : filteredReportRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    No student records found matching details.
                  </td>
                </tr>
              ) : (
                filteredReportRows.map((row) => (
                  <tr key={row.student_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-gray-500">{row.roll_number}</td>
                    <td className="px-5 py-3 font-mono text-gray-600 dark:text-gray-400">{row.admission_number}</td>
                    <td className="px-5 py-3 font-bold text-gray-900 dark:text-white">{row.student_name}</td>
                    <td className="px-5 py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5">{row.presents}</td>
                    <td className="px-5 py-3 text-center text-rose-500 font-bold bg-rose-500/5">{row.absents}</td>
                    <td className="px-5 py-3 text-center text-amber-500 font-bold bg-amber-500/5">{row.lates}</td>
                    <td className="px-5 py-3 text-center text-blue-500 font-bold bg-blue-500/5">{row.leaves}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              row.attendance_percentage >= 90 ? 'bg-emerald-500' :
                              row.attendance_percentage >= 75 ? 'bg-success-500' :
                              row.attendance_percentage >= 60 ? 'bg-warning-500' : 'bg-error-500'
                            }`}
                            style={{ width: `${row.attendance_percentage}%` }}
                          />
                        </div>
                        <span className={`text-sm font-black ${
                          row.attendance_percentage >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                          row.attendance_percentage >= 75 ? 'text-success-600 dark:text-success-400' :
                          row.attendance_percentage >= 60 ? 'text-amber-500' : 'text-error-500'
                        }`}>
                          {row.attendance_percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
