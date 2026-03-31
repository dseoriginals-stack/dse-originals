import { ReactNode } from "react"

export default function Card({ children }: { children: ReactNode }) {

  return (

    <div className="bg-surface border border-gray-200 rounded-2xl shadow-sm p-6">

      {children}

    </div>

  )
}