import { axiosInstance } from "@/lib/axios.config";
import type {
  KpiTargetHistoryQuery,
  KpiTargetHistoryResponse,
} from "@/types/kpi-target-history";

async function getHistory(
  params: KpiTargetHistoryQuery,
): Promise<KpiTargetHistoryResponse> {
  const response = await axiosInstance.get<KpiTargetHistoryResponse>(
    "/api/kpi-targets/history",
    { params },
  );
  return response.data;
}

export const kpiTargetHistoryApi = { getHistory };
