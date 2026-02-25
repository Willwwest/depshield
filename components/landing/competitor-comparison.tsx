"use client"

import { motion } from "framer-motion"
import { Check, X, Minus } from "lucide-react"

type Feature = {
  name: string
  depshield: "yes" | "no" | "partial"
  socket: "yes" | "no" | "partial"
  snyk: "yes" | "no" | "partial"
}

const features: Feature[] = [
  { name: "CVE / Known Vulnerability Scanning", depshield: "yes", socket: "yes", snyk: "yes" },
  { name: "Maintainer Takeover Detection", depshield: "yes", socket: "yes", snyk: "no" },
  { name: "Bus Factor Analysis", depshield: "yes", socket: "no", snyk: "no" },
  { name: "AI Slopsquatting Detection", depshield: "yes", socket: "partial", snyk: "no" },
  { name: "License Mutation Tracking", depshield: "yes", socket: "partial", snyk: "partial" },
  { name: "Migration Advisor with Alternatives", depshield: "yes", socket: "no", snyk: "no" },
  { name: "Dependency Health Scoring (A-F)", depshield: "yes", socket: "no", snyk: "partial" },
  { name: "Free for Open Source", depshield: "yes", socket: "no", snyk: "yes" },
  { name: "No Data Retention / Privacy-First", depshield: "yes", socket: "no", snyk: "no" },
  { name: "GitHub Action (PR Comments)", depshield: "yes", socket: "yes", snyk: "yes" },
]

const StatusIcon = ({ status }: { status: "yes" | "no" | "partial" }) => {
  if (status === "yes") return <Check className="h-4 w-4 text-emerald-400" />
  if (status === "no") return <X className="h-4 w-4 text-red-400/60" />
  return <Minus className="h-4 w-4 text-yellow-400/60" />
}

export function CompetitorComparison() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground">
          How DepShield Compares
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Traditional scanners react to CVEs. We predict the next supply chain attack.
        </p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="max-sm:hidden overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">
                  Feature
                </th>
                <th className="text-center p-3">
                  <div className="text-sm font-bold text-gradient">DepShield</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">$49/mo</div>
                </th>
                <th className="text-center p-3">
                  <div className="text-sm font-medium text-foreground/70">Socket.dev</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">$25K+/yr</div>
                </th>
                <th className="text-center p-3">
                  <div className="text-sm font-medium text-foreground/70">Snyk</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">$98+/mo</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr
                  key={feature.name}
                  className={`border-b border-white/[0.03] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                >
                  <td className="text-xs text-foreground/80 p-3">{feature.name}</td>
                  <td className="text-center p-3">
                    <div className="flex justify-center">
                      <StatusIcon status={feature.depshield} />
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex justify-center">
                      <StatusIcon status={feature.socket} />
                    </div>
                  </td>
                  <td className="text-center p-3">
                    <div className="flex justify-center">
                      <StatusIcon status={feature.snyk} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y divide-white/[0.03]">
          {features.map((feature, i) => (
            <div key={feature.name} className={`p-3 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
              <p className="text-xs font-medium text-foreground/80 mb-2">{feature.name}</p>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <StatusIcon status={feature.depshield} />
                  <span className="font-bold text-gradient">DepShield</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusIcon status={feature.socket} />
                  Socket
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusIcon status={feature.snyk} />
                  Snyk
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-white/5 text-center">
          <p className="text-[11px] text-muted-foreground">
            Socket.dev pricing based on public Enterprise tier. Snyk pricing for Teams plan (1 developer).
          </p>
        </div>
      </div>
    </motion.section>
  )
}
