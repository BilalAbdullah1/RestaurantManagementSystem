import React from 'react';
import Select, { StylesConfig } from 'react-select';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  className = ''
}: SearchableSelectProps) {
  
  const selectedOption = options.find(opt => opt.value === value) || null;

  // Modern Tailwind-inspired react-select styles
  const customStyles: StylesConfig<SearchableSelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '44px',
      borderRadius: '0.5rem',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
      backgroundColor: disabled ? '#f8fafc' : '#ffffff',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      },
      padding: '0 4px',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      zIndex: 50,
      border: '1px solid #e5e7eb'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? '#eff6ff' 
        : state.isFocused 
          ? '#f8fafc' 
          : 'white',
      color: state.isSelected ? '#1d4ed8' : '#374151',
      cursor: 'pointer',
      padding: '10px 12px',
      fontWeight: state.isSelected ? '600' : '400',
      '&:active': {
        backgroundColor: '#dbeafe'
      }
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '0.875rem'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937',
      fontSize: '0.875rem',
      fontWeight: '500'
    }),
    input: (provided) => ({
      ...provided,
      color: '#1f2937'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af',
      '&:hover': {
        color: '#6b7280'
      }
    })
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hidden input for native HTML form validation (required) */}
      <input 
        tabIndex={-1}
        autoComplete="off"
        style={{
          opacity: 0,
          width: '100%',
          height: 0,
          position: 'absolute',
          pointerEvents: 'none'
        }}
        value={value}
        onChange={() => {}}
        required={required}
      />
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option ? option.value : '')}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable={false}
        isSearchable={true}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
}