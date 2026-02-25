"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Check,
  CreditCard,
  Lock,
  Shield,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CheckoutDialogProps {
  open: boolean
  onClose: () => void
  plan: {
    name: string
    price: number
    priceSuffix: string
    billingCycle: "monthly" | "annual"
  }
}

export function CheckoutDialog({ open, onClose, plan }: CheckoutDialogProps) {
  const [step, setStep] = useState<"form" | "processing" | "success">("form")
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242")
  const [expiry, setExpiry] = useState("12/27")
  const [cvc, setCvc] = useState("123")

  const handleSubmit = () => {
    setStep("processing")
    setTimeout(() => setStep("success"), 2200)
  }

  const handleClose = () => {
    setStep("form")
    onClose()
  }

  const annualTotal = plan.billingCycle === "annual" ? plan.price * 12 : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0C1021] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold">DepShield</span>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Demo Mode Banner */}
            <div className="flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
              <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30 text-[10px]">
                TEST MODE
              </Badge>
              <span className="text-xs text-amber-200/80">
                Stripe integration ready — using test credentials
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 space-y-5"
                >
                  {/* Plan Summary */}
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{plan.name} Plan</p>
                        <p className="text-xs text-muted-foreground">
                          Billed {plan.billingCycle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold">${plan.price}</p>
                        <p className="text-xs text-muted-foreground">
                          {plan.priceSuffix}
                        </p>
                      </div>
                    </div>
                    {annualTotal && (
                      <p className="mt-2 text-xs text-muted-foreground border-t border-white/10 pt-2">
                        Total: ${annualTotal}/year
                      </p>
                    )}
                  </div>

                  {/* Card Form */}
                  <div className="space-y-3">
                    <label className="block space-y-1.5">
                      <span className="text-xs text-muted-foreground">Card number</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:border-primary/50 font-mono"
                          placeholder="4242 4242 4242 4242"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block space-y-1.5">
                        <span className="text-xs text-muted-foreground">Expiry</span>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 font-mono"
                          placeholder="MM/YY"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-xs text-muted-foreground">CVC</span>
                        <input
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 font-mono"
                          placeholder="123"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleSubmit}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Subscribe — ${plan.price}{plan.priceSuffix}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>

                  {/* Trust */}
                  <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" /> SSL encrypted
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" /> PCI compliant
                    </span>
                    <span>Powered by Stripe</span>
                  </div>
                </motion.div>
              )}

              {step === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-12 space-y-4"
                >
                  <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                  <p className="text-sm text-muted-foreground">Processing payment...</p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-10 space-y-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
                    <Check className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold">Welcome to {plan.name}!</p>
                    <p className="text-sm text-muted-foreground">
                      Your subscription is active. Scan unlimited repos now.
                    </p>
                  </div>
                  <Button onClick={handleClose} className="mt-2">
                    Go to Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
