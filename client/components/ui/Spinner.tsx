"use client"

export default function Spinner({ size = 128 }: { size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex justify-center items-center animate-[spin_3s_linear_infinite] bg-[conic-gradient(#274C77_0deg,#A3CEF1_300deg,transparent_270deg,transparent_360deg)] rounded-full"
    >
      <div className="absolute w-[60%] aspect-square rounded-full animate-[spin_2s_linear_infinite] bg-[conic-gradient(#274C77_0deg,#A3CEF1_270deg,transparent_180deg,transparent_360deg)]" />
      
      <div className="absolute w-3/4 aspect-square rounded-full animate-[spin_3s_linear_infinite] bg-[conic-gradient(#274C77_0deg,#A3CEF1_180deg,transparent_180deg,transparent_360deg)]" />
      
      <div className="absolute w-[85%] aspect-square rounded-full animate-[spin_5s_linear_infinite] bg-[conic-gradient(#274C77_0deg,#A3CEF1_180deg,transparent_180deg,transparent_360deg)]" />
    </div>
  )
}