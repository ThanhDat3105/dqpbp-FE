import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";

export default function WebsiteFooter() {
  return (
    <footer className="bg-[#2d3a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Col 1: Logo + Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 flex items-center justify-center shrink-0">
                <Image
                  src="/img/logo-dqtv.png"
                  alt="Logo Dân Quân Tự Vệ"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                />
              </div>
              <div>
                <div className="font-bold">BCH Quân Sự</div>
                <div className="text-yellow-300 text-sm">Phường Bình Phú</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Ban Chỉ Huy Quân Sự Phường Bình Phú, TP.HCM — đơn vị dân quân tự
              vệ bảo vệ an ninh, trật tự địa phương.
            </p>
            {/* <div className="mt-4 flex items-center gap-2 text-sm text-yellow-300 font-semibold">
              <span className="text-lg">⚡</span>
              Đoàn Kết — Kỷ Cương — Quyết Thắng
            </div> */}
          </div>

          {/* Col 2: Contact */}
          <div>
            <h3 className="font-bold text-yellow-300 mb-4 uppercase text-sm tracking-wider">
              Thông Tin Liên Hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                <div>
                  <p>675 Hậu Giang, Phường Bình Phú</p>
                  <p>36Bis An Dương Vương, Phường Bình Phú</p>
                  <p className="text-white/50">TP. Hồ Chí Minh</p>
                </div>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4 text-yellow-300 shrink-0" />
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-center gap-2 text-white/50 text-xs">
          <span>© 2025 BCH Quân Sự Phường Bình Phú. Bảo lưu mọi quyền.</span>
        </div>
      </div>
    </footer>
  );
}
