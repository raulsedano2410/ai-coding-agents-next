#!/usr/bin/env python3
"""
Upload classified data to Supabase.
Reads from new fetch_daily/classify format and upserts monthly_stats.
"""

import os
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

from supabase import create_client


def main():
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_KEY')

    if not supabase_url or not supabase_key:
        print('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
        return

    supabase = create_client(supabase_url, supabase_key)

    today = datetime.utcnow().strftime('%Y-%m-%d')
    current_month = datetime.utcnow().strftime('%Y-%m')

    input_file = Path('data/daily') / f'{today}.json'
    classified_file = Path('data/daily') / f'{today}_classified.json'

    if not input_file.exists():
        print(f'No input file: {input_file}')
        return

    # Load classifications (new format includes agents list)
    if not classified_file.exists():
        print(f'No classified file: {classified_file}')
        return

    with open(classified_file) as f:
        classified_items = json.load(f)

    if not classified_items:
        print('No classified items to upload')
        return

    # Aggregate by agent and industry
    agent_industry_counts = defaultdict(lambda: defaultdict(int))

    for item in classified_items:
        naics_code = item['naics_code']
        for agent_id in item.get('agents', []):
            agent_industry_counts[agent_id][naics_code] += 1

    # Upsert to Supabase
    updates = 0
    for agent_id, industry_counts in agent_industry_counts.items():
        for industry_code, count in industry_counts.items():
            # Check if row exists for this month
            result = supabase.table('monthly_stats').select('*').eq(
                'agent_id', agent_id
            ).eq(
                'industry_code', industry_code
            ).eq(
                'month', current_month
            ).execute()

            current_data = result.data[0] if result.data else None

            if current_data:
                new_cumulative = current_data['cumulative'] + count
                new_repos = current_data['new_repos'] + count
                supabase.table('monthly_stats').update({
                    'cumulative': new_cumulative,
                    'new_repos': new_repos
                }).eq('id', current_data['id']).execute()
            else:
                # Get previous month's cumulative
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

            updates += 1
            print(f'  {agent_id}/{industry_code}: +{count}')

    # Update metadata
    supabase.table('metadata').upsert({
        'key': 'last_updated',
        'value': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }).execute()

    print(f'\nDone! {updates} updates for {current_month}')


if __name__ == '__main__':
    main()
