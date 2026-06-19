"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Megaphone,
  ExternalLink,
  Star,
} from "lucide-react";
import ArticleCard from "@/components/website/ArticleCard";
import { websiteAPI } from "@/services/api/website";
import type { NewsArticle, WebsiteDocument } from "@/lib/mock/website";

const stats = [
  { value: "100%", label: "Hoàn thành chỉ tiêu" },
  { value: "24/7", label: "Trực sẵn sàng chiến đấu" },
  { value: "500+", label: "Dân quân đã huấn luyện" },
  { value: "50+", label: "Văn bản chỉ đạo" },
];

const quickLinks = [
  { label: "Cổng thông tin TP.HCM", href: "#" },
  { label: "UBND Phường Bình Phú", href: "#" },
  { label: "Bộ Quốc phòng", href: "#" },
  { label: "Báo Quân đội nhân dân", href: "#" },
];

const activities = [
  {
    title: "Tổ chức huấn luyện kỹ năng chiến đấu bộ binh",
    desc: "Đợt huấn luyện kỹ năng chiến đấu bộ binh tháng 4 đã hoàn thành tốt đẹp với 120 cán bộ chiến sĩ tham gia.",
    date: "20/04/2025",
  },
  {
    title: "Tham gia hội thi thao diễn quân sự cấp quận",
    desc: "Đơn vị đạt giải Nhì trong hội thi thao diễn quân sự cấp quận, khẳng định chất lượng huấn luyện.",
    date: "05/04/2025",
  },
];

export default function WebsiteHomePage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [newDocs, setNewDocs] = useState<WebsiteDocument[]>([]);
  const [notifications, setNotifications] = useState<NewsArticle[]>([]);

  useEffect(() => {
    websiteAPI.getArticles({ limit: 10 }).then((res) => {
      setArticles(res.data);
      setNotifications(
        res.data.filter((a) => a.category === "Thông báo").slice(0, 4),
      );
    });
    websiteAPI
      .getDocuments({ status: "new", limit: 3 })
      .then((res) => setNewDocs(res.data));
  }, []);

  const featured = articles.find((a) => a.featured);
  const sideNews = articles
    .filter((a) => a.featured && a.id !== featured?.id)
    .slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-center justify-center text-white"
        style={{
          minHeight: 480,
          background:
            "linear-gradient(135deg, #2d3a1a 0%, #546a2f 55%, #3d5020 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(253,224,71,0.3) 20px, rgba(253,224,71,0.3) 21px)",
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/40 rounded-full px-4 py-1.5 text-sm text-yellow-300 mb-6">
            <Star className="w-3.5 h-3.5" />
            Đoàn Kết — Kỷ Cương — Quyết Thắng
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Cổng thông tin điện tử
            <br />
            <span className="text-yellow-300">Ban CHQS phường Bình Phú</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
            Trang thông tin chính thức Phường Bình Phú, TP. Hồ Chí Minh.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/website/tin-tuc"
              className="inline-flex items-center gap-2 bg-yellow-300 text-[#2d3a1a] font-bold px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Xem Tin Tức <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/website/gioi-thieu"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Giới Thiệu Đơn Vị
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-yellow-300">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-[#546a2f]">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-[#2d3a1a] font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured news */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#546a2f] flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-300 rounded-full inline-block" />
                Tin Tức Nổi Bật
              </h2>
              <Link
                href="/website/tin-tuc"
                className="text-sm text-[#546a2f] hover:underline flex items-center gap-1"
              >
                Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {featured && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-3 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="bg-[#546a2f]/10 h-48 flex items-center justify-center text-[#546a2f]/20">
                    <svg
                      className="w-24 h-24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold bg-[#546a2f] text-white px-2 py-0.5 rounded">
                      {featured.category}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-2 leading-snug">
                      {featured.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                      {featured.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-4">
                  {sideNews.map((n) => (
                    <ArticleCard key={n.id} article={n} variant="vertical" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#546a2f] flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-300 rounded-full inline-block" />
                Hoạt Động Phong Trào
              </h2>
            </div>
            <div className="space-y-3">
              {activities.map((a) => (
                <div
                  key={a.title}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-4"
                >
                  <div className="w-16 h-16 bg-[#546a2f]/10 rounded-lg shrink-0 flex items-center justify-center text-[#546a2f]/30">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {a.desc}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar (1/3) */}
        <aside className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">Thông Báo</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-sm text-gray-700 leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {n.updatedAt}
                        </p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-gray-400">
                  Không có thông báo
                </li>
              )}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Liên Kết Nhanh</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 hover:text-[#546a2f] transition-colors"
                  >
                    {l.label}
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* New docs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-sm">Văn Bản Mới</span>
              <Link
                href="/website/van-ban"
                className="text-xs text-yellow-300 hover:underline"
              >
                Tất cả
              </Link>
            </div>
            <ul className="divide-y divide-gray-100">
              {newDocs.map((d) => (
                <li
                  key={d.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <p className="text-sm text-gray-700 leading-snug line-clamp-2">
                    {d.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.issuedDate}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Vị Trí</span>
            </div>
            <iframe
              title="Bản đồ BCH Quân Sự Phường Bình Phú"
              src="https://maps.google.com/maps?q=10.7473733,106.6329953&z=17&output=embed"
              className="w-full h-40 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </aside>
      </section>
    </>
  );
}
