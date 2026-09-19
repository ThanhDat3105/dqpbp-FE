import { axiosInstance } from "@/lib/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  code: string;
  description: string | null;
  /** Role hiện tại có quyền này hay chưa */
  active: boolean;
}

/** BE gom permission theo tiền tố trước "::" (vd: role::read -> nhóm "role") */
export interface PermissionGroup {
  group: string;
  items: Permission[];
}

/** GET /api/roles/:id trả về role kèm TOÀN BỘ permission, mỗi cái có cờ active */
export interface RoleDetail extends Role {
  permissions: PermissionGroup[];
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
  /** Gán sẵn quyền ngay lúc tạo — BE xử lý trong cùng transaction */
  permission_ids?: number[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Interceptor trong axios.config bọc lỗi lại thành { message, status, data },
 * message tiếng Việt thật do BE trả về nằm trong data.message.
 */
export const getRoleErrorMessage = (
  err: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại",
): string => {
  const error = err as {
    data?: { message?: string };
    message?: string;
    status?: number | string;
  };
  return error?.data?.message || error?.message || fallback;
};

/** BE chặn bằng requirePermission -> 403 khi tài khoản không đủ quyền */
export const isForbiddenError = (err: unknown): boolean =>
  (err as { status?: number | string })?.status === 403;

// ─── API functions ────────────────────────────────────────────────────────────

const getAll = async (search?: string): Promise<Role[]> => {
  const res = await axiosInstance.get("/api/roles", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return res.data.metaData;
};

/** POST /api/roles — BE chặn trùng tên, trả về role vừa tạo (chưa kèm permissions) */
const create = async (payload: CreateRolePayload): Promise<Role> => {
  const res = await axiosInstance.post("/api/roles", {
    name: payload.name.trim(),
    description: payload.description?.trim() || undefined,
    permission_ids: payload.permission_ids ?? [],
  });
  return res.data.metaData;
};

const getById = async (id: number): Promise<RoleDetail> => {
  const res = await axiosInstance.get(`/api/roles/${id}`);
  return res.data.metaData;
};

/** Gán thêm quyền cho role — BE dùng createMany + skipDuplicates nên gọi lại an toàn */
const addPermissions = async (
  id: number,
  permissionIds: number[],
): Promise<RoleDetail> => {
  const res = await axiosInstance.post(`/api/roles/${id}/add-permissions`, {
    permission_ids: permissionIds,
  });
  return res.data.metaData;
};

/** Gỡ quyền khỏi role */
const removePermissions = async (
  id: number,
  permissionIds: number[],
): Promise<RoleDetail> => {
  const res = await axiosInstance.post(`/api/roles/${id}/remove-permissions`, {
    permission_ids: permissionIds,
  });
  return res.data.metaData;
};

export const roleApi = {
  getAll,
  getById,
  create,
  addPermissions,
  removePermissions,
};
