import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import Swal from 'sweetalert2';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import SearchableSelect, { OptionType } from '../../components/form/select/SearchableSelect';
import { Download, LayoutGrid, Table as TableIcon, Plus, Search, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Sub-components
import AlumniStats from './components/AlumniStats';
import AlumniCard from './components/AlumniCard';
import AlumniFormDrawer from './components/AlumniFormDrawer';
import AlumniProfileModal from './components/AlumniProfileModal';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import { toast } from '../../components/ui/Toast';

interface AlumniProfile {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  gender: string;
  phone_number: string;
  graduation_year: number;
  current_occupation: string;
  current_organization: string;
  higher_education_details: string;
}

interface LookupItem {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  admission_number?: string;
}

export default function AlumniDirectory() {
  const tenantId = localStorage.getItem("tenantId") || "";

  // --- STATES ---
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [students, setStudents] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // UI States
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState<string>('');

  // Form State
  const initialForm = {
    id: '',
    student_id: '',
    graduation_year: new Date().getFullYear(),
    current_occupation: '',
    current_organization: '',
    higher_education_details: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA ---
  const fetchData = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const [alumniRes, studentsRes] = await Promise.all([
        api.get<AlumniProfile[]>(`/alumniprofiles/tenant/${tenantId}`),
        api.get<LookupItem[]>(`/students/tenant/${tenantId}`)
      ]);
      setAlumniList(alumniRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error('Failed to load alumni data', err);
      toast.error('Failed to load alumni directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  // --- DERIVED DATA & FILTERS ---
  const uniqueYears = useMemo(() => {
    const years = new Set(alumniList.map(a => a.graduation_year));
    return Array.from(years).sort((a, b) => b - a);
  }, [alumniList]);

  const filteredAlumni = useMemo(() => {
    let result = alumniList;
    if (filterYear) {
      result = result.filter(a => a.graduation_year.toString() === filterYear);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(a => 
        (a.student_name || '').toLowerCase().includes(q) || 
        (a.admission_number || '').toLowerCase().includes(q) ||
        (a.current_organization || '').toLowerCase().includes(q) ||
        (a.current_occupation || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [alumniList, filterYear, searchQuery]);

  const studentOptions = useMemo((): OptionType[] => 
    students.map(s => ({ value: s.id, label: `${s.first_name || ''} ${s.last_name || ''} (${s.admission_number || 'GR'})`.trim() })), 
    [students]
  );

  // Stats calculations
  const currentYear = new Date().getFullYear();
  const recentGradsCount = alumniList.filter(a => a.graduation_year >= currentYear - 2).length;
  const employedCount = alumniList.filter(a => a.current_occupation && a.current_occupation.trim() !== '').length;
  
  const topSector = useMemo(() => {
    const orgs = alumniList.map(a => a.current_organization).filter(Boolean);
    if (orgs.length === 0) return 'Various';
    const counts = orgs.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<string, number>);
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }, [alumniList]);

  const batchOptions = useMemo((): OptionType[] => 
    uniqueYears.map(year => ({ value: year.toString(), label: `Class of ${year}` })), [uniqueYears]
  );

  // --- EXPORT TO PDF & CSV ---
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Alumni Network Directory', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Batch Year Filter: ${filterYear ? `Class of ${filterYear}` : 'All Batches'}`, 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [['Student Name', 'GR Number', 'Batch Year', 'Current Occupation', 'Organization', 'Phone Number']],
      body: filteredAlumni.map(a => [
        a.student_name,
        a.admission_number,
        a.graduation_year,
        a.current_occupation || 'N/A',
        a.current_organization || 'N/A',
        a.phone_number || 'N/A'
      ]),
    });
    doc.save(`alumni_directory_${filterYear || 'all'}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['Student Name', 'GR Number', 'Batch Year', 'Current Occupation', 'Organization', 'Phone Number'];
    const csvRows = filteredAlumni.map(a => [
      a.student_name,
      a.admission_number,
      a.graduation_year,
      (a.current_occupation || '').replace(/,/g, ' '),
      (a.current_organization || '').replace(/,/g, ' '),
      a.phone_number || ''
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `alumni_directory_${filterYear || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS ---
  const handleAddNew = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setIsFormDrawerOpen(true);
  };

  const handleEdit = (profile: AlumniProfile) => {
    setFormData({
      id: profile.id,
      student_id: profile.student_id,
      graduation_year: profile.graduation_year,
      current_occupation: profile.current_occupation || '',
      current_organization: profile.current_organization || '',
      higher_education_details: profile.higher_education_details || ''
    });
    setIsEditing(true);
    setIsFormDrawerOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete Alumni Profile?',
      text: `Are you sure you want to remove ${name} from the Alumni Directory?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/alumniprofiles/${id}`);
        setAlumniList(prev => prev.filter(a => a.id !== id));
        toast.success('Alumni profile deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete alumni profile.');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (isEditing) {
        await api.put(`/alumniprofiles/${formData.id}`, formData);
        toast.success('Alumni profile updated!');
      } else {
        await api.post('/alumniprofiles', { ...formData, tenant_id: tenantId });
        toast.success('Welcome to the Alumni Network!');
      }
      setIsFormDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewDetails = (profile: AlumniProfile) => {
    setSelectedAlumni(profile);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Alumni Directory
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect and track the professional journey of proud school graduates.
          </p>
        </div>
        
        <Button variant="primary" onClick={handleAddNew} className="shadow-lg shadow-brand-500/20 whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> Add Alumni Profile
        </Button>
      </div>

      {/* KPI STATS */}
      <AlumniStats 
        totalAlumni={alumniList.length}
        recentGrads={recentGradsCount}
        employed={employedCount}
        topSector={topSector}
        loading={loading}
      />

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Batch Filter */}
        <div className="w-full md:w-56">
          <SearchableSelect
            label=""
            options={[
              { value: '', label: '🎓 All Batches' },
              ...batchOptions
            ]}
            value={filterYear}
            onChange={(val) => setFilterYear(val as string || '')}
            placeholder="All Batches"
          />
        </div>

        {/* View Toggle & Export */}
        <div className="flex items-center gap-2 ml-auto">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:text-gray-800'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:text-gray-800'
              }`}
              title="Datatable View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={exportPDF} 
            title="Export PDF" 
            className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={exportCSV} 
            title="Export CSV" 
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
          >
            CSV
          </button>
        </div>
      </div>

      {/* DIRECTORY CONTENT */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-800" />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Graduate Profile</th>
                    <th className="px-6 py-4 font-bold">Batch Year</th>
                    <th className="px-6 py-4 font-bold">Occupation & Company</th>
                    <th className="px-6 py-4 font-bold">Higher Education</th>
                    <th className="px-6 py-4 font-bold">Contact</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`alumni-skel-${rowIndex}`} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredAlumni.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 font-medium">
          <div className="text-4xl mb-3 opacity-50">🎓</div>
          No alumni profiles found matching your search.
        </div>
      ) : viewMode === 'grid' ? (
        /* --- GRID CARDS VIEW --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlumni.map(alumni => (
            <AlumniCard 
              key={alumni.id} 
              alumni={alumni} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        /* --- DATATABLE VIEW --- */
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Graduate Profile</th>
                  <th className="px-6 py-4 font-bold">Batch Year</th>
                  <th className="px-6 py-4 font-bold">Occupation & Company</th>
                  <th className="px-6 py-4 font-bold">Higher Education</th>
                  <th className="px-6 py-4 font-bold">Contact</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAlumni.map(alumni => (
                  <tr key={alumni.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-brand-600" onClick={() => handleViewDetails(alumni)}>
                        {alumni.student_name}
                      </div>
                      <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                        GR: {alumni.admission_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Class of {alumni.graduation_year}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{alumni.current_occupation || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{alumni.current_organization || '-'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-400" title={alumni.higher_education_details}>
                        {alumni.higher_education_details || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {alumni.phone_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        onEdit={() => handleEdit(alumni)}
                        onDelete={() => handleDelete(alumni.id, alumni.student_name)}
                        customActions={[
                          { label: 'View Profile Card', onClick: () => handleViewDetails(alumni) }
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- DRAWERS & MODALS --- */}
      <AlumniFormDrawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        isEditing={isEditing}
        studentOptions={studentOptions}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        submitLoading={submitLoading}
      />

      <AlumniProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        alumni={selectedAlumni}
      />

    </div>
  );
}