import Link from "next/link";
import { Shield, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function WebsiteFooter() {
  return (
    <footer className="bg-[#2d3a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#ffb300] rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#546a2f]" />
              </div>
              <div>
                <div className="font-bold">BCH Quân Sự</div>
                <div className="text-[#ffb300] text-sm">Phường Bình Phú</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Ban Chỉ Huy Quân Sự Phường Bình Phú, TP.HCM — đơn vị dân quân tự
              vệ bảo vệ an ninh, trật tự địa phương.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#ffb300] font-semibold">
              <span className="text-lg">⚡</span>
              Đoàn Kết — Kỷ Cương — Quyết Thắng
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="font-bold text-[#ffb300] mb-4 uppercase text-sm tracking-wider">
              Liên Kết Nhanh
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/website", label: "Trang Chủ" },
                { href: "/website/gioi-thieu", label: "Giới Thiệu" },
                { href: "/website/tin-tuc", label: "Tin Tức & Sự Kiện" },
                { href: "/website/van-ban", label: "Văn Bản Chỉ Đạo" },
                { href: "/website/lien-he", label: "Liên Hệ" },
                { href: "/login", label: "Cổng Đăng Nhập" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[#ffb300] text-sm transition-colors flex items-center gap-1"
                  >
                    <span className="text-[#ffb300]">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h3 className="font-bold text-[#ffb300] mb-4 uppercase text-sm tracking-wider">
              Thông Tin Liên Hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 text-[#ffb300] shrink-0 mt-0.5" />
                <span>675 Hậu Giang, Phường Bình Phú, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-1 text-sm text-white/70">
                <Clock className="w-4 h-4 text-[#ffb300] shrink-0" />
                <div>
                  <p>Thứ 2 – Thứ 6: 07:30 – 11:30, 13:30 – 17:00</p>
                  <p>Thứ 7: 07:30 – 11:30</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 bg-[#1e2710]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-white/50 text-xs">
          <span>© 2025 BCH Quân Sự Phường Bình Phú. Bảo lưu mọi quyền.</span>
          <span>Hệ thống DQBINHPHU v1.0</span>
        </div>
      </div>
    </footer>
  );
}
