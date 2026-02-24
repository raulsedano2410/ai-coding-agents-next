#!/usr/bin/env python3
"""
Upload classified data to Supabase.

This aggregates daily data and upserts to the monthly_stats table.
"""

import os
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

from supabase import create_client


def main():
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if not supabase_url or not supabase_key:
        print('Missing SUPABASE_URL or SUPABASE_KEY')
        return

    supabase = create_client(supabase_url, supabase_key)

    today = datetime.utcnow().strftime('%Y-%m-%d')
    current_month = datetime.utcnow().strftime('%Y-%m')

    input_file = Path('data/daily') / f'{today}.json'
    classified_file = Path('data/daily') / f'{today}_classified.json'

    if not input_file.exists():
        print(f'No input file: {input_file}')
        return

    with open(input_file) as f:
        daily_data = json.load(f)

    # Load classifications
    classifications = {}
    if classified_file.exists():
        with open(classified_file) as f:
            for item in json.load(f):
                classifications[item['repo_id']] = item['naics_code']

    # Aggregate by agent and industry
    agent_industry_counts = defaultdict(lambda: defaultdict(int))

    for agent, agent_data in daily_data.items():
        for item in agent_data.get('items', []):
            repo = item.get('repository') or {}
            repo_id = repo.get('id')

            if repo_id and repo_id in classifications:
                naics_code = classifications[repo_id]
                agent_industry_counts[agent][naics_code] += 1

    # Upsert to Supabase
    for agent, industry_counts in agent_industry_counts.items():
        for industry_code, count in industry_counts.items():
            # Get current value
            result = supabase.table('monthly_stats').select('*').eq(
                'agent_id', agent
            ).eq(
                'industry_code', industry_code
            ).eq(
                'month', current_month
            ).execute()

            current_data = result.data[0] if result.data else None

            if current_data:
                # Update existing
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
                    'agent_id', agent
                ).eq(
                    'industry_code', industry_code
                ).order(
                    'month', desc=True
                ).limit(1).execute()

                prev_cumulative = prev_result.data[0]['cumulative'] if prev_result.data else 0

                # Insert new row
                supabase.table('monthly_stats').insert({
                    'agent_id': agent,
                    'industry_code': industry_code,
                    'month': current_month,
                    'cumulative': prev_cumulative + count,
                    'new_repos': count
                }).execute()

            print(f'{agent}/{industry_code}: +{count}')

    # Update metadata
    supabase.table('metadata').upsert({
        'key': 'last_updated',
        'value': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }).execute()

    print(f'\nDone! Updated for {current_month}')


if __name__ == '__main__':
    main()
