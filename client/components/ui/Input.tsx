import { InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-[var(--bg-surface)] border-2 border-transparent 
              focus:bg-white focus:border-[var(--brand-primary)] rounded-2xl 
              font-bold text-sm outline-none transition-all 
              placeholder:text-slate-300 disabled:opacity-50
              ${icon ? "pl-11" : ""}
              ${error ? "border-[var(--status-error)]" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--status-error)] px-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
