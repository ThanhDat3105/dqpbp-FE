'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/website/AdminSidebar';
import AdminNavbar from '@/components/website/AdminNavbar';

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoadingFetchUser } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);
  const [dark, setDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoadingFetchUser) return;
    if (!user) {
      router.push('/login');
    } else {
      setHasChecked(true);
    }
  }, [user, isLoadingFetchUser, router]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  if (isLoadingFetchUser || !hasChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${dark ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      <AdminSidebar />
      <AdminNavbar dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
