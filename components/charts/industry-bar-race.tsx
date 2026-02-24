'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatNumber } from '@/lib/utils'
import { Industry } from '@/lib/types'

interface IndustryValue {
  code: string
  name: string
  value: number
  color: string
}

interface IndustryBarRaceProps {
  data: IndustryValue[]
  maxItems?: number
}

export function IndustryBarRace({ data, maxItems = 10 }: IndustryBarRaceProps) {
  // Sort by value descending and take top N
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems)

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <XAxis
            type="number"
            stroke="#71717a"
            fontSize={12}
            tickFormatter={formatNumber}
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#71717a"
            fontSize={12}
            tick={{ fill: '#a1a1aa' }}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fafafa' }}
            formatter={(value) => [formatNumber(Number(value) || 0), 'Repos']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface IndustryLegendProps {
  industries: Industry[]
}

export function IndustryLegend({ industries }: IndustryLegendProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {industries.slice(0, 10).map((industry) => (
        <div key={industry.code} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: industry.color }}
          />
          <span className="text-xs text-zinc-400">{industry.name}</span>
        </div>
      ))}
    </div>
  )
}
