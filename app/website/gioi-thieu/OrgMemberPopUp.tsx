"use client";

import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrgMember {
  avatar: string;
  name: string;
  role: string;
  birthYear: string;
}

interface OrgMemberPopUpProps {
  selectedMember: OrgMember | null;
  setSelectedMember: Dispatch<SetStateAction<OrgMember | null>>;
}

export default function OrgMemberPopUp({
  selectedMember,
  setSelectedMember,
}: OrgMemberPopUpProps) {
  return (
    <Dialog
      open={!!selectedMember}
      onOpenChange={() => setSelectedMember(null)}
    >
      <DialogContent className="sm:max-w-md overflow-hidden p-0 rounded-2xl">
        {selectedMember && (
          <>
            <div className="bg-[#546a2f] text-white px-5 py-4 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white">
                <Image
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                />
              </div>

              <DialogHeader>
                <DialogTitle className="text-sm text-white">
                  {selectedMember.role}
                </DialogTitle>

                <p className="text-lg font-bold">
                  {selectedMember.name}
                </p>
              </DialogHeader>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Họ và tên</span>
                <span className="font-semibold">
                  {selectedMember.name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Chức vụ</span>
                <span className="font-semibold">
                  {selectedMember.role}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Năm sinh</span>
                <span className="font-semibold">
                  {selectedMember.birthYear}
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}