'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CumulativeChart } from '@/components/charts/cumulative-chart'
import { MonthlyChart } from '@/components/charts/monthly-chart'
import { IndustryBarRace, IndustryLegend } from '@/components/charts/industry-bar-race'
import { Industry } from '@/lib/types'

interface IndustryTotal {
  code: string
  name: string
  value: number
  color: string
}

interface AgentChartsProps {
  agentColor: string
  cumulativeData: Record<string, string | number>[]
  monthlyData: Record<string, string | number>[]
  industryTotals: IndustryTotal[]
  industries: Industry[]
}

export function AgentCharts({
  cumulativeData,
  monthlyData,
  industryTotals,
  industries,
}: AgentChartsProps) {
  const [activeTab, setActiveTab] = useState('cumulative')

  return (
    <div className="space-y-8">
      {/* Industry Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <IndustryBarRace data={industryTotals} maxItems={10} />
        </CardContent>
      </Card>

      {/* Time Series Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Adoption Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="cumulative">
              <CumulativeChart data={cumulativeData} industries={industries} />
              <IndustryLegend industries={industries} />
            </TabsContent>

            <TabsContent value="monthly">
              <MonthlyChart data={monthlyData} industries={industries} />
              <IndustryLegend industries={industries} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
