import { axiosInstance } from "@/lib/axios.config";
import type { Person, PersonType } from "@/components/map/types";

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
  enlistment_date?: string | null;
  service_start_date?: string | null;
  date_of_birth?: string | null;
  lat?: number | null;
  lng?: number | null;
}

const TYPE_MAP: Record<ApiPersonType, PersonType> = {
  dqcd: "DQCD",
  quan_nhan_du_bi: "QUAN_NHAN_DU_BI",
  tuoi_17: "TUOI_17",
};

function getYear(value?: string | null) {
  if (!value) return new Date().getFullYear();
  return new Date(value).getFullYear();
}

function mapApiPerson(item: ApiMapPerson): Person | null {
  if (item.lat == null || item.lng == null) return null;

  return {
    id: item.id,
    name: item.name || item.full_name || "Chưa có tên",
    type: TYPE_MAP[item.type],
    kp: item.neighborhood || item.unit_code || "Chưa rõ KP",
    address:
      item.address ||
      item.permanent_address ||
      item.temporary_address ||
      "Chưa có địa chỉ",
    yearJoined: getYear(item.enlistment_date || item.service_start_date),
    lat: Number(item.lat),
    lng: Number(item.lng),
  };
}

export async function getMapPersons() {
  const res = await axiosInstance.get("/api/ban-do/nhan-su");

  const rawData: ApiMapPerson[] = res.data?.metaData ?? [];

  return rawData.map(mapApiPerson).filter(Boolean) as Person[];
}