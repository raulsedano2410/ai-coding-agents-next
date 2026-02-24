import Link from 'next/link'
import { ArrowRight, TrendingUp, Building2, Code2, BookOpen, Factory } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AGENTS, INDUSTRIES, AGENT_COMPANIES, AGENT_STATS, KEY_FINDINGS } from '@/lib/constants'
import { formatNumber } from '@/lib/utils'
import { OverviewCharts } from './overview-charts'
import { getAgents, getAgentTotalByMonth } from '@/lib/queries'

export const revalidate = 3600 // Revalidate every hour

async function getOverviewData() {
  const agents = await getAgents()

  // Get total by month for each agent
  const agentTotals = await Promise.all(
    agents.map(async (agent) => {
      const totals = await getAgentTotalByMonth(agent.id)
      return { agent, totals }
    })
  )

  // Build comparison chart data
  const allMonths = new Set<string>()
  agentTotals.forEach(({ totals }) => {
    totals.forEach(({ month }) => allMonths.add(month))
  })

  const sortedMonths = Array.from(allMonths).sort()
  const comparisonData = sortedMonths.map((month) => {
    const point: Record<string, string | number> = { month }
    agentTotals.forEach(({ agent, totals }) => {
      const monthData = totals.find((t) => t.month === month)
      point[agent.id] = monthData?.total || 0
    })
    return point
  })

  return {
    agents: agents.map((agent) => {
      const agentData = agentTotals.find((at) => at.agent.id === agent.id)
      const latestTotal = agentData?.totals[agentData.totals.length - 1]?.total || 0
      return { ...agent, total_repos: latestTotal }
    }),
    comparisonData,
    monthRange: sortedMonths.length > 0
      ? `${formatMonthShort(sortedMonths[0])} - ${formatMonthShort(sortedMonths[sortedMonths.length - 1])}`
      : 'Jan 2025 - Feb 2026',
  }
}

function formatMonthShort(month: string): string {
  const [year, m] = month.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${year}`
}

export default async function HomePage() {
  const { agents, comparisonData, monthRange } = await getOverviewData()

  const totalRepos = agents.reduce((sum, a) => sum + a.total_repos, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-5 py-2 text-sm text-zinc-400 mb-8">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Research Data &bull; {monthRange}
        </div>

        <h1 className="text-4xl font-bold text-zinc-100 sm:text-5xl lg:text-6xl mb-4">
          <span className="gradient-text">AI Coding Agents</span>
          <br />
          <span className="text-zinc-100">Industry Adoption Analysis</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10">
          Comprehensive research tracking how different industries adopt AI-powered coding
          assistants across {formatNumber(totalRepos)}+ public GitHub repositories, classified by NAICS industry codes.
        </p>

        {/* Hero Stats */}
        <div className="flex justify-center gap-12 flex-wrap">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-extrabold text-purple-400">
              {totalRepos >= 1000000
                ? `${(totalRepos / 1000000).toFixed(1)}M+`
                : `${Math.round(totalRepos / 1000)}K+`}
            </div>
            <div className="text-sm text-zinc-500 mt-1">Repositories Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-extrabold text-purple-400">
              {INDUSTRIES.length}
            </div>
            <div className="text-sm text-zinc-500 mt-1">Industries Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-extrabold text-purple-400">
              {agents.length}
            </div>
            <div className="text-sm text-zinc-500 mt-1">AI Agents Compared</div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Explore by Agent</h2>
          <p className="text-zinc-400">Deep-dive into adoption patterns for each AI coding assistant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const stats = AGENT_STATS[agent.id]
            const company = AGENT_COMPANIES[agent.id]
            return (
              <Link key={agent.id} href={`/${agent.id}`}>
                <Card className="h-full hover:border-zinc-600 transition-all cursor-pointer group">
                  {/* Card Header */}
                  <div className="p-6 border-b border-zinc-800">
                    <span
                      className="inline-block px-3 py-1 rounded-md text-xs font-semibold text-white mb-3"
                      style={{ background: `linear-gradient(135deg, ${agent.color}80, ${agent.color})` }}
                    >
                      {agent.name.toUpperCase()}
                    </span>
                    <h3 className="text-xl font-bold text-zinc-100 mb-1">
                      {agent.name}
                    </h3>
                    {company && (
                      <p className="text-sm text-zinc-500">by {company}</p>
                    )}
                  </div>

                  {/* Card Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: agent.color }}>
                        {stats?.repos || formatNumber(agent.total_repos)}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">Repositories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: agent.color }}>
                        {stats?.profServices || '—'}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">Prof. Services</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: agent.color }}>
                        {stats?.months || '—'}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">Months Data</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: agent.color }}>
                        {stats?.growthRank || '—'}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">Growth Rate</div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 bg-zinc-800/30 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-300">View detailed analysis</span>
                    <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Cumulative Adoption Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewCharts
            comparisonData={comparisonData}
            agents={agents.map((a) => ({ id: a.id, name: a.name, color: a.color }))}
          />
        </CardContent>
      </Card>

      {/* Key Findings */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Key Findings</h2>
          <p className="text-zinc-400">Insights from analyzing industry adoption patterns</p>
        </div>

        <div className="space-y-4">
          {KEY_FINDINGS.map((finding) => (
            <div
              key={finding.number}
              className="flex gap-4 p-5 rounded-xl border border-zinc-800 bg-zinc-900/50"
            >
              <div className="text-2xl font-extrabold text-purple-400 min-w-[40px]">
                {finding.number}
              </div>
              <div>
                <h4 className="text-base font-semibold text-zinc-100 mb-1">
                  {finding.title}
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {finding.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Links */}
      <div className="mb-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Documentation</h2>
          <p className="text-zinc-400">Learn about our data collection and analysis methods</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/methodology">
            <Card className="h-full hover:border-zinc-600 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-5">
                  <BookOpen className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                  Methodology
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Detailed documentation of our data collection process, classification model,
                  confidence calibration, and analysis pipeline.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/industries">
            <Card className="h-full hover:border-zinc-600 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-5">
                  <Factory className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                  Industry Reference
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Complete NAICS industry code reference with descriptions, examples,
                  and explanation of excluded sectors.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
