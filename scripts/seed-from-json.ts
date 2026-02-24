/**
 * Script to seed Supabase database from existing JSON files
 *
 * Usage:
 *   npx ts-node --esm scripts/seed-from-json.ts
 *
 * Or with env vars:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node --esm scripts/seed-from-json.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const agents = ['claude', 'copilot', 'codex', 'cursor']

interface IndustryData {
  code: string
  name: string
  values: number[]
  monthly: number[]
}

interface CumulativeJson {
  agent: string
  total_repos: number
  months: string[]
  industries: IndustryData[]
}

async function seedFromJson() {
  console.log('Starting seed from JSON files...\n')

  for (const agentId of agents) {
    const jsonPath = path.join(
      __dirname,
      '../../ai-coding-agents-industry-analysis/docs',
      `${agentId}_cumulative.json`
    )

    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠ Skipping ${agentId}: JSON file not found at ${jsonPath}`)
      continue
    }

    try {
      const data: CumulativeJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

      console.log(`Processing ${agentId}...`)
      console.log(`  - Total repos: ${data.total_repos}`)
      console.log(`  - Months: ${data.months.length}`)
      console.log(`  - Industries: ${data.industries.length}`)

      // Update agent total_repos
      const { error: agentError } = await supabase
        .from('agents')
        .update({ total_repos: data.total_repos })
        .eq('id', agentId)

      if (agentError) {
        console.error(`  Error updating agent ${agentId}:`, agentError.message)
      }

      // Build monthly_stats rows
      const rows: Array<{
        agent_id: string
        industry_code: string
        month: string
        cumulative: number
        new_repos: number
      }> = []

      for (const industry of data.industries) {
        for (let i = 0; i < data.months.length; i++) {
          rows.push({
            agent_id: agentId,
            industry_code: industry.code,
            month: data.months[i],
            cumulative: industry.values[i] || 0,
            new_repos: industry.monthly[i] || 0,
          })
        }
      }

      // Upsert in batches of 1000
      const batchSize = 1000
      let inserted = 0

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)

        const { error } = await supabase
          .from('monthly_stats')
          .upsert(batch, {
            onConflict: 'agent_id,industry_code,month',
          })

        if (error) {
          console.error(`  Error inserting batch for ${agentId}:`, error.message)
        } else {
          inserted += batch.length
        }
      }

      console.log(`  ✓ Inserted ${inserted} rows for ${agentId}\n`)
    } catch (err) {
      console.error(`Error processing ${agentId}:`, err)
    }
  }

  // Update metadata
  const { error: metaError } = await supabase
    .from('metadata')
    .upsert({
      key: 'last_seeded',
      value: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (metaError) {
    console.error('Error updating metadata:', metaError.message)
  }

  console.log('Done!')
}

seedFromJson().catch(console.error)
