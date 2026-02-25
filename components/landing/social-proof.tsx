"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle2, Loader2 } from "lucide-react"

const stats = [
  { value: 2000000, suffix: "+", label: "Packages in Threat DB", prefix: "" },
  { value: 14, suffix: " days", label: "Avg. Early Detection", prefix: "" },
  { value: 0, suffix: "", label: "Cost for Open Source", prefix: "$" },
]

export function SocialProof() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState("error")
      setErrorMsg("Enter a valid email address")
      return
    }

    setState("loading")
    await new Promise(r => setTimeout(r, 800))

    try {
      const existing = JSON.parse(localStorage.getItem("depshield_waitlist") || "[]") as string[]
      if (!existing.includes(trimmed)) {
        existing.push(trimmed)
        localStorage.setItem("depshield_waitlist", JSON.stringify(existing))
      }
      setState("success")
    } catch {
      setState("success")
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Early Access
          </p>
          <h3 className="text-lg font-semibold text-foreground">
            Join the waitlist for Pro features
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            CI/CD integration, Slack alerts, and team dashboards. Free tier stays free forever.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 py-3"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">
                You&apos;re on the list. We&apos;ll be in touch.
              </span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (state === "error") setState("idle")
                  }}
                  placeholder="you@company.com"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                {state === "error" && (
                  <p className="text-[11px] text-red-400 mt-1 absolute">{errorMsg}</p>
                )}
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={state === "loading"}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 h-10 px-5 shrink-0"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Get Early Access"
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/5">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-foreground">
                {s.prefix}
                {s.value > 0 ? (
                  <AnimatedCounter value={s.value} duration={2000} />
                ) : (
                  "0"
                )}
                {s.suffix}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
