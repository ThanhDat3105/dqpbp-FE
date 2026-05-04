"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoadingFetchUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isLoadingFetchUser) return;

    if (!user) {
      toast.error("Bạn cần đăng nhập để truy cập.");
      router.push("/login");
    } else {
      setHasChecked(true);
    }
  }, [user, isLoadingFetchUser, router]);

  if (isLoadingFetchUser || !hasChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — full height, scrolls independently */}
      <Sidebar
        onLogout={() => {
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onMobileOpen={setMobileMenuOpen}
      />

      {/* Main content area — scrolls independently */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile top header */}
        <div className="md:hidden shrink-0">
          <Header
            onMobileMenuOpen={() => setMobileMenuOpen(!mobileMenuOpen)}
            mobileMenuOpen={mobileMenuOpen}
          />
        </div>

        {/* Page content — only this scrolls */}
        <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col md:p-6 p-2 md:pb-6 pb-24">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
