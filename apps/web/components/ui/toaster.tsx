"use client"

import { Toaster as Sonner, toast } from "sonner"

export { toast }

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "font-sans text-sm rounded-xl border border-border shadow-lg",
        },
      }}
    />
  )
}
