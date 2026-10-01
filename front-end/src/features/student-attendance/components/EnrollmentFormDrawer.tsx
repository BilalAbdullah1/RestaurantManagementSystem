import React from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/button/Button';
import Input from '../../../components/form/input/InputField';
import SearchableSelect, { OptionType } from '../../../components/form/select/SearchableSelect';
import Label from '../../../components/form/Label';

interface EnrollmentFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'enroll' | 'transfer' | 'promote';
  studentOptions: OptionType[];
  academicYearOptions: OptionType[];
  classOptions: OptionType[];
  filteredSectionOptions: OptionType[];
  
  // State from parent
  selectedStudentId: string;
  setSelectedStudentId: (val: string) => void;
  targetYearId: string;
  setTargetYearId: (val: string) => void;
  targetClassId: string;
  setTargetClassId: (val: string) => void;
  targetSectionId: string;
  setTargetSectionId: (val: string) => void;
  rollNumber: string;
  setRollNumber: (val: string) => void;
  onAutoRollNumber?: () => void;
  
  submitLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EnrollmentFormDrawer({
  isOpen,
  onClose,
  actionType,
  studentOptions,
  academicYearOptions,
  classOptions,
  filteredSectionOptions,
  
  selectedStudentId,
  setSelectedStudentId,
  targetYearId,
  setTargetYearId,
  targetClassId,
  setTargetClassId,
  targetSectionId,
  setTargetSectionId,
  rollNumber,
  setRollNumber,
  onAutoRollNumber,
  
  submitLoading,
  onSubmit
}: EnrollmentFormDrawerProps) {
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[999999] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[999999] transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{actionType} Pipeline Setup</h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Configure allocation parameters</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="enrollment-form" onSubmit={onSubmit} className="space-y-6">
            
            <div className="mb-4">
              <SearchableSelect
                label="Target Student Profile *"
                options={studentOptions}
                value={selectedStudentId}
                onChange={(val) => setSelectedStudentId(val)}
                isDisabled={actionType !== 'enroll'} 
                placeholder="Select Identity Node"
                required
              />
            </div>

            <div className="mb-4">
              <SearchableSelect
                label="Target Session Stage *"
                options={academicYearOptions}
                value={targetYearId}
                onChange={(val) => setTargetYearId(val)}
                isDisabled={actionType === 'transfer'} 
                placeholder="Choose Target Session"
                required
              />
            </div>

            <div className="mb-4">
              <SearchableSelect
                label="Destination Class *"
                options={classOptions}
                value={targetClassId}
                onChange={(val) => setTargetClassId(val)}
                placeholder="Choose Target Class"
                required
              />
            </div>

            <div className="mb-4">
              <SearchableSelect
                label="Target Section *"
                options={filteredSectionOptions}
                value={targetSectionId}
                onChange={(val) => setTargetSectionId(val)}
                placeholder="Choose Target Section"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label required>Assigned Roll Number</Label>
                {onAutoRollNumber && (
                  <button
                    type="button"
                    onClick={onAutoRollNumber}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/50 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 transition-colors"
                    title="Auto-calculate next available Roll Number"
                  >
                    ✨ Auto Roll #
                  </button>
                )}
              </div>
              <Input
                type="number"
                min="1"
                required
                placeholder="e.g. 1"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>

          </form>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="enrollment-form"
            variant="primary" 
            loading={submitLoading}
            loadingText="Processing..."
            disabled={!selectedStudentId || !targetSectionId}
          >
            Commit Transaction
          </Button>
        </div>

      </div>
    </>
  );
}
