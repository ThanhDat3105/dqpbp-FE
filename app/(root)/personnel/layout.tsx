'use client'

import { useAuth } from "@/context/AuthContext";
import { hasPermission, UserRole } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const ALLOWED_ROLES: UserRole[] = ["CHI_HUY", "TO_TRUONG"];

export default function layout({ children }: { children: React.ReactNode }) {
  const { user, isLoadingFetchUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingFetchUser) return;
    if (user && !hasPermission(user.role, ALLOWED_ROLES)) {
      router.replace("/");
      toast.error("Bạn không có quyền truy cập trang này.");
    }
  }, [user, isLoadingFetchUser, router]);

  if (user && !hasPermission(user.role, ALLOWED_ROLES)) return null;

  return <>{children}</>;
}
