"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Shield } from "lucide-react";

const navLinks = [
  { href: "/website", label: "Trang Chủ" },
  { href: "/website/gioi-thieu", label: "Giới Thiệu" },
  { href: "/website/tin-tuc", label: "Tin Tức" },
  { href: "/website/van-ban", label: "Văn Bản" },
  { href: "/website/lien-he", label: "Liên Hệ" },
];

export default function WebsiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#546a2f] shadow-lg">
      {/* Top bar */}
      <div className="bg-[#3d5020] text-white/70 text-xs py-1 px-4 text-center">
        BCH Quân Sự Phường Bình Phú, TP. Hồ Chí Minh
      </div>

      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/website" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffb300] rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#546a2f]" />
          </div>
          <div className="text-white">
            <div className="font-bold text-sm leading-tight">BCH Quân Sự</div>
            <div className="text-xs text-[#ffb300] leading-tight">
              Phường Bình Phú
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active =
              link.href === "/website"
                ? pathname === "/website"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#ffb300] text-[#546a2f]"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Login + hamburger */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#3d5020] border-t border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-white/90 hover:bg-white/10 text-sm border-b border-white/5"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="block px-4 py-3 text-[#ffb300] font-semibold text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Đăng Nhập
          </Link>
        </div>
      )}
    </header>
  );
}
