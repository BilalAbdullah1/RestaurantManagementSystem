import React, { useState } from 'react';
import api from '../../utils/axiosConfig';
import { resolveSafeImageUrl, compressImage } from '../../utils/imageUtils';

interface ImageUploadProps {
  label?: string;
  currentImageUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  onChange?: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ label = "Profile Picture", currentImageUrl, onUploadSuccess, onChange, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasLoadError, setHasLoadError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5MB)");
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file");
      return;
    }

    setUploading(true);
    setError(null);
    setHasLoadError(false);

    try {
      // 1. Compress image client-side to compact, high-quality WebP/JPEG
      const { blob, dataUrl } = await compressImage(file, 600, 600, 0.82);
      setPreviewUrl(dataUrl);

      // 2. Upload compressed image to backend
      const formData = new FormData();
      formData.append("file", blob, file.name);

      let finalUrl = dataUrl;
      try {
        const response = await api.post('/uploads', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data?.url) {
          finalUrl = response.data.url;
        }
      } catch {
        // Even if server upload fails, fallback to persistent Base64 dataUrl
        console.warn("Server file upload failed, using persistent Base64 Data URL.");
      }

      if (onUploadSuccess) onUploadSuccess(finalUrl);
      if (onChange) onChange(finalUrl);
    } catch (err: any) {
      setError(err.message || "Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  const activeImage = previewUrl || (hasLoadError ? null : currentImageUrl);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-slate-700 shrink-0 bg-gray-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
          {activeImage ? (
            <img 
              src={resolveSafeImageUrl(activeImage)} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
              onError={() => setHasLoadError(true)}
            />
          ) : (
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex flex-col">
          <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-semibold transition-colors rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20">
            {uploading ? "Compressing & Saving..." : "Upload Photo"}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
          <span className="text-[10px] text-gray-400 mt-1">Automatic Cloud-Safe Compression Active (Max 5MB)</span>
        </div>
      </div>
    </div>
  );
}
