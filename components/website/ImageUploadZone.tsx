'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, ImagePlus } from 'lucide-react';

interface Props {
  onFilesSelected?: (files: File[]) => void;
}

export default function ImageUploadZone({ onFilesSelected }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length > 0) onFilesSelected?.(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onFilesSelected?.(files);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
        dragging
          ? 'border-[#546a2f] bg-[#546a2f]/5'
          : 'border-gray-300 dark:border-gray-600 hover:border-[#546a2f] hover:bg-[#546a2f]/5'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <div className="w-14 h-14 bg-[#546a2f]/10 rounded-full flex items-center justify-center">
        <ImagePlus className="w-7 h-7 text-[#546a2f]" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
          Kéo thả ảnh vào đây hoặc{' '}
          <span className="text-[#546a2f] underline underline-offset-2">chọn file</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Hỗ trợ JPG, PNG, WEBP. Tự động nén về kích thước tối ưu.
        </p>
        <p className="text-xs text-gray-400">Kích thước tối đa: 5MB / ảnh</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
        <Upload className="w-3.5 h-3.5" />
        <span>Có thể tải lên nhiều ảnh cùng lúc</span>
      </div>
    </div>
  );
}
