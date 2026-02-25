"use client"

import { FileWarning, Scale } from "lucide-react"

import { RiskBadge } from "@/components/shared/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { scoreToRiskLevel } from "@/lib/constants"
import type { LicenseMutationResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LicenseHistoryProps {
  licenseMutation: LicenseMutationResult;
  className?: string;
}

export function LicenseHistory({ licenseMutation, className }: LicenseHistoryProps) {
  const level = scoreToRiskLevel(licenseMutation.score)

  return (
    <Card className={cn("glass border border-white/5 rounded-xl p-5 gap-4", `risk-glow-${level}`, className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">License History</p>
          <h3 className="text-sm font-semibold text-foreground mt-1">Mutation and compliance tracking</h3>
        </div>
        <RiskBadge level={level} size="sm" showDot />
      </div>

      <div className="rounded-xl border border-white/5 bg-black/20 p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-cyan-300" />
          <span className="text-xs text-muted-foreground">Current License</span>
        </div>
        <Badge className="text-xs bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
          {licenseMutation.currentLicense}
        </Badge>
      </div>

      {licenseMutation.isRestrictive && (
        <div className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 flex items-start gap-2">
          <FileWarning className="h-4 w-4 text-red-300 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-red-200">Restrictive License Risk</p>
            <p className="text-xs text-red-200/80 mt-1">This license may enforce reciprocal obligations for redistribution.</p>
          </div>
        </div>
      )}

      {licenseMutation.hasChanged && (
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs text-muted-foreground mb-3">Version timeline</p>
          <div className="relative pl-4 space-y-3">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
            {licenseMutation.previousLicenses.map((entry, index) => (
              <div key={`${entry.version}-${entry.license}`} className="relative rounded-lg border border-white/5 bg-card/70 p-2.5">
                <span
                  className={cn(
                    "absolute -left-[13px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full",
                    index === 0 ? "bg-red-400" : "bg-cyan-400"
                  )}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground font-medium">{entry.version}</span>
                  <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                    {entry.license}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Signals</p>
        {licenseMutation.signals.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {licenseMutation.signals.map((signal) => (
              <Badge key={signal} variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                {signal}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No license mutation signals.</p>
        )}
      </div>
    </Card>
  )
}
