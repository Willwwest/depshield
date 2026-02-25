"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Menu, X } from "lucide-react"
import { LogoWithText } from "./logo"
import { cn } from "@/lib/utils"

interface HeaderProps {
  repoName?: string;
  showBackButton?: boolean;
  showNav?: boolean;
  className?: string;
}

export function Header({ repoName, showBackButton, showNav, className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className={cn("sticky top-0 z-50 glass border-b border-white/5", className)}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Link href="/dashboard" className="p-1.5 rounded-md hover:bg-white/5 transition-colors" title="Back to dashboard">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
          <Link href="/">
            <LogoWithText size={24} />
          </Link>
        </div>
        {showNav && (
          <>
            <nav className="flex max-sm:hidden items-center gap-1">
              <Link href="/pricing" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
                Pricing
              </Link>
              <Link href="/integrations" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
                Integrations
              </Link>
            </nav>
            <button
              type="button"
              className="sm:hidden p-1.5 rounded-md hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-muted-foreground" />}
            </button>
          </>
        )}
        {repoName && (
          <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-[300px]">
            {repoName}
          </span>
        )}
        {!repoName && !showNav && <div className="w-[120px]" />}
      </div>
      {showNav && mobileMenuOpen && (
        <nav className="sm:hidden border-t border-white/5 px-4 py-3 space-y-1">
          <Link
            href="/pricing"
            className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/integrations"
            className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
            onClick={() => setMobileMenuOpen(false)}
          >
            Integrations
          </Link>
        </nav>
      )}
    </header>
  )
}
