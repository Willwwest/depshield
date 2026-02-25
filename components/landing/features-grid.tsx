"use client"

import { motion } from "framer-motion"
import { HeartPulse, ShieldAlert, Bot, FileWarning, ArrowRightLeft, BarChart3 } from "lucide-react"

const features = [
  { icon: HeartPulse, title: "Maintainer Health", desc: "Track burnout signals, commit frequency, issue response times, and bus factor across your entire dependency tree.", color: "#10B981", span: true },
  { icon: ShieldAlert, title: "Takeover Detection", desc: "Spot the xz-utils pattern before it strikes. We flag suspicious maintainer changes, new unknown publishers, and repository transfers.", color: "#EF4444", span: true },
  { icon: Bot, title: "Slopsquatting Scanner", desc: "Catch AI-hallucinated package names that malicious actors register to intercept installs.", color: "#8B5CF6", span: false },
  { icon: FileWarning, title: "License Mutations", desc: "Track license changes across your dependency tree. Know when MIT becomes AGPL.", color: "#FACC15", span: false },
  { icon: ArrowRightLeft, title: "Migration Advisor", desc: "Get safer alternatives with migration effort estimates when risk increases.", color: "#22D3EE", span: false },
  { icon: BarChart3, title: "Weekly Digest", desc: "Automated health reports track how your dependency risk changes over time.", color: "#6366F1", span: false },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function FeaturesGrid() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-5xl mx-auto px-4 py-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={item}
            className={`glass rounded-xl p-5 hover:bg-white/[0.07] transition-colors ${f.span ? "md:col-span-1 md:row-span-1" : ""}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: f.color + "15" }}>
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
