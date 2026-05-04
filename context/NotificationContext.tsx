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
  DigestTask,
} from "@/services/api/notification";

// ------------------- TYPES -------------------
interface NotificationContextType {
  tasks: DigestTask[];
  unreadCount: number;
  loading: boolean;
  fetchDigest: () => Promise<void>;
  handleMarkTaskRead: (taskId: number) => Promise<void>;
  handleMarkAllRead: () => Promise<void>;
}

// ------------------- CONTEXT -------------------
const NotificationContext = createContext<NotificationContextType>({
  tasks: [],
  unreadCount: 0,
  loading: false,
  fetchDigest: () => Promise.resolve(),
  handleMarkTaskRead: () => Promise.resolve(),
  handleMarkAllRead: () => Promise.resolve(),
});

// ------------------- PROVIDER -------------------
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<DigestTask[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDigest = useCallback(async () => {
    try {
      const data = await notificationService.getTodayDigest();
      setTasks(data.tasks);
      setUnreadCount(data.unread_count);
    } catch {
      // Silent fail - khong toast khi background fetch
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount - khong refetch khi navigate
  useEffect(() => {
    fetchDigest();
  }, [fetchDigest]);

  // Auto-refetch moi 5 phut
  useEffect(() => {
    const interval = setInterval(fetchDigest, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDigest]);

  const handleMarkTaskRead = useCallback(
    async (taskId: number) => {
      const prevTasks = tasks;
      const prevCount = unreadCount;

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.task_id === taskId ? { ...t, is_read: true } : t)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        const data = await notificationService.markTaskAsRead(taskId);
        setTasks(data.tasks);
        setUnreadCount(data.unread_count);
      } catch {
        // Rollback
        setTasks(prevTasks);
        setUnreadCount(prevCount);
        toast.error("Không thể xác nhận đã đọc. Vui lòng thử lại.");
      }
    },
    [tasks, unreadCount],
  );

  const handleMarkAllRead = useCallback(
    async () => {
      const prevTasks = tasks;
      const prevCount = unreadCount;

      // Optimistic update
      setTasks((prev) => prev.map((t) => ({ ...t, is_read: true })));
      setUnreadCount(0);

      try {
        const data = await notificationService.markAllAsRead();
        setTasks(data.tasks);
        setUnreadCount(data.unread_count);
      } catch {
        // Rollback
        setTasks(prevTasks);
        setUnreadCount(prevCount);
        toast.error("Không thể đánh dấu tất cả đã đọc. Vui lòng thử lại.");
      }
    },
    [tasks, unreadCount],
  );

  const value = useMemo(
    () => ({
      tasks,
      unreadCount,
      loading,
      fetchDigest,
      handleMarkTaskRead,
      handleMarkAllRead,
    }),
    [
      tasks,
      unreadCount,
      loading,
      fetchDigest,
      handleMarkTaskRead,
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
