import { format } from "date-fns";
import { AdminRegistration } from "@/services/api/website-registration";
import { CategoryBadge, StatusBadge } from "./RegistrationBadges";

export function RegistrationTable({
  registrations,
}: {
  registrations: AdminRegistration[];
}) {
  return (
    <div className="hidden sm:block flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">#</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-40">Họ tên</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Loại</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Số điện thoại</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">SĐT giám hộ</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Ngày sinh</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell min-w-40">Địa chỉ</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden xl:table-cell">Nơi làm việc</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell min-w-36">Ngày gửi</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg, idx) => (
            <tr
              key={reg.id}
              className={`border-b border-gray-100 transition-colors hover:bg-[#556B2F]/5 ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
              }`}
            >
              <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
              <td className="px-4 py-3 font-semibold text-gray-900 max-w-44 truncate">{reg.full_name}</td>
              <td className="px-4 py-3"><CategoryBadge category={reg.category} /></td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{reg.phone}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap hidden md:table-cell">{reg.guardian_phone || "—"}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap hidden lg:table-cell">
                {reg.dob ? format(new Date(reg.dob), "dd/MM/yyyy") : "—"}
              </td>
              <td className="px-4 py-3 text-gray-600 hidden lg:table-cell max-w-48 truncate">{reg.address}</td>
              <td className="px-4 py-3 text-gray-600 hidden xl:table-cell max-w-40 truncate">{reg.workplace || "—"}</td>
              <td className="px-4 py-3"><StatusBadge status={reg.status} /></td>
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap hidden md:table-cell">
                {format(new Date(reg.created_at), "dd/MM/yyyy HH:mm")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
