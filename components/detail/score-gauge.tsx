"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { GRADE_COLORS } from "@/lib/constants"
import type { HealthGrade } from "@/lib/types"

interface ScoreGaugeProps {
  score: number;
  grade: HealthGrade;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreGauge({ score, grade, size = 180, strokeWidth = 12, className }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const offset = arcLength - (arcLength * (score / 100));
  const color = GRADE_COLORS[grade];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={animated ? offset : arcLength}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{grade}</span>
        <span className="text-sm text-muted-foreground font-mono">{score}/100</span>
      </div>
    </div>
  )
}
