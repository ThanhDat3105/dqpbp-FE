import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/services/api/auth"

export type UserRole = User["role"]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasPermission(
  currentRole: UserRole | null | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!currentRole) return false
  return allowedRoles.includes(currentRole)
}
