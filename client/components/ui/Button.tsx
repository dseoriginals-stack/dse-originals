import { ReactNode } from "react"

type Props = {
  children: ReactNode
  variant?: "primary" | "accent"
  onClick?: () => void
}

export default function Button({ children, variant="primary", onClick }: Props) {

  const styles = {
    primary: "bg-primary hover:bg-[#356EA3]",
    accent: "bg-accent hover:bg-[#4F87AC]"
  }

  return (
    <button
      onClick={onClick}
      className={`${styles[variant]} text-white px-6 py-3 rounded-xl font-medium transition`}
    >
      {children}
    </button>
  )
}