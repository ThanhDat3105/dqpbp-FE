"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentInterface } from "@/services/api/department";
import { documentAPI } from "@/services/api/document";
import { toast } from "sonner";

interface Props {
  open: boolean;
  departments: DepartmentInterface[];
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadDocumentDialog({
  open,
  departments,
  onClose,
  onSuccess,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [isPublic, setIsPublic] = useState("false");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setDepartmentId("");
    setIsPublic("false");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Vui lòng chọn file");
      return;
    }
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (!departmentId) {
      toast.error("Vui lòng chọn tổ");
      return;
    }

    setLoading(true);
    try {
      await documentAPI.upload(file, {
        title: title.trim(),
        description: description.trim() || undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
        is_public: isPublic === "true",
      });
      toast.success("Tải lên thành công!");
      handleClose();
      onSuccess();
    } catch {
      toast.error("Có lỗi xảy ra khi tải lên!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải lên tài liệu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* File picker */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
          >
            {file ? (
              <>
                <FileText className="w-8 h-8 text-blue-500" />
                <p className="text-sm font-medium text-gray-800 text-center break-all">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-500">Nhấn để chọn file</p>
                <p className="text-xs text-gray-400">
                  PDF, DOC, DOCX, XLS, XLSX
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 -mt-2"
            >
              <X className="w-3 h-3" /> Xóa file
            </button>
          )}

          {/* Title */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề tài liệu"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Mô tả
            </Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn (tuỳ chọn)"
            />
          </div>

          {/* Department + Visibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Tổ công tác <span className="text-red-500">*</span>
              </Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Chọn tổ --" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Phạm vi
              </Label>
              <Select value={isPublic} onValueChange={setIsPublic}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Nội bộ</SelectItem>
                  <SelectItem value="true">Công khai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tải..." : "Tải lên"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
