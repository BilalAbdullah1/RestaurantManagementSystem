import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean;
  className?: string;
}

interface ActionMenuProps {
  groups?: ActionMenuItem[][];
  items?: ActionMenuItem[];
}

export default function ActionMenu({ groups, items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeGroups = useMemo(() => {
    if (groups && groups.length > 0) return groups;
    if (items && items.length > 0) return [items];
    return [];
  }, [groups, items]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = activeGroups.reduce((acc, group) => acc + (group.length * 36) + 8, 0); // Approximate height calculation
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

  const menuContent = (
    <div 
      ref={menuRef}
      className="fixed w-48 rounded-xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-[9999] animate-in fade-in zoom-in duration-200"
      style={{ top: position.top, right: position.right }}
    >
      {activeGroups.map((group, gIdx) => (
        <div key={gIdx} className="py-1">
          {group.map((action, aIdx) => (
            <button
              key={aIdx}
              onClick={(e) => { 
                e.stopPropagation(); 
                setIsOpen(false); 
                action.onClick(); 
              }}
              className={`group flex items-center w-full px-4 py-2 text-sm transition-colors ${
                action.isDanger 
                  ? 'text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10' 
                  : action.className || 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className={`w-4 h-4 mr-3 ${action.isDanger ? 'text-error-400 group-hover:text-error-500' : 'text-gray-400 group-hover:text-brand-500'}`}>
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && createPortal(menuContent, document.body)}
    </>
  );
}