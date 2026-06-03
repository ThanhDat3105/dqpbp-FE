import Link from 'next/link';
import { Calendar, User, Tag } from 'lucide-react';
import type { NewsArticle } from '@/lib/mock/website';

interface Props {
  article: NewsArticle;
  variant?: 'horizontal' | 'vertical';
}

const categoryColor: Record<string, string> = {
  'Hoạt động': 'bg-green-100 text-green-700',
  'Tin tức': 'bg-blue-100 text-blue-700',
  'Thông báo': 'bg-yellow-100 text-yellow-700',
  'Văn bản pháp quy': 'bg-purple-100 text-purple-700',
};

export default function ArticleCard({ article, variant = 'horizontal' }: Props) {
  const badgeClass = categoryColor[article.category] ?? 'bg-gray-100 text-gray-600';

  if (variant === 'vertical') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
        <div className="bg-[#546a2f]/10 h-40 flex items-center justify-center text-[#546a2f]/30">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit mb-2 ${badgeClass}`}>
            {article.category}
          </span>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2 flex-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {article.updatedAt}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex gap-4 p-4">
      {/* Thumbnail */}
      <div className="bg-[#546a2f]/10 rounded-lg w-24 h-20 shrink-0 flex items-center justify-center text-[#546a2f]/30">
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
              {article.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-1">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2">{article.excerpt}</p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 flex-wrap">
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {article.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {article.updatedAt}
          </span>
        </div>
      </div>
    </div>
  );
}
