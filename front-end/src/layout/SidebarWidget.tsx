import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Clock } from 'lucide-react';

const RESTAURANT_SHIFTS = [
  { id: 'dinner', title: 'Dinner Service (Peak)', hours: '06:00 PM – 12:00 AM' },
  { id: 'lunch', title: 'Lunch Service', hours: '12:00 PM – 05:00 PM' },
  { id: 'breakfast', title: 'Breakfast / Brunch', hours: '08:00 AM – 11:30 AM' },
  { id: 'night', title: 'Late Night Takeaway', hours: '12:00 AM – 04:00 AM' }
];

export default function SidebarWidget() {
  const [shiftTitle, setShiftTitle] = useState<string>('Dinner Service (Peak)');

  useEffect(() => {
    const saved = localStorage.getItem('rms_active_shift');
    if (saved) {
      setShiftTitle(saved);
    } else {
      // Auto-detect based on current hour
      const hour = new Date().getHours();
      let defaultShift = RESTAURANT_SHIFTS[0].title;
      if (hour >= 8 && hour < 12) defaultShift = RESTAURANT_SHIFTS[2].title;
      else if (hour >= 12 && hour < 17) defaultShift = RESTAURANT_SHIFTS[1].title;
      else if (hour >= 17 || hour < 1) defaultShift = RESTAURANT_SHIFTS[0].title;
      else defaultShift = RESTAURANT_SHIFTS[3].title;
      
      setShiftTitle(defaultShift);
      localStorage.setItem('rms_active_shift', defaultShift);
    }
  }, []);

  const handleChangeShift = async () => {
    const inputOptions: Record<string, string> = {};
    RESTAURANT_SHIFTS.forEach(s => {
      inputOptions[s.title] = `${s.title} (${s.hours})`;
    });

    const { value: selectedShift } = await Swal.fire({
      title: 'Switch Service Shift',
      input: 'select',
      inputOptions,
      inputValue: shiftTitle,
      showCancelButton: true,
      confirmButtonText: 'Switch Shift',
      confirmButtonColor: '#ea580c',
    });

    if (selectedShift && selectedShift !== shiftTitle) {
      localStorage.setItem('rms_active_shift', selectedShift);
      setShiftTitle(selectedShift);
      
      Swal.fire({
        icon: 'success',
        title: 'Shift Switched',
        text: `Active register switched to ${selectedShift}`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 px-4 py-5 text-center shadow-xs">
      <div className="flex items-center justify-center gap-1.5 mb-1.5">
        <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
        <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
          Active Register Shift
        </h3>
      </div>
      <p className="mb-4 text-xs font-semibold text-orange-600 dark:text-orange-400 truncate">
        {shiftTitle}
      </p>
      <button 
        onClick={handleChangeShift}
        className="flex w-full items-center justify-center p-2.5 font-bold text-white rounded-xl bg-orange-600 hover:bg-orange-700 text-xs transition-colors shadow-sm"
      >
        Switch Shift
      </button>
    </div>
  );
}