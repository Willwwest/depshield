"use client"

import { motion } from "framer-motion"
import { ScanStep } from "./scan-step"
import { Logo } from "@/components/shared/logo"
import type { ScanStep as ScanStepType } from "@/lib/types"

interface ScanProgressProps {
  steps: ScanStepType[];
  packagesProcessed?: number;
  totalPackages?: number;
}

export function ScanProgress({ steps, packagesProcessed = 0, totalPackages = 0 }: ScanProgressProps) {
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="animate-pulse-glow text-primary mb-4">
          <Logo size={48} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Scanning Dependencies</h2>
        {totalPackages > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {packagesProcessed} / {totalPackages} packages analyzed
          </p>
        )}
      </motion.div>

      <div className="relative mb-6">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right font-mono">
          {Math.round(progress)}%
        </p>
      </div>

      <div className="space-y-1">
        {steps.map((step, i) => (
          <ScanStep
            key={step.id}
            label={step.label}
            description={step.description}
            status={step.status}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
