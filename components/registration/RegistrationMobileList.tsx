import { format } from "date-fns";
import { AdminRegistration } from "@/services/api/website-registration";
import { CategoryBadge, StatusBadge } from "./RegistrationBadges";

export function RegistrationMobileList({
  registrations,
}: {
  registrations: AdminRegistration[];
}) {
  return (
    <div className="flex-1 overflow-auto sm:hidden space-y-3 px-1 pb-4">
      {registrations.map((reg) => (
        <div
          key={reg.id}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <StatusBadge status={reg.status} />
            <CategoryBadge category={reg.category} />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {reg.full_name}
          </h3>
          <div className="text-xs text-gray-600 space-y-0.5">
            <div>SĐT: {reg.phone}</div>
            {reg.guardian_phone && <div>SĐT giám hộ: {reg.guardian_phone}</div>}
            <div>Địa chỉ: {reg.address}</div>
            {reg.workplace && <div>Nơi làm việc: {reg.workplace}</div>}
            {reg.dob && (
              <div>Ngày sinh: {format(new Date(reg.dob), "dd/MM/yyyy")}</div>
            )}
            <div className="text-gray-400 pt-1">
              Ngày gửi: {format(new Date(reg.created_at), "dd/MM/yyyy HH:mm")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
