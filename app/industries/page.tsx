import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { INDUSTRIES, NAICS_DESCRIPTIONS, INDUSTRY_EXAMPLES } from '@/lib/constants'
import { ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Industry Classification | AI Coding Agents',
  description: 'NAICS industry codes used to classify GitHub repositories by sector.',
}

export default function IndustriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 mb-4">
          NAICS Industry Codes
        </h1>
        <p className="text-zinc-400 max-w-3xl mx-auto">
          Reference guide to the 19 industry sectors used in our analysis, based on
          the North American Industry Classification System
        </p>
      </div>

      {/* About NAICS */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle>About NAICS</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <p>
            The <strong className="text-zinc-100">North American Industry Classification System (NAICS)</strong> is
            the standard used by Federal statistical agencies in classifying business
            establishments. It provides a consistent framework for collecting, analyzing,
            and publishing statistical data related to the U.S. business economy.
          </p>
          <p>
            In our analysis, we use the <strong className="text-zinc-100">2-digit NAICS sector codes</strong> to
            classify GitHub repositories by the industry of their owners or primary use
            case. This classification is performed by a machine learning model trained
            on manually labeled repository-industry pairs.
          </p>
          <p>
            Learn more at{' '}
            <a
              href="https://www.census.gov/naics/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              census.gov/naics <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Industry Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {INDUSTRIES.map((industry) => {
          const description = NAICS_DESCRIPTIONS[industry.code]
          const fullDesc = description?.split(' - ')[1] || description || ''
          const examples = INDUSTRY_EXAMPLES[industry.code] || []

          return (
            <div
              key={industry.code}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-600 transition-all hover:-translate-y-0.5"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-md text-xs font-bold font-mono"
                  style={{ backgroundColor: `${industry.color}20`, color: industry.color }}
                >
                  {industry.code}
                </span>
                <span className="text-lg font-bold text-zinc-100">
                  {industry.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {fullDesc}
              </p>

              {/* Example Tags */}
              {examples.length > 0 && (
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Example repositories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {examples.map((example) => (
                      <span
                        key={example}
                        className="px-2 py-1 rounded text-xs bg-zinc-800 text-zinc-400"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Excluded Sectors */}
      <Card className="mb-10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-amber-500" />
            <CardTitle>Excluded Sectors</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <p>
            The following NAICS sector is excluded from our analysis due to limited
            representation in public GitHub repositories:
          </p>
          <div className="rounded-lg bg-zinc-800/50 p-4 flex items-center gap-4">
            <span className="text-amber-400 font-bold font-mono text-sm">55</span>
            <span className="text-zinc-400 text-sm">
              Management of Companies and Enterprises
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Sector 55 primarily consists of holding companies and corporate headquarters.
            These organizations rarely maintain public repositories on GitHub, as their
            software development activities typically occur within subsidiary companies
            classified under other sectors.
          </p>
        </CardContent>
      </Card>

      {/* Classification Process */}
      <Card>
        <CardHeader>
          <CardTitle>Classification Process</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold">
                1
              </div>
              <h3 className="font-semibold text-zinc-100">Data Collection</h3>
              <p className="text-sm text-zinc-400">
                We collect repository metadata including name, description,
                README content, and topics from GitHub&apos;s public API.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                2
              </div>
              <h3 className="font-semibold text-zinc-100">AI Classification</h3>
              <p className="text-sm text-zinc-400">
                Our fine-tuned RoBERTa model analyzes the text and assigns the
                most relevant NAICS industry code.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                3
              </div>
              <h3 className="font-semibold text-zinc-100">Aggregation</h3>
              <p className="text-sm text-zinc-400">
                Results are aggregated by month and industry to show adoption
                trends over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
