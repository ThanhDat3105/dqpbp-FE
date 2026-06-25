import { Link2, Pencil, Trash2 } from "lucide-react";
import { Column } from "@/components/website/DataTable";
import { QuickLink } from "@/lib/mock/website";

function CustomCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
        checked
          ? "bg-[#546a2f] border-[#546a2f]"
          : "border-gray-300 hover:border-[#546a2f]"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 12 10"
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="1,5 4,9 11,1" />
        </svg>
      )}
    </div>
  );
}

interface BuildColumnsArgs {
  setData: React.Dispatch<React.SetStateAction<QuickLink[]>>;
  onEdit: (row: QuickLink) => void;
  onDelete: (id: number) => void;
  onOrderBlur: (id: number, order: number) => void;
  onToggleVisible: (id: number) => void;
}

export function buildQuickLinkColumns({
  setData,
  onEdit,
  onDelete,
  onOrderBlur,
  onToggleVisible,
}: BuildColumnsArgs): Column<QuickLink>[] {
  return [
    {
      key: "id",
      label: "Id",
      width: "w-12",
      render: (row) => <span className="text-gray-400 text-xs">{row.id}</span>,
    },
    {
      key: "title",
      label: "Tiêu đề",
      render: (row) => (
        <p className="font-medium text-gray-800 dark:text-white text-sm">
          {row.title}
        </p>
      ),
    },
    {
      key: "url",
      label: "URL",
      render: (row) =>
        row.url ? (
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 max-w-50 truncate"
          >
            <Link2 className="w-3 h-3 shrink-0" />
            <span className="truncate">{row.url}</span>
          </a>
        ) : (
          <span className="text-xs text-gray-300 italic">-</span>
        ),
    },
    {
      key: "order",
      label: "Thứ tự",
      width: "w-24",
      render: (row) => (
        <input
          type="number"
          value={row.order}
          onChange={(e) =>
            setData((prev) =>
              prev.map((d) =>
                d.id === row.id ? { ...d, order: Number(e.target.value) } : d,
              ),
            )
          }
          onBlur={(e) => onOrderBlur(row.id, Number(e.target.value))}
          className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-[#546a2f]"
        />
      ),
    },
    {
      key: "visible",
      label: "Hiển thị",
      width: "w-24",
      render: (row) => (
        <CustomCheckbox
          checked={row.visible}
          onChange={() => onToggleVisible(row.id)}
        />
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
            title="Sửa"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(row.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
            title="Xoa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
