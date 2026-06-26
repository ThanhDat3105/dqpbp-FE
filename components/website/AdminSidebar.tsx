"use client";

import {
  FileCheck2,
  FileText,
  Image,
  Link2,
  LogOut,
  MessageSquare,
  Newspaper,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/quan-ly/website/tin-tuc", label: "Tin Tức", icon: Newspaper },
  {
    href: "/quan-ly/website/van-ban",
    label: "Văn Bản Pháp Luật",
    icon: FileText,
  },
  { href: "/quan-ly/website/slide", label: "Slide Ảnh", icon: Image },
  { href: "/quan-ly/website/quick-link", label: "Liên Kết Nhanh", icon: Link2 },
  {
    href: "/quan-ly/website/ho-so-dang-ky",
    label: "Quản lý hồ sơ đăng ký",
    icon: FileCheck2,
  },
  {
    href: "/quan-ly/website/lien-he",
    label: "Liên Hệ",
    icon: MessageSquare,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#546a2f]">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffb300]">
          <Shield className="h-4 w-4 text-[#546a2f]" />
        </div>
        <div className="text-white">
          <div className="text-sm font-bold leading-tight">CMS Quản Lý</div>
          <div className="text-xs leading-tight text-[#ffb300]">
            Website BCH QSPP
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          Nội Dung
        </p>
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#ffb300] text-[#546a2f]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Hệ Thống
          </p>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Đăng Xuất
          </button>
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-white/30">
        DQBINHPHU v1.0
      </div>
    </aside>
  );
}
