import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, ArrowRightLeft, TrendingUp, History } from 'lucide-react';

interface EnrollmentActionMenuProps {
  onTransfer: () => void;
  onPromote: () => void;
  onHistory: () => void;
  status: string;
}

export default function EnrollmentActionMenu({ onTransfer, onPromote, onHistory, status }: EnrollmentActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = status === 'Active' ? 140 : 60; // Active has 3 buttons, inactive has 1
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < menuHeight && rect.top > menuHeight;

      setPosition({
        top: showAbove ? rect.top - menuHeight - 4 : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true); 
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setIsOpen(false);
    action();
  };

  const menuContent = (
    <div 
      ref={menuRef}
      className="fixed w-44 rounded-xl shadow-lg bg-white dark:bg-gray-900 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-800 z-[99999] animate-in fade-in zoom-in duration-150"
      style={{ top: position.top, right: position.right }}
    >
      {status === 'Active' && (
        <div className="py-1">
          <button
            onClick={(e) => handleAction(e, onTransfer)}
            className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          >
            <ArrowRightLeft className="w-4 h-4 mr-3 text-orange-400 group-hover:text-orange-500" /> 
            Lateral Transfer
          </button>
          <button
            onClick={(e) => handleAction(e, onPromote)}
            className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            <TrendingUp className="w-4 h-4 mr-3 text-emerald-400 group-hover:text-emerald-500" /> 
            Promote Level
          </button>
        </div>
      )}
      <div className="py-1">
        <button
          onClick={(e) => handleAction(e, onHistory)}
          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <History className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-500" /> 
          Audit Logs
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && createPortal(menuContent, document.body)}
    </>
  );
}
