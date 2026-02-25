import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <Skeleton className="h-6 w-32" />
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[220px] rounded-xl" />
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {["total", "critical", "high", "bus"].map((key) => (
              <Skeleton key={key} className="h-[88px] rounded-xl" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[500px] rounded-xl" />
          <Skeleton className="lg:col-span-1 h-[500px] rounded-xl" />
        </div>

        <Skeleton className="h-[500px] rounded-xl" />
      </main>
    </div>
  )
}
