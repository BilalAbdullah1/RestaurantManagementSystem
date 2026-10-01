import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, ArrowRight, User, GraduationCap, FileText, Book } from 'lucide-react';
import { navItems, othersItems, isRoleAllowed } from '../../layout/AppSidebar';
import { isModuleEnabled, activeClientConfig } from '../../config/clientConfig';
import { getUserRoleName } from '../../utils/authUtils';
import api from '../../utils/axiosConfig';

interface CommandItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  group: string;
}

interface GlobalSearchResultDto {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [globalResults, setGlobalResults] = useState<CommandItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const roleName = getUserRoleName() || localStorage.getItem('roleName') || '';
  const tenantId = localStorage.getItem('tenantId');

  // Dynamically generate commands from the sidebar nav items based on user role
  const commands: CommandItem[] = useMemo(() => {
    const allItems = [...navItems, ...othersItems];
    const generatedCommands: CommandItem[] = [];

    const isRestrictedForClient = (path: string) => {
      if (activeClientConfig.lockToSingleSchool) {
        if (path === '/Tenants' || path === '/DatabaseBackup' || path === '/ExecutiveMasterDashboard') {
          return true;
        }
        if (path === '/signup' && !activeClientConfig.allowPublicSignup) {
          return true;
        }
      }
      return false;
    };

    allItems.forEach((nav) => {
      if (!isRoleAllowed(nav.allowedRoles, roleName) || !isModuleEnabled(nav.moduleKey || nav.name)) return;

      if (nav.subItems) {
        nav.subItems.forEach((sub: any) => {
          if (!isRoleAllowed(sub.allowedRoles, roleName)) return;
          if (isRestrictedForClient(sub.path)) return;

          generatedCommands.push({
            id: sub.path,
            name: sub.name,
            description: `Navigate to ${sub.name} in ${nav.name}`,
            icon: nav.icon,
            path: sub.path,
            group: 'Navigation'
          });
        });
      } else if (nav.path) {
        if (isRestrictedForClient(nav.path)) return;

        generatedCommands.push({
          id: nav.path,
          name: nav.name,
          description: `Navigate to ${nav.name}`,
          icon: nav.icon,
          path: nav.path,
          group: 'Navigation'
        });
      }
    });

    return generatedCommands;
  }, [roleName]);

  // Filter local navigation commands based on query
  const filteredCommands = query === ''
    ? commands
    : commands.filter((command) =>
        command.name.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5); // Limit local navigation results when searching

  // Fetch global search results from API
  useEffect(() => {
    const fetchGlobalSearch = async () => {
      if (!query || query.length < 2 || !tenantId) {
        setGlobalResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get<GlobalSearchResultDto[]>(`/GlobalSearch/tenant/${tenantId}?query=${query}`);
        
        const mappedResults: CommandItem[] = response.data.map(item => {
          let icon = <Search className="w-4 h-4" />;
          if (item.type === 'Student') icon = <GraduationCap className="w-4 h-4" />;
          if (item.type === 'Staff') icon = <User className="w-4 h-4" />;
          if (item.type === 'Invoice') icon = <FileText className="w-4 h-4" />;
          if (item.type === 'Book') icon = <Book className="w-4 h-4" />;

          return {
            id: item.id,
            name: item.title,
            description: item.subtitle,
            icon: icon,
            path: item.url,
            group: item.type
          };
        });
        
        setGlobalResults(mappedResults);
      } catch (error) {
        console.error("Global search failed:", error);
        setGlobalResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchGlobalSearch();
    }, 400); // Debounce 400ms

    return () => clearTimeout(timerId);
  }, [query, tenantId]);

  // Group commands for display
  const displayList = [...filteredCommands, ...globalResults];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
        setQuery('');
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % displayList.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayList.length > 0) {
          handleSelect(displayList[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayList, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, globalResults]);

  const handleSelect = (command: CommandItem) => {
    navigate(command.path);
    setIsOpen(false);
    setQuery('');
  };

  // Expose toggle logic via a custom event so AppHeader can trigger it
  useEffect(() => {
    const handleToggle = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleToggle);
    return () => window.removeEventListener('open-command-palette', handleToggle);
  }, []);

  if (!isOpen) return null;

  // Group for rendering
  const navigationItems = displayList.filter(c => c.group === 'Navigation');
  const studentItems = displayList.filter(c => c.group === 'Student');
  const staffItems = displayList.filter(c => c.group === 'Staff');
  const invoiceItems = displayList.filter(c => c.group === 'Invoice');
  const bookItems = displayList.filter(c => c.group === 'Book');

  const renderGroup = (title: string, items: CommandItem[], startIndex: number) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">{title}</div>
        {items.map((command, localIdx) => {
          const absoluteIdx = startIndex + localIdx;
          const isSelected = selectedIndex === absoluteIdx;
          return (
            <div
              key={command.id}
              className={`flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-brand-50 dark:bg-brand-500/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              onClick={() => handleSelect(command)}
              onMouseEnter={() => setSelectedIndex(absoluteIdx)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white dark:bg-brand-500/30 text-brand-600 dark:text-brand-300 shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {command.icon}
                </div>
                <div>
                  <div className={`text-sm font-medium ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-gray-900 dark:text-gray-200'}`}>{command.name}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-brand-600/70 dark:text-brand-300/70' : 'text-gray-500 dark:text-gray-400'}`}>{command.description}</div>
                </div>
              </div>
              {isSelected && <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg w-full focus:ring-0"
            placeholder="Search pages, students, staff, invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <div className="mr-3 w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <div className="flex items-center gap-1.5 ml-3">
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">ESC</kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
          {displayList.length === 0 ? (
            <div className="py-14 text-center text-gray-500 dark:text-gray-400 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            <>
              {renderGroup("Navigation", navigationItems, 0)}
              {renderGroup("Students", studentItems, navigationItems.length)}
              {renderGroup("Staff", staffItems, navigationItems.length + studentItems.length)}
              {renderGroup("Invoices", invoiceItems, navigationItems.length + studentItems.length + staffItems.length)}
              {renderGroup("Library Books", bookItems, navigationItems.length + studentItems.length + staffItems.length + invoiceItems.length)}
            </>
          )}
        </div>
        
        <div className="hidden sm:flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↵</kbd> to select</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↓</kbd> <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">↑</kbd> to navigate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
