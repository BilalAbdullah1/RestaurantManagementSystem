import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface DebouncedSearchProps {
  value: string;
  onChange: (value: string) => void;
  debounce?: number;
  placeholder?: string;
  className?: string;
}

export function DebouncedSearch({
  value: initialValue,
  onChange,
  debounce = 500,
  placeholder = "Search...",
  className = "",
}: DebouncedSearchProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value !== initialValue) {
        onChange(value);
      }
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value, debounce, onChange, initialValue]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-transparent dark:bg-gray-900 dark:border-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
