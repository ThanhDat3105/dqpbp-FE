"use client";

import { ArrowLeft, ChevronDown, ChevronUp, History } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import AppPagination from "@/components/ui/AppPagination";
import {
  type MilitaryCvEditHistoryItem,
  type MilitaryCvRecord,
  militaryCvApi,
} from "@/services/api/military-cv";

const PAGE_SIZE = 10;

const FIELD_LABELS: Record<string, string> = {
  full_name: "Họ và tên",
  dob: "Ngày sinh",
  id_no: "Số CCCD",
  photo: "Ảnh 4x6",
  profile: "Thông tin bản thân",
  family: "Thông tin gia đình",
  history: "Quá trình kinh tế, chính trị và công tác",
  reviews: "Kết luận của cơ quan",
  "profile.gender": "Giới tính",
  "profile.pob": "Nơi đăng ký khai sinh",
  "profile.hometown": "Quê quán",
  "profile.ethnicity": "Dân tộc",
  "profile.religion": "Tôn giáo",
  "profile.nationality": "Quốc tịch",
  "profile.home_addr": "Nơi thường trú",
  "profile.curr_addr": "Nơi ở hiện tại",
  "profile.family_class": "Thành phần gia đình",
  "profile.self_class": "Thành phần bản thân",
  "profile.edu_level": "Trình độ phổ thông",
  "profile.degree": "Trình độ đào tạo",
  "profile.language": "Ngoại ngữ",
  "profile.major": "Chuyên ngành",
  "profile.party_date": "Ngày vào Đảng dự bị",
  "profile.party_full": "Ngày vào Đảng chính thức",
  "profile.union_date": "Ngày vào Đoàn",
  "profile.reward": "Khen thưởng",
  "profile.discipline": "Kỷ luật",
  "profile.job": "Nghề nghiệp",
  "profile.salary": "Lương",
  "profile.grade": "Ngạch",
  "profile.step": "Bậc",
  "profile.workplace": "Nơi học tập/làm việc",
  "profile.overseas": "Thông tin đi nước ngoài",
  "family.sibling_count": "Số anh, chị, em",
  "family.son_count": "Số con trai của cha mẹ",
  "family.daughter_count": "Số con gái của cha mẹ",
  "family.birth_order": "Thứ tự trong gia đình",
  "family.child_count": "Số con",
  "family.father": "Thông tin cha",
  "family.mother": "Thông tin mẹ",
  "family.spouse": "Thông tin vợ/chồng",
  "family.siblings": "Danh sách anh, chị, em",
  "family.children": "Danh sách con",
  "history.politics": "Thái độ chính trị",
  "history.periods": "Quá trình công tác",
  "reviews.police": "Kết luận Công an cấp phường",
  "reviews.military": "Kết luận Ban CHQS cấp phường",
  "reviews.council": "Kết luận Hội đồng NVQS",
};

const FILTER_OPTIONS = [
  { value: "", label: "Tất cả nội dung" },
  { value: "full_name", label: "Họ và tên" },
  { value: "dob", label: "Ngày sinh" },
  { value: "id_no", label: "Số CCCD" },
  { value: "profile", label: "Thông tin bản thân" },
  { value: "family", label: "Thông tin gia đình" },
  { value: "history", label: "Quá trình công tác" },
  { value: "reviews", label: "Kết luận của cơ quan" },
];

type HistoryFilters = {
  search: string;
  field: string;
  dateFrom: string;
  dateTo: string;
};

const EMPTY_FILTERS: HistoryFilters = {
  search: "",
  field: "",
  dateFrom: "",
  dateTo: "",
};

const getFieldLabel = (field: string) => {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  const parent = Object.keys(FIELD_LABELS)
    .filter((key) => field.startsWith(`${key}.`))
    .sort((a, b) => b.length - a.length)[0];
  return parent ? FIELD_LABELS[parent] : field;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "Chưa có";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "object") return "Đã cập nhật";
  return String(value);
};

const formatSummary = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "Chưa có";
  if (typeof value === "object") return "Dữ liệu chi tiết";
  const text = String(value);
  return text.length > 55 ? `${text.slice(0, 55)}…` : text;
};

const NESTED_FIELD_LABELS: Record<string, string> = {
  year_from: "Từ năm",
  year_to: "Đến năm",
  note: "Nội dung",
  subject: "Đối tượng",
  job: "Nghề nghiệp",
  address: "Địa chỉ",
  econ: "Kinh tế",
  politics: "Chính trị",
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

type DetailedChange = {
  label: string;
  oldValue: unknown;
  newValue: unknown;
};

const sameValue = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

const getDetailLabel = (rootField: string, path: string[]) => {
  const rootLabel = getFieldLabel(rootField);
  if (path.length === 0) return rootLabel;
  return `${rootLabel} · ${path
    .map((part) => NESTED_FIELD_LABELS[part] ?? part)
    .join(" · ")}`;
};

const diffValues = (
  rootField: string,
  oldValue: unknown,
  newValue: unknown,
  path: string[] = [],
): DetailedChange[] => {
  if (sameValue(oldValue, newValue)) return [];

  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const changes: DetailedChange[] = [];
    const length = Math.max(oldValue.length, newValue.length);
    for (let index = 0; index < length; index += 1) {
      changes.push(
        ...diffValues(rootField, oldValue[index], newValue[index], [
          ...path,
          `Mục ${index + 1}`,
        ]),
      );
    }
    return changes.length > 0
      ? changes
      : [{ label: getDetailLabel(rootField, path), oldValue, newValue }];
  }

  if (isObject(oldValue) && isObject(newValue)) {
    const changes: DetailedChange[] = [];
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    for (const key of keys) {
      changes.push(
        ...diffValues(rootField, oldValue[key], newValue[key], [
          ...path,
          key,
        ]),
      );
    }
    return changes;
  }

  return [{ label: getDetailLabel(rootField, path), oldValue, newValue }];
};

const getDetailedChanges = (
  item: MilitaryCvEditHistoryItem,
): DetailedChange[] =>
  item.changes.flatMap((change) =>
    diffValues(change.field, change.oldValue, change.newValue),
  );

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function MilitaryCvHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const recordId = Number(id);
  const [record, setRecord] = useState<MilitaryCvRecord | null>(null);
  const [items, setItems] = useState<MilitaryCvEditHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<HistoryFilters>(EMPTY_FILTERS);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recordResult, historyResult] = await Promise.all([
        militaryCvApi.getById(recordId),
        militaryCvApi.getHistory(recordId, {
          page,
          limit: PAGE_SIZE,
          search: appliedFilters.search,
          field: appliedFilters.field,
          dateFrom: appliedFilters.dateFrom,
          dateTo: appliedFilters.dateTo,
        }),
      ]);
      setRecord(recordResult);
      setItems(historyResult.data);
      setTotal(historyResult.total);
      setExpandedRows(new Set());
    } catch {
      toast.error("Không thể tải lịch sử chỉnh sửa hồ sơ.");
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, recordId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (
        filters.dateFrom &&
        filters.dateTo &&
        filters.dateFrom > filters.dateTo
      ) {
        return;
      }
      setPage(1);
      setAppliedFilters({ ...filters, search: filters.search.trim() });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [filters]);

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const toggleRow = (idValue: string | number) => {
    const key = String(idValue);
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5c8] bg-[#f7f9f1] p-5">
        <button
          type="button"
          onClick={() => router.push(`/military-cv/${recordId}`)}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-[#546a2f]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại hồ sơ
        </button>
        <div className="text-right">
          <h1 className="flex items-center justify-end gap-2 text-xl font-bold text-gray-900">
            <History className="h-5 w-5 text-[#657b36]" /> Lịch sử chỉnh sửa
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {record?.full_name ?? `Hồ sơ #${recordId}`}
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-gray-600">
            Người chỉnh sửa
          </span>
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Nhập tên người chỉnh sửa"
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#657b36]"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-gray-600">
            Nội dung sửa
          </span>
          <select
            value={filters.field}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                field: event.target.value,
              }))
            }
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#657b36]"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-gray-600">Từ ngày</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                dateFrom: event.target.value,
              }))
            }
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#657b36]"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-gray-600">Đến ngày</span>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                dateTo: event.target.value,
              }))
            }
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#657b36]"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="font-semibold text-gray-800">
            Danh sách lần chỉnh sửa
          </h2>
          <span className="text-sm text-gray-500">Tổng: {total}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Thời điểm</th>
                <th className="px-4 py-3">Người chỉnh sửa</th>
                <th className="px-4 py-3">Nội dung thay đổi</th>
                <th className="px-4 py-3 text-center">Số nội dung đã sửa</th>
                <th className="px-4 py-3 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Đang tải lịch sử...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    Không có lịch sử phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const expanded = expandedRows.has(String(item.id));
                  const detailedChanges = getDetailedChanges(item);
                  const preview = detailedChanges.slice(0, 3);
                  return (
                    <Fragment key={item.id}>
                      <tr className="align-top hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-800">
                          <span className="mb-1 block text-xs font-normal text-gray-400">
                            Người chỉnh sửa
                          </span>
                          {item.actor_name}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            {preview.map((change, index) => (
                              <p
                                key={`${item.id}-preview-${index}`}
                                className="text-gray-600"
                              >
                                <span className="font-semibold text-gray-800">
                                  {change.label}:
                                </span>{" "}
                                {formatSummary(change.oldValue)} →{" "}
                                {formatSummary(change.newValue)}
                              </p>
                            ))}
                            {detailedChanges.length > 3 && (
                              <p className="text-xs font-semibold text-[#657b36]">
                                Còn {detailedChanges.length - 3} thay đổi khác
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex rounded-full bg-[#eef3e4] px-2.5 py-1 font-semibold text-[#546a2f]">
                            {item.changes.length}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleRow(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 font-semibold text-gray-600 hover:bg-gray-50"
                          >
                            {expanded ? "Thu gọn" : "Xem"}
                            {expanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={5} className="px-5 py-4">
                            <div className="space-y-3">
                              {detailedChanges.map((change, index) => (
                                <div
                                  key={`${item.id}-detail-${index}`}
                                  className="grid gap-2 rounded-lg border border-gray-200 bg-white p-3 md:grid-cols-[190px_1fr_24px_1fr] md:items-start"
                                >
                                  <p className="text-sm font-semibold text-gray-700">
                                    {change.label}
                                  </p>
                                  <p className="break-words rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {formatValue(change.oldValue)}
                                  </p>
                                  <span className="hidden pt-2 text-center text-gray-400 md:block">
                                    →
                                  </span>
                                  <p className="break-words rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                    {formatValue(change.newValue)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex justify-end">
          <AppPagination
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
