'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatNumber } from '@/lib/utils'
import { Industry } from '@/lib/types'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface IndustryValue {
  code: string
  name: string
  value: number
  color: string
}

// Data for all months, used by the animated bar race
interface BarRaceTimeData {
  code: string
  name: string
  color: string
  values: number[] // One value per month
}

interface IndustryBarRaceProps {
  data: IndustryValue[]
  maxItems?: number
  // Optional: time series data for animation
  timeData?: BarRaceTimeData[]
  months?: string[]
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  return `${MONTH_NAMES[parseInt(m) - 1]} ${year}`
}

export function IndustryBarRace({ data, maxItems = 10, timeData, months }: IndustryBarRaceProps) {
  const hasTimeSeries = timeData && months && months.length > 0
  const [currentIndex, setCurrentIndex] = useState(hasTimeSeries ? months!.length - 1 : 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [showAll, setShowAll] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Compute current values based on month index
  const currentData: IndustryValue[] = hasTimeSeries
    ? timeData!.map((ind) => ({
        code: ind.code,
        name: ind.name,
        value: ind.values[currentIndex] || 0,
        color: ind.color,
      }))
    : data

  const sortedData = [...currentData]
    .sort((a, b) => b.value - a.value)

  const displayData = showAll ? sortedData : sortedData.slice(0, maxItems)
  const maxValue = sortedData[0]?.value || 1

  // Animation controls
  const play = useCallback(() => {
    if (!hasTimeSeries) return
    setIsPlaying(true)
  }, [hasTimeSeries])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }, [])

  useEffect(() => {
    if (isPlaying && hasTimeSeries) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= months!.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, hasTimeSeries, months])

  const progressPct = hasTimeSeries ? ((currentIndex + 1) / months!.length) * 100 : 100

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      {hasTimeSeries && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <select
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={currentIndex}
            onChange={(e) => {
              setIsPlaying(false)
              setCurrentIndex(Number(e.target.value))
            }}
          >
            {months!.map((m, i) => (
              <option key={m} value={i}>{formatMonthLabel(m)}</option>
            ))}
          </select>

          <span className="text-xs text-zinc-500">Cumulative adoption by NAICS sector</span>

          <div className="flex-1" />

          {/* Play/Pause */}
          <button
            onClick={isPlaying ? pause : play}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          {/* Speed */}
          <select
            className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-md px-2 py-1.5 focus:outline-none"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={1200}>0.5x</option>
            <option value={800}>1x</option>
            <option value={400}>2x</option>
            <option value={200}>4x</option>
          </select>

          {/* Toggle */}
          <button
            onClick={() => setShowAll(!showAll)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              showAll
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'bg-zinc-700 text-zinc-300 border border-zinc-600'
            }`}
          >
            {showAll ? `All ${sortedData.length}` : `Top ${maxItems}`}
          </button>
        </div>
      )}

      {/* Bar items */}
      <div className="space-y-1.5">
        {displayData.map((item, index) => (
          <div
            key={item.code}
            className="grid items-center gap-2 transition-all duration-300"
            style={{
              gridTemplateColumns: '28px 110px 1fr 60px',
            }}
          >
            <div className={`text-xs font-bold text-right ${index < 3 ? 'text-purple-400' : 'text-zinc-500'}`}>
              {index + 1}
            </div>
            <div className="text-xs text-zinc-300 truncate" title={item.name}>
              {item.name}
            </div>
            <div className="h-5 bg-zinc-800 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                }}
              />
            </div>
            <div className="text-xs text-zinc-400 text-right font-mono">
              {formatNumber(item.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {hasTimeSeries && (
        <div className="pt-3 border-t border-zinc-800">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-zinc-500">Timeline Progress</span>
            <span className="text-xs text-zinc-500">
              {currentIndex + 1} of {months!.length} months
            </span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface IndustryLegendProps {
  industries: Industry[]
  hiddenCodes?: Set<string>
  onToggle?: (code: string) => void
}

export function IndustryLegend({ industries, hiddenCodes, onToggle }: IndustryLegendProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {industries.map((industry) => {
        const isHidden = hiddenCodes?.has(industry.code)
        return (
          <button
            key={industry.code}
            className={`flex items-center gap-1.5 transition-opacity ${
              isHidden ? 'opacity-30' : 'opacity-100'
            } ${onToggle ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            onClick={() => onToggle?.(industry.code)}
            type="button"
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: industry.color }}
            />
            <span className="text-xs text-zinc-400">{industry.name}</span>
          </button>
        )
      })}
    </div>
  )
}
