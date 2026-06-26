"use client";

import { Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Column } from "@/components/website/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WebsiteContact } from "./types";

const STATUS_CONFIG = {
  pending: {
    label: "Chờ xử lý",
    icon: Clock,
    className: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  approved: {
    label: "Đã duyệt",
    icon: CheckCircle2,
    className: "text-green-600  bg-green-50  border-green-200",
  },
  rejected: {
    label: "Từ chối",
    icon: XCircle,
    className: "text-red-500    bg-red-50    border-red-200",
  },
} as const;

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xử lý", icon: Clock },
  { value: "approved", label: "Đã duyệt", icon: CheckCircle2 },
  { value: "rejected", label: "Từ chối", icon: XCircle },
] as const;

interface BuildColumnsArgs {
  onView: (row: WebsiteContact) => void;
  onStatusChange: (id: number, status: WebsiteContact["status"]) => void;
}

export function buildContactColumns({
  onView,
  onStatusChange,
}: BuildColumnsArgs): Column<WebsiteContact>[] {
  return [
    {
      key: "full_name",
      label: "Họ tên",
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.is_read && (
            <span
              className="w-2 h-2 rounded-full bg-blue-500 shrink-0"
              title="Chưa đọc"
            />
          )}
          <span
            className={`text-sm font-medium ${row.is_read ? "text-gray-600 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}
          >
            {row.full_name}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Điện thoại",
      width: "w-32",
      render: (row) => (
        <a
          href={`tel:${row.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-blue-500 hover:underline"
        >
          {row.phone}
        </a>
      ),
    },
    {
      key: "subject",
      label: "Chủ đề",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
          {row.subject ?? <span className="italic text-gray-300">—</span>}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Ngày gửi",
      width: "w-32",
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.created_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      width: "w-44",
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.pending;
        const Icon = cfg.icon;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={row.status}
              onValueChange={(val) =>
                onStatusChange(row.id, val as WebsiteContact["status"])
              }
            >
              <SelectTrigger
                className={`h-7 text-xs font-medium px-2.5 rounded-full border gap-1.5 w-fit focus:ring-0 focus:ring-offset-0 ${cfg.className}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(({ value, label, icon: OptionIcon }) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    <span className="flex items-center gap-2">
                      <OptionIcon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "w-20",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(row);
          }}
          className="p-1.5 rounded hover:bg-blue-50 text-blue-500 transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];
}
