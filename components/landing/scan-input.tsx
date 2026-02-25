"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Search, Zap } from "lucide-react"

export function ScanInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPaste, setIsPaste] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    if (isPaste) {
      sessionStorage.setItem("pastedPackageJson", value);
      router.push("/scan?paste=true");
    } else {
      router.push(`/scan?repo=${encodeURIComponent(value.trim())}`);
    }
  }

  function handleChange(val: string) {
    setValue(val);
    if (val.trim().startsWith("{") && !isPaste) setIsPaste(true);
    if (!val.trim().startsWith("{") && isPaste) setIsPaste(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="max-w-lg mx-auto px-4"
    >
      <form onSubmit={handleSubmit} className="glass rounded-xl p-4 space-y-3">
        {isPaste ? (
          <textarea
            value={value}
            onChange={e => handleChange(e.target.value)}
            placeholder='Paste your package.json here...'
            rows={6}
            className="w-full bg-white/5 rounded-lg border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-mono"
          />
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={value}
              onChange={e => handleChange(e.target.value)}
              placeholder="github.com/user/repo or paste package.json"
              className="w-full bg-white/5 rounded-lg border border-white/10 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Scan Now
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-muted-foreground">or try a demo</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/10 hover:bg-white/5"
          onClick={() => router.push("/scan?demo=express")}
        >
          <Zap className="h-3.5 w-3.5 mr-2 text-yellow-400" />
          Try with Express
        </Button>
      </form>
    </motion.div>
  )
}
