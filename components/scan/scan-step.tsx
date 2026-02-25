"use client"

import { cn } from "@/lib/utils"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import type { ScanStepStatus } from "@/lib/types"

interface ScanStepProps {
  label: string;
  description: string;
  status: ScanStepStatus;
  index: number;
}

const statusIcon: Record<ScanStepStatus, React.ReactNode> = {
  pending: <div className="h-5 w-5 rounded-full border border-white/20" />,
  active: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
  complete: <Check className="h-5 w-5 text-emerald-400" />,
  error: <AlertCircle className="h-5 w-5 text-red-400" />,
}

export function ScanStep({ label, description, status, index }: ScanStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg transition-all duration-300",
        status === 'active' && "glass",
        status === 'complete' && "opacity-60",
        status === 'error' && "bg-red-500/5 border border-red-500/20",
      )}
    >
      <div className="mt-0.5 shrink-0">
        {statusIcon[status]}
      </div>
      <div className="min-w-0">
        <p className={cn(
          "font-medium text-sm",
          status === 'active' && "text-foreground",
          status === 'pending' && "text-muted-foreground",
          status === 'complete' && "text-muted-foreground",
          status === 'error' && "text-red-400",
        )}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {status === 'active' && (
        <motion.div
          className="ml-auto text-xs text-primary font-mono"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          analyzing...
        </motion.div>
      )}
    </motion.div>
  )
}
