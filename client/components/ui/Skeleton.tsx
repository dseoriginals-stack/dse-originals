import { HTMLAttributes } from "react"

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text"
  width?: string | number
  height?: string | number
}

export default function Skeleton({ 
  variant = "rectangular", 
  width, 
  height, 
  className = "", 
  style, 
  ...props 
}: SkeletonProps) {
  
  const baseStyles = "animate-pulse bg-slate-100"
  
  const variants = {
    rectangular: "rounded-2xl",
    circular: "rounded-full",
    text: "rounded-full h-4 w-full",
  }

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  )
}
