"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type DialogRootProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogRootProps) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-10">{children}</div>
    </div>,
    document.body
  );
}

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogContent({ className, ...props }: DivProps) {
  // Prevent background scroll while dialog is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "w-full max-w-lg rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg border border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}

export function DialogHeader({ className, ...props }: DivProps) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: DivProps) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />;
}