import type { Person, PersonType } from "@/components/map/types";
import { axiosInstance } from "@/lib/axios.config";

type ApiPersonType = "dqcd" | "quan_nhan_du_bi" | "tuoi_17";

interface ApiMapPerson {
  id: string;
  name?: string | null;
  full_name?: string | null;
  type: ApiPersonType;
  neighborhood?: string | null;
  unit_code?: string | null;
  address?: string | null;
  permanent_address?: string | null;
  temporary_address?: string | null;
  permanent_address_lat?: number | string | null;
  permanent_address_lng?: number | string | null;
  temporary_address_lat?: number | string | null;
  temporary_address_lng?: number | string | null;
  enlistment_date?: string | null;
  service_start_date?: string | null;
  date_of_birth?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
}

const TYPE_MAP: Record<ApiPersonType, PersonType> = {
  dqcd: "DQCD",
  quan_nhan_du_bi: "QUAN_NHAN_DU_BI",
  tuoi_17: "TUOI_17",
};

function toCoord(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Ưu tiên toạ độ thường trú -> tạm trú -> toạ độ chung (users.lat/lng của DQCD).
 * Trả kèm địa chỉ tương ứng với toạ độ được chọn để popup không lệch dữ liệu.
 */
function resolveLocation(item: ApiMapPerson) {
  const candidates = [
    {
      lat: toCoord(item.permanent_address_lat),
      lng: toCoord(item.permanent_address_lng),
      address: item.permanent_address,
    },
    {
      lat: toCoord(item.temporary_address_lat),
      lng: toCoord(item.temporary_address_lng),
      address: item.temporary_address,
    },
    {
      lat: toCoord(item.lat),
      lng: toCoord(item.lng),
      address: item.address,
    },
  ];

  return candidates.find((c) => c.lat !== null && c.lng !== null) ?? null;
}

function getYear(value?: string | null) {
  if (!value) return new Date().getFullYear();
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? year : new Date().getFullYear();
}

function mapApiPerson(item: ApiMapPerson): Person | null {
  const location = resolveLocation(item);

  // Chưa có toạ độ trong DB thì không hiển thị marker
  if (!location) return null;

  return {
    id: `${item.type}-${item.id}`,
    name: item.name || item.full_name || "Chưa có tên",
    type: TYPE_MAP[item.type],
    kp: item.neighborhood || item.unit_code || "Chưa rõ KP",
    address:
      location.address ||
      item.address ||
      item.permanent_address ||
      item.temporary_address ||
      "Chưa có địa chỉ",
    yearJoined: getYear(item.enlistment_date || item.service_start_date),
    lat: location.lat as number,
    lng: location.lng as number,
  };
}

export async function getMapPersons() {
  const res = await axiosInstance.get("/api/ban-do/nhan-su");

  const rawData: ApiMapPerson[] = res.data?.metaData ?? [];

  return rawData
    .filter((item) => TYPE_MAP[item.type])
    .map(mapApiPerson)
    .filter((person): person is Person => person !== null);
}
