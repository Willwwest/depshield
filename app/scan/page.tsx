"use client"

import { Suspense, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ScanProgress } from "@/components/scan/scan-progress"
import { useScan } from "@/hooks/use-scan"

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { steps, isComplete, error, startScan } = useScan();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const demo = searchParams.get('demo');
    const repo = searchParams.get('repo');
    const paste = searchParams.get('paste');

    if (demo) {
      startScan({ demo });
    } else if (repo) {
      startScan({ repoUrl: repo });
    } else if (paste) {
      const stored = sessionStorage.getItem('pastedPackageJson');
      if (stored) {
        startScan({ packageJson: stored });
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [searchParams, startScan, router]);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isComplete, router]);

  return (
    <>
      <ScanProgress steps={steps} />
      {error && (
        <div className="mt-6 max-w-lg mx-auto p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <p className="font-medium">Scan failed</p>
          <p className="mt-1 text-xs text-red-400/70">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-3 text-xs underline hover:no-underline"
          >
            Go back and try again
          </button>
        </div>
      )}
    </>
  )
}

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center p-4">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
      <div className="relative z-10 w-full">
        <Suspense>
          <ScanContent />
        </Suspense>
      </div>
    </div>
  )
}
