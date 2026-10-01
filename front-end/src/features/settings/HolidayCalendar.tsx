import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import api from '../../utils/axiosConfig';
import { Calendar, Plus, Trash2, Edit, Clock, Palmtree, SunMedium } from 'lucide-react';
import Swal from 'sweetalert2';
import ActionMenu from '../../components/ui/UIDesigns/ActionMenu';
import ProfileDrawer from '../../components/ui/UIDesigns/ProfileDrawer';
import InputField from '../../components/form/input/InputField';
import DatePicker from '../../components/form/date-picker';
import Label from '../../components/form/Label';
import Button from '../../components/ui/button/Button';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import StatCards from '../../components/ui/UIDesigns/StatCards';
import { toast } from '../../components/ui/Toast';

export default function HolidayCalendar() {
  const tenantId = localStorage.getItem("tenantId") || "";
  const [searchParams] = useSearchParams();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [formData, setFormData] = useState({ id: '', name: '', start_date: '', end_date: '' });

  useEffect(() => {
    fetchHolidays();
  }, []);

  // Deep linking: Open drawer if ?action=new or ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'new' || searchParams.get('action') === 'add') {
      openAdd();
    }
  }, [searchParams]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      setHolidays(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setFormData({ id: '', name: '', start_date: '', end_date: '' });
    setIsDrawerOpen(true);
  };

  const openEdit = (holiday: any) => {
    setFormData({ 
      id: holiday.id, 
      name: holiday.name, 
      start_date: holiday.start_date.split('T')[0], 
      end_date: holiday.end_date.split('T')[0] 
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: 'Delete Holiday?',
      text: "This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });
    if (res.isConfirmed) {
      try {
        await api.delete(`/holidays/${id}`);
        toast.success('Holiday deleted');
        fetchHolidays();
      } catch (err) {
        toast.error('Failed to delete holiday');
      }
    }
  };

  const saveHoliday = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      if (formData.id) {
        await api.put(`/holidays/${formData.id}`, formData);
      } else {
        const { id, ...newHolidayData } = formData;
        await api.post('/holidays', newHolidayData);
      }
      toast.success('Holiday saved successfully');
      setIsDrawerOpen(false);
      fetchHolidays();
    } catch (err: any) {
      toast.error('Failed to save holiday');
      console.error(err);
    }
  };

  const totalHolidays = holidays.length;
  const nextHoliday = holidays.length > 0 ? holidays[0].name : 'None Scheduled';

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <Breadcrumb items={[{ label: 'System Settings', href: '#' }, { label: 'Academic Holiday Calendar' }]} />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-500" /> Restaurant & Staff Holiday Calendar
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Define restaurant operating holidays, gazetted closures, and special festive schedules.</p>
        </div>
        <Button variant="primary" onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Holiday
        </Button>
      </div>

      {/* KPI STAT CARDS */}
      <StatCards
        stats={[
          { title: 'Total Holidays Scheduled', value: totalHolidays, icon: <Palmtree className="w-5 h-5" />, theme: 'brand' },
          { title: 'Next Upcoming Break', value: nextHoliday, icon: <SunMedium className="w-5 h-5" />, theme: 'warning' },
          { title: 'Operational Year Calendar', value: '2026 - 2027 Active', icon: <Clock className="w-5 h-5" />, theme: 'success' },
        ]}
      />

      {/* HOLIDAYS TABLE */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[250px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Holiday Name</th>
                <th className="px-6 py-3">Start Date</th>
                <th className="px-6 py-3">End Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-400 animate-pulse">Loading holidays...</td></tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                        No Holidays Scheduled
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Add official restaurant closures, national holidays, or seasonal schedules to sync with staff rosters.
                      </p>
                      <Button variant="primary" onClick={openAdd} className="text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add First Holiday
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                holidays.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Palmtree className="w-4 h-4 text-emerald-500" /> {h.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(h.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(h.end_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex justify-end">
                      <ActionMenu groups={[[
                        { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEdit(h) },
                        { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDelete(h.id), isDanger: true }
                      ]]} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER FOR ADD / EDIT */}
      <ProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title={formData.id ? "Edit Holiday" : "Add Holiday"}>
        <div className="p-6 space-y-4">
          <div>
            <Label required>Holiday Name</Label>
            <InputField 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Summer Vacation, Eid ul Fitr"
            />
          </div>
          <div>
            <Label required>Start Date</Label>
            <DatePicker 
              value={formData.start_date}
              onChange={e => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div>
            <Label required>End Date</Label>
            <DatePicker 
              value={formData.end_date}
              onChange={e => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="primary" onClick={saveHoliday} className="w-full">
              {formData.id ? 'Update Holiday' : 'Save Holiday'}
            </Button>
          </div>
        </div>
      </ProfileDrawer>
    </div>
  );
}
