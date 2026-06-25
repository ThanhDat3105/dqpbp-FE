const STATUS_MAP: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
    label: "Chờ duyệt",
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
    label: "Đã duyệt",
  },
  rejected: {
    bg: "bg-red-100",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Từ chối",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  tsqs: "Tuyển sinh quân sự",
  tuoi17: "Tuổi 17",
  tinhnguyen: "Tình nguyện",
  dqtt: "Dân quân tự vệ",
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold whitespace-nowrap">
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}
