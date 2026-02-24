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
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 mb-4">Methodology</h1>
        <p className="text-zinc-400">
          Detailed methodology for the AI coding agent industry adoption analysis
        </p>
      </div>

      {/* Table of Contents */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-sm font-bold text-zinc-100 mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ['#data-collection', 'Data Collection'],
              ['#agent-detection', 'Agent Detection'],
              ['#classification-model', 'Industry Classification Model'],
              ['#adoption-timing', 'Adoption Timing Analysis'],
              ['#confidence', 'Confidence Calibration'],
              ['#limitations', 'Limitations and Caveats'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                {label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Collection */}
      <Card className="mb-6" id="data-collection">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-gradient-to-b from-purple-500 to-pink-500" />
            <CardTitle>Data Collection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <div>
            <h4 className="font-semibold text-zinc-100">Source</h4>
            <p className="text-zinc-400 mt-1">
              All data was collected from the GitHub API, focusing on <strong className="text-zinc-200">public repositories only</strong>. Private and enterprise repositories are not included.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100">Time Period</h4>
            <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-1">
              <li><strong className="text-zinc-300">Collection Period:</strong> January 2025 - February 2026</li>
              <li><strong className="text-zinc-300">Snapshot Date:</strong> February 2026</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100">Repository Selection Criteria</h4>
            <p className="text-zinc-400 mt-1">Repositories were included if they had:</p>
            <ol className="list-decimal list-inside text-zinc-400 mt-1 space-y-1">
              <li>At least one commit with detected AI agent attribution</li>
              <li>At least one pull request with detected AI agent attribution</li>
              <li>At least one Co-Author tag indicating AI agent usage</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100">Data Fields Collected</h4>
            <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-1">
              <li>Repository name with owner</li>
              <li>Repository description and topics</li>
              <li>Primary programming language</li>
              <li>Creation date and star count</li>
              <li>Commit and PR metadata (messages, dates, authors)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Agent Detection */}
      <Card className="mb-6" id="agent-detection">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-gradient-to-b from-purple-500 to-pink-500" />
            <CardTitle>Agent Detection</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-6">
          {/* Per-agent detection */}
          <div>
            <h4 className="font-semibold text-purple-400 mb-2">Claude Code</h4>
            <p className="text-sm text-zinc-400 mb-2">Detected through Co-Author tags:</p>
            <code className="block bg-zinc-800 rounded-md px-3 py-2 text-xs text-purple-300">
              Co-Authored-By: Claude &lt;noreply@anthropic.com&gt;
            </code>
          </div>

          <div>
            <h4 className="font-semibold text-blue-400 mb-2">GitHub Copilot</h4>
            <p className="text-sm text-zinc-400 mb-2">Detected through PR metadata and commit patterns matching known Copilot auto-completion signatures.</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400 mb-2">OpenAI Codex</h4>
            <p className="text-sm text-zinc-400 mb-2">Detected through commits or PRs with Codex API attribution and integration signatures.</p>
          </div>

          <div>
            <h4 className="font-semibold text-orange-400 mb-2">Cursor AI</h4>
            <p className="text-sm text-zinc-400 mb-2">Detected through branch naming and Co-Author tags:</p>
            <div className="space-y-1">
              <code className="block bg-zinc-800 rounded-md px-3 py-2 text-xs text-orange-300">
                is:pr head:cursor/
              </code>
              <code className="block bg-zinc-800 rounded-md px-3 py-2 text-xs text-orange-300">
                Co-Authored-By: cursoragent@cursor.com
              </code>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Yielded <strong className="text-zinc-400">292,461 PRs</strong> and{' '}
              <strong className="text-zinc-400">497,949 commits</strong> across{' '}
              <strong className="text-zinc-400">128,791 unique repositories</strong>.
            </p>
          </div>

          {/* Detection Validation Table */}
          <div>
            <h4 className="font-semibold text-zinc-100 mb-3">Detection Validation</h4>
            <p className="text-sm text-zinc-400 mb-3">
              A random sample of 1,000 detections per agent was manually validated:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-3 text-zinc-400">Agent</th>
                    <th className="text-left py-2 px-3 text-zinc-400">True Positive Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Claude Code', '94.2%'],
                    ['GitHub Copilot', '91.8%'],
                    ['OpenAI Codex', '89.5%'],
                    ['Cursor AI', 'Pending'],
                  ].map(([agent, rate]) => (
                    <tr key={agent} className="border-b border-zinc-800">
                      <td className="py-2 px-3 font-medium text-zinc-200">{agent}</td>
                      <td className="py-2 px-3 text-green-400 font-semibold">{rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Classification Model */}
      <Card className="mb-6" id="classification-model">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-gradient-to-b from-purple-500 to-pink-500" />
            <CardTitle>Industry Classification Model</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <div>
            <h4 className="font-semibold text-zinc-100">Model Architecture</h4>
            <p className="text-zinc-400 mt-1">
              Fine-tuned transformer based on <strong className="text-zinc-200">RoBERTa-base</strong>, trained to predict NAICS sector codes from repository metadata.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100">Training Data</h4>
            <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-1">
              <li>50,000 manually labeled repository-to-industry mappings</li>
              <li>Repository descriptions, topics, and README content as input</li>
              <li>20 NAICS sector classes as output labels</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100">Input Features</h4>
            <ol className="list-decimal list-inside text-zinc-400 mt-1 space-y-1">
              <li><strong className="text-zinc-300">Repository Description:</strong> GitHub description text</li>
              <li><strong className="text-zinc-300">Topics:</strong> Concatenated list of repository topics</li>
              <li><strong className="text-zinc-300">README Excerpt:</strong> First 512 tokens (if available)</li>
            </ol>
          </div>

          {/* Model Performance Table */}
          <div>
            <h4 className="font-semibold text-zinc-100 mb-3">Model Performance</h4>
            <p className="text-sm text-zinc-400 mb-3">Evaluated on a held-out test set of 5,000 repositories:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-3 text-zinc-400">Metric</th>
                    <th className="text-left py-2 px-3 text-zinc-400">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Accuracy', '78.3%'],
                    ['Macro F1', '0.72'],
                    ['Weighted F1', '0.79'],
                  ].map(([metric, value]) => (
                    <tr key={metric} className="border-b border-zinc-800">
                      <td className="py-2 px-3 text-zinc-200">{metric}</td>
                      <td className="py-2 px-3 text-green-400 font-semibold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-Sector Performance Table */}
          <div>
            <h4 className="font-semibold text-zinc-100 mb-3">Per-Sector Performance</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-3 text-zinc-400">NAICS Sector</th>
                    <th className="text-left py-2 px-3 text-zinc-400">Precision</th>
                    <th className="text-left py-2 px-3 text-zinc-400">Recall</th>
                    <th className="text-left py-2 px-3 text-zinc-400">F1</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['54 (Professional Services)', '0.85', '0.89', '0.87'],
                    ['51 (Information)', '0.82', '0.78', '0.80'],
                    ['52 (Finance)', '0.79', '0.74', '0.76'],
                    ['62 (Healthcare)', '0.76', '0.71', '0.73'],
                    ['61 (Education)', '0.74', '0.69', '0.71'],
                    ['Other sectors', '0.65-0.75', '0.60-0.72', '0.62-0.73'],
                  ].map(([sector, precision, recall, f1]) => (
                    <tr key={sector} className="border-b border-zinc-800">
                      <td className="py-2 px-3 text-zinc-200">{sector}</td>
                      <td className="py-2 px-3 text-zinc-400">{precision}</td>
                      <td className="py-2 px-3 text-zinc-400">{recall}</td>
                      <td className="py-2 px-3 text-green-400 font-semibold">{f1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adoption Timing */}
      <Card className="mb-6" id="adoption-timing">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-gradient-to-b from-purple-500 to-pink-500" />
            <CardTitle>Adoption Timing Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <div>
            <h4 className="font-semibold text-zinc-100">First Use Date Determination</h4>
            <ol className="list-decimal list-inside text-zinc-400 mt-2 space-y-1">
              <li><strong className="text-zinc-300">Claude Code:</strong> Earliest commit with Claude Co-Author tag</li>
              <li><strong className="text-zinc-300">Copilot:</strong> Earliest PR or commit attributed to Copilot</li>
              <li><strong className="text-zinc-300">Codex:</strong> Earliest commit/PR with Codex attribution</li>
              <li><strong className="text-zinc-300">Cursor AI:</strong> Earliest PR from cursor/ branch or commit with Cursor attribution</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100">Monthly Aggregation</h4>
            <p className="text-zinc-400 mt-1">Repositories are aggregated by:</p>
            <ol className="list-decimal list-inside text-zinc-400 mt-1 space-y-1">
              <li><strong className="text-zinc-300">Month:</strong> Year-month of first use date</li>
              <li><strong className="text-zinc-300">Industry:</strong> Predicted NAICS sector code</li>
            </ol>
            <p className="text-zinc-400 mt-2">
              This produces a time series of new repositories per industry per month.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Calibration */}
      <Card className="mb-6" id="confidence">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-gradient-to-b from-purple-500 to-pink-500" />
            <CardTitle>Confidence Calibration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-4">
          <p className="text-zinc-400">
            Model confidence scores were calibrated using isotonic regression on a
            validation set of 2,000 manually verified predictions.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400">Threshold</th>
                  <th className="text-left py-2 px-3 text-zinc-400">Coverage</th>
                  <th className="text-left py-2 px-3 text-zinc-400">Estimated Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['> 0.9', '35%', '94%'],
                  ['> 0.8', '55%', '88%'],
                  ['> 0.7', '72%', '82%'],
                  ['> 0.6', '85%', '76%'],
                  ['> 0.5', '95%', '71%'],
                ].map(([threshold, coverage, accuracy]) => (
                  <tr key={threshold} className="border-b border-zinc-800">
                    <td className="py-2 px-3 text-zinc-200">{threshold}</td>
                    <td className="py-2 px-3 text-zinc-400">{coverage}</td>
                    <td className="py-2 px-3 text-green-400 font-semibold">{accuracy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note box */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="text-sm text-zinc-200">
              <strong>Note:</strong> The visualizations on this site include all predictions
              without confidence filtering to maximize coverage. For high-precision analysis,
              consider filtering to confidence &gt; 0.7.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card className="mb-6" id="limitations">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-gradient-to-b from-purple-500 to-pink-500" />
            <CardTitle>Limitations and Caveats</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-zinc-300 space-y-5">
          {/* Warning box */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-zinc-200">
              <strong>Public Repositories Only:</strong> Enterprise and private repository
              usage is not captured. This may underrepresent industries with high proprietary
              code concerns (e.g., finance, healthcare).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-2">Data Limitations</h4>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm">
              <li>
                <strong className="text-zinc-300">Detection Accuracy:</strong> Agent detection
                based on metadata patterns; implicit usage without attribution is not captured.
                False negative rate estimated at 15-25%.
              </li>
              <li>
                <strong className="text-zinc-300">GitHub Bias:</strong> Analysis limited to
                GitHub; other platforms (GitLab, Bitbucket) not included.
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-2">Classification Limitations</h4>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm">
              <li>
                <strong className="text-zinc-300">Repository vs. Organization:</strong> Classification
                at repository level, not organization level. A single organization may have
                repositories classified into multiple industries.
              </li>
              <li>
                <strong className="text-zinc-300">Metadata Quality:</strong> Accuracy depends on
                repository description and topic quality.
              </li>
              <li>
                <strong className="text-zinc-300">Industry Ambiguity:</strong> A &quot;fintech&quot;
                repository could be Finance (52) or Information (51).
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-2">Temporal Limitations</h4>
            <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm">
              <li>
                <strong className="text-zinc-300">Adoption vs. Usage:</strong> &quot;First
                use&quot; captures adoption date, not usage intensity.
              </li>
              <li>
                <strong className="text-zinc-300">Agent Availability:</strong> Different agents
                launched at different times. Direct comparisons should account for availability windows.
              </li>
            </ul>
          </div>

          {/* Warning box */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-zinc-200">
              <strong>Recommendations:</strong> Trend analysis (within a single agent) is more
              reliable than cross-agent absolute comparisons. Relative industry rankings are
              more reliable than absolute percentages.
            </p>
          </div>
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
                <li>Next.js 16</li>
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
              href="https://github.com/raulsedano2410/ai-coding-agents-next"
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
