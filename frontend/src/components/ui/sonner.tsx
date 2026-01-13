"use client"

import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-zinc-950 group-[.toaster]:ring-1 group-[.toaster]:ring-black/5 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-zinc-500",
          actionButton:
            "group-[.toast]:bg-zinc-950 group-[.toast]:text-white group-[.toast]:rounded-full group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-600 group-[.toast]:rounded-full group-[.toast]:font-medium",
          success:
            "group-[.toaster]:bg-white/80 group-[.toaster]:text-zinc-950 group-[.toaster]:ring-emerald-500/20",
          error:
            "group-[.toaster]:bg-white/80 group-[.toaster]:text-zinc-950 group-[.toaster]:ring-red-500/20",
          warning:
            "group-[.toaster]:bg-white/80 group-[.toaster]:text-zinc-950 group-[.toaster]:ring-amber-500/20",
          info:
            "group-[.toaster]:bg-white/80 group-[.toaster]:text-zinc-950 group-[.toaster]:ring-blue-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
