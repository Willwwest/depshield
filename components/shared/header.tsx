"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { LogoWithText } from "./logo"
import { cn } from "@/lib/utils"

interface HeaderProps {
  repoName?: string;
  showBackButton?: boolean;
  showNav?: boolean;
  className?: string;
}

export function Header({ repoName, showBackButton, showNav, className }: HeaderProps) {
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
          <nav className="flex max-sm:hidden items-center gap-1">
            <Link href="/pricing" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
              Pricing
            </Link>
            <Link href="/integrations" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5">
              Integrations
            </Link>
          </nav>
        )}
        {repoName && (
          <span className="text-sm text-muted-foreground font-mono truncate max-w-[300px]">
            {repoName}
          </span>
        )}
        {!repoName && !showNav && <div className="w-[120px]" />}
      </div>
    </header>
  )
}
