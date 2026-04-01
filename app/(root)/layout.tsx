"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          currentUser={{
            fullName: "Nguyễn Văn A",
            role: "admin",
            team: "DQTT",
          }}
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
