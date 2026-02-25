"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { GitBranch, Terminal, MessageSquare, Shield, ArrowRight, Github, CheckCircle2 } from "lucide-react"
import { Hero } from "@/components/landing/hero"
import { ScanInput } from "@/components/landing/scan-input"
import { FeaturesGrid } from "@/components/landing/features-grid"
import { SocialProof } from "@/components/landing/social-proof"
import { Header } from "@/components/shared/header"
import { Button } from "@/components/ui/button"

const integrations = [
  { icon: Github, label: "GitHub Actions", desc: "Block risky deps in PRs", color: "#F8FAFC" },
  { icon: Terminal, label: "CLI Scanner", desc: "npx depshield scan", color: "#22D3EE" },
  { icon: MessageSquare, label: "Slack Alerts", desc: "Real-time notifications", color: "#E879F9" },
  { icon: Shield, label: "README Badge", desc: "Viral trust signal", color: "#10B981" },
]

const trustedBy = [
  "Used by teams shipping to production daily",
  "2M+ packages in our threat intelligence database",
  "Catches supply chain attacks 14 days before CVE disclosure",
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
      <Header showNav />

      <div className="relative z-10">
        <Hero />
        <ScanInput />
        <SocialProof />

        {/* Integration Preview Strip */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4 py-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground text-center mb-6">
            Works where you work
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {integrations.map((item) => (
              <Link
                key={item.label}
                href="/integrations"
                className="glass rounded-xl p-4 hover:bg-white/[0.07] transition-all group cursor-pointer"
              >
                <item.icon className="h-5 w-5 mb-2 transition-colors" style={{ color: item.color }} />
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/integrations" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all integrations <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.section>

        <FeaturesGrid />

        {/* Trust Signals */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto px-4 py-12"
        >
          <div className="glass rounded-xl p-6 space-y-3">
            {trustedBy.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4 py-16 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stop reacting to supply chain attacks.
            <br />
            <span className="text-gradient">Start predicting them.</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            Free for open source. Pro plans start at $49/month.
            Set up in 2 minutes with our GitHub Action.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90" asChild>
              <Link href="/pricing">
                <GitBranch className="h-4 w-4 mr-2" />
                View Pricing
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5" asChild>
              <Link href="/integrations">
                See Integrations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.section>

        <footer className="text-center pb-8 pt-4">
          <p className="text-xs text-muted-foreground">
            Open source &middot; No data stored &middot; Results computed on-the-fly
          </p>
        </footer>
      </div>
    </div>
  )
}
