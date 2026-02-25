"use client"

import { cn } from "@/lib/utils"
import { AlertCard } from "./alert-card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle } from "lucide-react"
import type { RiskAlert } from "@/lib/types"

interface RiskAlertsProps {
  alerts: RiskAlert[];
  className?: string;
}

export function RiskAlerts({ alerts, className }: RiskAlertsProps) {
  return (
    <div className={cn("rounded-xl border border-white/5 bg-card", className)}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h3 className="text-sm font-medium">Risk Alerts</h3>
        </div>
        <Badge variant="destructive" className="text-[10px]">{alerts.length}</Badge>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="p-3 space-y-2">
          {alerts.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} />
          ))}
          {alerts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No risk alerts found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
