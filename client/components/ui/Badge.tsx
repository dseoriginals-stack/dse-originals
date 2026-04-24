import { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "outline"
  className?: string
}

export default function Badge({ 
  children, 
  variant = "primary", 
  className = "" 
}: BadgeProps) {
  
  const variants = {
    primary: "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]",
    secondary: "bg-[var(--brand-accent)]/10 text-[var(--brand-accent)]",
    success: "bg-[var(--status-success)]/10 text-[var(--status-success)]",
    warning: "bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
    error: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
    info: "bg-[var(--status-info)]/10 text-[var(--status-info)]",
    outline: "bg-transparent border border-[var(--border-light)] text-[var(--text-muted)]",
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
