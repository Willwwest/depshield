"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleX,
  Factory,
  Shield,
  Sparkles,
} from "lucide-react"
import { Header } from "@/components/shared/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type BillingCycle = "monthly" | "annual"

interface PricingTier {
  name: string
  description: string
  monthlyPrice: number
  annualPrice?: number
  priceSuffix: string
  cta: string
  highlighted?: boolean
  features: string[]
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for solo maintainers validating dependency hygiene.",
    monthlyPrice: 0,
    priceSuffix: "/mo",
    cta: "Get Started",
    features: ["5 public repos", "Basic scanning", "Community support"],
  },
  {
    name: "Pro",
    description: "Built for shipping teams that cannot afford surprise incidents.",
    monthlyPrice: 49,
    annualPrice: 39,
    priceSuffix: "/mo",
    cta: "Start Free Trial",
    highlighted: true,
    features: [
      "Unlimited repos",
      "CI/CD integration",
      "PR comments",
      "Slack alerts",
      "Historical tracking",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description: "For regulated organizations standardizing software supply chain governance.",
    monthlyPrice: 199,
    priceSuffix: "/seat/mo",
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "SSO/SAML",
      "Custom policies",
      "SLA",
      "Dedicated CSM",
      "Audit logs",
      "On-prem option",
    ],
  },
]

const comparisonRows = [
  { feature: "Public repo scanning", free: true, pro: true, enterprise: true },
  { feature: "Unlimited repositories", free: false, pro: true, enterprise: true },
  { feature: "PR comment automation", free: false, pro: true, enterprise: true },
  { feature: "Slack alert routing", free: false, pro: true, enterprise: true },
  { feature: "SSO/SAML", free: false, pro: false, enterprise: true },
  { feature: "On-prem deployment", free: false, pro: false, enterprise: true },
]

const faqs = [
  {
    question: "Do you store our package metadata or source code?",
    answer:
      "No. Scans execute on demand and return risk telemetry without retaining your dependency graph. That is why legal reviews are typically fast.",
  },
  {
    question: "Can we run DepShield in CI across monorepos?",
    answer:
      "Yes. Pro and Enterprise include CI/CD integration with policy gates and pull request annotations, including multi-package monorepo support.",
  },
  {
    question: "What happens when we outgrow Pro?",
    answer:
      "Enterprise adds SSO/SAML, audit trails, on-prem options, and a dedicated customer success manager to align with procurement and compliance workflows.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer:
      "Pro starts with a free trial and no card required. Enterprise pilots include a scoped rollout plan with security review artifacts.",
  },
  {
    question: "Can pricing scale with seat commitments?",
    answer:
      "Yes. Enterprise contracts support seat commitments and annual terms when you need predictable budgeting across multiple teams.",
  },
]

function FeatureCell({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Check className="h-4 w-4 text-emerald-400" aria-label="Included" />
  ) : (
    <CircleX className="h-4 w-4 text-muted-foreground/70" aria-label="Not included" />
  )
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const annualSavings = useMemo(() => {
    const pro = tiers.find((tier) => tier.name === "Pro")
    if (!pro?.annualPrice) return 0
    return Math.round(((pro.monthlyPrice - pro.annualPrice) / pro.monthlyPrice) * 100)
  }, [])

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
      <Header showBackButton />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center space-y-5"
        >
          <Badge className="glass border-white/15 text-[11px] tracking-wide uppercase">
            Revenue-ready pricing
          </Badge>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Invest in <span className="text-gradient">Supply Chain Visibility</span>,
            <br className="hidden md:block" />
            avoid million-dollar dependency surprises.
          </h1>
          <p className="max-w-3xl mx-auto text-sm md:text-base text-muted-foreground">
            A clear expansion path from solo maintainers to enterprise security teams. Simple entry,
            strong retention, and obvious upside to $10K+ MRR.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-2 py-1">
            <Button
              size="sm"
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant={billingCycle === "annual" ? "default" : "ghost"}
              className="rounded-full"
              onClick={() => setBillingCycle("annual")}
            >
              Annual
            </Button>
            <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
              Save {annualSavings}%
            </Badge>
          </div>
        </motion.section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
          {tiers.map((tier, index) => {
            const isPro = tier.name === "Pro"
            const currentPrice =
              billingCycle === "annual" && tier.annualPrice ? tier.annualPrice : tier.monthlyPrice

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 * index, duration: 0.45, ease: "easeOut" }}
                className="h-full"
              >
                <Card
                  className={[
                    "glass border-white/10 relative h-full gap-0",
                    isPro ? "glass-strong border-primary/40 shadow-[0_0_45px_rgba(139,92,246,0.25)]" : "",
                  ].join(" ")}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-6 bg-accent text-accent-foreground border border-accent/60">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="space-y-2 pb-5">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground min-h-10">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-semibold tracking-tight">${currentPrice}</span>
                        <span className="text-sm text-muted-foreground pb-1">{tier.priceSuffix}</span>
                      </div>
                      {billingCycle === "annual" && tier.annualPrice && (
                        <p className="text-xs text-muted-foreground mt-1">
                          billed annually, regular <span className="line-through">${tier.monthlyPrice}/mo</span>
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 text-sm">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-muted-foreground">
                          <BadgeCheck className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    <Button
                      className={[
                        "w-full",
                        isPro ? "bg-primary hover:bg-primary/90" : "",
                        tier.name === "Enterprise" ? "bg-white/10 hover:bg-white/15 border border-white/15" : "",
                      ].join(" ")}
                    >
                      {tier.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass rounded-2xl border border-white/10 p-5 md:p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Factory className="h-4 w-4 text-primary" />
            How we get to $10K MRR
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Pro expansion</p>
              <p className="text-lg md:text-xl font-semibold">200 Pro teams x $49 = $9,800/mo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Team-led adoption through CI automation and weekly risk digests.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Enterprise runway</p>
              <p className="text-lg md:text-xl font-semibold">50 Enterprise seats x $199 = $9,950/mo</p>
              <p className="text-sm text-muted-foreground mt-1">
                Security and platform teams consolidate governance with SSO and audit controls.
              </p>
            </div>
          </div>
        </motion.section>

        <section className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold tracking-tight">Feature comparison</h2>
            <p className="text-sm text-muted-foreground mt-1">Quick view of what each tier unlocks.</p>
          </div>
          <div className="p-3 md:p-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-white/10">
                  <th className="py-3 px-3 font-medium">Capability</th>
                  <th className="py-3 px-3 font-medium">Free</th>
                  <th className="py-3 px-3 font-medium">Pro</th>
                  <th className="py-3 px-3 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-white/5 last:border-none">
                    <td className="py-3 px-3 text-foreground/95">{row.feature}</td>
                    <td className="py-3 px-3"><FeatureCell enabled={row.free} /></td>
                    <td className="py-3 px-3"><FeatureCell enabled={row.pro} /></td>
                    <td className="py-3 px-3"><FeatureCell enabled={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass border-white/10 py-4 gap-2">
            <CardContent className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">SOC 2 Compliant</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/10 py-4 gap-2">
            <CardContent className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium">No data stored</p>
                <p className="text-xs text-muted-foreground">Results computed on demand</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-white/10 py-4 gap-2">
            <CardContent className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-medium">Open source scanner</p>
                <p className="text-xs text-muted-foreground">Transparent engine and methodology</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 pb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
              <p className="text-sm text-muted-foreground mt-1">Everything security, procurement, and engineering asks first.</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <Card key={faq.question} className="glass border-white/10 py-0 gap-0">
                  <button
                    type="button"
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={[
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>
                  {isOpen && (
                    <CardContent className="pt-0 pb-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
