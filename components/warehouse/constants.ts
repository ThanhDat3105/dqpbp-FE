import type {
  WarehouseAction,
  WarehouseStatus,
} from "@/services/api/warehouse";

export const BRAND = "#556B2F";

export const STATUS_OPTIONS: {
  value: WarehouseStatus;
  label: string;
  className: string;
}[] = [
  {
    value: "IN_STOCK",
    label: "Còn hàng",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  {
    value: "LOW_STOCK",
    label: "Sắp hết",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "OUT_OF_STOCK",
    label: "Hết hàng",
    className: "border-red-200 bg-red-50 text-red-700",
  },
];

export const ACTION_OPTIONS: {
  value: WarehouseAction;
  label: string;
  className: string;
}[] = [
  {
    value: "CREATE_ITEM",
    label: "Thêm vật phẩm",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    value: "IMPORT",
    label: "Nhập thêm",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  {
    value: "EXPORT",
    label: "Xuất kho",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  {
    value: "ADJUST",
    label: "Kiểm kê",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    value: "UPDATE_ITEM",
    label: "Cập nhật thông tin",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  {
    value: "DELETE_ITEM",
    label: "Xoá vật phẩm",
    className: "border-red-200 bg-red-50 text-red-700",
  },
];

/** Khớp với requireRole ở backend/src/routes/warehouse/index.js */
export const CAN_WRITE_ROLES = ["DQTT", "TO_TRUONG", "CHI_HUY", "ADMIN"];
export const CAN_MANAGE_ROLES = ["CHI_HUY", "ADMIN"];

export const canWriteWarehouse = (role?: string | null) =>
  !!role && CAN_WRITE_ROLES.includes(role);

/** Xoá vật phẩm + kiểm kê: chỉ chỉ huy / admin */
export const canManageWarehouse = (role?: string | null) =>
  !!role && CAN_MANAGE_ROLES.includes(role);

export const getStatusOption = (status: WarehouseStatus) =>
  STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0];

export const getActionOption = (action: WarehouseAction) =>
  ACTION_OPTIONS.find((option) => option.value === action);

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatNumber = (value: number) => value.toLocaleString("vi-VN");
