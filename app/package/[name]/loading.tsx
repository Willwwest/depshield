import { Skeleton } from "@/components/ui/skeleton"

export default function PackageDetailLoading() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <Skeleton className="h-6 w-24" />
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["downloads", "deps", "maintainers", "published", "created"].map((key) => (
            <Skeleton key={key} className="h-[72px] rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl md:col-span-2" />
        </div>

        <Skeleton className="h-[300px] rounded-xl" />
        <Skeleton className="h-[200px] rounded-xl" />
      </main>
    </div>
  )
}
