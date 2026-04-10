"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"
import { X, Camera, Upload, AlertCircle } from "lucide-react"

type QRScannerProps = {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [tab, setTab] = useState<"camera" | "upload">("camera")
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const regionId = "qr-reader-region"

  useEffect(() => {
    if (tab === "camera") {
      const html5QrCode = new Html5Qrcode(regionId)
      scannerRef.current = html5QrCode

      const config = { fps: 10, qrbox: { width: 250, height: 250 } }

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          // Keep scanning
        }
      ).catch(err => {
        console.error("Camera access error", err)
        setError("Could not access camera. Please check permissions.")
      })

      return () => {
        stopScanner()
      }
    }
  }, [tab])

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear()
      }).catch(err => console.error("Error stopping scanner", err))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const html5QrCode = new Html5Qrcode(regionId)
    try {
      const decodedText = await html5QrCode.scanFile(file, true)
      onScan(decodedText)
    } catch (err) {
      setError("No QR code found in this image.")
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-scale-up">
        
        <div className="bg-[var(--bg-surface)] px-8 py-6 border-b border-[var(--border-light)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-[1000] text-[var(--text-heading)] tracking-tighter">
              Product Scanner
            </h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)] mt-0.5">Automated SKU Recognition</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] mb-8">
            <button 
              onClick={() => { setError(null); setTab("camera") }}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === "camera" ? "bg-white text-[var(--brand-primary)] shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Camera size={14} /> Live Camera
            </button>
            <button 
              onClick={() => { setError(null); stopScanner(); setTab("upload") }}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${tab === "upload" ? "bg-white text-[var(--brand-primary)] shadow-md" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Upload size={14} /> Upload Image
            </button>
          </div>

          <div className="relative aspect-square bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center group">
            <div id={regionId} className="w-full h-full [&>video]:object-cover" />
            
            {tab === "upload" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-bold text-[var(--text-heading)] mb-1">Select QR Code Image</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Supported: JPG, PNG, WEBP</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-x-6 bottom-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-fade-up">
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs font-bold text-red-700">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 leading-relaxed">
              Align the product QR code within the frame to automatically sync with the catalog inventory.
            </p>
          </div>
        </div>

        <div className="px-8 pb-8 bg-white">
           <button 
             onClick={onClose}
             className="w-full py-4 rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition"
           >
             Cancel Session
           </button>
        </div>

      </div>
    </div>
  )
}
