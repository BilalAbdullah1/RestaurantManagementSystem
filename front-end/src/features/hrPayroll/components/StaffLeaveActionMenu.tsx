import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, XCircle } from 'lucide-react';

interface StaffLeaveActionMenuProps {
  leave: any;
  onView: (leave: any) => void;
  onCancel?: (leave: any) => void;
}

export default function StaffLeaveActionMenu({ leave, onView, onCancel }: StaffLeaveActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isUpward, setIsUpward] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate position
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = 120; // Approximate menu height
        
        const showUpward = spaceBelow < menuHeight && rect.top > menuHeight;
        setIsUpward(showUpward);

        setMenuPosition({
          top: showUpward ? rect.top - 8 + window.scrollY : rect.bottom + 8 + window.scrollY,
          left: rect.right - 180 + window.scrollX // 180 is menu width approx
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            transform: isUpward ? 'translateY(-100%)' : 'none'
          }}
          className="w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-[9999] py-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 border-b border-gray-50 dark:border-gray-800/50 mb-1">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Actions</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onView(leave);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4 text-brand-500" /> View Details
          </button>

          {leave.status === 'Pending' && onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCancel(leave);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors mt-1 border-t border-gray-50 dark:border-gray-800/50"
            >
              <XCircle className="w-4 h-4" /> Cancel Application
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
