"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";

export function Dialog({ open, onOpenChange, title, description, close, variant = "center", children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  close: string;
  variant?: "center" | "drawer";
  children: ReactNode;
}) {
  const trigger = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="overlay" />
        <DialogPrimitive.Content className={`dialog dialog--${variant}`}
          onCloseAutoFocus={(event) => {
            // Some triggers are external to Radix. Restore the last focused control.
            event.preventDefault();
            const previous = trigger.current;
            if (previous?.isConnected) previous.focus();
            else document.querySelector<HTMLElement>("[data-cart-trigger]")?.focus();
          }}
          onOpenAutoFocus={() => {
            if (document.activeElement instanceof HTMLElement) trigger.current = document.activeElement;
          }}
        >
          <div className="dialog-heading">
            <DialogPrimitive.Title asChild><h2>{title}</h2></DialogPrimitive.Title>
            <DialogPrimitive.Close className="icon-button icon-button--outline" aria-label={close}><X size={20} /></DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
