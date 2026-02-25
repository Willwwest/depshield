"use client"

import { BarChart3, Bell, TrendingDown, TrendingUp } from "lucide-react"

import { RiskBadge } from "@/components/shared/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { scoreToRiskLevel } from "@/lib/constants"
import type { WeeklyDigestEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WeeklyDigestProps {
  entries: WeeklyDigestEntry[];
  className?: string;
}

export function WeeklyDigest({ entries, className }: WeeklyDigestProps) {
  const recentFirst = [...entries].reverse()
  const chartSeries = [...recentFirst].reverse()

  return (
    <Card className={cn("glass border border-white/5 rounded-xl p-5 gap-5", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weekly Digest</p>
          <h3 className="text-sm font-semibold text-foreground mt-1">Health movement over time</h3>
        </div>
        <BarChart3 className="h-4 w-4 text-cyan-300" />
      </div>

      <div className="rounded-xl border border-white/5 bg-black/20 p-4">
        <div className="flex items-end gap-3" style={{ height: 120 }}>
          {chartSeries.map((entry) => {
            const level = scoreToRiskLevel(entry.overallScore)
            const barColor = level === "critical" ? "rgba(239,68,68,0.9)" :
              level === "high" ? "rgba(249,115,22,0.9)" :
              level === "medium" ? "rgba(234,179,8,0.9)" :
              "rgba(34,211,238,0.9)"
            const barColorFaded = barColor.replace("0.9)", "0.3)")
            const barHeight = Math.max(20, entry.overallScore)

            return (
              <div key={`bar-${entry.weekLabel}`} className="flex-1 group min-w-0 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] font-mono text-foreground/70 mb-1">
                  {entry.overallScore}
                </span>
                <div
                  className={cn("w-full rounded-t-sm transition-all duration-300")}
                  style={{
                    height: `${barHeight}%`,
                    background: `linear-gradient(to top, ${barColorFaded}, ${barColor})`,
                    boxShadow: `0 0 8px ${barColor.replace("0.9)", "0.4)")}`,
                  }}
                />
                <p className="mt-2 text-[10px] text-muted-foreground truncate group-hover:text-foreground transition-colors">
                  {entry.weekLabel}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        {recentFirst.map((entry, index) => {
          const scoreUp = entry.scoreChange >= 0
          const level = scoreToRiskLevel(entry.overallScore)

          return (
            <article
              key={entry.weekLabel}
              className={cn("animate-fade-up rounded-xl border border-white/5 bg-black/20 p-4", `risk-glow-${level}`)}
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{entry.weekLabel}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-semibold text-foreground">{entry.overallScore}</span>
                    <span className={cn("inline-flex items-center gap-1 text-xs", scoreUp ? "text-emerald-300" : "text-red-300")}>
                      {scoreUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {scoreUp ? "+" : ""}
                      {entry.scoreChange}
                    </span>
                  </div>
                </div>
                <RiskBadge level={level} size="sm" />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <Badge className="text-[10px] bg-red-500/15 text-red-300 border border-red-400/20">
                  <Bell className="h-3 w-3" /> {entry.newAlerts} new alerts
                </Badge>
                <Badge className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                  <Bell className="h-3 w-3" /> {entry.resolvedAlerts} resolved
                </Badge>
              </div>

              {entry.highlights.length > 0 && (
                <ul className="space-y-1">
                  {entry.highlights.map((highlight) => (
                    <li key={highlight} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-cyan-300" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}

        {entries.length === 0 && (
          <div className="rounded-lg border border-white/5 bg-black/20 p-4 text-center">
            <p className="text-sm text-foreground">No weekly data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Digest cards appear once trend snapshots are collected.</p>
          </div>
        )}
      </div>
    </Card>
  )
}
