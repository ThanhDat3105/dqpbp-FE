import { Download, Eye, FileText, File } from 'lucide-react';
import type { WebsiteDocument } from '@/lib/mock/website';

interface Props {
  doc: WebsiteDocument;
}

const statusConfig = {
  active: { label: 'Hiệu lực', className: 'bg-green-100 text-green-700' },
  expired: { label: 'Hết hiệu lực', className: 'bg-red-100 text-red-600' },
  new: { label: 'Mới', className: 'bg-blue-100 text-blue-700' },
};

const categoryColor: Record<string, string> = {
  'Nhiệm vụ': 'bg-green-50 text-green-700 border-green-200',
  'Hành chính': 'bg-blue-50 text-blue-700 border-blue-200',
  'Tuyên truyền': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Bảo mật': 'bg-red-50 text-red-700 border-red-200',
  'Hậu cần': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function DocumentRow({ doc }: Props) {
  const status = statusConfig[doc.status];
  const catClass = categoryColor[doc.category] ?? 'bg-gray-50 text-gray-600 border-gray-200';

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      {/* File icon */}
      <div
        className={`w-12 h-14 rounded-lg flex flex-col items-center justify-center shrink-0 ${
          doc.fileType === 'PDF' ? 'bg-red-50' : 'bg-blue-50'
        }`}
      >
        {doc.fileType === 'PDF' ? (
          <FileText className={`w-6 h-6 text-red-500`} />
        ) : (
          <File className={`w-6 h-6 text-blue-500`} />
        )}
        <span
          className={`text-[10px] font-bold mt-1 ${
            doc.fileType === 'PDF' ? 'text-red-500' : 'text-blue-500'
          }`}
        >
          {doc.fileType}
        </span>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug">{doc.title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span>Số: {doc.docNumber}</span>
          <span>·</span>
          <span>Ngày: {doc.issuedDate}</span>
          <span>·</span>
          <span>{doc.issuedBy}</span>
          <span>·</span>
          <span>{doc.fileSize}</span>
        </div>
      </div>

      {/* Category + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`hidden sm:inline-flex text-xs font-medium px-2 py-1 rounded border ${catClass}`}>
          {doc.category}
        </span>
        <button className="flex items-center gap-1 text-xs text-[#546a2f] hover:bg-[#546a2f]/10 px-3 py-1.5 rounded transition-colors font-medium">
          <Eye className="w-3.5 h-3.5" /> Xem
        </button>
        <button className="flex items-center gap-1 text-xs bg-[#546a2f] text-white hover:bg-[#3d5020] px-3 py-1.5 rounded transition-colors font-medium">
          <Download className="w-3.5 h-3.5" /> Tải về
        </button>
      </div>
    </div>
  );
}
