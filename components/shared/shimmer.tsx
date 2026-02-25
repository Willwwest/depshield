import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn("rounded-md animate-shimmer", className)}
      style={{ width, height }}
    />
  )
}

export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/5 bg-card p-6 space-y-4", className)}>
      <Shimmer className="h-4 w-1/3" />
      <Shimmer className="h-8 w-2/3" />
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-4/5" />
    </div>
  )
}
