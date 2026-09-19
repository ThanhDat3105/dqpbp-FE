/**
 * Permission code có dạng `<nhóm>::<hành động>` (vd: role::addPermissions).
 * BE tự gom theo tiền tố trước "::"; ở đây chỉ dịch sang nhãn tiếng Việt.
 * Nhóm / hành động chưa có trong bảng vẫn hiển thị nguyên code, không bị ẩn.
 * Danh sách bám theo dqpbp-prisma/prisma/seeds/system/permissions.seed.ts
 */

const GROUP_LABELS: Record<string, string> = {
  user: "Người dùng",
  role: "Vai trò",
  permission: "Quyền",
  department: "Đơn vị",
  personnel: "Nhân sự",
  youth: "Thanh niên 17 tuổi",
  nguon: "Nguồn",
  qndb: "Quân nhân dự bị",
  registration: "Hồ sơ đăng ký",
  website_article: "Website · Tin tức",
  website_contact: "Website · Liên hệ",
  website_document: "Website · Văn bản",
  website_quick_link: "Website · Liên kết nhanh",
  website_slide: "Website · Slide",
  other: "Khác",
};

const ACTION_LABELS: Record<string, string> = {
  read: "Xem",
  create: "Thêm mới",
  update: "Chỉnh sửa",
  delete: "Xoá",
  import: "Nhập dữ liệu",
  promote: "Thăng cấp",
  addPermissions: "Gán quyền",
  removePermissions: "Gỡ quyền",
};

export const getGroupLabel = (group: string) => GROUP_LABELS[group] ?? group;

/** Tách phần hành động phía sau "::" */
export const getPermissionAction = (code: string) => {
  const separatorIndex = code.indexOf("::");
  return separatorIndex > 0 ? code.slice(separatorIndex + 2) : code;
};

/**
 * Nhãn ngắn cho một quyền. Ưu tiên nhãn hành động vì tên nhóm đã nằm ở tiêu đề
 * section rồi (mô tả của BE dạng "Quyền đọc/xem User" sẽ bị lặp).
 * Hành động lạ thì mới dùng description của BE.
 */
export const getPermissionLabel = (
  code: string,
  description?: string | null,
) => {
  const action = getPermissionAction(code);
  return ACTION_LABELS[action] ?? description?.trim() ?? action;
};
