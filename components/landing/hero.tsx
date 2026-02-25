"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export function Hero() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="text-center pt-16 pb-8 px-4"
    >
      <motion.div variants={item} className="mb-6">
        <Badge variant="secondary" className="text-xs px-3 py-1 border border-primary/20 bg-primary/10 text-primary">
          Now in public beta &mdash; try it free
        </Badge>
      </motion.div>
      <motion.h1 variants={item} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
        Predict dependency disasters
        <br />
        <span className="text-gradient">before they happen</span>
      </motion.h1>
      <motion.p variants={item} className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
        Socket detects the bomb. <span className="text-foreground font-medium">We detect the bomb-maker.</span>
      </motion.p>
      <motion.p variants={item} className="mt-4 text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
        DepShield monitors the humans behind your open-source dependencies &mdash;
        maintainer health, takeover risks, and AI-hallucinated packages &mdash;
        so you catch problems before they become vulnerabilities.
      </motion.p>
    </motion.section>
  )
}
