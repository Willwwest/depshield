"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink, GitBranch, Download, Calendar, Users } from "lucide-react"
import { usePackageDetail } from "@/hooks/use-package-detail"
import { Header } from "@/components/shared/header"
import { ScoreGauge } from "@/components/detail/score-gauge"
import { RiskBadge } from "@/components/shared/risk-badge"
import { MaintainerTimeline } from "@/components/detail/maintainer-timeline"
import { RiskBreakdown } from "@/components/detail/risk-breakdown"
import { AlternativesCard } from "@/components/detail/alternatives-card"
import { LicenseHistory } from "@/components/detail/license-history"
import { AlertCard } from "@/components/dashboard/alert-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface PageProps {
  params: Promise<{ name: string }>
}

export default function PackageDetailPage({ params }: PageProps) {
  const { name } = use(params)
  const packageName = decodeURIComponent(name)
  const { data, isLoading, error } = usePackageDetail(packageName)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background bg-grid">
        <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
        <Header showBackButton />
        <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[280px] rounded-xl" />
            <Skeleton className="h-[280px] rounded-xl md:col-span-2" />
          </div>
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
        <div className="relative z-10 text-center space-y-4">
          <p className="text-lg text-foreground font-medium">
            {error || `Package "${packageName}" not found`}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
      <Header showBackButton />

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {data.name}
              </h1>
              <RiskBadge level={data.riskLevel} showDot />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {data.metadata.description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="font-mono text-xs">
              v{data.version}
            </Badge>
            {data.metadata.repository && (
              <a
                href={data.metadata.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-white/5 bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Download className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Weekly Downloads</span>
            </div>
            <span className="text-lg font-bold">{formatNumber(data.metadata.weeklyDownloads)}</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] text-muted-foreground">Dependencies</span>
            </div>
            <span className="text-lg font-bold">{data.dependencyCount}</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[10px] text-muted-foreground">Maintainers</span>
            </div>
            <span className="text-lg font-bold">{data.maintainerHealth.totalMaintainers}</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] text-muted-foreground">Last Published</span>
            </div>
            <span className="text-sm font-medium">{formatDate(data.metadata.lastPublish)}</span>
          </div>
          <div className="rounded-xl border border-white/5 bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] text-muted-foreground">Created</span>
            </div>
            <span className="text-sm font-medium">{formatDate(data.metadata.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-center rounded-xl border border-white/5 bg-card p-6">
            <ScoreGauge score={data.healthScore} grade={data.healthGrade} size={200} />
          </div>
          <MaintainerTimeline
            maintainerHealth={data.maintainerHealth}
            className="md:col-span-2"
          />
        </div>

        <RiskBreakdown
          takeoverRisk={data.takeoverRisk}
          slopsquatting={data.slopsquatting}
        />

        <LicenseHistory licenseMutation={data.licenseMutation} />

        {data.alerts.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-card">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-sm font-medium">
                Alerts ({data.alerts.length})
              </h2>
            </div>
            <div className="p-3 space-y-2">
              {data.alerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} index={i} />
              ))}
            </div>
          </div>
        )}

        {data.migrationSuggestions.length > 0 && (
          <AlternativesCard suggestions={data.migrationSuggestions} />
        )}
      </main>
    </div>
  )
}
