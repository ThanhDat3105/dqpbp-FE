'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, TrendingUp } from 'lucide-react';
import ArticleCard from '@/components/website/ArticleCard';
import AppPagination from '@/components/ui/AppPagination';
import { websiteAPI } from '@/services/api/website';
import type { NewsArticle } from '@/lib/mock/website';

const CATEGORIES = [
  { label: 'Tất cả', value: '' },
  { label: 'Hoạt động', value: 'Hoạt động' },
  { label: 'Tin tức', value: 'Tin tức' },
  { label: 'Thông báo', value: 'Thông báo' },
  { label: 'Văn bản pháp quy', value: 'Văn bản pháp quy' },
];

const LIMIT = 10;

export default function TinTucPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [popular, setPopular] = useState<NewsArticle[]>([]);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

  useEffect(() => {
    setLoading(true);
    websiteAPI
      .getArticles({
        page,
        limit: LIMIT,
        ...(activeCategory ? { category: activeCategory } : {}),
      })
      .then((res) => {
        setArticles(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, activeCategory]);

  useEffect(() => {
    websiteAPI.getArticles({ page: 1, limit: 4 }).then((res) => setPopular(res.data));
  }, []);

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setPage(1);
    setKeyword('');
    setInputValue('');
  };

  const handleSearch = () => {
    setKeyword(inputValue);
    setPage(1);
  };

  const displayedArticles = keyword.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(keyword.toLowerCase()))
    : articles;

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
          <span className="text-white/80">Tin tức</span>
        </nav>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div ref={mainRef} className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-[#546a2f] flex items-center gap-2">
            <span className="w-1 h-6 bg-yellow-300 rounded-full" />
            {CATEGORIES.find((c) => c.value === activeCategory)?.label ?? 'Tất cả'}
          </h2>

          {/* News list */}
          <div className="space-y-4 min-h-50">
            {loading ? (
              <p className="text-gray-400 text-sm py-6 text-center">Đang tải...</p>
            ) : displayedArticles.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">Không tìm thấy bài viết.</p>
            ) : (
              displayedArticles.map((article) => (
                <Link key={article.id} href={`/website/tin-tuc/${article.id}`}>
                  <ArticleCard article={article} variant="horizontal" />
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Tổng {total} bài viết
            </span>
            <AppPagination
              page={page}
              limit={LIMIT}
              total={total}
              onPageChange={(p) => setPage(p)}
            />
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
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập từ khóa..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#546a2f]"
              />
            </div>
            <button
              onClick={handleSearch}
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
                <li key={cat.value}>
                  <button
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors text-left ${
                      activeCategory === cat.value
                        ? 'bg-[#546a2f]/5 text-[#546a2f] font-semibold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <ChevronRight className="w-3 h-3 text-[#546a2f]" />
                      {cat.label}
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
              {popular.map((article, idx) => (
                <li key={article.id}>
                  <Link
                    href={`/website/tin-tuc/${article.id}`}
                    className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3"
                  >
                    <span className="text-2xl font-black text-[#546a2f]/20 leading-none w-7 shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700 leading-snug line-clamp-2">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{article.updatedAt}</p>
                    </div>
                  </Link>
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
