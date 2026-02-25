"use client"

import { type ReactNode, useMemo, useState } from "react"
import { motion, type Variants } from "framer-motion"
import {
  AlertTriangle,
  Check,
  Copy,
  Github,
  Hash,
  Link2,
  MessageSquareText,
  Shield,
  Slack,
  Terminal,
} from "lucide-react"
import { Header } from "@/components/shared/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const navItems = [
  { id: "github-action", label: "GitHub Action" },
  { id: "readme-badge", label: "README Badge" },
  { id: "cli-scanner", label: "CLI Scanner" },
  { id: "slack-notify", label: "Slack" },
]

const actionYaml = `name: DepShield
on: [pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: depshield/action@v1
        with:
          token: \${{ secrets.DEPSHIELD_TOKEN }}`

const badgeStyles = ["flat", "flat-square", "for-the-badge"] as const

type CopyKey = "yaml" | "badge"

const sectionContainer: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function IntegrationShell({
  id,
  title,
  subtitle,
  icon,
  reverse,
  preview,
  body,
}: {
  id: string
  title: string
  subtitle: string
  icon: ReactNode
  reverse?: boolean
  preview: ReactNode
  body: ReactNode
}) {
  return (
    <motion.section
      id={id}
      variants={sectionContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="glass-strong rounded-2xl border border-white/10 p-5 sm:p-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-primary">{icon}</div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className={reverse ? "lg:order-2" : ""}>{preview}</div>
        <div className={reverse ? "lg:order-1" : ""}>{body}</div>
      </div>
    </motion.section>
  )
}

export default function IntegrationsPage() {
  const [copied, setCopied] = useState<CopyKey | null>(null)
  const [owner, setOwner] = useState("acme-security")
  const [repo, setRepo] = useState("payments-api")
  const [badgeStyle, setBadgeStyle] = useState<(typeof badgeStyles)[number]>("flat")

  const badgeUrl = useMemo(() => {
    const safeOwner = owner.trim() || "owner"
    const safeRepo = repo.trim() || "repo"
    return `https://depshield.dev/badge/${safeOwner}/${safeRepo}.svg`
  }, [owner, repo])

  const badgeImageUrl = useMemo(() => {
    return badgeStyle === "flat" ? badgeUrl : `${badgeUrl}?style=${badgeStyle}`
  }, [badgeStyle, badgeUrl])

  const badgeMarkdown = useMemo(() => {
    const safeOwner = owner.trim() || "owner"
    const safeRepo = repo.trim() || "repo"
    return `[![DepShield: A | 92/100](${badgeImageUrl})](https://depshield.dev/${safeOwner}/${safeRepo})`
  }, [badgeImageUrl, owner, repo])

  const handleCopy = async (key: CopyKey, value: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return
    }
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1800)
  }

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="bg-radial-glow fixed inset-0 pointer-events-none" />
      <Header showBackButton />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:py-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-4"
        >
          <Badge variant="outline" className="glass border-indigo-300/20 text-indigo-200">
            Distribution Surface
          </Badge>
          <h1 className="text-gradient text-4xl font-bold tracking-tight sm:text-5xl">Integrations</h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Ship safely with tools you already use. CI gates, viral README trust signals, local CLI workflows,
            and team-level Slack escalation all in one pipeline.
          </p>
        </motion.section>

        <Tabs defaultValue="github-action" className="gap-4">
          <TabsList variant="line" className="glass h-auto w-full flex-wrap justify-start gap-2 rounded-xl p-2">
            {navItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="rounded-lg px-3 py-1.5 text-xs sm:text-sm">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="github-action">
            <IntegrationShell
              id="github-action"
              title="GitHub Action CI/CD"
              subtitle="The merge gate that catches dependency threats before production"
              icon={<Github className="h-5 w-5" />}
              preview={
                <div className="glass rounded-xl border border-white/10 p-4">
                  <div className="flex items-start gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">depshield-bot commented</p>
                      <p className="text-xs text-muted-foreground">DepShield found 2 critical issues in this PR</p>
                    </div>
                  </div>

                  <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.04] text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">package name</th>
                          <th className="px-3 py-2">risk level</th>
                          <th className="px-3 py-2">issue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-white/10">
                          <td className="px-3 py-2 font-mono text-red-200">qs</td>
                          <td className="px-3 py-2">
                            <Badge className="bg-red-500/20 text-red-200">CRITICAL</Badge>
                          </td>
                          <td className="px-3 py-2 text-red-100">Suspicious maintainer change</td>
                        </tr>
                        <tr className="border-t border-white/10">
                          <td className="px-3 py-2 font-mono text-red-200">expresss-validator</td>
                          <td className="px-3 py-2">
                            <Badge className="bg-red-500/20 text-red-200">CRITICAL</Badge>
                          </td>
                          <td className="px-3 py-2 text-red-100">Slopsquatting detected</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <a href="#" className="text-xs text-cyan-300 hover:text-cyan-200">
                      View full report {"->"}
                    </a>
                    <Badge className="rounded-md bg-amber-500/20 px-2 py-1 text-amber-200">
                      Health Grade: D (55/100)
                    </Badge>
                  </div>
                </div>
              }
              body={
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Add one workflow file and every pull request gets an automated dependency threat assessment
                    with actionable reasons, not generic CVE noise.
                  </p>

                  <div className="glass rounded-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                      <span className="text-xs text-muted-foreground">.github/workflows/depshield.yml</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleCopy("yaml", actionYaml)}
                      >
                        {copied === "yaml" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied === "yaml" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed text-slate-200">
                      <code>{actionYaml}</code>
                    </pre>
                  </div>

                  <p className="text-sm font-medium text-indigo-200">
                    Block risky dependencies before they merge. 2 minutes to set up.
                  </p>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="readme-badge">
            <IntegrationShell
              id="readme-badge"
              title="README Badge"
              subtitle="Viral social proof that travels with every open-source repo"
              icon={<Link2 className="h-5 w-5" />}
              reverse
              preview={
                <div className="glass rounded-xl border border-white/10 p-4">
                  <div className="mb-4 rounded-lg border border-white/10 bg-[#0B1225] p-4">
                    <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
                    <div className="inline-flex items-center overflow-hidden rounded-md border border-emerald-400/30 text-xs font-semibold">
                      <span className="bg-emerald-500/20 px-2.5 py-1 text-emerald-100">DepShield: A</span>
                      <span className="bg-emerald-400/15 px-2.5 py-1 text-emerald-200">92/100</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Style</p>
                    <div className="flex flex-wrap gap-2">
                      {badgeStyles.map((style) => (
                        <Button
                          key={style}
                          size="sm"
                          variant={badgeStyle === style ? "secondary" : "outline"}
                          className="h-7 rounded-md px-2 text-xs"
                          onClick={() => setBadgeStyle(style)}
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              }
              body={
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Every badge is a backlink. Every backlink is a potential customer. Teams showcase health scores
                    publicly, prospects discover DepShield organically.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-xs text-muted-foreground">
                      Owner
                      <input
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-indigo-400/40"
                        value={owner}
                        onChange={(event) => setOwner(event.target.value)}
                      />
                    </label>
                    <label className="space-y-1 text-xs text-muted-foreground">
                      Repo
                      <input
                        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-indigo-400/40"
                        value={repo}
                        onChange={(event) => setRepo(event.target.value)}
                      />
                    </label>
                  </div>

                  <div className="glass rounded-xl border border-white/10">
                    <div className="border-b border-white/10 px-4 py-2 text-xs text-muted-foreground">Badge URL</div>
                    <p className="break-all px-4 py-3 font-mono text-xs text-cyan-200">{badgeUrl}</p>
                  </div>

                  <div className="glass rounded-xl border border-white/10">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                      <span className="text-xs text-muted-foreground">README markdown</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleCopy("badge", badgeMarkdown)}
                      >
                        {copied === "badge" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied === "badge" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <pre className="overflow-x-auto px-4 py-3 text-xs text-slate-200">
                      <code>{badgeMarkdown}</code>
                    </pre>
                  </div>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="cli-scanner">
            <IntegrationShell
              id="cli-scanner"
              title="CLI Scanner"
              subtitle="Developer-first local scanning for pre-commit and pre-push workflows"
              icon={<Terminal className="h-5 w-5" />}
              preview={
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#060913] shadow-[0_24px_80px_rgba(2,8,20,0.6)]">
                  <div className="flex items-center gap-1 border-b border-white/10 px-4 py-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-300/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 text-xs text-slate-400">terminal</span>
                  </div>
                  <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed sm:text-[13px]">
                    <code>
                      <span className="text-emerald-300">$ npx depshield scan</span>
                      {"\n\n"}
                      <span className="text-slate-200">  DepShield v1.0.0 -- Dependency Supply Chain Intelligence</span>
                      {"\n\n"}
                      <span className="text-slate-300">  Scanning package.json...</span>
                      {"\n"}
                      <span className="text-slate-300">  Found 13 dependencies (8 direct, 5 transitive)</span>
                      {"\n\n"}
                      <span className="text-rose-300">  ⚠  2 CRITICAL</span>
                      <span className="text-amber-300">  1 HIGH</span>
                      <span className="text-yellow-300">  2 MEDIUM</span>
                      <span className="text-emerald-300">  8 SAFE</span>
                      {"\n\n"}
                      <span className="text-rose-300">  CRITICAL  qs@6.13.1</span>
                      {"\n"}
                      <span className="text-slate-400">            Suspicious maintainer change: unkown-contrib-42 (28d old account)</span>
                      {"\n\n"}
                      <span className="text-rose-300">  CRITICAL  expresss-validator@0.1.0</span>
                      {"\n"}
                      <span className="text-slate-400">            Slopsquatting: 1 char from express-validator (2.8M downloads)</span>
                      {"\n\n"}
                      <span className="text-amber-300">  HIGH      body-parser@1.20.3</span>
                      {"\n"}
                      <span className="text-slate-400">            Bus factor: 1 maintainer, inactive 240 days</span>
                      {"\n\n"}
                      <span className="text-slate-100">  Overall Health: D (55/100)</span>
                      {"\n\n"}
                      <span className="text-cyan-300">  Full report: https://depshield.dev/report/abc123</span>
                    </code>
                  </pre>
                </div>
              }
              body={
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Secure teams shift left. The CLI plugs into shell scripts, CI bootstraps, and git hooks without
                    forcing a dashboard-first workflow.
                  </p>
                  <div className="glass rounded-xl border border-white/10 p-4">
                    <p className="font-mono text-sm text-emerald-300">npm install -g depshield</p>
                    <p className="mt-2 text-xs text-muted-foreground">Open source CLI. Free forever.</p>
                  </div>
                  <div className="grid gap-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      Works locally in under 5 seconds for typical Node repos
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      Emits machine-readable JSON for pipeline automation
                    </p>
                  </div>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="slack-notify">
            <IntegrationShell
              id="slack-notify"
              title="Slack Notifications"
              subtitle="Enterprise-ready incident broadcast and weekly risk digest"
              icon={<Slack className="h-5 w-5" />}
              reverse
              preview={
                <div className="glass rounded-xl border border-white/10 p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Hash className="h-4 w-4 text-slate-300" />
                      #engineering
                    </p>
                    <Badge variant="secondary" className="rounded-md text-[10px]">
                      live alerts
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-red-200">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        DepShield bot
                      </p>
                      <p className="text-sm text-red-100">
                        🚨 New critical alert: Suspicious maintainer change on <span className="font-mono">qs</span> package
                      </p>
                      <Button size="sm" className="mt-3 h-7 bg-red-500/70 px-2 text-xs hover:bg-red-500/80">
                        View in DepShield
                      </Button>
                    </div>

                    <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-200">
                        <MessageSquareText className="h-3.5 w-3.5" />
                        Scheduled digest
                      </p>
                      <p className="text-sm text-cyan-100">
                        📊 Weekly DepShield Digest: Health score dropped from 68 {"->"} 55. 3 new alerts.
                      </p>
                    </div>
                  </div>
                </div>
              }
              body={
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Security only works when it reaches humans fast. Route alerts into the channels your team already
                    monitors, then escalate with one click.
                  </p>

                  <div className="glass rounded-xl border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Notification matrix</p>
                    <div className="mt-3 grid gap-2 text-xs">
                      <p className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                        <span className="text-slate-300">Critical maintainer events</span>
                        <span className="text-red-300">Immediate</span>
                      </p>
                      <p className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                        <span className="text-slate-300">Typosquat or slopsquat match</span>
                        <span className="text-amber-300">Immediate</span>
                      </p>
                      <p className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2">
                        <span className="text-slate-300">Portfolio health drift</span>
                        <span className="text-cyan-300">Weekly digest</span>
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-indigo-200">Get alerted where your team already works.</p>
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
