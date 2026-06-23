'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, TrendingUp } from 'lucide-react';
import ArticleCard from '@/components/website/ArticleCard';
import EventCard from '@/components/website/EventCard';
import { websiteAPI } from '@/services/api/website';
import type { NewsArticle } from '@/lib/mock/website';

const CATEGORIES = ['Tất cả', 'Hoạt động', 'Tin tức', 'Thông báo', 'Văn bản pháp quy'];

export default function TinTucPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filtered, setFiltered] = useState<NewsArticle[]>([]);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    websiteAPI
      .getArticles({ page, limit })
      .then((res) => {
        setArticles(res.data);
        setFiltered(res.data);
        setTotal(res.total);
      });
  }, [page]);

  useEffect(() => {
    let result = articles;
    if (activeCategory !== 'Tất cả') {
      result = result.filter((a) => a.category === activeCategory);
    }
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(kw));
    }
    setFiltered(result);
  }, [articles, activeCategory, keyword]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Page banner */}
      <section
        className="relative py-12 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #2d3a1a, #546a2f)' }}
      >
        <h1 className="text-3xl md:text-4xl font-black">Tin Tức & Sự Kiện</h1>
        <nav className="flex items-center justify-center gap-2 text-sm text-white/60 mt-3">
          <a href="/website" className="hover:text-white transition-colors">Trang chủ</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-yellow-300">Tin Tức & Sự Kiện</span>
        </nav>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          {/* News list */}
          <div>
            <h2 className="text-xl font-bold text-[#546a2f] mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-yellow-300 rounded-full" />
              Bài Viết Mới Nhất
            </h2>
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <p className="text-gray-400 text-sm py-6 text-center">Không tìm thấy bài viết.</p>
              ) : (
                filtered.map((article) => (
                  <Link key={article.id} href={`/website/tin-tuc/${article.id}`}>
                    <ArticleCard article={article} variant="horizontal" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Hiển thị {filtered.length} / {total} bài viết
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-[#546a2f] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-700 mb-3 text-sm">Tìm Kiếm</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập từ khóa..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#546a2f]"
              />
            </div>
            <button
              onClick={() => setKeyword(keyword)}
              className="w-full mt-2 bg-[#546a2f] text-white text-sm py-2 rounded-lg hover:bg-[#3d5020] transition-colors font-medium"
            >
              Tìm Kiếm
            </button>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Chuyên Mục</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors text-left ${
                      activeCategory === cat ? 'bg-[#546a2f]/5 text-[#546a2f] font-semibold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-3 h-3 text-[#546a2f]" />
                      {cat}
                    </span>
                    <span className="bg-[#546a2f]/10 text-[#546a2f] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {cat === 'Tất cả'
                        ? articles.length
                        : articles.filter((a) => a.category === cat).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">Tin Xem Nhiều</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {articles.slice(0, 4).map((article, idx) => (
                <li key={article.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3">
                  <span className="text-2xl font-black text-[#546a2f]/20 leading-none w-7 shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm text-gray-700 leading-snug line-clamp-2">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{article.updatedAt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Banner */}
          <div
            className="rounded-xl p-5 text-white text-center"
            style={{ background: 'linear-gradient(135deg, #546a2f, #3d5020)' }}
          >
            <div className="text-3xl mb-2">📢</div>
            <h3 className="font-bold mb-1">Liên Hệ Với Chúng Tôi</h3>
            <p className="text-sm text-white/80 mb-3">
              Có thắc mắc? Liên hệ ngay với Ban CHQS để được hỗ trợ.
            </p>
            <a
              href="/website/lien-he"
              className="inline-block bg-yellow-300 text-[#546a2f] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 transition-colors"
            >
              Liên Hệ Ngay
            </a>
          </div>
        </aside>
      </section>
    </>
  );
}
