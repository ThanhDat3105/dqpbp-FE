'use client';

import { useState } from 'react';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

export default function AdminNavbar({ dark, onToggleDark }: Props) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-30 shadow-sm">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:border-[#546a2f] focus:ring-1 focus:ring-[#546a2f] dark:text-white"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                  Thông Báo
                </span>
              </div>
              <div className="py-2">
                {['Bài viết mới cần duyệt', 'Văn bản hết hạn cần cập nhật'].map((n, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">{n}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Vừa xong</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-[#546a2f] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">
              {user?.name ?? 'Quản trị viên'}
            </p>
            <p className="text-xs text-gray-400 leading-tight">{user?.role ?? 'ADMIN'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
