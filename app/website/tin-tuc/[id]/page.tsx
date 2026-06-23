"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  Share2,
  Clock,
} from "lucide-react";
import { websiteAPI } from "@/services/api/website";
import type { NewsArticle } from "@/lib/mock/website";

const categoryColor: Record<string, string> = {
  "Hoạt động": "bg-green-100 text-green-700",
  "Tin tức": "bg-blue-100 text-blue-700",
  "Thông báo": "bg-yellow-100 text-yellow-700",
  "Văn bản pháp quy": "bg-purple-100 text-purple-700",
};

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [related, setRelated] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    websiteAPI
      .getArticleById(Number(id))
      .then((data) => {
        if (!data) {
          setNotFound(true);
          return;
        }
        setArticle(data);
        websiteAPI
          .getArticles({ limit: 5, category: data.category })
          .then((res) =>
            setRelated(res.data.filter((a) => a.id !== data.id).slice(0, 4)),
          );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#546a2f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">📄</div>
        <h2 className="text-xl font-bold text-gray-700">
          Không tìm thấy bài viết
        </h2>
        <p className="text-gray-500 text-sm">
          Bài viết này không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/website/tin-tuc"
          className="inline-flex items-center gap-2 bg-[#546a2f] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3d5020] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách tin tức
        </Link>
      </div>
    );
  }

  const badgeClass =
    categoryColor[article.category] ?? "bg-gray-100 text-gray-600";

  return (
    <>
      {/* Page banner */}
      <section
        className="relative py-10 text-white"
        style={{ background: "linear-gradient(135deg, #2d3a1a, #546a2f)" }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <a href="/website" className="hover:text-white transition-colors">
              Trang chủ
            </a>
            <ChevronRight className="w-3.5 h-3.5" />
            <a
              href="/website/tin-tuc"
              className="hover:text-white transition-colors"
            >
              Tin Tức & Sự Kiện
            </a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-yellow-300 line-clamp-1">
              {article.title}
            </span>
          </nav>
          <h1 className="text-xl md:text-2xl font-black leading-snug max-w-3xl">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}
            >
              {article.category}
            </span>
            <span className="flex items-center gap-1.5 text-white/70 text-sm">
              <Calendar className="w-3.5 h-3.5" />
              {article.updatedAt}
            </span>
            {article.author && (
              <span className="flex items-center gap-1.5 text-white/70 text-sm">
                <User className="w-3.5 h-3.5" />
                {article.author}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article body */}
        <article className="lg:col-span-2">
          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6 bg-[#546a2f]/10">
              <Image
                src={article.thumbnail}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-base text-gray-600 leading-relaxed border-l-4 border-yellow-300 pl-4 mb-6 italic">
              {article.excerpt}
            </p>
          )}

          {/* Body content */}
          <div className="prose prose-sm max-w-none leading-relaxed text-gray-700 text-justify">
            {article.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="article-content"
              />
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Nội dung đang được cập nhật...</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/website/tin-tuc"
              className="inline-flex items-center gap-2 text-sm text-[#546a2f] font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: article.title,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#546a2f] transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </button>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Category badge */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#546a2f]" />
              Chuyên mục
            </h3>
            <span
              className={`inline-block text-sm font-semibold px-3 py-1.5 rounded-full ${badgeClass}`}
            >
              {article.category}
            </span>
          </div>

          {/* Related articles */}
          {related.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-[#546a2f] text-white px-4 py-3">
                <span className="font-semibold text-sm">
                  Bài Viết Liên Quan
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/website/tin-tuc/${item.id}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-16 h-14 rounded-lg bg-[#546a2f]/10 shrink-0 overflow-hidden relative">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#546a2f]/30">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug line-clamp-2 font-medium">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.updatedAt}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-gray-100">
                <Link
                  href="/website/tin-tuc"
                  className="text-sm text-[#546a2f] hover:underline flex items-center gap-1"
                >
                  Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            className="rounded-xl p-5 text-white text-center"
            style={{ background: "linear-gradient(135deg, #546a2f, #3d5020)" }}
          >
            <div className="text-3xl mb-2">📢</div>
            <h3 className="font-bold mb-1 text-sm">Liên Hệ Với Chúng Tôi</h3>
            <p className="text-xs text-white/80 mb-3">
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
