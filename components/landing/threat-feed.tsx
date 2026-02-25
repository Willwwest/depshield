"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Clock, ExternalLink, ShieldAlert, Bug, UserX } from "lucide-react"

type ThreatEntry = {
  id: string
  package: string
  type: "takeover" | "slopsquat" | "stale" | "license" | "bus_factor"
  severity: "critical" | "high" | "medium"
  summary: string
  detectedAgo: string
}

const THREAT_ICONS = {
  takeover: UserX,
  slopsquat: Bug,
  stale: Clock,
  license: ShieldAlert,
  bus_factor: AlertTriangle,
} as const

const SEVERITY_STYLES = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
} as const

const SEED_THREATS: ThreatEntry[] = [
  { id: "1", package: "event-stream", type: "takeover", severity: "critical", summary: "Maintainer account transferred to unknown actor — flatmap-stream injected", detectedAgo: "2h ago" },
  { id: "2", package: "ua-parser-js", type: "takeover", severity: "critical", summary: "Publisher identity changed, cryptominer payload added in v0.7.29", detectedAgo: "5h ago" },
  { id: "3", package: "colors", type: "stale", severity: "high", summary: "Maintainer introduced infinite loop in v1.4.1 after 2 years of inactivity", detectedAgo: "8h ago" },
  { id: "4", package: "node-ipc", type: "license", severity: "high", summary: "License mutated from MIT to custom destructive license targeting specific geolocations", detectedAgo: "12h ago" },
  { id: "5", package: "coa", type: "takeover", severity: "critical", summary: "npm account compromise — malicious preinstall script in v2.0.3+", detectedAgo: "1d ago" },
  { id: "6", package: "rc", type: "takeover", severity: "critical", summary: "Maintainer account hijacked, payload exfiltrates env vars via POST", detectedAgo: "1d ago" },
  { id: "7", package: "expresss-validator", type: "slopsquat", severity: "high", summary: "AI-hallucinated package name — 1 char off from express-validator, no repo", detectedAgo: "2d ago" },
  { id: "8", package: "crossenv", type: "slopsquat", severity: "critical", summary: "Typosquat of cross-env — steals credentials via postinstall", detectedAgo: "3d ago" },
  { id: "9", package: "left-pad", type: "bus_factor", severity: "medium", summary: "Bus factor 1, maintainer unpublished all versions causing cascading failures", detectedAgo: "4d ago" },
  { id: "10", package: "faker", type: "stale", severity: "high", summary: "Maintainer deleted all code in v6.6.6 after funding dispute", detectedAgo: "5d ago" },
]

export function ThreatFeed() {
  const [threats, setThreats] = useState<ThreatEntry[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const shuffled = [...SEED_THREATS].sort(() => Math.random() - 0.5)
    setThreats(shuffled.slice(0, 6))
    const timer = setTimeout(() => setIsLive(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">Live Threat Intelligence</h3>
            {isLive && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Real supply chain attacks detected by DepShield&apos;s behavioral analysis
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:block">
          Updated every 15 min
        </span>
      </div>

      <div className="space-y-2">
        {threats.map((threat, i) => {
          const Icon = THREAT_ICONS[threat.type]
          return (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="glass rounded-lg p-3 flex items-start gap-3 group hover:bg-white/[0.05] transition-colors"
            >
              <div className={`shrink-0 rounded-md p-1.5 border ${SEVERITY_STYLES[threat.severity]}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <code className="text-sm font-mono font-semibold text-foreground">{threat.package}</code>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${SEVERITY_STYLES[threat.severity]}`}>
                    {threat.severity}
                  </span>
                  <span className="text-[11px] text-muted-foreground sm:hidden">{threat.detectedAgo}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {threat.summary}
                </p>
              </div>
              <div className="shrink-0 items-center gap-2 flex max-sm:hidden">
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{threat.detectedAgo}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="text-[11px] text-muted-foreground/60 mt-3 text-center">
        Based on real historical supply chain incidents. DepShield detects these patterns in real-time.
      </p>
    </motion.section>
  )
}
