"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Filter, Bell } from "lucide-react";
import DocumentRow from "@/components/website/DocumentRow";
import { websiteAPI } from "@/services/api/website";
import type { WebsiteDocument, NewsArticle } from "@/lib/mock/website";

const DOC_TYPES = [
  "Kế hoạch",
  "Quyết định",
  "Nghị quyết",
  "Thông tư",
  "Chỉ thị",
  "Quy chế",
];
const YEARS = ["2025", "2024", "2023", "2022"];
const CATEGORIES = [
  "Nhiệm vụ",
  "Hành chính",
  "Tuyên truyền",
  "Bảo mật",
  "Hậu cần",
];

export default function VanBanPage() {
  const [docs, setDocs] = useState<WebsiteDocument[]>([]);
  const [notifications, setNotifications] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const limit = 10;

  const fetchDocs = (overrides?: {
    page?: number;
    category?: string;
    keyword?: string;
  }) => {
    const params = {
      page: overrides?.page ?? page,
      limit,
      category: (overrides?.category ?? category) || undefined,
      keyword: (overrides?.keyword ?? keyword) || undefined,
    };
    websiteAPI.getDocuments(params).then((res) => {
      setDocs(res.data);
      setTotal(res.total);
    });
  };

  useEffect(() => {
    fetchDocs();
    websiteAPI.getArticles({ limit: 3 }).then((res) => {
      setNotifications(
        res.data.filter((a) => a.category === "Thông báo").slice(0, 3),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchDocs({ page: 1 });
  };

  const handleClearFilter = () => {
    setKeyword("");
    setCategory("");
    setActiveCategory("");
    setPage(1);
    websiteAPI.getDocuments({ page: 1, limit }).then((res) => {
      setDocs(res.data);
      setTotal(res.total);
    });
  };

  const handleCategoryClick = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    setPage(1);
    fetchDocs({ page: 1, category: next });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Page banner */}
      <section
        className="relative py-12 text-white text-center"
        style={{ background: "linear-gradient(135deg, #2d3a1a, #546a2f)" }}
      >
        <h1 className="text-3xl md:text-4xl font-black">Văn Bản</h1>
        <nav className="flex items-center justify-center gap-2 text-sm text-white/60 mt-3">
          <a href="/website" className="hover:text-white transition-colors">
            Trang chủ
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-yellow-300">Văn Bản</span>
        </nav>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left sidebar */}
        <aside className="space-y-5">
          {/* Filter form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">Bộ Lọc Tìm Kiếm</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Từ khóa
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Nhập tên văn bản..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#546a2f]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Loại văn bản
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#546a2f]"
                >
                  <option value="">-- Tất cả --</option>
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Năm ban hành
                </label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#546a2f]">
                  <option value="">-- Tất cả --</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSearch}
                className="w-full bg-[#546a2f] text-white text-sm py-2 rounded-lg hover:bg-[#3d5020] transition-colors font-medium"
              >
                Tìm Kiếm
              </button>
              <button
                onClick={handleClearFilter}
                className="w-full border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          </div>

          {/* Category list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Phân Loại</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors text-left ${
                      activeCategory === cat
                        ? "bg-[#546a2f]/5 font-semibold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-3 h-3 text-[#546a2f]" />
                      {cat}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">Thông Báo</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <li
                    key={n.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-xs text-gray-700 leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {n.updatedAt}
                    </p>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-xs text-gray-400">
                  Không có thông báo
                </li>
              )}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Sort controls */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Tìm thấy <strong>{total}</strong> văn bản
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sắp xếp:</label>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:border-[#546a2f]">
                <option>Mới nhất</option>
                <option>Cũ nhất</option>
                <option>Tên A–Z</option>
              </select>
            </div>
          </div>

          {/* Document list */}
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">
                Không tìm thấy văn bản.
              </p>
            ) : (
              docs.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPage(p);
                        fetchDocs({ page: p });
                      }}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-[#546a2f] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
