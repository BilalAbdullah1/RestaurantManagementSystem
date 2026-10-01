import { useId } from 'react';
import Select, { Props as SelectProps, StylesConfig } from 'react-select';

export interface OptionType {
  value: string | number | boolean;
  label: string;
}

export type SearchableSelectOption = OptionType;

interface SearchableSelectProps extends Omit<SelectProps<OptionType, false>, 'options' | 'value' | 'onChange'> {
  options: OptionType[];
  label?: string;
  error?: string;
  value?: string | number | boolean;
  onChange?: (value: any) => void;
  disabled?: boolean;
  isDisabled?: boolean;
}

export default function SearchableSelect({ 
  options, 
  label, 
  error, 
  value, 
  onChange, 
  disabled,
  isDisabled,
  ...props 
}: SearchableSelectProps) {
  const instanceId = useId();
  const computedDisabled = isDisabled || disabled || false;
  
  // Find the selected option object based on the primitive value passed
  const selectedOption = options.find(opt => opt.value === value) || null;

  const handleChange = (selected: OptionType | null) => {
    if (onChange) {
      onChange(selected ? selected.value : '');
    }
  };
  
  // Tailwind classes mapped to React-Select parts
  const customStyles: StylesConfig<OptionType, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: state.isDisabled 
        ? (document.documentElement.classList.contains('dark') ? '#111827' : '#f3f4f6')
        : (document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff'),
      borderColor: state.isFocused 
        ? '#4f46e5' 
        : (document.documentElement.classList.contains('dark') ? '#374151' : '#e2e8f0'),
      borderRadius: '0.75rem',
      padding: '2px 4px',
      minHeight: '44px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      opacity: state.isDisabled ? 0.65 : 1,
      cursor: state.isDisabled ? 'not-allowed' : 'default',
      '&:hover': {
        borderColor: state.isFocused 
          ? '#4f46e5' 
          : (document.documentElement.classList.contains('dark') ? '#4b5563' : '#cbd5e1'),
      },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid ' + (document.documentElement.classList.contains('dark') ? '#374151' : '#e2e8f0'),
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      zIndex: 99999
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999999
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#4f46e5' 
        : state.isFocused 
          ? (document.documentElement.classList.contains('dark') ? '#374151' : '#e0e7ff')
          : 'transparent',
      color: state.isSelected 
        ? '#ffffff' 
        : (document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827'),
      cursor: 'pointer',
      padding: '10px 14px',
      fontSize: '0.875rem',
      fontWeight: state.isSelected ? '600' : '400',
      '&:active': {
        backgroundColor: '#4338ca'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
      fontSize: '0.875rem',
      fontWeight: '500'
    }),
    input: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
      fontSize: '0.875rem'
    }),
    placeholder: (base) => ({
      ...base,
      color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
      fontSize: '0.875rem'
    })
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
          {label}
        </label>
      )}
      <Select
        instanceId={instanceId}
        options={options}
        styles={customStyles}
        classNamePrefix="react-select"
        value={selectedOption}
        onChange={handleChange as any}
        isDisabled={computedDisabled}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

