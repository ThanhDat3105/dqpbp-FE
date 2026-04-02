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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="md:hidden flex">
        <Header
          onMobileMenuOpen={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          onLogout={() => {
            setMobileMenuOpen(false);
          }}
          mobileOpen={mobileMenuOpen}
          onMobileOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="p-4 md:p-6 h-screen overflow-auto flex-1">
          {children}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
