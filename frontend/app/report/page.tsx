"use client"

import { Navigation, PageHeader } from "@/components/navigation"
import { AIReportForm } from "@/components/ai-report-form"

export default function ReportDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background pt-16 md:pt-20">
      <Navigation />

      <PageHeader
        title="Report Agricultural Issue"
        description="Describe your farming challenge and get AI-powered recommendations"
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <AIReportForm />
      </div>
    </div>
  )
}
