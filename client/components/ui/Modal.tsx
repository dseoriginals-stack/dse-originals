"use client"

import { ReactNode, useEffect } from "react"

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export default function Modal({ open, onClose, children }: Props) {

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "auto"
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999]">

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 flex justify-center px-3">

        <div
            className="
            w-full
            max-w-md
            bg-white
            rounded-3xl
            shadow-2xl
            flex flex-col
            max-h-[90vh]
            animate-slideUp
            "
        >

          {/* Drag Handle */}
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 md:p-8">
            {children}
          </div>

        </div>
      </div>

    </div>
  )
}