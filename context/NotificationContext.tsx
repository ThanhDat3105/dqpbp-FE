"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { toast } from "sonner";
import {
  notificationService,
  NotificationItem,
} from "@/services/api/notification";

// ------------------- TYPES -------------------
interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  handleMarkNotificationRead: (notificationId: number) => Promise<void>;
  handleMarkAllRead: () => Promise<void>;
}

// ------------------- CONTEXT -------------------
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: () => Promise.resolve(),
  handleMarkNotificationRead: () => Promise.resolve(),
  handleMarkAllRead: () => Promise.resolve(),
});

// ------------------- PROVIDER -------------------
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.data);
      setUnreadCount(data.unread_count);
    } catch {
      // Silent fail - khong toast khi background fetch
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount - khong refetch khi navigate
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refetch moi 5 phut
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkNotificationRead = useCallback(
    async (notificationId: number) => {
      const prevNotifications = notifications;
      const prevCount = unreadCount;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationService.markNotificationRead(notificationId);
      } catch {
        // Rollback
        setNotifications(prevNotifications);
        setUnreadCount(prevCount);
        toast.error("Không thể xác nhận đã đọc. Vui lòng thử lại.");
      }
    },
    [notifications, unreadCount],
  );

  const handleMarkAllRead = useCallback(
    async () => {
      const prevNotifications = notifications;
      const prevCount = unreadCount;
      const unreadIds = notifications
        .filter((item) => !item.is_read)
        .map((item) => item.id);

      if (unreadIds.length === 0) {
        return;
      }

      // Optimistic update
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
      setUnreadCount(0);

      try {
        await Promise.all(
          unreadIds.map((id) => notificationService.markNotificationRead(id)),
        );
      } catch {
        // Rollback
        setNotifications(prevNotifications);
        setUnreadCount(prevCount);
        toast.error("Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.");
      }
    },
    [notifications, unreadCount],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      handleMarkNotificationRead,
      handleMarkAllRead,
    }),
    [
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      handleMarkNotificationRead,
      handleMarkAllRead,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ------------------- HOOKS -------------------
export const useNotifications = () => useContext(NotificationContext);
