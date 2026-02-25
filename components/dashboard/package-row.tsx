"use client"

import { cn } from "@/lib/utils"
import { RiskBadge } from "@/components/shared/risk-badge"
import { GRADE_COLORS } from "@/lib/constants"
import type { DependencyNode } from "@/lib/types"

interface PackageRowProps {
  node: DependencyNode;
  onClick?: () => void;
}

function formatDownloads(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}

export function PackageRow({ node, onClick }: PackageRowProps) {
  const color = GRADE_COLORS[node.healthGrade];

  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-white/5 hover:bg-white/[0.02] transition-colors",
        onClick && "cursor-pointer"
      )}
    >
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium truncate max-w-[160px]">{node.name}</span>
          {!node.isDirectDependency && (
            <span className="text-[10px] text-muted-foreground">transitive</span>
          )}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${node.healthScore}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color }}>{node.healthScore}</span>
        </div>
      </td>
      <td className="p-3"><RiskBadge level={node.riskLevel} size="sm" /></td>
      <td className="p-3 text-xs text-muted-foreground">{node.alerts.length || "-"}</td>
      <td className="p-3 text-xs text-muted-foreground font-mono max-sm:hidden">{formatDownloads(node.metadata.weeklyDownloads)}</td>
      <td className="p-3 text-xs text-muted-foreground font-mono max-sm:hidden">{node.version}</td>
    </tr>
  )
}
