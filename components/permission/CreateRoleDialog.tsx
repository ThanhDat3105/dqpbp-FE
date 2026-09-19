"use client";

import { AlertCircle, Loader2, Plus } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getRoleErrorMessage,
  isForbiddenError,
  type Role,
  roleApi,
} from "@/services/api/role";

/** Khớp với Joi ở BE: name max 100, description max 500 */
const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  /** Gọi sau khi tạo thành công — parent tự refetch và mở sheet phân quyền */
  onCreated: (role: Role) => void;
}

export function CreateRoleDialog({
  open,
  onClose,
  onCreated,
}: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form mỗi lần mở lại để không giữ dữ liệu của lần tạo trước
  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setError(null);
    setSubmitting(false);
  }, [open]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const role = await roleApi.create({
        name: trimmedName,
        description,
      });
      toast.success(`Đã tạo vai trò "${role.name}"`);
      onCreated(role);
      onClose();
    } catch (err) {
      setError(
        isForbiddenError(err)
          ? "Tài khoản của bạn không có quyền tạo vai trò (cần quyền role::create)"
          : getRoleErrorMessage(err, "Tạo vai trò thất bại"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && !submitting && onClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#556B2F]" />
            Tạo vai trò mới
          </DialogTitle>
          <DialogDescription>
            Tạo xong sẽ mở ngay bảng phân quyền để bật quyền cho vai trò này.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="role-name"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Tên vai trò <span className="text-red-500">*</span>
            </label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tổ trưởng hậu cần"
              maxLength={NAME_MAX}
              autoFocus
              disabled={submitting}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {name.length}/{NAME_MAX}
            </p>
          </div>

          <div>
            <label
              htmlFor="role-description"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Mô tả
            </label>
            <textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về phạm vi công việc của vai trò..."
              rows={3}
              maxLength={DESCRIPTION_MAX}
              disabled={submitting}
              className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {description.length}/{DESCRIPTION_MAX}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[#556B2F] text-white hover:bg-[#465e17]"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Đang tạo..." : "Tạo vai trò"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
