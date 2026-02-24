import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { INDUSTRIES, NAICS_DESCRIPTIONS } from '@/lib/constants'

export const metadata = {
  title: 'Industry Classification | AI Coding Agents',
  description: 'NAICS industry codes used to classify GitHub repositories by sector.',
}

export default function IndustriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-4">
          Industry Classification
        </h1>
        <p className="text-zinc-400 max-w-3xl">
          We use the North American Industry Classification System (NAICS) to
          categorize GitHub repositories by industry sector. Our AI classifier
          analyzes repository descriptions, README files, and topics to assign
          the most relevant industry code.
        </p>
      </div>

      {/* NAICS Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About NAICS</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <p>
            The North American Industry Classification System (NAICS) is the
            standard used by Federal statistical agencies in classifying
            business establishments. It was developed by the U.S. Economic
            Classification Policy Committee, Statistics Canada, and Mexico's
            INEGI.
          </p>
          <p>
            NAICS uses a 6-digit hierarchical coding system to classify all
            economic activity into 20 industry sectors. For our analysis, we use
            the 2-digit sector codes to provide a high-level view of which
            industries are adopting AI coding tools.
          </p>
        </CardContent>
      </Card>

      {/* Industries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Sectors</CardTitle>
          <CardDescription>
            2-digit NAICS codes used in our classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400">
                    Industry
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-400 hidden md:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {INDUSTRIES.map((industry) => (
                  <tr
                    key={industry.code}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: industry.color }}
                        />
                        <span className="font-mono text-sm text-zinc-300">
                          {industry.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-100 font-medium">
                      {industry.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-400 hidden md:table-cell">
                      {NAICS_DESCRIPTIONS[industry.code]?.split(' - ')[1] || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Classification Process */}
      <Card className="mt-8">
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
                README content, and topics from GitHub's public API.
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
