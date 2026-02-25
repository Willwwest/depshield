"use client"

import { Activity, Clock, GitCommit, MessageCircle, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MaintainerHealthResult } from "@/lib/types"

interface MaintainerTimelineProps {
  maintainerHealth: MaintainerHealthResult;
  className?: string;
}

function toneFromValue(value: number) {
  if (value >= 70) {
    return {
      bar: "bg-emerald-400/90",
      track: "bg-emerald-500/15",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
    }
  }
  if (value >= 40) {
    return {
      bar: "bg-yellow-400/90",
      track: "bg-yellow-500/15",
      text: "text-yellow-300",
      dot: "bg-yellow-400",
    }
  }
  return {
    bar: "bg-red-400/90",
    track: "bg-red-500/15",
    text: "text-red-300",
    dot: "bg-red-400",
  }
}

export function MaintainerTimeline({ maintainerHealth, className }: MaintainerTimelineProps) {
  const activeRatio = maintainerHealth.totalMaintainers > 0
    ? (maintainerHealth.activeMaintainers / maintainerHealth.totalMaintainers) * 100
    : 0

  const metrics = [
    {
      id: "last-commit",
      icon: GitCommit,
      label: "Last Commit",
      value: `${maintainerHealth.lastCommitDaysAgo}d ago`,
      percent: Math.max(0, Math.min(100, 100 - (maintainerHealth.lastCommitDaysAgo / 180) * 100)),
    },
    {
      id: "frequency",
      icon: Activity,
      label: "Commit Frequency",
      value: `${maintainerHealth.commitFrequency}/mo`,
      percent: Math.max(0, Math.min(100, (maintainerHealth.commitFrequency / 12) * 100)),
    },
    {
      id: "response",
      icon: MessageCircle,
      label: "Issue Response",
      value: `${maintainerHealth.issueResponseTimeDays}d`,
      percent: Math.max(0, Math.min(100, 100 - (maintainerHealth.issueResponseTimeDays / 21) * 100)),
    },
    {
      id: "bus-factor",
      icon: Users,
      label: "Bus Factor",
      value: `${maintainerHealth.busFactor}`,
      percent: Math.max(0, Math.min(100, (maintainerHealth.busFactor / 5) * 100)),
    },
    {
      id: "active-maintainers",
      icon: Clock,
      label: "Active Maintainers",
      value: `${maintainerHealth.activeMaintainers}/${maintainerHealth.totalMaintainers}`,
      percent: activeRatio,
    },
  ]

  return (
    <Card className={cn("glass border border-white/5 rounded-xl p-5 gap-4 risk-glow-low", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Maintainer Timeline</p>
          <h3 className="text-sm font-semibold text-foreground mt-1">Maintenance signal flow</h3>
        </div>
        <Badge variant="outline" className="text-xs border-cyan-400/30 text-cyan-300 bg-cyan-500/10">
          {maintainerHealth.score}%
        </Badge>
      </div>

      <div className="relative pl-4 space-y-3">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
        {metrics.map((metric, index) => {
          const tone = toneFromValue(metric.percent)
          const Icon = metric.icon

          return (
            <div
              key={metric.id}
              className="animate-fade-up relative rounded-lg border border-white/5 bg-black/20 p-3"
              style={{ animationDelay: `${index * 0.06}s`, animationFillMode: "forwards" }}
            >
              <span className={cn("absolute -left-[13px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full", tone.dot)} />
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", tone.text)} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <span className={cn("text-xs font-medium", tone.text)}>{metric.value}</span>
              </div>
              <div className={cn("h-1.5 w-full rounded-full overflow-hidden", tone.track)}>
                <div className={cn("h-full rounded-full transition-all duration-500", tone.bar)} style={{ width: `${metric.percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {maintainerHealth.signals.length > 0 ? (
          maintainerHealth.signals.map((signal) => (
            <Badge
              key={signal}
              variant="secondary"
              className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground"
            >
              {signal}
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
            No maintainer warnings
          </Badge>
        )}
      </div>
    </Card>
  )
}
