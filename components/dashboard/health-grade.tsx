"use client"

import { cn } from "@/lib/utils"
import { ScoreGauge } from "@/components/detail/score-gauge"
import type { HealthGrade as HealthGradeType } from "@/lib/types"

interface HealthGradeProps {
  grade: HealthGradeType;
  score: number;
  className?: string;
}

const gradeGlow: Record<HealthGradeType, string> = {
  A: "risk-glow-info",
  B: "risk-glow-low",
  C: "risk-glow-medium",
  D: "risk-glow-high",
  F: "risk-glow-critical",
}

export function HealthGrade({ grade, score, className }: HealthGradeProps) {
  return (
    <div className={cn(
      "rounded-xl border border-white/5 bg-card p-6 flex flex-col items-center justify-center",
      gradeGlow[grade],
      className
    )}>
      <p className="text-sm text-muted-foreground mb-4 font-medium">Health Grade</p>
      <ScoreGauge score={score} grade={grade} size={160} />
    </div>
  )
}
