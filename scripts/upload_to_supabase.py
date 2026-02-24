#!/usr/bin/env python3
"""
Upload classified data to Supabase.
Reads from new fetch_daily/classify format and upserts monthly_stats.
Ensures ALL 19 industries have a row for every agent each month
(carrying forward cumulative from previous month when new_repos=0).
"""

import os
import json
from datetime import datetime, UTC
from pathlib import Path
from collections import defaultdict

from supabase import create_client

ALL_AGENTS = ['claude', 'copilot', 'codex', 'cursor']
ALL_INDUSTRIES = [
    '11', '21', '22', '23', '31-33', '42', '44-45', '48-49',
    '51', '52', '53', '54', '56', '61', '62', '71', '72', '81', '92'
]


def main():
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_KEY')

    if not supabase_url or not supabase_key:
        print('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
        return

    supabase = create_client(supabase_url, supabase_key)

    today = datetime.now(UTC).strftime('%Y-%m-%d')
    current_month = datetime.now(UTC).strftime('%Y-%m')

    classified_file = Path('data/daily') / f'{today}_classified.json'

    # Load classifications
    classified_items = []
    if classified_file.exists():
        with open(classified_file) as f:
            classified_items = json.load(f)

    # Aggregate by agent and industry
    agent_industry_counts = defaultdict(lambda: defaultdict(int))
    for item in classified_items:
        naics_code = item['naics_code']
        for agent_id in item.get('agents', []):
            agent_industry_counts[agent_id][naics_code] += 1

    # Determine which agents had activity today
    active_agents = set(agent_industry_counts.keys())
    if not active_agents:
        print('No classified items to upload')
        return

    print(f'Active agents today: {sorted(active_agents)}')

    # For each active agent, ensure ALL 19 industries have a row for this month
    updates = 0
    for agent_id in sorted(active_agents):
        new_counts = agent_industry_counts[agent_id]

        for industry_code in ALL_INDUSTRIES:
            count = new_counts.get(industry_code, 0)

            # Check if row already exists for this month
            result = supabase.table('monthly_stats').select('*').eq(
                'agent_id', agent_id
            ).eq(
                'industry_code', industry_code
            ).eq(
                'month', current_month
            ).execute()

            current_data = result.data[0] if result.data else None

            if current_data:
                # Row exists: add new repos
                if count > 0:
                    supabase.table('monthly_stats').update({
                        'cumulative': current_data['cumulative'] + count,
                        'new_repos': current_data['new_repos'] + count
                    }).eq('id', current_data['id']).execute()
                    print(f'  {agent_id}/{industry_code}: +{count} (updated)')
                    updates += 1
            else:
                # No row yet: get previous month's cumulative and carry forward
                prev_result = supabase.table('monthly_stats').select(
                    'cumulative'
                ).eq(
                    'agent_id', agent_id
                ).eq(
                    'industry_code', industry_code
                ).order(
                    'month', desc=True
                ).limit(1).execute()

                prev_cumulative = prev_result.data[0]['cumulative'] if prev_result.data else 0

                supabase.table('monthly_stats').insert({
                    'agent_id': agent_id,
                    'industry_code': industry_code,
                    'month': current_month,
                    'cumulative': prev_cumulative + count,
                    'new_repos': count
                }).execute()

                if count > 0:
                    print(f'  {agent_id}/{industry_code}: +{count} (new row)')
                else:
                    print(f'  {agent_id}/{industry_code}: carried forward ({prev_cumulative})')
                updates += 1

    # Update metadata
    supabase.table('metadata').upsert({
        'key': 'last_updated',
        'value': datetime.now(UTC).isoformat(),
        'updated_at': datetime.now(UTC).isoformat()
    }).execute()

    print(f'\nDone! {updates} rows processed for {current_month}')


if __name__ == '__main__':
    main()
