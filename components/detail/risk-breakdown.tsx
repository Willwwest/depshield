"use client"

import { Bot, Check, ShieldAlert, X } from "lucide-react"

import { RiskBadge } from "@/components/shared/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { scoreToRiskLevel } from "@/lib/constants"
import type { SlopsquattingResult, TakeoverRiskResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RiskBreakdownProps {
  takeoverRisk: TakeoverRiskResult;
  slopsquatting: SlopsquattingResult;
  className?: string;
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

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-2.5 flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("inline-flex items-center gap-1 text-xs font-medium", active ? "text-red-300" : "text-emerald-300")}>
        {active ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
        {active ? "Risk" : "Clear"}
      </span>
    </div>
  )
}

export function RiskBreakdown({ takeoverRisk, slopsquatting, className }: RiskBreakdownProps) {
  const takeoverLevel = scoreToRiskLevel(takeoverRisk.score)
  const slopsquattingLevel = scoreToRiskLevel(slopsquatting.score)

  return (
    <Card className={cn("glass border border-white/5 rounded-xl p-5 gap-5", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk Breakdown</p>
          <h3 className="text-sm font-semibold text-foreground mt-1">Attack surface diagnostics</h3>
        </div>
      </div>

      <section className={cn("rounded-xl border border-white/5 bg-black/20 p-4 space-y-3", `risk-glow-${takeoverLevel}`)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-orange-300" />
            <h4 className="text-sm font-medium text-foreground">Takeover Risk</h4>
          </div>
          <RiskBadge level={takeoverLevel} size="sm" showDot />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Score</span>
            <span className="text-xs text-foreground font-medium">{takeoverRisk.score}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${takeoverRisk.score}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <StatusPill label="New maintainer added" active={takeoverRisk.newMaintainerAdded} />
          <StatusPill label="Maintainer removed" active={takeoverRisk.maintainerRemoved} />
          <StatusPill label="Publisher changed" active={takeoverRisk.publisherChanged} />
          <StatusPill label="Repository URL changed" active={takeoverRisk.repositoryUrlChanged} />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suspicious Maintainers</p>
          {takeoverRisk.suspiciousMaintainers.length > 0 ? (
            <div className="space-y-2">
              {takeoverRisk.suspiciousMaintainers.map((maintainer) => (
                <div key={`${maintainer.name}-${maintainer.email}`} className="rounded-lg border border-white/5 bg-card/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-foreground font-medium">{maintainer.name}</p>
                      <p className="text-[10px] text-muted-foreground">{maintainer.email}</p>
                    </div>
                    {maintainer.isNewMaintainer && (
                      <Badge className="text-[10px] bg-red-500/15 text-red-300 border border-red-400/20">New</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                      {maintainer.npmPackageCount} npm packages
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                      {maintainer.npmAccountAge}d account age
                    </Badge>
                    {maintainer.githubUsername && (
                      <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                        @{maintainer.githubUsername}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No suspicious maintainers detected.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Signals</p>
          {takeoverRisk.signals.length > 0 ? (
            takeoverRisk.signals.map((signal) => (
              <p key={signal} className="text-xs text-muted-foreground pl-2 border-l border-white/10">{signal}</p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No takeover signals.</p>
          )}
        </div>
      </section>

      <section className={cn("rounded-xl border border-white/5 bg-black/20 p-4 space-y-3", `risk-glow-${slopsquattingLevel}`)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-yellow-300" />
            <h4 className="text-sm font-medium text-foreground">Slopsquatting</h4>
          </div>
          <RiskBadge level={slopsquattingLevel} size="sm" showDot />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Score</span>
            <span className="text-xs text-foreground font-medium">{slopsquatting.score}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${slopsquatting.score}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <StatusPill label="Suspected slopsquatting" active={slopsquatting.isSuspected} />
          <StatusPill label="Missing repository" active={!slopsquatting.hasRepository} />
          <StatusPill label="Single version only" active={slopsquatting.singleVersion} />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Similar Packages</p>
          {slopsquatting.similarPackages.length > 0 ? (
            <div className="space-y-2">
              {slopsquatting.similarPackages.map((pkg) => (
                <div key={pkg.name} className="rounded-lg border border-white/5 bg-card/70 p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-foreground font-medium">{pkg.name}</p>
                    <p className="text-[10px] text-muted-foreground">Distance {pkg.distance}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] border border-white/10 bg-white/5 text-muted-foreground">
                    {formatDownloads(pkg.downloads)} weekly
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No near-name package collisions found.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Signals</p>
          {slopsquatting.signals.length > 0 ? (
            slopsquatting.signals.map((signal) => (
              <p key={signal} className="text-xs text-muted-foreground pl-2 border-l border-white/10">{signal}</p>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No slopsquatting signals.</p>
          )}
        </div>
      </section>
    </Card>
  )
}
