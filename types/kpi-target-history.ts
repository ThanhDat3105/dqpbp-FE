export type KpiTargetHistoryAction =
  | "UPDATE_TARGET"
  | "UPDATE_ALLOCATION"
  | "ADD_LINE"
  | "DELETE_LINE";

export interface KpiTargetHistoryItem {
  id: number;
  changedAt: string;
  changedBy: { id: number; name: string };
  teamId: number;
  teamName: string;
  lineId: number;
  lineName: string;
  action: KpiTargetHistoryAction;
  oldValue: unknown | null;
  newValue: unknown | null;
}

export interface KpiTargetHistoryResponse {
  total: number;
  items: KpiTargetHistoryItem[];
}

export interface KpiTargetHistoryQuery {
  teamId?: number;
  year?: number;
  page?: number;
  size?: number;
}
