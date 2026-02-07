"use client"

import type { ComponentProps } from "react"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-gray-900 group-[.toaster]:ring-1 group-[.toaster]:ring-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-brand-primary group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:rounded-lg group-[.toast]:font-medium",
          success:
            "group-[.toaster]:bg-white/90 group-[.toaster]:text-gray-900 group-[.toaster]:ring-success",
          error:
            "group-[.toaster]:bg-white/90 group-[.toaster]:text-gray-900 group-[.toaster]:ring-error",
          warning:
            "group-[.toaster]:bg-white/90 group-[.toaster]:text-gray-900 group-[.toaster]:ring-warning",
          info:
            "group-[.toaster]:bg-white/90 group-[.toaster]:text-gray-900 group-[.toaster]:ring-brand-primary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
