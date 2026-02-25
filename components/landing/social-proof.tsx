"use client"

import { motion } from "framer-motion"
import { AnimatedCounter } from "@/components/shared/animated-counter"

const stats = [
  { value: 2000000, suffix: "+", label: "Packages in Threat DB", prefix: "" },
  { value: 847, suffix: "", label: "Teams in Beta", prefix: "" },
  { value: 14, suffix: " days", label: "Avg. Early Detection", prefix: "" },
  { value: 0, suffix: "", label: "Cost for Open Source", prefix: "$" },
];

export function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {s.prefix}
              {s.value > 0 ? (
                <AnimatedCounter value={s.value} duration={2000} />
              ) : (
                "0"
              )}
              {s.suffix}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
