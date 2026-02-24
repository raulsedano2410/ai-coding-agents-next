import Link from 'next/link'
import { ArrowRight, TrendingUp, Building2, Code2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AGENTS, INDUSTRIES } from '@/lib/constants'
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
  }
}

export default async function HomePage() {
  const { agents, comparisonData } = await getOverviewData()

  const totalRepos = agents.reduce((sum, a) => sum + a.total_repos, 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-100 sm:text-5xl mb-4">
          AI Coding Agents
          <span className="gradient-text block mt-2">Industry Analysis</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
          Track and compare how AI coding assistants are being adopted across
          different industries using NAICS classification.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Code2 className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Repositories</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {formatNumber(totalRepos)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">AI Agents Tracked</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {agents.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Building2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Industries Classified</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {INDUSTRIES.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cumulative Repository Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <OverviewCharts
            comparisonData={comparisonData}
            agents={agents.map((a) => ({ id: a.id, name: a.name, color: a.color }))}
          />
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <h2 className="text-2xl font-bold text-zinc-100 mb-4">AI Coding Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/${agent.id}`}>
            <Card className="h-full hover:border-zinc-700 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                  {agent.name}
                </h3>
                <p className="text-2xl font-bold" style={{ color: agent.color }}>
                  {formatNumber(agent.total_repos)}
                </p>
                <p className="text-sm text-zinc-500">repositories</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/industries">
          <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                    Industry Classification
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Explore NAICS codes and industry definitions
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/methodology">
          <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                    Methodology
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Learn how we collect and classify the data
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
