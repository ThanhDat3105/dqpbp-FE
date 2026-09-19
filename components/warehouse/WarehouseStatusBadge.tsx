import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WarehouseStatus } from "@/services/api/warehouse";
import { getStatusOption } from "./constants";

interface WarehouseStatusBadgeProps {
  status: WarehouseStatus;
  /** Nhãn từ BE (status_label); fallback về nhãn cứng nếu thiếu */
  label?: string;
  className?: string;
}

export function WarehouseStatusBadge({
  status,
  label,
  className,
}: WarehouseStatusBadgeProps) {
  const option = getStatusOption(status);

  return (
    <Badge
      variant="outline"
      className={cn(option.className, "font-semibold", className)}
    >
      {label || option.label}
    </Badge>
  );
}
