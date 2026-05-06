"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import ReportIssueModal from "@/components/ReportIssueModal"

type ReportIssueContextType = {
  openReportModal: () => void
}

const ReportIssueContext = createContext<ReportIssueContextType | undefined>(undefined)

export function ReportIssueProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openReportModal = () => setIsOpen(true)

  return (
    <ReportIssueContext.Provider value={{ openReportModal }}>
      {children}
      <ReportIssueModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ReportIssueContext.Provider>
  )
}

export function useReportIssue() {
  const context = useContext(ReportIssueContext)
  if (!context) {
    throw new Error("useReportIssue must be used within a ReportIssueProvider")
  }
  return context
}
