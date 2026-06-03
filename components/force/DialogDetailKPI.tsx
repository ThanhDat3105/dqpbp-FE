import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiDetailPanel } from "@/components/kpi/KpiDetailPanel";
import clsx from "clsx";
import {
  formatShift,
  PersonnelItem,
  ROLE_LABELS,
  STATUS_DOT,
  STATUS_LABELS,
} from "@/app/(root)/dashboard/force/page";
import { useState } from "react";
import { KpiPeriod } from "../kpi/KpiPageLayout";

interface Props {
  selectedPerson: PersonnelItem | null;
  setSelectedPerson: (person: PersonnelItem | null) => void;
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <span
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        color,
      )}
    >
      {initials}
    </span>
  );
}

export default function DialogDetailKPI({
  selectedPerson,
  setSelectedPerson,
}: Props) {
  const [kpiPeriod, setKpiPeriod] = useState<KpiPeriod>("month");

  return (
    <Dialog
      open={!!selectedPerson}
      onOpenChange={(open) => !open && setSelectedPerson(null)}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              {selectedPerson && <Avatar name={selectedPerson.name} />}
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900">
                  {selectedPerson?.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-semibold">
                    {ROLE_LABELS[selectedPerson?.role ?? ""] ??
                      selectedPerson?.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {selectedPerson?.department_name}
                  </span>
                  {selectedPerson && (
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                        selectedPerson.status === "on_duty" &&
                          "bg-green-100 text-green-700",
                        selectedPerson.status === "on_leave" &&
                          "bg-orange-100 text-orange-700",
                        selectedPerson.status === "training" &&
                          "bg-gray-100 text-gray-600",
                        selectedPerson.status === "other" &&
                          "bg-gray-800 text-white",
                      )}
                    >
                      <span
                        className={clsx(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          STATUS_DOT[selectedPerson.status],
                        )}
                      />
                      {STATUS_LABELS[selectedPerson.status] ??
                        selectedPerson.status}
                    </span>
                  )}
                  {selectedPerson?.shift_start_at && (
                    <span className="text-xs text-gray-400">
                      Vào ca: {formatShift(selectedPerson.shift_start_at)}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>

            <Select
              value={kpiPeriod}
              onValueChange={(v) => setKpiPeriod(v as KpiPeriod)}
            >
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
                <SelectItem value="quarter">Quý này</SelectItem>
                <SelectItem value="year">Năm này</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        <div className="mt-2">
          <KpiDetailPanel
            userId={selectedPerson?.id ?? null}
            period={kpiPeriod}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
