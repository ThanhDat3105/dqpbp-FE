import { Skeleton } from "@/components/ui/skeleton";
import type { KpiTargetHistoryItem } from "@/types/kpi-target-history";
import {
  formatChangedAt,
  formatHistoryValue,
  getActionPresentation,
} from "./history-formatters";

const HEADERS = [
  "Thời điểm",
  "Người sửa",
  "Tổ",
  "Thao tác",
  "Loại nhiệm vụ",
  "Từ → Thành",
];

function LoadingRows() {
  return ["one", "two", "three", "four", "five"].map((rowKey) => (
    <tr key={rowKey} className="border-b border-slate-100">
      {HEADERS.map((header) => (
        <td key={header} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  ));
}

export function HistoryTable({
  items,
  loading,
}: {
  items: KpiTargetHistoryItem[];
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[960px] w-full text-sm">
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200">
            {HEADERS.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <LoadingRows />
          ) : (
            items.map((item) => {
              const action = getActionPresentation(item.action);
              return (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                    {formatChangedAt(item.changedAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.changedBy.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {item.teamName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${action.className}`}
                    >
                      {action.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{item.lineName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    <span>{formatHistoryValue(item.oldValue)}</span>
                    <span className="mx-2 text-slate-400">→</span>
                    <span>{formatHistoryValue(item.newValue)}</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
