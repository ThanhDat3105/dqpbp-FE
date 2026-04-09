"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, MapPin, Clock, ClipboardList, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskNotification {
  id: string;
  title: string;
  location: string;
  due_date: string;
  is_read: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_NOTIFICATIONS: TaskNotification[] = [
  {
    id: "n1",
    title: "Tuần tra khu vực chợ",
    location: "Chợ Phường 10",
    due_date: "24/01/2026",
    is_read: false,
  },
  {
    id: "n2",
    title: "Trực bảo vệ trụ sở UBND",
    location: "UBND Phường Bình Phú",
    due_date: "25/01/2026",
    is_read: false,
  },
  {
    id: "n3",
    title: "Huấn luyện sử dụng vũ khí",
    location: "Sân tập P10",
    due_date: "28/01/2026",
    is_read: false,
  },
  {
    id: "n4",
    title: "Kiểm tra quân số định kỳ",
    location: "Trụ sở BCH Quân sự",
    due_date: "30/01/2026",
    is_read: true,
  },
  {
    id: "n5",
    title: "Tuần tra đêm khu vực KP.11",
    location: "Khu phố 11",
    due_date: "01/02/2026",
    is_read: true,
  },
];

// ─── Notification Item ────────────────────────────────────────────────────────

interface NotificationItemProps {
  notif: TaskNotification;
  onMarkRead: (id: string) => void;
  onView: (id: string) => void;
}

function NotificationItem({
  notif,
  onMarkRead,
  onView,
}: NotificationItemProps) {
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-colors duration-150 group relative",
        notif.is_read
          ? "hover:bg-gray-50"
          : "hover:bg-blue-50/40 bg-blue-50/20",
      )}
    >
      {/* Unread dot */}
      {!notif.is_read && (
        <span className="absolute top-3.5 right-4 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
      )}

      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mt-0.5">
        <ClipboardList className="h-5 w-5 text-yellow-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p
          className={cn(
            "text-sm leading-snug truncate pr-5",
            notif.is_read
              ? "text-gray-600 font-normal"
              : "text-gray-900 font-semibold",
          )}
        >
          {notif.title}
        </p>

        {/* Meta */}
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{notif.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Thời hạn: {notif.due_date}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onView(notif.id)}
            className="text-xs text-gray-400 hover:text-gray-700 hover:underline transition-colors"
          >
            Xem chi tiết
          </button>
          {!notif.is_read && (
            <button
              onClick={() => onMarkRead(notif.id)}
              className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Xác nhận đã đọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Notification() {
  const [notifications, setNotifications] = useState<TaskNotification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleView = (id: string) => {
    // In real app: navigate to task detail
    handleMarkRead(id);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ── Bell trigger ── */}
      <button
        id="notification-bell-btn"
        aria-label="Thông báo"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full ring-2 ring-white leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden",
          "transition-all duration-200 origin-top-right",
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Thông báo nhiệm vụ
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Tất cả đã đọc"}
          </span>
        </div>

        {/* Body – scrollable if many items */}
        <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-sm">Không có thông báo</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onMarkRead={handleMarkRead}
                onView={handleView}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-100">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className={cn(
                "w-full py-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors",
                unreadCount > 0
                  ? "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
                  : "text-gray-300 cursor-default",
              )}
            >
              <CheckCheck className="h-4 w-4" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
