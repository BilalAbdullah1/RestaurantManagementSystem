import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isOpen,
  title = 'Processing...',
  message = 'Please wait while we complete the operation.',
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-md transition-all duration-300 animate-fadeIn p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center justify-center space-y-4 transform transition-all duration-300 scale-100">
        
        {/* Animated Glowing Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-brand-100 dark:border-brand-900/40 border-t-brand-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-brand-500 animate-pulse" />
          </div>
        </div>

        {/* Informative Text */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {message}
          </p>
        </div>

        {/* Pulse Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LoadingOverlay;
