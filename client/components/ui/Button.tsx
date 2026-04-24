import { ReactNode } from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode
  variant?: "primary" | "secondary" | "outline" | "ghost" | "rose" | "emerald"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props 
}: ButtonProps) {

  const baseStyles = "inline-flex items-center justify-center rounded-2xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
  
  const variants = {
    primary: "bg-[var(--brand-primary)] text-white shadow-lg hover:shadow-[var(--brand-primary)]/20 hover:brightness-110",
    secondary: "bg-[var(--brand-accent)] text-white shadow-lg hover:brightness-110",
    outline: "bg-transparent border-2 border-[var(--border-light)] text-[var(--text-main)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]",
    ghost: "bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--brand-primary)]",
    rose: "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white",
  }

  const sizes = {
    sm: "px-4 py-2 text-[10px] tracking-widest uppercase",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  }

  return (
    <motion.button
      whileHover={!disabled && !loading ? { y: -2 } : {}}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}