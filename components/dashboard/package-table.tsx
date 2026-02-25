"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { PackageRow } from "./package-row"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, ChevronUp, ChevronDown } from "lucide-react"
import type { DependencyNode } from "@/lib/types"

interface PackageTableProps {
  dependencies: DependencyNode[];
  onPackageClick?: (name: string) => void;
  className?: string;
}

type SortKey = "name" | "healthScore" | "riskLevel" | "alerts" | "downloads";
type SortDir = "asc" | "desc";

const riskOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export function PackageTable({ dependencies, onPackageClick, className }: PackageTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("healthScore");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...dependencies].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name": cmp = a.name.localeCompare(b.name); break;
      case "healthScore": cmp = a.healthScore - b.healthScore; break;
      case "riskLevel": cmp = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]; break;
      case "alerts": cmp = b.alerts.length - a.alerts.length; break;
      case "downloads": cmp = b.metadata.weeklyDownloads - a.metadata.weeklyDownloads; break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return null;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  return (
    <div className={cn("rounded-xl border border-white/5 bg-card", className)}>
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Dependencies</h3>
        <span className="text-xs text-muted-foreground">({dependencies.length})</span>
      </div>
      <ScrollArea className="h-[500px]">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-white/5 text-xs text-muted-foreground">
              {([["name", "Package"], ["healthScore", "Health"], ["riskLevel", "Risk"], ["alerts", "Alerts"], ["downloads", "Downloads"]] as [SortKey, string][]).map(([key, label]) => (
                <th
                  key={key}
                  className={cn(
                    "p-3 text-left font-medium cursor-pointer hover:text-foreground transition-colors",
                    (key === "downloads") && "max-sm:hidden"
                  )}
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon column={key} />
                  </div>
                </th>
              ))}
              <th className="p-3 text-left font-medium max-sm:hidden">
                <span>Version</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(dep => (
              <PackageRow
                key={dep.name}
                node={dep}
                onClick={onPackageClick ? () => onPackageClick(dep.name) : undefined}
              />
            ))}
          </tbody>
        </table>
        </div>
      </ScrollArea>
    </div>
  )
}
