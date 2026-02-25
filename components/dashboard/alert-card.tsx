"use client"

import { cn } from "@/lib/utils"
import { RiskBadge } from "@/components/shared/risk-badge"
import { Badge } from "@/components/ui/badge"
import type { RiskAlert } from "@/lib/types"

interface AlertCardProps {
  alert: RiskAlert;
  index?: number;
  className?: string;
}

const severityBorder: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-cyan-500",
  info: "border-l-emerald-500",
}

export function AlertCard({ alert, index = 0, className }: AlertCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/5 bg-card p-4 border-l-2 animate-slide-in-right opacity-0",
        severityBorder[alert.severity],
        className
      )}
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="text-sm font-medium text-foreground leading-tight">{alert.title}</h4>
        <RiskBadge level={alert.severity} size="sm" showDot />
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{alert.description}</p>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-[10px] font-mono">
          {alert.packageName}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {alert.type.replace(/_/g, ' ')}
        </Badge>
      </div>
      {alert.evidence && (
        <div className="mt-2 p-2 rounded bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">{alert.evidence}</p>
        </div>
      )}
      {alert.recommendation && (
        <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
          <p className="text-[10px] text-primary/80 leading-relaxed">{alert.recommendation}</p>
        </div>
      )}
    </div>
  )
}
