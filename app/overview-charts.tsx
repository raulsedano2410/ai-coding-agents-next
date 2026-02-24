'use client'

import { ComparisonChart } from '@/components/charts/comparison-chart'

interface AgentConfig {
  id: string
  name: string
  color: string
}

interface OverviewChartsProps {
  comparisonData: Record<string, string | number>[]
  agents: AgentConfig[]
}

export function OverviewCharts({ comparisonData, agents }: OverviewChartsProps) {
  return <ComparisonChart data={comparisonData} agents={agents} />
}
