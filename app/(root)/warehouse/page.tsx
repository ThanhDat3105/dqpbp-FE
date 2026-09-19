import { Suspense } from "react";
import { WarehouseLayout } from "@/components/warehouse/WarehouseLayout";

export default function WarehousePage() {
  // WarehouseLayout đọc ?tab= bằng useSearchParams nên bắt buộc có Suspense
  // boundary. Fallback để trống vì layout (root) đã chặn bằng màn hình kiểm tra
  // quyền truy cập trước khi children được render.
  return (
    <Suspense>
      <WarehouseLayout />
    </Suspense>
  );
}
