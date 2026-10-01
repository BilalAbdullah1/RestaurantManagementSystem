import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/axiosConfig';
import PageMeta from '../../components/common/PageMeta';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards, { StatCardData } from '../../components/ui/UIDesigns/StatCards';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import SearchableSelect from '../../components/form/select/SearchableSelect';
import { toast } from '../../components/ui/Toast';
import { Layers, Users, MapPin, Download, Edit3, Trash2, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';

interface SchoolClass {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  designation?: string;
}

interface Section {
  id?: string;
  tenant_id: string;
  class_id: string;
  class_teacher_id?: string;
  name: string;
  room_number: string;
  max_capacity: number;
  created_at?: string;
}

const initialFormState = (tenantId: string, defaultClassId: string): Section => ({
  tenant_id: tenantId,
  class_id: defaultClassId,
  class_teacher_id: '',
  name: '',
  room_number: '',
  max_capacity: 40
});

export default function Sections() {
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const tenantId = localStorage.getItem("tenantId") || "";
  const [formData, setFormData] = useState<Section>(initialFormState(tenantId, ''));

  const classMap = useMemo(() => {
    const map: Record<string, string> = {};
    classes.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [classes]);

  const staffMap = useMemo(() => {
    const map: Record<string, string> = {};
    staffList.forEach(s => { 
      map[s.id] = `${s.first_name} ${s.last_name}${s.designation ? ` (${s.designation})` : ''}`; 
    });
    return map;
  }, [staffList]);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    fetchInitialData();
  }, [tenantId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, classesRes, staffRes] = await Promise.all([
        api.get<Section[]>(`/sections/tenant/${tenantId}`),
        api.get<SchoolClass[]>(`/classes/tenant/${tenantId}`),
        api.get<StaffMember[]>(`/staff/tenant/${tenantId}`).catch(() => ({ data: [] }))
      ]);
      setSections(sectionsRes.data || []);
      setClasses(classesRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err: any) {
      toast.error('Unable to load section records.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSections = async () => {
    const response = await api.get<Section[]>(`/sections/tenant/${tenantId}`);
    setSections(response.data || []);
  };

  const processedSections = useMemo(() => {
    const keyword = searchKeyword.toLowerCase();
    return sections.filter(s => {
      const matchesClass = classFilter === 'all' || s.class_id === classFilter;
      const matchesKeyword =
        s.name.toLowerCase().includes(keyword) ||
        (s.room_number ?? '').toLowerCase().includes(keyword) ||
        (classMap[s.class_id] ?? '').toLowerCase().includes(keyword);
      return matchesClass && matchesKeyword;
    });
  }, [sections, searchKeyword, classFilter, classMap]);

  const openEditView = (section: Section) => {
    setEditingSection(section);
    setFormData({ ...section, room_number: section.room_number ?? '' });
    setIsEditing(true);
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openAddView = () => {
    if (classes.length === 0) {
      toast.error('You need at least one class created before adding a section.');
      return;
    }
    setEditingSection(null);
    setFormData(initialFormState(tenantId, classFilter !== 'all' ? classFilter : classes[0].id));
    setIsEditing(false);
    setIsViewing(false);
    setIsFormDrawerOpen(true);
  };

  const openDetailView = (section: Section) => {
    setEditingSection(section);
    setFormData({ ...section, room_number: section.room_number ?? '' });
    setIsEditing(false);
    setIsViewing(true);
    setIsFormDrawerOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Section Name is required.');
      return;
    }
    if (!formData.class_id) {
      toast.error('Please select a Class.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (isEditing && editingSection && editingSection.id) {
        await api.put(`/sections/${editingSection.id}`, formData);
        toast.success('Section updated successfully.');
      } else {
        await api.post('/sections', formData);
        toast.success('New section created successfully.');
      }
      setIsFormDrawerOpen(false);
      refreshSections();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not save section.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Class Sections Directory', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Class / Grade', 'Section Name', 'Room Number', 'Max Capacity']],
      body: processedSections.map(s => [
        classMap[s.class_id] || 'N/A',
        s.name,
        s.room_number || 'N/A',
        `${s.max_capacity} Seats`
      ]),
    });
    doc.save('Class_Sections_Directory.pdf');
  };

  const exportCSV = () => {
    const headers = ['Class / Grade', 'Section Name', 'Room Number', 'Max Capacity'];
    const csvRows = processedSections.map(s => [
      (classMap[s.class_id] || '').replace(/,/g, ' '),
      s.name.replace(/,/g, ' '),
      (s.room_number || '').replace(/,/g, ' '),
      s.max_capacity
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Class_Sections_Directory.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSection = async (section: Section) => {
    if (!window.confirm(`Are you sure you want to delete section "${section.name}"?`)) return;
    try {
      await api.delete(`/sections/${section.id}`);
      toast.success('Section deleted successfully.');
      refreshSections();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not delete this section.");
    }
  };

  const totalSeats = useMemo(() => sections.reduce((acc, s) => acc + (s.max_capacity || 0), 0), [sections]);

  const stats: StatCardData[] = useMemo(() => [
    { title: 'Total Active Sections', value: `${sections.length} Sections`, icon: <Layers className="w-5 h-5 text-brand-500" />, theme: 'brand' as const },
    { title: 'Total Student Capacity', value: `${totalSeats} Seats`, icon: <Users className="w-5 h-5 text-emerald-500" />, theme: 'success' as const },
    { title: 'Active Classes', value: `${classes.length} Classes`, icon: <MapPin className="w-5 h-5 text-indigo-500" />, theme: 'indigo' as const },
  ], [sections, totalSeats, classes]);

  const columns = useMemo<ColumnDef<Section>[]>(
    () => [
      {
        accessorKey: 'class_id',
        header: 'Class / Grade',
        cell: info => (
          <span className="font-bold text-gray-900 dark:text-white">
            {classMap[info.getValue() as string] || 'Unassigned Class'}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Section Name',
        cell: info => <Badge variant="light" color="primary">{info.getValue() as string}</Badge>,
      },
      {
        accessorKey: 'class_teacher_id',
        header: 'Class Teacher / Incharge',
        cell: info => {
          const val = info.getValue() as string;
          return val && staffMap[val] ? (
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              👨‍🏫 {staffMap[val]}
            </span>
          ) : (
            <span className="text-xs text-gray-400 italic">Not Assigned</span>
          );
        },
      },
      {
        accessorKey: 'room_number',
        header: 'Room Number',
        cell: info => {
          const val = info.getValue() as string;
          return val ? (
            <span className="font-mono text-xs">{val}</span>
          ) : (
            <span className="text-xs text-gray-400 italic">No room assigned</span>
          );
        },
      },
      {
        accessorKey: 'max_capacity',
        header: 'Seating Capacity',
        cell: info => (
          <span className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">
            {info.getValue() as number} Student Seats
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: info => {
          const rowData = info.row.original;
          return (
            <div className="flex justify-end">
              <ActionMenu
                items={[
                  {
                    label: 'View Section Profile',
                    icon: <Eye className="w-4 h-4 text-blue-500" />,
                    onClick: () => openDetailView(rowData),
                  },
                  {
                    label: 'Edit Section Details',
                    icon: <Edit3 className="w-4 h-4 text-emerald-500" />,
                    onClick: () => openEditView(rowData),
                  },
                  {
                    label: 'Delete Section',
                    icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                    onClick: () => deleteSection(rowData),
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    [classMap, staffMap]
  );

  const table = useReactTable({
    data: processedSections,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <PageMeta title="Class Sections Directory" description="School Section & Room Assignment Portal" />

      <div className="w-full space-y-6 animate-in fade-in duration-300">
        <Breadcrumb items={[{ label: 'Academics' }, { label: 'Class Sections' }]} />

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-brand-500" /> Class Sections Directory
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage class room assignments, capacities, and sections.</p>
          </div>

          <Button variant="primary" onClick={openAddView} className="flex items-center gap-2">
            + Add New Section
          </Button>
        </div>

        {/* KPI STATS */}
        <StatCards stats={stats} loading={loading} />

        {/* MAIN TABLE CONTAINER */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar Header */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">Class Sections Ledger</h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-56">
                <SearchableSelect
                  options={[{ value: 'all', label: 'All Classes Filter' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                  value={classFilter}
                  onChange={(v) => setClassFilter((v as string) || 'all')}
                />
              </div>
              <div className="w-full sm:w-56">
                <Input
                  type="text"
                  placeholder="Search section or room..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportPDF} title="Export to PDF" className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors h-10 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={exportCSV} title="Export to CSV" className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors h-10 flex items-center justify-center">
                  CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[250px]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                      >
                        <div className={`flex items-center ${header.id === 'actions' ? 'justify-end' : ''}`}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <span className="ml-1 text-brand-500">▲</span>,
                            desc: <span className="ml-1 text-brand-500">▼</span>,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                      {columns.map((_, colIndex) => (
                        <td key={`skeleton-cell-${colIndex}`} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                      No sections found in directory.
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {[10, 20, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            {table.getPageCount() > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all cursor-pointer">
                  Previous
                </button>
                <span className="text-xs text-gray-400">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-40 transition-all cursor-pointer">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE DRAWER FORM */}
        <ProfileDrawer
          isOpen={isFormDrawerOpen}
          onClose={() => setIsFormDrawerOpen(false)}
          title={isViewing ? 'Section Profile Details' : isEditing ? 'Update Section Details' : 'Create New Section'}
        >
          {isViewing ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Class / Grade</Label>
                <p className="text-base font-bold text-gray-900 dark:text-white">{classMap[formData.class_id] || 'N/A'}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Section Name</Label>
                <p className="text-base font-bold text-brand-600">{formData.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Class Teacher / Incharge</Label>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {formData.class_teacher_id && staffMap[formData.class_teacher_id] ? staffMap[formData.class_teacher_id] : 'No class teacher assigned'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Room Assignment</Label>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{formData.room_number || 'None'}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
                <Label>Seating Capacity</Label>
                <p className="font-mono text-sm text-gray-700 dark:text-gray-300">{formData.max_capacity} Seats</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <SearchableSelect
                  label="Target Class / Grade *"
                  options={classes.map(c => ({ value: c.id, label: c.name }))}
                  value={formData.class_id}
                  onChange={(v) => setFormData({ ...formData, class_id: v as string })}
                />
              </div>

              <div>
                <Label required>Section Name</Label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Section A or Rose"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <SearchableSelect
                  label="Class Teacher / Incharge (Designated Staff)"
                  options={[
                    { value: '', label: 'None (Unassigned)' },
                    ...staffList.map(s => ({
                      value: s.id,
                      label: `${s.first_name} ${s.last_name}${s.designation ? ` (${s.designation})` : ''}`
                    }))
                  ]}
                  value={formData.class_teacher_id || ''}
                  onChange={(v) => setFormData({ ...formData, class_teacher_id: (v as string) || '' })}
                  placeholder="Select Class Teacher..."
                />
              </div>

              <div>
                <Label>Room Number / Location</Label>
                <Input
                  type="text"
                  placeholder="e.g. Room 102"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                />
              </div>

              <div>
                <Label>Max Seating Capacity</Label>
                <Input
                  type="number"
                  placeholder="40"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" onClick={() => setIsFormDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={submitLoading}
                  loadingText="Saving..."
                >
                  {isEditing ? 'Save Changes' : 'Create Section'}
                </Button>
              </div>
            </form>
          )}
        </ProfileDrawer>
      </div>
    </>
  );
}