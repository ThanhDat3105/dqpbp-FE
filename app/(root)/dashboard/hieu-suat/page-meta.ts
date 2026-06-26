type AppRole = "CHI_HUY" | "TO_TRUONG" | "DQTT" | "DQCD" | "ADMIN";

export const ALLOWED_ROLES: AppRole[] = ["CHI_HUY", "TO_TRUONG", "DQTT", "ADMIN"];

export function getPageMeta(
  role: AppRole | undefined,
  departmentName: string | null | undefined,
  memberCount: number,
  deptCount: number,
): { title: string; subtitle: string } {
  switch (role) {
    case "CHI_HUY":
    case "ADMIN":
      return {
        title: "Hiệu suất Lực lượng — Tổng quan",
        subtitle: `Toàn lực lượng · ${deptCount} tổ`,
      };
    case "TO_TRUONG":
      return {
        title: `Hiệu suất ${departmentName ?? "Tổ"} — Quản lý`,
        subtitle: `Phạm vi: ${departmentName ?? "Tổ"} · ${memberCount} thành viên`,
      };
    case "DQTT":
      return {
        title: "Hiệu suất cá nhân",
        subtitle: "Phạm vi: cá nhân",
      };
    default:
      return { title: "Hiệu suất", subtitle: "" };
  }
}
