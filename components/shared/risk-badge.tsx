import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string; dotColor: string }> = {
  critical: { label: 'CRITICAL', color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-500' },
  high: { label: 'HIGH', color: 'text-orange-400', bgColor: 'bg-orange-500/10', dotColor: 'bg-orange-500' },
  medium: { label: 'MEDIUM', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', dotColor: 'bg-yellow-500' },
  low: { label: 'LOW', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', dotColor: 'bg-cyan-500' },
  info: { label: 'SAFE', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', dotColor: 'bg-emerald-500' },
}

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
}

export function RiskBadge({ level, size = 'md', showDot = false, className }: RiskBadgeProps) {
  const config = RISK_CONFIG[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-wider",
        config.bgColor,
        config.color,
        SIZE_CLASSES[size],
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {(level === 'critical' || level === 'high') && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.dotColor)} />
          )}
          <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dotColor)} />
        </span>
      )}
      {config.label}
    </span>
  )
}
