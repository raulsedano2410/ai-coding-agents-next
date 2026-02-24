#!/usr/bin/env python3
"""
Fetch new PRs and commits from GitHub API for all AI coding agents.

This script runs daily via GitHub Actions to collect new data.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
HEADERS = {
    'Authorization': f'Bearer {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

# Agent detection patterns
AGENTS = {
    'claude': {
        'type': 'commit',
        'pattern': 'Co-Authored-By.*@anthropic.com'
    },
    'copilot': {
        'type': 'commit',
        'pattern': 'Co-Authored-By.*copilot'
    },
    'codex': {
        'type': 'commit',
        'pattern': 'Co-Authored-By.*@openai.com'
    },
    'cursor': {
        'type': 'pr',
        'pattern': 'head:cursor/'
    }
}

OUTPUT_DIR = Path('data/daily')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def fetch_cursor_prs(since_date: str):
    """Fetch PRs with cursor/ branch prefix."""
    query = f'is:pr head:cursor/ created:>{since_date}'
    url = 'https://api.github.com/search/issues'

    all_prs = []
    page = 1

    while True:
        params = {'q': query, 'per_page': 100, 'page': page}
        response = requests.get(url, headers=HEADERS, params=params)

        if response.status_code != 200:
            print(f'Error fetching PRs: {response.status_code}')
            break

        data = response.json()
        items = data.get('items', [])

        if not items:
            break

        all_prs.extend(items)
        print(f'  Fetched page {page}, total: {len(all_prs)}')

        if len(items) < 100:
            break

        page += 1

    return all_prs


def fetch_commits(agent: str, pattern: str, since_date: str):
    """Fetch commits matching a pattern."""
    query = f'{pattern} committer-date:>{since_date}'
    url = 'https://api.github.com/search/commits'

    headers = HEADERS.copy()
    headers['Accept'] = 'application/vnd.github.cloak-preview+json'

    all_commits = []
    page = 1

    while True:
        params = {'q': query, 'per_page': 100, 'page': page}
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            print(f'Error fetching commits: {response.status_code}')
            break

        data = response.json()
        items = data.get('items', [])

        if not items:
            break

        all_commits.extend(items)
        print(f'  Fetched page {page}, total: {len(all_commits)}')

        if len(items) < 100:
            break

        page += 1

    return all_commits


def main():
    # Get yesterday's date
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    today = datetime.utcnow().strftime('%Y-%m-%d')

    print(f'Fetching data since {yesterday}...\n')

    results = {}

    for agent, config in AGENTS.items():
        print(f'Fetching {agent}...')

        if config['type'] == 'pr':
            items = fetch_cursor_prs(yesterday)
        else:
            items = fetch_commits(agent, config['pattern'], yesterday)

        results[agent] = {
            'count': len(items),
            'items': items
        }
        print(f'  Found {len(items)} items\n')

    # Save results
    output_file = OUTPUT_DIR / f'{today}.json'
    with open(output_file, 'w') as f:
        json.dump(results, f)

    print(f'Saved results to {output_file}')

    # Print summary
    print('\n=== Summary ===')
    for agent, data in results.items():
        print(f'{agent}: {data["count"]} items')


if __name__ == '__main__':
    main()
