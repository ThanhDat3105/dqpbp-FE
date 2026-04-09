import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "../ui/multi-select";
import { departments } from "@/services/api/activity";
import { useState } from "react";

const user = [
  {
    id: "u1",
    name: "Ngô Trương Định",
    address: "12 Đường Bình Phú, KP.1",
    lat: 10.7531,
    lng: 106.6272,
    phone: "0901234001",
    cccd: "079201001001",
  },
  {
    id: "u2",
    name: "Ngô Hoài Bảo",
    address: "45 Đường Lê Tấn Kế, KP.1",
    lat: 10.7537,
    lng: 106.6265,
    phone: "0901234002",
    cccd: "079201001002",
  },
  {
    id: "u3",
    name: "Nguyễn Lý Minh Quang",
    address: "78 Đường Bình Phú, KP.2",
    lat: 10.7525,
    lng: 106.6281,
    phone: "0901234003",
    cccd: "079201001003",
  },
  {
    id: "u4",
    name: "Nguyễn Thành Tài",
    address: "23 Đường Hồ Học Lãm, KP.2",
    lat: 10.7542,
    lng: 106.6258,
    phone: "0901234004",
    cccd: "079201001004",
  },
  {
    id: "u5",
    name: "Trần Hoàng Phi",
    address: "31 Đường Bình Phú, KP.11",
    lat: 10.7495,
    lng: 106.6325,
    phone: "0901234023",
    cccd: "079201001023",
  },
  {
    id: "u6",
    name: "Lưu Vĩnh Cơ",
    address: "112 Đường Lê Tấn Kế, KP.11",
    lat: 10.7565,
    lng: 106.623,
    phone: "0901234024",
    cccd: "079201001024",
  },
  {
    id: "u7",
    name: "Lê Hải Triều",
    address: "48 Đường Hồ Học Lãm, KP.12",
    lat: 10.7508,
    lng: 106.6308,
    phone: "0901234025",
    cccd: "079201001025",
  },
  {
    id: "u8",
    name: "Hoàng Phạm Thế Lộc",
    address: "175 Đường An Dương Vương, KP.12",
    lat: 10.755,
    lng: 106.6248,
    phone: "0901234026",
    cccd: "079201001026",
  },
  {
    id: "u9",
    name: "Vương Quý Thắng",
    address: "64 Đường Bình Phú, KP.11",
    lat: 10.7538,
    lng: 106.627,
    phone: "0901234027",
    cccd: "079201001027",
  },
];

interface Props {
  openMobilizeModal: boolean;
  setOpenMobilizeModal: (open: boolean) => void;
  loading: boolean;
}

export default function MobilizeDialog({
  loading,
  openMobilizeModal,
  setOpenMobilizeModal,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<string[]>([]);

  return (
    <Dialog open={openMobilizeModal} onOpenChange={setOpenMobilizeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều động DQCĐ</DialogTitle>
          <DialogDescription>Chọn DQCĐ để điều động</DialogDescription>
        </DialogHeader>

        {/* Status Select */}
        <div className="flex flex-col space-y-4 py-4">
          <Label htmlFor="status-select" className="text-gray-700">
            Chọn DQCĐ
          </Label>
          <MultiSelect
            options={user.map((u) => ({ value: u.id, label: u.name }))}
            value={selectedUser}
            onValueChange={(value) => {
              setSelectedUser(value);
            }}
            placeholder="Chọn người thực hiện..."
          />
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenMobilizeModal(false)}
            disabled={loading}
          >
            Đóng
          </Button>
          <Button
            onClick={() => setOpenMobilizeModal(false)}
            disabled={loading}
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
