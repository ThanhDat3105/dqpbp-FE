'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Newspaper, FileText, Image, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/quan-ly/website/tin-tuc', label: 'Tin Tức', icon: Newspaper },
  { href: '/quan-ly/website/van-ban', label: 'Văn Bản Pháp Luật', icon: FileText },
  { href: '/quan-ly/website/slide', label: 'Slide Ảnh', icon: Image },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#546a2f] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#ffb300] rounded-full flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-[#546a2f]" />
        </div>
        <div className="text-white">
          <div className="font-bold text-sm leading-tight">CMS Quản Lý</div>
          <div className="text-[#ffb300] text-xs leading-tight">Website BCH QSPP</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-white/40 text-xs uppercase font-semibold px-2 mb-2 tracking-wider">
          Nội Dung
        </p>
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#ffb300] text-[#546a2f]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs uppercase font-semibold px-2 mb-2 tracking-wider">
            Hệ Thống
          </p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng Xuất
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 text-white/30 text-xs text-center">
        DQBINHPHU v1.0
      </div>
    </aside>
  );
}
