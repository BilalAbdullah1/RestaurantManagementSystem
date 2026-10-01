import React, { useEffect, useState } from 'react';
import api from '../utils/axiosConfig';
import Swal from 'sweetalert2';

interface AcademicYear {
  id: string;
  title: string;
  is_current: boolean;
}

export default function SidebarWidget() {
  const [sessionTitle, setSessionTitle] = useState<string>('Loading...');
  const [years, setYears] = useState<AcademicYear[]>([]);
  const tenantId = localStorage.getItem('tenantId') || '';

  useEffect(() => {
    const savedTitle = localStorage.getItem('academicSessionTitle');
    if (savedTitle) {
      setSessionTitle(savedTitle);
    }
    
    if (tenantId) {
      fetchYears();
    }
  }, [tenantId]);

  const fetchYears = async () => {
    try {
      const response = await api.get<AcademicYear[]>(`/academicyears/tenant/${tenantId}`);
      setYears(response.data);
      
      const savedId = localStorage.getItem('academicSessionId');
      if (!savedId && response.data.length > 0) {
        // Find current or default to first
        const current = response.data.find(y => y.is_current) || response.data[0];
        if (current) {
          setSessionTitle(current.title);
          localStorage.setItem('academicSessionId', current.id);
          localStorage.setItem('academicSessionTitle', current.title);
        }
      } else if (savedId && response.data.length > 0) {
        // Validate saved ID still exists
        const exists = response.data.find(y => y.id === savedId);
        if (exists) {
           setSessionTitle(exists.title);
           localStorage.setItem('academicSessionTitle', exists.title);
        } else {
           const current = response.data.find(y => y.is_current) || response.data[0];
           setSessionTitle(current.title);
           localStorage.setItem('academicSessionId', current.id);
           localStorage.setItem('academicSessionTitle', current.title);
        }
      }
    } catch (error) {
      console.error('Failed to fetch academic years', error);
      if (!localStorage.getItem('academicSessionTitle')) {
        setSessionTitle('Default Session');
      }
    }
  };

  const handleChangeSession = async () => {
    if (years.length === 0) {
      await fetchYears();
    }
    
    if (years.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Sessions',
        text: 'No academic sessions found for this school.',
      });
      return;
    }

    const inputOptions: Record<string, string> = {};
    years.forEach(y => {
      inputOptions[y.id] = y.title + (y.is_current ? ' (Current)' : '');
    });

    const currentId = localStorage.getItem('academicSessionId') || '';

    const { value: selectedId } = await Swal.fire({
      title: 'Change Academic Session',
      input: 'select',
      inputOptions,
      inputValue: currentId,
      showCancelButton: true,
      confirmButtonText: 'Switch Session',
      confirmButtonColor: '#4f46e5',
    });

    if (selectedId && selectedId !== currentId) {
      const selectedYear = years.find(y => y.id === selectedId);
      if (selectedYear) {
        localStorage.setItem('academicSessionId', selectedYear.id);
        localStorage.setItem('academicSessionTitle', selectedYear.title);
        setSessionTitle(selectedYear.title);
        
        Swal.fire({
          icon: 'success',
          title: 'Session Changed',
          text: `Switched to ${selectedYear.title}`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          // Reload page to refetch all data for the new session
          window.location.reload();
        });
      }
    }
  };

  const displayTitle = sessionTitle.toLowerCase().includes('academic') 
    ? sessionTitle 
    : (sessionTitle === 'Loading...' || sessionTitle === 'Default Session' ? sessionTitle : `Academic Year ${sessionTitle}`);

  return (
    <div className="mx-auto mb-10 w-full max-w-60 rounded-2xl bg-brand-50/50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/50 px-4 py-5 text-center">
      <h3 className="mb-1.5 font-bold text-gray-900 dark:text-white text-sm">
        Active Session
      </h3>
      <p className="mb-4 text-xs font-medium text-brand-600 dark:text-brand-400">
        {displayTitle}
      </p>
      <button 
        onClick={handleChangeSession}
        className="flex w-full items-center justify-center p-2.5 font-bold text-white rounded-lg bg-brand-600 text-xs hover:bg-brand-700 transition-colors shadow-sm"
      >
        Change Session
      </button>
    </div>
  );
}