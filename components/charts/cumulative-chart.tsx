'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber, formatMonth } from '@/lib/utils'
import { Industry } from '@/lib/types'

interface CumulativeChartProps {
  data: Record<string, string | number>[]
  industries: Industry[]
}

export function CumulativeChart({ data, industries }: CumulativeChartProps) {
  // Sort industries by total value (highest last so they stack on top)
  const sortedIndustries = [...industries].sort((a, b) => {
    const lastData = data[data.length - 1]
    if (!lastData) return 0
    const aVal = (lastData[a.code] as number) || 0
    const bVal = (lastData[b.code] as number) || 0
    return aVal - bVal
  })

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="month"
            stroke="#71717a"
            fontSize={12}
            tickFormatter={formatMonth}
            tick={{ fill: '#a1a1aa' }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickFormatter={formatNumber}
            tick={{ fill: '#a1a1aa' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
            labelStyle={{ color: '#fafafa' }}
            labelFormatter={(label) => formatMonth(String(label))}
            formatter={(value, name) => {
              const industry = industries.find((i) => i.code === name)
              return [formatNumber(Number(value) || 0), industry?.name || String(name)]
            }}
          />
          {sortedIndustries.map((industry) => (
            <Area
              key={industry.code}
              type="monotone"
              dataKey={industry.code}
              name={industry.code}
              stackId="1"
              stroke={industry.color}
              fill={industry.color}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
