// sidebar.config.ts
import { Home, Assessment, Event, Group } from "@mui/icons-material";
import type { ElementType } from "react";

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: ElementType;
  role?: "STANDING_MILITIA" | "COMMANDER";
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    id: "home",
    label: "Trang chủ",
    href: "/",
    icon: Home,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Assessment,
    role: "COMMANDER",
    children: [
      {
        id: "dashboard-summary",
        label: "Tổng hợp",
        href: "/dashboard/tong-hop",
        icon: Assessment,
      },
      {
        id: "dashboard-facebook",
        label: "Facebook",
        href: "/dashboard/facebook",
        icon: Assessment,
      },
      {
        id: "dashboard-warehouse",
        label: "Kho",
        href: "/dashboard/kho",
        icon: Assessment,
      },
      {
        id: "dashboard-forces",
        label: "Lực lượng",
        href: "/dashboard/luc-luong",
        icon: Assessment,
      },
    ],
  },
  {
    id: "activities",
    label: "Hoạt động",
    icon: Event,
    children: [
      {
        id: "activities-list",
        label: "Danh sách",
        href: "/activities",
        icon: Event,
      },
      {
        id: "activities-calendar",
        label: "Lịch",
        href: "/calendar",
        icon: Event,
      },
      {
        id: "activities-qdtt",
        label: "Lịch Trực DQTT",
        href: "/calendar-qdtt",
        icon: Event,
      },
      {
        id: "activities-qdcd",
        label: "Lịch Trực DQCĐ",
        href: "/calendar-qdcd",
        icon: Event,
      },
    ],
  },
  {
    id: "personnel",
    label: "Nhân sự",
    icon: Group,
    children: [
      {
        id: "personnel-age17",
        label: "Tuổi 17",
        href: "/nhansu/17tuoi",
        icon: Group,
      },
      {
        id: "personnel-source",
        label: "Nguồn",
        href: "/nhansu/nguon",
        icon: Group,
      },
      {
        id: "personnel-reserve",
        label: "Quân nhân dự bị",
        href: "/nhansu/Quannhandubi",
        icon: Group,
      },
    ],
  },
];
