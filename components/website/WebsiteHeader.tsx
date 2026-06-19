"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { RegistrationCategory } from "@/services/api/website-registration";

const navLinks = [
  { href: "/website", label: "Trang Chủ" },
  { href: "/website/gioi-thieu", label: "Giới Thiệu" },
  { href: "/website/tin-tuc", label: "Tin Tức" },
  { href: "/website/van-ban", label: "Văn Bản Pháp Lý" },
  { href: "/website/lien-he", label: "Tiếp Nhận Hồ Sơ" },
];

const registrationLinks: Array<{
  category: RegistrationCategory;
  label: string;
}> = [
  { category: "tsqs", label: "Tuyển sinh quân sự (TSQS)" },
  { category: "tuoi17", label: "Đăng ký quản lý NVQS lần đầu (tuổi 17)" },
  { category: "tinhnguyen", label: "Tình nguyện tham gia NVQS" },
  { category: "dqtt", label: "Đăng ký tham gia DQTT - Dân quân nòng cốt" },
  { category: "doituongchinhsach", label: "Đối tượng chính sách" },
  { category: "siquandubi", label: "Đăng ký đào tạo sĩ quan dự bị" },
];

export default function WebsiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const registrationActive = pathname.startsWith("/website/tiep-nhan-dang-ky");

  return (
    <header className="sticky top-0 z-50 bg-[#546a2f] shadow-lg">
      <div className="bg-[#3d5020] px-4 py-1 text-center text-xs text-white/70">
        BCH Quân Sự Phường Bình Phú, TP. Hồ Chí Minh
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/website" className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <Image
              src="/img/logo-dqtv.png"
              alt="Logo Dân Quân Tự Vệ"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          </div>
          <div className="text-white">
            <div className="text-sm font-bold leading-tight">BCH Quân Sự</div>
            <div className="text-xs leading-tight text-yellow-300">
              Phường Bình Phú
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/website"
                ? pathname === "/website"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-yellow-300 text-[#546a2f]"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="group relative">
            <Link
              href="/website/tiep-nhan-dang-ky"
              className={`flex items-center gap-1 rounded px-4 py-2 text-sm font-medium transition-colors ${
                registrationActive
                  ? "bg-yellow-300 text-[#546a2f]"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              Tiếp Nhận Đăng Ký
              <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full w-72 overflow-hidden rounded-b bg-white py-1 opacity-0 shadow-xl transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {registrationLinks.map((item) => (
                <Link
                  key={item.category}
                  href={`/website/tiep-nhan-dang-ky?category=${item.category}`}
                  className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-yellow-300 hover:text-[#3d5020]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="p-1 text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            type="button"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/10 bg-[#3d5020] md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block border-b border-white/5 px-4 py-3 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-b border-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white/45">
            Tiếp nhận đăng ký
          </div>
          {registrationLinks.map((item) => (
            <Link
              key={item.category}
              href={`/website/tiep-nhan-dang-ky?category=${item.category}`}
              className="block border-b border-white/5 px-4 py-3 text-sm text-white/90 hover:bg-white/10"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
