"use client";

import { useEffect, useState } from "react";
import { warehouseApi } from "@/services/api/warehouse";

/**
 * Danh mục đang thực sự có trong kho, lấy từ GET /api/warehouse/meta.
 * Không hardcode vì mỗi đơn vị đặt danh mục theo loại kho của mình.
 */
export function useWarehouseCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    warehouseApi
      .getMeta()
      .then((meta) => {
        if (active) setCategories(meta.categories);
      })
      .catch(() => {
        // Danh mục chỉ là gợi ý — lỗi ở đây không nên chặn cả trang
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}
