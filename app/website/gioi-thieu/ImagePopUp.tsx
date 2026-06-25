"use client";

import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

type ImagePopupProps = {
  imageUrl: string | null;
  onClose: () => void;
};

export default function ImagePopup({ imageUrl, onClose }: ImagePopupProps) {
  return (
    <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay
          onClick={onClose}
          className="fixed inset-0 z-[9998] bg-black/80"
        />

        <DialogPrimitive.Content
          className="
            fixed left-1/2 top-1/2 z-[9999]
            -translate-x-1/2 -translate-y-1/2
            border-none bg-transparent p-0 shadow-none
            outline-none
            w-fit h-fit
          "
        >
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>

          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Preview"
              width={1600}
              height={1200}
              priority
              className="
                max-w-[90vw]
                max-h-[90vh]
                w-auto
                h-auto
                object-contain
              "
            />
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}