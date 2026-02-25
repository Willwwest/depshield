"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/shared/header"
import { HealthGrade } from "@/components/dashboard/health-grade"
import { StatsRow } from "@/components/dashboard/stats-row"
import { DependencyGraph } from "@/components/dashboard/dependency-graph"
import { RiskAlerts } from "@/components/dashboard/risk-alerts"
import { PackageTable } from "@/components/dashboard/package-table"
import { WeeklyDigest } from "@/components/dashboard/weekly-digest"
import { EXPRESS_MOCK_RESULT } from "@/lib/mock-data"
import type { ScanResult } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [result, setResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("scanResult")
    if (stored) {
      try {
        setResult(JSON.parse(stored))
        return
      } catch {
        // fall through to demo data
      }
    }
    setResult(EXPRESS_MOCK_RESULT)
  }, [])

  if (!result) {
    return null
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
      <Header repoName={result.repoName} showBackButton />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <HealthGrade
            grade={result.overallGrade}
            score={result.overallScore}
            className="lg:col-span-1"
          />
          <div className="lg:col-span-3">
            <StatsRow
              totalDeps={result.totalDependencies}
              criticalAlerts={result.criticalAlerts}
              highAlerts={result.highAlerts}
              busFActorWarnings={result.busFActorWarnings}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DependencyGraph
            data={result.graphData}
            onNodeClick={(nodeId) => {
              if (nodeId !== "express-app") {
                router.push(`/package/${encodeURIComponent(nodeId)}`)
              }
            }}
            className="lg:col-span-2 h-[500px]"
          />
          <RiskAlerts alerts={result.alerts} className="lg:col-span-1" />
        </div>

        <PackageTable
          dependencies={result.dependencies}
          onPackageClick={(name) =>
            router.push(`/package/${encodeURIComponent(name)}`)
          }
        />

        {result.weeklyDigest.length > 0 && (
          <WeeklyDigest entries={result.weeklyDigest} />
        )}
      </main>
    </div>
  )
}
