// sidebar.config.ts
import {
  Article,
  Assessment,
  Event,
  Group,
  Map,
  Warehouse,
} from "@mui/icons-material";
import { FileCheck2, Globe, LayoutList, MessageSquare } from "lucide-react";
import type { ElementType } from "react";

export type MenuRole = "DQTT" | "CHI_HUY" | "DQCD" | "TO_TRUONG";

export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: ElementType;
  role?: MenuRole[];
  hiddenForRoles?: MenuRole[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  // {
  //   id: "home",
  //   label: "Trang chủ",
  //   href: "/",
  //   icon: Home,
  // },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Assessment,
    role: ["CHI_HUY", "TO_TRUONG"],
    children: [
      // {
      //   id: "dashboard-summary",
      //   label: "Tổng hợp",
      //   href: "/dashboard/tong-hop",
      //   icon: Assessment,
      // },
      {
        id: "dashboard-warehouse",
        label: "Vật chất trang bị",
        href: "/dashboard/warehouse",
        icon: Assessment,
      },
      {
        id: "dashboard-forces",
        label: "Hiệu suất làm việc",
        href: "/dashboard/force",
        icon: Assessment,
      },
    ],
  },
  {
    id: "activities",
    label: "Công tác",
    icon: Event,
    children: [
      {
        id: "activities-list",
        label: "Nhiệm vụ",
        href: "/activities",
        icon: Event,
        hiddenForRoles: ["DQCD"],
      },
      {
        id: "activities-calendar",
        label: "Lịch công tác",
        href: "/calendar",
        icon: Event,
      },
      {
        id: "activities-qdtt",
        label: "Lịch Trực Tuần",
        href: "/calendar-qdtt",
        icon: Event,
      },
      {
        id: "templates",
        label: "Mẫu VB, KH, BC",
        href: "/templates",
        icon: Event,
        hiddenForRoles: ["DQCD", "DQTT"],
      },
    ],
  },
  {
    id: "personnel",
    label: "Thuộc diện QL",
    role: ["CHI_HUY", "TO_TRUONG", "DQTT"],
    icon: Group,
    children: [
      {
        id: "personnel-age17",
        label: "Tuổi 17",
        href: "/personnel/17tuoi",
        hiddenForRoles: ["DQCD", "DQTT"],
        icon: Group,
      },
      {
        id: "personnel-source",
        label: "Nguồn NVQS",
        href: "/personnel/nguon",
        hiddenForRoles: ["DQCD", "DQTT"],
        icon: Group,
      },
      {
        id: "personnel-reserve",
        label: "Quân nhân dự bị",
        href: "/personnel/Quannhandubi",
        hiddenForRoles: ["DQCD", "DQTT"],
        icon: Group,
      },
      {
        id: "DQTT",
        label: "DQTT",
        href: "/personnel/dqtt",
        hiddenForRoles: ["DQCD", "DQTT"],
        icon: Group,
      },
      {
        id: "activities-qdcd",
        label: "Lịch làm việc DQCĐ",
        href: "/calendar-qdcd",
        icon: Event,
      },
      {
        id: "personnel-registrations",
        label: "Hồ sơ đăng ký",
        href: "/personnel/ho-so-dang-ky",
        hiddenForRoles: ["DQCD", "DQTT"],
        icon: FileCheck2,
      },
    ],
  },
  {
    id: "ban-do",
    label: "Bản đồ",
    href: "/ban-do",
    icon: Map,
    role: ["CHI_HUY", "TO_TRUONG"],
  },
  {
    id: "document",
    label: "Tài liệu QS-QP",
    href: "/document",
    icon: Article,
  },
  {
    id: "warehouse",
    label: "Hậu cần",
    href: "/warehouse",
    icon: Warehouse,
    role: ["CHI_HUY", "TO_TRUONG"],
  },
  {
    id: "website-cms",
    label: "Trang thông tin",
    icon: Globe,
    href: "/website",
  },
  {
    id: "manage-website-cms",
    label: "Manage CMS",
    icon: Globe,
    role: ["CHI_HUY", "TO_TRUONG"],
    children: [
      {
        id: "website-cms-news",
        label: "Tin tức",
        href: "/quan-ly/website/tin-tuc",
        icon: Globe,
      },
      {
        id: "website-cms-docs",
        label: "Văn bản",
        href: "/quan-ly/website/van-ban",
        icon: Globe,
      },
      {
        id: "website-cms-slides",
        label: "Slide ảnh",
        href: "/quan-ly/website/slide",
        icon: Globe,
      },
      {
        id: "website-cms-registrations",
        label: "Quản lý hồ sơ đăng ký",
        href: "/quan-ly/website/ho-so-dang-ky",
        icon: FileCheck2,
      },
      {
        id: "website-cms-contacts",
        label: "Liên hệ",
        href: "/quan-ly/website/lien-he",
        icon: MessageSquare,
      },
    ],
  },
];

export const menuConfigMobile: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Assessment,
    href: "/dashboard/force",
    role: ["CHI_HUY"],
  },
  {
    id: "activities",
    label: "Công tác",
    href: "/activities",
    icon: Event,
  },
  {
    id: "ban-do",
    label: "Bản đồ",
    href: "/ban-do",
    icon: Map,
    role: ["CHI_HUY"],
  },
  {
    id: "document",
    label: "Tài liệu",
    href: "/document",
    icon: Article,
    role: ["CHI_HUY"],
  },
];

export const menuConfigMobileUser: MenuItem[] = [
  {
    id: "activities-list",
    label: "Danh sách",
    href: "/activities",
    icon: LayoutList,
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
];
