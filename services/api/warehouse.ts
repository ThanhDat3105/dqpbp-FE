import { axiosInstance } from "@/lib/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Danh mục là chuỗi tự do; gợi ý lấy từ GET /api/warehouse/meta */
export type WarehouseCategory = string;

/** Trạng thái tồn kho — do trigger DB tự tính, client không set được */
export type WarehouseStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type WarehouseAction =
  | "CREATE_ITEM"
  | "IMPORT"
  | "EXPORT"
  | "ADJUST"
  | "UPDATE_ITEM"
  | "DELETE_ITEM";

export interface WarehouseItem {
  id: number;
  name: string;
  category: WarehouseCategory;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  status: WarehouseStatus;
  status_label: string;
  is_low_stock: boolean;
  note: string | null;
  created_by: number | null;
  created_by_name: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarehouseTransaction {
  id: number;
  item_id: number | null;
  item_name: string;
  action: WarehouseAction;
  action_label: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  note: string | null;
  performed_by: number | null;
  performed_by_name: string | null;
  performed_by_email?: string | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface WarehouseStats {
  summary: {
    total_items: number;
    total_quantity: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  by_category: {
    category: WarehouseCategory;
    item_count: number;
    total_quantity: number;
  }[];
  recent_transactions: WarehouseTransaction[];
}

export interface WarehouseMeta {
  categories: WarehouseCategory[];
  statuses: { value: WarehouseStatus; label: string }[];
  actions: { value: WarehouseAction; label: string }[];
}

export interface WarehouseListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: WarehouseCategory | "";
  status?: WarehouseStatus | "";
  sort_by?:
    | "name"
    | "category"
    | "quantity"
    | "status"
    | "created_at"
    | "updated_at";
  sort_order?: "ASC" | "DESC";
}

export interface WarehouseTransactionParams {
  page?: number;
  limit?: number;
  item_id?: number;
  action?: WarehouseAction | "";
  performed_by?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export interface WarehouseCreatePayload {
  name: string;
  category: WarehouseCategory;
  quantity?: number;
  unit?: string;
  low_stock_threshold?: number;
  note?: string;
}

/** Số lượng không sửa ở đây — dùng importStock / exportStock / adjustStock */
export interface WarehouseUpdatePayload {
  name?: string;
  category?: WarehouseCategory;
  unit?: string;
  low_stock_threshold?: number;
  note?: string;
  reason?: string;
}

export interface StockMovementPayload {
  quantity: number;
  note?: string;
}

export interface StockMovementResult {
  item: WarehouseItem;
  transaction: WarehouseTransaction;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Bỏ các param rỗng để không gửi `?search=&category=` lên BE */
const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );

/**
 * Interceptor trong axios.config bọc lỗi thành { message, data, ... },
 * còn message tiếng Việt thật nằm trong data.message do BE trả về.
 */
export const getWarehouseErrorMessage = (
  err: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại",
): string => {
  const error = err as { data?: { message?: string }; message?: string };
  return error?.data?.message || error?.message || fallback;
};

// ─── API functions ────────────────────────────────────────────────────────────

const getList = async (
  params: WarehouseListParams,
): Promise<Paginated<WarehouseItem>> => {
  const res = await axiosInstance.get("/api/warehouse/list", {
    params: clean({
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search,
      category: params.category,
      status: params.status,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    }),
  });
  return res.data.metaData;
};

const getById = async (id: number): Promise<WarehouseItem> => {
  const res = await axiosInstance.get(`/api/warehouse/${id}`);
  return res.data.metaData;
};

const getMeta = async (): Promise<WarehouseMeta> => {
  const res = await axiosInstance.get("/api/warehouse/meta");
  return res.data.metaData;
};

const getStats = async (): Promise<WarehouseStats> => {
  const res = await axiosInstance.get("/api/warehouse/stats");
  return res.data.metaData;
};

const create = async (
  payload: WarehouseCreatePayload,
): Promise<WarehouseItem> => {
  const res = await axiosInstance.post("/api/warehouse", payload);
  return res.data.metaData;
};

const update = async (
  id: number,
  payload: WarehouseUpdatePayload,
): Promise<WarehouseItem> => {
  const res = await axiosInstance.put(`/api/warehouse/${id}`, payload);
  return res.data.metaData;
};

const remove = async (
  id: number,
  note?: string,
): Promise<{ deleted_id: number; name: string }> => {
  const res = await axiosInstance.delete(`/api/warehouse/${id}`, {
    data: note ? { note } : undefined,
  });
  return res.data.metaData;
};

/** Nhập thêm hàng — cộng vào tồn kho */
const importStock = async (
  id: number,
  payload: StockMovementPayload,
): Promise<StockMovementResult> => {
  const res = await axiosInstance.post(`/api/warehouse/${id}/import`, payload);
  return res.data.metaData;
};

/** Xuất kho — trừ khỏi tồn kho */
const exportStock = async (
  id: number,
  payload: StockMovementPayload,
): Promise<StockMovementResult> => {
  const res = await axiosInstance.post(`/api/warehouse/${id}/export`, payload);
  return res.data.metaData;
};

/** Kiểm kê — set tồn kho về số lượng thực tế đếm được */
const adjustStock = async (
  id: number,
  payload: StockMovementPayload,
): Promise<StockMovementResult> => {
  const res = await axiosInstance.post(`/api/warehouse/${id}/adjust`, payload);
  return res.data.metaData;
};

const getTransactions = async (
  params: WarehouseTransactionParams,
): Promise<Paginated<WarehouseTransaction>> => {
  const res = await axiosInstance.get("/api/warehouse/transactions", {
    params: clean({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      item_id: params.item_id,
      action: params.action,
      performed_by: params.performed_by,
      from_date: params.from_date,
      to_date: params.to_date,
      search: params.search,
    }),
  });
  return res.data.metaData;
};

const getItemTransactions = async (
  id: number,
  params: Omit<WarehouseTransactionParams, "item_id"> = {},
): Promise<Paginated<WarehouseTransaction>> => {
  const res = await axiosInstance.get(`/api/warehouse/${id}/transactions`, {
    params: clean({
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      action: params.action,
      from_date: params.from_date,
      to_date: params.to_date,
    }),
  });
  return res.data.metaData;
};

export const warehouseApi = {
  getList,
  getById,
  getMeta,
  getStats,
  create,
  update,
  remove,
  importStock,
  exportStock,
  adjustStock,
  getTransactions,
  getItemTransactions,
};
