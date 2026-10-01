import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import Button from '../../components/ui/button/Button';
import { toast } from '../../components/ui/Toast';
import { IdCard, Printer, RefreshCw } from 'lucide-react';
import { activeClientConfig } from '../../config/clientConfig';

export default function StudentIdCardsReport() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const tenantId = localStorage.getItem('tenantId') || '';

  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

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
      setClasses(classData.map((c: any) => ({ value: c.id, label: c.name })));
      setStudents(studentRes.data || []);
      if (tenantRes.data) setTenantInfo(tenantRes.data);
    } catch (err) {
      toast.error('Failed to load student ID cards dataset.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    let result = students;
    if (selectedClass) {
      result = result.filter(s => s.class_id === selectedClass);
    }
    if (searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      result = result.filter(s =>
        (s.first_name && s.first_name.toLowerCase().includes(q)) ||
        (s.last_name && s.last_name.toLowerCase().includes(q)) ||
        (s.admission_number && s.admission_number.toLowerCase().includes(q))
      );
    }
    return result;
  }, [students, selectedClass, searchParam]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageMeta title="Bulk Student ID Cards Sheet Report" description="Bulk Printable Student ID Cards Sheet" />

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
          <Breadcrumb items={[{ label: 'Reports & Analytics' }, { label: 'Bulk Student ID Cards Sheet' }]} />
        </div>

        <div className="no-print bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <IdCard className="w-6 h-6 text-brand-500" /> Bulk Student ID Cards Sheet Report
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Printable grid layout of official Student Identification Cards filtered by class.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchInitialLiveData} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" /> Print ID Cards Sheet
            </Button>
          </div>
        </div>

        <div className="printable-area bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="no-print flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Bulk Student ID Cards ({filteredStudents.length} Candidates)
            </h3>
            <div className="w-64">
              <SearchableSelect
                label="Filter by Class"
                options={[{ value: '', label: 'All Classes' }, ...classes]}
                value={selectedClass}
                onChange={v => setSelectedClass(v as string)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-gray-500">No active students found in selected class.</div>
            ) : (
              filteredStudents.map((st: any, i: number) => {
                const clsName = classes.find(c => c.value === st.class_id)?.label || 'Class Registered';
                const instName = tenantInfo?.name || tenantInfo?.school_name || activeClientConfig.branding.schoolName;
                return (
                  <div key={i} className="w-80 h-48 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-lg flex flex-col justify-between border-2 border-indigo-500/30">
                    <div className="flex justify-between items-center border-b border-indigo-700/50 pb-2">
                      <span className="font-extrabold text-xs tracking-wider text-indigo-300 truncate uppercase">{instName}</span>
                      <span className="text-[10px] font-mono bg-indigo-800 px-2 py-0.5 rounded text-indigo-200 shrink-0">ID CARD</span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-xl bg-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-400">
                        {(st.first_name || 'S').charAt(0)}
                      </div>
                      <div className="space-y-0.5 truncate">
                        <h4 className="font-bold text-sm text-white truncate">{st.first_name} {st.last_name}</h4>
                        <p className="text-xs text-indigo-300 truncate">{clsName}</p>
                        <p className="text-[11px] font-mono text-gray-300">Adm: {st.admission_number || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end text-[9px] text-indigo-300 border-t border-indigo-700/50 pt-1.5">
                      <span>Valid: Academic Session</span>
                      <span className="font-bold text-white">Principal Signature</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
