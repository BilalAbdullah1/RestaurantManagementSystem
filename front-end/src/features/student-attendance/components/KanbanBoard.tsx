import React, { useState } from 'react';
import { AdmissionEnquiry } from '../AdmissionEnquiries';
import { getAvatarGradient, getInitials } from '../../../utils/avatarUtils';
import Badge from '../../../components/ui/badge/Badge';

interface KanbanBoardProps {
  enquiries: AdmissionEnquiry[];
  onStatusChange: (id: string, newStatus: string) => void;
  onView: (enquiry: AdmissionEnquiry) => void;
}

const COLUMNS = ['Enquiry', 'Follow-Up', 'Registered', 'Closed'] as const;

export default function KanbanBoard({ enquiries, onStatusChange, onView }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && draggedId === id) {
      const draggedEnquiry = enquiries.find(eq => eq.id === id);
      if (draggedEnquiry && draggedEnquiry.status !== status) {
        onStatusChange(id, status);
      }
    }
    setDraggedId(null);
  };

  const getBadgeColor = (status: string) => {
    switch(status) {
      case 'Enquiry': return 'info';
      case 'Follow-Up': return 'warning';
      case 'Registered': return 'success';
      case 'Closed': return 'error';
      default: return 'light';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {COLUMNS.map((col) => {
        const columnEnquiries = enquiries.filter(e => e.status === col);
        return (
          <div
            key={col}
            className="flex-1 min-w-[280px] bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-200">{col}</h3>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                {columnEnquiries.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-3">
              {columnEnquiries.map(enquiry => (
                <div
                  key={enquiry.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, enquiry.id)}
                  onClick={() => onView(enquiry)}
                  className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing ${draggedId === enquiry.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner ${getAvatarGradient(enquiry.child_name)}`}>
                      {getInitials(enquiry.child_name, '')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{enquiry.child_name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{enquiry.class_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">Parent:</span> {enquiry.father_name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400"><span className="font-medium">Phone:</span> {enquiry.phone_number}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                     <span className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                     <Badge color={getBadgeColor(enquiry.status) as any}>{enquiry.status}</Badge>
                  </div>
                </div>
              ))}
              
              {columnEnquiries.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
