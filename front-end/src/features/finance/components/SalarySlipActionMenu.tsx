import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Printer, CheckCircle2 } from 'lucide-react';

interface SalarySlipActionMenuProps {
  slip: any;
  onPrint: (slip: any) => void;
  onDisburse: (id: string, name: string) => void;
}

export default function SalarySlipActionMenu({ slip, onPrint, onDisburse }: SalarySlipActionMenuProps) {
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
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = 120;
        
        const showUpward = spaceBelow < menuHeight && rect.top > menuHeight;
        setIsUpward(showUpward);

        setMenuPosition({
          top: showUpward ? rect.top - 8 + window.scrollY : rect.bottom + 8 + window.scrollY,
          left: rect.right - 180 + window.scrollX
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
              onPrint(slip);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-brand-500" /> Print Pay Slip
          </button>

          {slip.status !== 'Paid' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onDisburse(slip.id, slip.staff_name);
              }}
              className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 flex items-center gap-2 transition-colors mt-1 border-t border-gray-50 dark:border-gray-800/50"
            >
              <CheckCircle2 className="w-4 h-4" /> Disburse Salary
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
