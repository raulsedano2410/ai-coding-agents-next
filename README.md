# AI Coding Agents: Industry Adoption Dashboard

> **Live at [ai-coding-agents-next.vercel.app](https://ai-coding-agents-next.vercel.app)**

Full-stack research dashboard tracking how **886,000+ GitHub repositories** adopt AI coding assistants across **19 NAICS industry sectors**. Built with Next.js, Supabase, and a daily-updating ML pipeline.

---

## Overview

This project answers a simple question: **which industries are adopting AI coding tools, and how fast?**

We track four AI coding agents — Claude Code, GitHub Copilot, OpenAI Codex, and Cursor AI — by detecting their signatures in public GitHub commits and pull requests. Each repository is then classified into a NAICS industry sector using a fine-tuned RoBERTa model.

| Agent | Repositories | Top Industry | Detection Method |
|-------|-------------|-------------|-----------------|
| Claude Code | 391K | Professional Services (28%) | `Co-Authored-By: *@anthropic.com` |
| OpenAI Codex | 249K | Professional Services (22%) | `Co-Authored-By: *@openai.com` |
| GitHub Copilot | 247K | Professional Services (25%) | Copilot commit patterns |
| Cursor AI | 129K | Professional Services (24%) | `head:cursor/` branches |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                           │
│                     (Daily at 00:05 UTC)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ fetch_daily   │→│ classify_new_repos│→│ upload_to_supabase│  │
│  │   .py         │  │      .py         │  │      .py         │  │
│  │              │  │                  │  │                  │  │
│  │ GitHub API   │  │ RoBERTa (CPU)    │  │ Supabase Client  │  │
│  │ Search +     │  │ NAICS classifier │  │ Upsert monthly   │  │
│  │ Repo metadata│  │ 19 sectors       │  │ stats            │  │
│  └──────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase (PostgreSQL)                      │
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌───────────────┐  ┌─────────┐ │
│  │ agents   │  │ industries │  │ monthly_stats │  │metadata │ │
│  │ 4 rows   │  │ 19 rows    │  │ 1,273 rows    │  │ 1 row   │ │
│  └──────────┘  └────────────┘  └───────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 16 (Vercel)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Server-Side Rendering + Static Generation                │  │
│  │ • SSG for agent pages (revalidate every hour)            │  │
│  │ • Fallback to JSON when Supabase unavailable             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Pages:                                                         │
│  ├── /           Overview: hero stats, agent cards, comparison  │
│  ├── /[agent]    Per-agent: animated bar race, time series      │
│  ├── /industries NAICS reference: 19 cards + excluded sectors   │
│  └── /methodology Detection, classification, calibration tables │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### Interactive Visualizations
- **Animated Bar Race** — Industries compete over time with Play/Pause/Reset, speed control (0.5x–4x), and month selector
- **Cumulative Adoption Chart** — Stacked area with Top 5/10/All filter and Linear/Logarithmic scale toggle
- **Monthly New Repos Chart** — Switch between Line and Stacked Bar views
- **Clickable Legends** — Click any industry to show/hide its data series
- **Comparison Chart** — All 4 agents on a single line chart

### Data & Research
- **886K+ repositories** analyzed across 19 NAICS sectors
- **4 Key Findings** with supporting data
- **Detection Validation** tables (True Positive rates per agent)
- **Per-Sector Performance** metrics (Precision, Recall, F1)
- **Confidence Calibration** analysis with threshold coverage

### Daily Automation
- GitHub Actions pipeline runs at 00:05 UTC
- Fetches new commits/PRs → classifies industries → updates Supabase
- Zero-downtime: Vercel auto-deploys on push, data refreshes hourly via ISR

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS 4 | App Router, SSG/SSR, dark theme |
| **Charts** | Recharts | Area, Bar, Line charts with interactivity |
| **UI** | Radix UI, Lucide Icons | Tabs, selects, accessible components |
| **Database** | Supabase (PostgreSQL) | Time-series storage, RLS policies |
| **ML Pipeline** | Python, RoBERTa (HuggingFace), PyTorch | NAICS industry classification (CPU) |
| **Automation** | GitHub Actions | Daily data fetch + classify + upload |
| **Hosting** | Vercel | Edge deployment, ISR revalidation |

---

## Project Structure

```
ai-coding-agents-next/
├── app/
│   ├── page.tsx                # Overview: hero, agent cards, findings
│   ├── overview-charts.tsx     # Comparison chart (client)
│   ├── [agent]/
│   │   ├── page.tsx            # Agent detail: stats, charts
│   │   └── agent-charts.tsx    # Bar race + time series (client)
│   ├── industries/page.tsx     # 19 NAICS cards + excluded sectors
│   └── methodology/page.tsx    # TOC, tables, limitations
├── components/
│   ├── charts/
│   │   ├── industry-bar-race.tsx   # Animated bar race with controls
│   │   ├── cumulative-chart.tsx    # Stacked area + filters
│   │   ├── monthly-chart.tsx       # Line/Bar toggle + filters
│   │   └── comparison-chart.tsx    # Multi-agent line chart
│   ├── layout/
│   │   ├── navbar.tsx              # Responsive navigation
│   │   └── footer.tsx
│   └── ui/                         # Radix-based primitives
├── lib/
│   ├── queries.ts              # Supabase queries + JSON fallback
│   ├── constants.ts            # Agents, industries, findings
│   ├── types.ts                # TypeScript interfaces
│   └── supabase.ts             # Lazy client initialization
├── scripts/
│   ├── fetch_daily.py          # GitHub API → unique repos + metadata
│   ├── classify_new_repos.py   # RoBERTa NAICS classification
│   └── upload_to_supabase.py   # Aggregate + upsert monthly_stats
└── .github/workflows/
    └── update-data.yml         # Daily pipeline (00:05 UTC)
```

---

## Getting Started

### Prerequisites

- Node.js 22+ (via nvm)
- Python 3.12+ (for pipeline scripts)

### Local Development

```bash
# Clone the repo
git clone https://github.com/raulsedano2410/ai-coding-agents-next.git
cd ai-coding-agents-next

# Install dependencies
npm install

# Set up environment (optional — works without Supabase using JSON fallback)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Daily Pipeline Setup

To enable automatic daily updates, configure these GitHub repository secrets:

| Secret | Value |
|--------|-------|
| `GH_TOKEN` | GitHub personal access token |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key from Supabase Dashboard > Settings > API |

The workflow runs automatically at 00:05 UTC or can be triggered manually from Actions tab.

---

## Database Schema

```sql
-- 4 agents tracked
CREATE TABLE agents (
    id TEXT PRIMARY KEY,        -- 'claude', 'copilot', 'codex', 'cursor'
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    total_repos INTEGER DEFAULT 0
);

-- 19 NAICS industry sectors
CREATE TABLE industries (
    code TEXT PRIMARY KEY,      -- '54', '51', '52', etc.
    name TEXT NOT NULL,
    color TEXT NOT NULL
);

-- Time-series data: ~1,300 rows
CREATE TABLE monthly_stats (
    id SERIAL PRIMARY KEY,
    agent_id TEXT REFERENCES agents(id),
    industry_code TEXT REFERENCES industries(code),
    month TEXT NOT NULL,         -- '2025-01', '2025-02', etc.
    cumulative INTEGER NOT NULL, -- Running total
    new_repos INTEGER NOT NULL,  -- New this month
    UNIQUE(agent_id, industry_code, month)
);
```

---

## Key Findings

1. **Professional Services Dominates** — NAICS 54 leads across all agents (22–28%)
2. **Information Sector Strong Second** — NAICS 51 consistently ranks #2
3. **Claude Code Fastest Growth** — 111K+ new repos in January 2026 alone
4. **Finance & Healthcare Accelerating** — Growing trust in AI tools for regulated industries

---

## Related Repositories

| Repository | Description |
|-----------|-------------|
| [ai-coding-agents-industry-analysis](https://github.com/alexanderquispe/ai-coding-agents-industry-analysis) | Static HTML/CSS/JS version with Chart.js |
| [github-repo-fetcher](https://github.com/alexanderquispe/github-repo-fetcher) | Python scripts for bulk GitHub API data collection |
| [naics-github-train](https://github.com/alexanderquispe/naics-github-train) | RoBERTa NAICS classifier training code |

---

## License

Data and analysis provided for research purposes. See individual data sources for their respective terms of use.
