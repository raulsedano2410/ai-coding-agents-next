import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Methodology | AI Coding Agents',
  description: 'How we collect, process, and analyze AI coding agent adoption data.',
}

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-4">Methodology</h1>
        <p className="text-zinc-400">
          This page describes how we collect, process, and analyze data about AI
          coding agent adoption across different industries.
        </p>
      </div>

      {/* Data Sources */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <p>
            All data is sourced from GitHub's public API. We track four AI
            coding agents by identifying their unique signatures in pull
            requests and commits:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400">Agent</th>
                  <th className="text-left py-2 px-3 text-zinc-400">
                    Detection Method
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium">Claude Code</td>
                  <td className="py-2 px-3 text-zinc-400">
                    Co-authored commits with{' '}
                    <code className="text-purple-400">
                      @anthropic.com
                    </code>{' '}
                    email
                  </td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium">GitHub Copilot</td>
                  <td className="py-2 px-3 text-zinc-400">
                    Co-authored commits with{' '}
                    <code className="text-blue-400">
                      @users.noreply.github.com
                    </code>{' '}
                    and copilot indicators
                  </td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium">OpenAI Codex</td>
                  <td className="py-2 px-3 text-zinc-400">
                    Co-authored commits with{' '}
                    <code className="text-green-400">@openai.com</code> email
                  </td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium">Cursor AI</td>
                  <td className="py-2 px-3 text-zinc-400">
                    PRs with <code className="text-orange-400">cursor/</code>{' '}
                    branch prefix or commits with{' '}
                    <code className="text-orange-400">cursoragent@cursor.com</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Industry Classification */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Industry Classification</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <p>
            We use a fine-tuned RoBERTa model to classify repositories into
            NAICS (North American Industry Classification System) industry
            sectors. The model was trained on a curated dataset of GitHub
            repositories with known industry associations.
          </p>

          <h4 className="font-semibold text-zinc-100 mt-4">Input Features</h4>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li>Repository name</li>
            <li>Repository description</li>
            <li>README content (first 512 tokens)</li>
            <li>Repository topics/tags</li>
          </ul>

          <h4 className="font-semibold text-zinc-100 mt-4">Model Performance</h4>
          <p className="text-zinc-400">
            The classifier achieves approximately 86% accuracy on our test set.
            Edge cases and ambiguous repositories may be misclassified.
          </p>
        </CardContent>
      </Card>

      {/* Data Processing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Processing Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100">
                  Daily Data Collection
                </h4>
                <p className="text-sm text-zinc-400 mt-1">
                  GitHub Actions workflow runs daily at 00:05 UTC to fetch new
                  PRs and commits from the GitHub API.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100">
                  Repository Metadata
                </h4>
                <p className="text-sm text-zinc-400 mt-1">
                  For each unique repository, we fetch additional metadata
                  including description, topics, and README content.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100">
                  NAICS Classification
                </h4>
                <p className="text-sm text-zinc-400 mt-1">
                  The RoBERTa classifier processes repository metadata and
                  assigns the most relevant NAICS industry code.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100">
                  Aggregation & Storage
                </h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Results are aggregated by month and industry, then stored in
                  Supabase PostgreSQL database for efficient querying.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Limitations</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <ul className="list-disc list-inside space-y-2 text-zinc-400">
            <li>
              <strong className="text-zinc-300">Public repositories only:</strong>{' '}
              Private repository data is not available through the GitHub API.
            </li>
            <li>
              <strong className="text-zinc-300">Detection accuracy:</strong> Some
              AI-assisted code may not be properly attributed or detected.
            </li>
            <li>
              <strong className="text-zinc-300">Classification accuracy:</strong>{' '}
              The NAICS classifier has ~86% accuracy; some repositories may be
              misclassified.
            </li>
            <li>
              <strong className="text-zinc-300">Sampling bias:</strong> Our data
              represents repositories that explicitly attribute AI assistance,
              which may not be representative of all AI-assisted development.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="text-zinc-300">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-zinc-100 mb-2">Frontend</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>Next.js 15</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
                <li>Recharts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 mb-2">Backend</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>Supabase (PostgreSQL)</li>
                <li>GitHub Actions</li>
                <li>Python</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 mb-2">ML/AI</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>RoBERTa (HuggingFace)</li>
                <li>PyTorch</li>
                <li>Transformers</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <a
              href="https://github.com/alexanderquispe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              View source code on GitHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
