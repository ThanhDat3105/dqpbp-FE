"use client";

import { Document } from "./types";
import { FileX } from "lucide-react";

export interface DocumentTableProps {
  documents: Document[];
}

export function DocumentTable({ documents }: DocumentTableProps) {
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
          <tr className="bg-gray-50 text-sm font-semibold text-gray-400 border-b border-gray-100">
            <th className="px-4 py-3 font-semibold">Tên tài liệu</th>
            <th className="px-4 py-3 font-semibold">Loại</th>
            <th className="px-4 py-3 font-semibold">Ngày tạo</th>
            <th className="px-4 py-3 font-semibold">Người tạo</th>
            <th className="px-4 py-3 font-semibold text-right">Tập tin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-4 text-gray-900 flex-1">{doc.name}</td>
              <td className="px-4 py-4 text-gray-500">{doc.type}</td>
              <td className="px-4 py-4 text-gray-500">{doc.createdAt}</td>
              <td className="px-4 py-4 text-gray-500">{doc.createdBy}</td>
              <td className="px-4 py-4 text-right">
                <span className="inline-flex items-center justify-center bg-teal-100 text-teal-700 rounded-full px-3 py-1 text-sm font-medium">
                  {doc.fileCount} Tập tin
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
