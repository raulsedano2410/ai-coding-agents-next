import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AGENTS, INDUSTRIES, AGENT_DESCRIPTIONS } from '@/lib/constants'
import { getAgent, getAgentStats, getIndustries } from '@/lib/queries'
import { formatNumber } from '@/lib/utils'
import { AgentCharts } from './agent-charts'
import { MonthlyStat, Industry } from '@/lib/types'

export const revalidate = 3600

export async function generateStaticParams() {
  return AGENTS.map((agent) => ({
    agent: agent.id,
  }))
}

interface PageProps {
  params: Promise<{ agent: string }>
}

function processStats(stats: MonthlyStat[], industries: Industry[]) {
  // Get unique months
  const months = [...new Set(stats.map((s) => s.month))].sort()

  // Build cumulative data (stacked area chart)
  const cumulativeData = months.map((month) => {
    const point: Record<string, string | number> = { month }
    industries.forEach((ind) => {
      const stat = stats.find(
        (s) => s.month === month && s.industry_code === ind.code
      )
      point[ind.code] = stat?.cumulative || 0
    })
    return point
  })

  // Build monthly data (bar chart)
  const monthlyData = months.map((month) => {
    const point: Record<string, string | number> = { month }
    industries.forEach((ind) => {
      const stat = stats.find(
        (s) => s.month === month && s.industry_code === ind.code
      )
      point[ind.code] = stat?.new_repos || 0
    })
    return point
  })

  // Build industry totals for bar race
  const industryTotals = industries.map((ind) => {
    const latestMonth = months[months.length - 1]
    const stat = stats.find(
      (s) => s.month === latestMonth && s.industry_code === ind.code
    )
    return {
      code: ind.code,
      name: ind.name,
      value: stat?.cumulative || 0,
      color: ind.color,
    }
  })

  return { months, cumulativeData, monthlyData, industryTotals }
}

export default async function AgentPage({ params }: PageProps) {
  const { agent: agentId } = await params

  const agent = await getAgent(agentId)
  if (!agent) {
    notFound()
  }

  const [stats, industries] = await Promise.all([
    getAgentStats(agentId),
    getIndustries(),
  ])

  const { months, cumulativeData, monthlyData, industryTotals } = processStats(
    stats,
    industries
  )

  const totalRepos = industryTotals.reduce((sum, i) => sum + i.value, 0)
  const topIndustry = industryTotals.sort((a, b) => b.value - a.value)[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: agent.color }}
          />
          <h1 className="text-3xl font-bold text-zinc-100">{agent.name}</h1>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          {AGENT_DESCRIPTIONS[agentId] || 'AI coding assistant analysis.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Total Repositories</p>
            <p className="text-3xl font-bold" style={{ color: agent.color }}>
              {formatNumber(totalRepos)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Data Range</p>
            <p className="text-xl font-semibold text-zinc-100">
              {months.length > 0
                ? `${months[0]} to ${months[months.length - 1]}`
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Top Industry</p>
            <p className="text-xl font-semibold text-zinc-100">
              {topIndustry?.name || 'N/A'}
            </p>
            <p className="text-sm" style={{ color: topIndustry?.color }}>
              {formatNumber(topIndustry?.value || 0)} repos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AgentCharts
        agentColor={agent.color}
        cumulativeData={cumulativeData}
        monthlyData={monthlyData}
        industryTotals={industryTotals}
        industries={industries}
      />
    </div>
  )
}
