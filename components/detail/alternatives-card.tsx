"use client"

import { ArrowRightLeft, Download, Gauge } from "lucide-react"

import { RiskBadge } from "@/components/shared/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { GRADE_COLORS } from "@/lib/constants"
import type { MigrationSuggestion, RiskLevel } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AlternativesCardProps {
  suggestions: MigrationSuggestion[];
  className?: string;
}

const EFFORT_TO_RISK: Record<MigrationSuggestion["effort"], RiskLevel> = {
  low: "info",
  medium: "medium",
  high: "high",
}

function formatDownloads(value: number) {
  if (value >= 1_000_000) {
    const scaled = value / 1_000_000
    return `${scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1)}M`
  }
  if (value >= 1_000) {
    const scaled = value / 1_000
    return `${scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1)}K`
  }
  return `${value}`
}

export function AlternativesCard({ suggestions, className }: AlternativesCardProps) {
  return (
    <Card className={cn("glass border border-white/5 rounded-xl p-5 gap-4 risk-glow-info", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Migration Alternatives</p>
          <h3 className="text-sm font-semibold text-foreground mt-1">Safer package pathways</h3>
        </div>
        <ArrowRightLeft className="h-4 w-4 text-cyan-300" />
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-lg border border-white/5 bg-black/20 p-4 text-center">
          <p className="text-sm text-foreground">No alternatives needed</p>
          <p className="text-xs text-muted-foreground mt-1">Current package posture is already healthy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.from}-${suggestion.to}`}
              className="animate-slide-in-right rounded-xl border border-white/5 bg-black/20 p-4"
              style={{ animationDelay: `${index * 0.06}s`, animationFillMode: "forwards" }}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                    {suggestion.from}
                  </Badge>
                  <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge className="text-[10px] bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
                    {suggestion.to}
                  </Badge>
                </div>
                <RiskBadge level={EFFORT_TO_RISK[suggestion.effort]} size="sm" />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.toDescription}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                  <Download className="h-3 w-3" /> {formatDownloads(suggestion.weeklyDownloads)} weekly
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] border border-white/10 bg-white/5"
                  style={{ color: GRADE_COLORS[suggestion.healthGrade] }}
                >
                  <Gauge className="h-3 w-3" /> Grade {suggestion.healthGrade}
                </Badge>
                <Badge className={cn(
                  "text-[10px] border",
                  suggestion.effort === "low" && "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
                  suggestion.effort === "medium" && "bg-yellow-500/15 text-yellow-300 border-yellow-400/20",
                  suggestion.effort === "high" && "bg-red-500/15 text-red-300 border-red-400/20",
                )}>
                  Effort: {suggestion.effort}
                </Badge>
              </div>

              <div className="mt-3 rounded-lg border border-white/5 bg-card/70 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Reason</p>
                <p className="text-xs text-foreground leading-relaxed">{suggestion.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
