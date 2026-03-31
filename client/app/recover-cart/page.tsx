import { Suspense } from "react"
import RecoverCartClient from "./RecoverCartClient"

export default function RecoverCartPage() {
  return (
    <Suspense fallback={
      <div className="container py-20 text-center text-white">
        Restoring your cart...
      </div>
    }>
      <RecoverCartClient />
    </Suspense>
  )
}