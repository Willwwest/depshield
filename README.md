# DepShield

**AI-powered Dependency Supply Chain Intelligence**

> Socket detects the bomb. We detect the bomb-maker.

DepShield predicts which npm dependencies are **about to become dangerous** by tracking human and organizational signals — not just CVEs. We catch maintainer takeovers, slopsquatting attacks, bus-factor risks, and license mutations *before* they become incidents.

## Why DepShield?

Traditional dependency scanners react to **known vulnerabilities** (CVEs). But the most devastating supply chain attacks — event-stream, ua-parser-js, colors.js — had **zero CVEs at the time of compromise**. The warning signs were behavioral:

- A new maintainer appeared on a dormant package
- An account with no history published a version
- A package name was 1 character off from a popular library

DepShield tracks these **human signals** and scores every dependency on a 0-100 health scale.

## Features

- **Health Scoring** — Every dependency gets a grade (A-F) based on maintainer activity, contributor bus factor, and organizational trust
- **Takeover Detection** — Flags suspicious maintainer changes, publisher swaps, and repository URL mutations
- **Slopsquatting Detection** — Catches AI-generated typosquat packages using Levenshtein distance + download anomaly analysis
- **License Mutation Tracking** — Alerts when dependencies silently change from MIT to GPL or other restrictive licenses
- **Migration Advisor** — Suggests healthier alternatives with effort estimates when a dependency is flagged

## Quick Start

```bash
# Install globally
npm install -g depshield

# Scan your project
npx depshield scan

# Or use as a GitHub Action
# See: action.yml
```

## GitHub Action

Add to `.github/workflows/depshield.yml`:

```yaml
name: DepShield
on: [pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: depshield/action@v1
        with:
          token: ${{ secrets.DEPSHIELD_TOKEN }}
          fail-on: critical
```

Every PR gets an automated comment with dependency risk findings:

| Package | Risk | Issue |
|---------|------|-------|
| `qs` | CRITICAL | Suspicious maintainer change |
| `expresss-validator` | CRITICAL | Slopsquatting detected |

## Architecture

```
Landing -> Scan Input -> Progress Animation -> Dashboard -> Package Detail
    |         |              |                  |            |
  Pricing  Integrations   API Routes      Force Graph    Risk Breakdown
```

**Tech stack**: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, react-force-graph-2d, framer-motion

**Data sources**: npm Registry API, GitHub REST API, npm Downloads API

**No database** — everything computed on-the-fly per scan. Zero data retention.

## Pricing

| Tier | Price | For |
|------|-------|-----|
| Free | $0 | Solo maintainers, 5 public repos |
| Pro | $49/mo | Shipping teams, unlimited repos + CI/CD |
| Enterprise | $199/seat/mo | Regulated orgs, SSO + audit + on-prem |

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Production build
```

## License

MIT
