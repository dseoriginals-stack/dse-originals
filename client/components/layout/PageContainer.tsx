import { ReactNode } from "react"

export default function PageContainer({ children }: { children: ReactNode }) {

  return (

    <main className="page-gradient min-h-screen">

      <div className="container">

        {children}

      </div>

    </main>

  )

}