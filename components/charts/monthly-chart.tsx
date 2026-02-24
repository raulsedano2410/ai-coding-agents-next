'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber, formatMonth } from '@/lib/utils'
import { Industry } from '@/lib/types'

interface MonthlyChartProps {
  data: Record<string, string | number>[]
  industries: Industry[]
}

export function MonthlyChart({ data, industries }: MonthlyChartProps) {
  // Sort industries by total value for better visual stacking
  const sortedIndustries = [...industries].sort((a, b) => {
    const totalA = data.reduce((sum, d) => sum + ((d[a.code] as number) || 0), 0)
    const totalB = data.reduce((sum, d) => sum + ((d[b.code] as number) || 0), 0)
    return totalB - totalA
  })

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            <Bar
              key={industry.code}
              dataKey={industry.code}
              name={industry.code}
              stackId="a"
              fill={industry.color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
