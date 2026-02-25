"use client"

import { cn } from "@/lib/utils"
import { Package, AlertTriangle, ShieldAlert, Users } from "lucide-react"
import { AnimatedCounter } from "@/components/shared/animated-counter"

interface StatsRowProps {
  totalDeps: number;
  criticalAlerts: number;
  highAlerts: number;
  busFActorWarnings: number;
  className?: string;
}

const stats = [
  { key: "total", label: "Total Dependencies", icon: Package, color: "text-primary", glowClass: "" },
  { key: "critical", label: "Critical Alerts", icon: AlertTriangle, color: "text-red-400", glowClass: "risk-glow-critical" },
  { key: "high", label: "High Risk", icon: ShieldAlert, color: "text-orange-400", glowClass: "risk-glow-high" },
  { key: "bus", label: "Bus Factor Warnings", icon: Users, color: "text-yellow-400", glowClass: "risk-glow-medium" },
] as const;

export function StatsRow({ totalDeps, criticalAlerts, highAlerts, busFActorWarnings, className }: StatsRowProps) {
  const values = { total: totalDeps, critical: criticalAlerts, high: highAlerts, bus: busFActorWarnings };

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {stats.map(({ key, label, icon: Icon, color, glowClass }) => {
        const value = values[key];
        return (
          <div
            key={key}
            className={cn(
              "rounded-xl border border-white/5 bg-card p-4",
              value > 0 && glowClass
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("h-4 w-4", color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <AnimatedCounter value={value} className={cn("text-2xl font-bold", color)} />
          </div>
        );
      })}
    </div>
  )
}
