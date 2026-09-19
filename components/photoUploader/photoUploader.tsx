"use client";

import { Loader2, Upload, X } from "lucide-react";
import {  useState } from "react";
import { toast } from "sonner";
import { uploadAPI } from "@/services/api/upload";

export function PhotoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh.");
      return;
    }

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    setUploading(true);

    try {
      const url = await uploadAPI.uploadMedia(file, "military-cv");

      onChange(url);

      toast.success("Đã tải ảnh lên.");
    } catch (error) {
      toast.error("Tải ảnh lên thất bại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-gray-600">
        Ảnh 4x6
      </span>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
        {value ? (
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative">
              <img
                src={value}
                alt="Ảnh hồ sơ"
                className="h-40 w-32 rounded-lg border border-gray-200 bg-white object-cover shadow-sm"
              />

              <button
                type="button"
                onClick={() => onChange("")}
                disabled={uploading}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
                title="Xóa ảnh"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-w-[220px] flex-1 flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">Ảnh hiện tại</p>

              <p className="break-all text-xs text-gray-400">{value}</p>

              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-[#546a2f] px-3 py-2 text-sm font-semibold text-[#546a2f] transition-colors hover:bg-[#f7f9f1]">
                <Upload className="h-4 w-4" />
                Đổi ảnh
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      void handleUpload(file);
                    }

                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg p-6 text-center transition-colors hover:bg-white">
            {uploading ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-[#546a2f]" />
                <p className="text-sm font-semibold text-gray-700">
                  Đang tải ảnh lên...
                </p>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-[#546a2f]" />

                <p className="text-sm font-semibold text-gray-700">
                  Chọn ảnh 4x6
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  JPG, JPEG, PNG hoặc WebP · tối đa 5MB
                </p>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void handleUpload(file);
                }

                event.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
