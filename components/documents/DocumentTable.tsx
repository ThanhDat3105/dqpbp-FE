"use client";

import { FileX, ExternalLink, Lock, Globe } from "lucide-react";
import { DocumentItem } from "@/services/api/document";

interface Props {
  documents: DocumentItem[];
  loading?: boolean;
}

export function DocumentTable({ documents, loading }: Props) {
  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-4 flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/5" />
            <div className="h-4 bg-gray-200 rounded w-1/5" />
            <div className="h-4 bg-gray-200 rounded w-1/5" />
            <div className="h-4 bg-gray-200 rounded w-1/5" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <FileX className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg">Không có tài liệu nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-sm font-semibold text-gray-500 border-b border-gray-100">
            <th className="px-4 py-3">Tên tài liệu</th>
            <th className="px-4 py-3">Tổ công tác</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-right">Tải xuống</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <p className="text-gray-900 font-medium text-sm leading-snug">{doc.title}</p>
                {doc.description && (
                  <p className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{doc.description}</p>
                )}
                <p className="text-gray-400 text-xs mt-0.5">{doc.file_name}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {doc.department_name ?? "—"}
              </td>
              <td className="px-4 py-3">
                {doc.is_public ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                    <Globe className="w-3 h-3" /> Công khai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    <Lock className="w-3 h-3" /> Nội bộ
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(doc.created_at).toLocaleDateString("vi-VN")}
              </td>
              <td className="px-4 py-3 text-right">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  Mở
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
