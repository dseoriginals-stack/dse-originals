"use client"

import Spinner from "./Spinner"

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#E6EEF5] via-[#F0F6FA] to-[#E3EDF6] flex items-center justify-center animate-fadeIn">
      <Spinner size={120} />
    </div>
  )
}