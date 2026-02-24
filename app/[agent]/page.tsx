import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { AGENTS, INDUSTRIES, AGENT_DESCRIPTIONS, AGENT_COMPANIES } from '@/lib/constants'
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

  // Build industry totals for bar race (latest month)
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

  // Build time series data for bar race animation (values per month per industry)
  const timeData = industries.map((ind) => ({
    code: ind.code,
    name: ind.name,
    color: ind.color,
    values: months.map((month) => {
      const stat = stats.find(
        (s) => s.month === month && s.industry_code === ind.code
      )
      return stat?.cumulative || 0
    }),
  }))

  return { months, cumulativeData, monthlyData, industryTotals, timeData }
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

  const { months, cumulativeData, monthlyData, industryTotals, timeData } = processStats(
    stats,
    industries
  )

  const totalRepos = industryTotals.reduce((sum, i) => sum + i.value, 0)
  const sortedIndustries = [...industryTotals].sort((a, b) => b.value - a.value)
  const topIndustry = sortedIndustries[0]
  const company = AGENT_COMPANIES[agentId]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-1.5 text-xs text-zinc-400 mb-4">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Live Data Visualization
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: agent.color }}
          />
          <h1 className="text-3xl font-bold text-zinc-100">
            <span style={{ color: agent.color }}>{agent.name}</span> Industry Adoption
          </h1>
        </div>
        <p className="text-zinc-400 max-w-2xl">
          Tracking how different industries adopt AI coding assistants across{' '}
          {formatNumber(totalRepos)}+ repositories on GitHub
          {company && <span className="text-zinc-500"> &mdash; by {company}</span>}
        </p>
      </div>

      {/* Stats - 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <p className="text-sm text-zinc-400">Industries Tracked</p>
            <p className="text-3xl font-bold text-pink-400">
              {industries.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Current Period</p>
            <p className="text-xl font-semibold text-blue-400">
              {months.length > 0
                ? formatMonthShort(months[months.length - 1])
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-400">Leading Industry</p>
            <p className="text-xl font-semibold text-green-400">
              {topIndustry?.name || 'N/A'}
            </p>
            <p className="text-xs" style={{ color: topIndustry?.color }}>
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
        timeData={timeData}
        months={months}
      />
    </div>
  )
}

function formatMonthShort(month: string): string {
  const [year, m] = month.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${year}`
}
