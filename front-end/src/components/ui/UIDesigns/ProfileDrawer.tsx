import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getAvatarGradient, getInitials } from '../../../utils/avatarUtils';
import { getFileBaseUrl } from '../../../utils/apiConfig';
import Badge from '../badge/Badge';

export interface DrawerSectionItem {
  icon: React.ReactNode;
  label: React.ReactNode;
}

export interface DrawerSection {
  title: string;
  items: DrawerSectionItem[];
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  icon?: React.ReactNode;
  badges?: { label: string; color: 'success' | 'error' | 'primary' | 'warning' | 'light' | 'dark' }[];
  sections?: DrawerSection[];
  children?: React.ReactNode;
}

export default function ProfileDrawer({ isOpen, onClose, title, subtitle, imageUrl, icon, badges, sections, children }: ProfileDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const getFullUrl = (url: string) => {
    return getFileBaseUrl(url);
  };

  const nameParts = title.trim().split(' ');
  const fName = nameParts[0];
  const lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  const drawerContent = (
    <>
      {/* FIXED: Backdrop overlay bilkul alag hai taake full screen backdrop blur sahi aaye */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col z-[9999] transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">

        {/* Header Section */}
        <div className="relative h-40 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-bl-3xl shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute -bottom-12 left-6">
            {icon ? (
              <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center text-white shadow-xl bg-gradient-to-tr from-brand-600 to-indigo-600 dark:from-brand-500 dark:to-indigo-500">
                {icon}
              </div>
            ) : imageUrl && !imageFailed ? (
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg bg-white">
                <img
                  src={getFullUrl(imageUrl)}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center text-3xl font-bold text-white shadow-lg ${getAvatarGradient(title)}`}>
                {getInitials(fName, lName)}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pt-16 px-6 pb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90">{title}</h2>
            {subtitle && <p className="text-brand-500 font-medium mt-0.5">{subtitle}</p>}

            {badges && badges.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.map((b, idx) => (
                  <Badge key={idx} variant="light" color={b.color}>{b.label}</Badge>
                ))}
              </div>
            )}
          </div>

          {children ? (
            <div>{children}</div>
          ) : sections && sections.length > 0 ? (
            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                    {section.title}
                  </h4>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="shrink-0 mt-0.5 text-gray-400">
                        {item.icon}
                      </div>
                      <div className="break-words">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}