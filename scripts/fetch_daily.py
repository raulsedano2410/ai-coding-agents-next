#!/usr/bin/env python3
"""
Fetch yesterday's PRs/commits from GitHub API for all AI coding agents.
Queries match Alex's original fetchers in src/github_fetcher/*.py
"""

import os
import json
import time
import requests
from datetime import datetime, timedelta, timezone
from pathlib import Path

GITHUB_TOKEN = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
if not GITHUB_TOKEN:
    raise RuntimeError('Missing GH_TOKEN or GITHUB_TOKEN environment variable')

HEADERS = {
    'Authorization': f'Bearer {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

# Queries correctas (de src/github_fetcher/)
AGENTS = {
    'claude': {
        'search_type': 'commits',
        'query_base': 'author-name:"Claude" author-email:noreply@anthropic.com',
        'date_field': 'committer-date',
    },
    'copilot': {
        'search_type': 'issues',
        'query_base': 'is:pr head:copilot',
        'date_field': 'created',
    },
    'codex': {
        'search_type': 'issues',
        'query_base': 'is:pr head:codex',
        'date_field': 'created',
    },
    'cursor': {
        'search_type': 'issues',
        'query_base': 'is:pr head:cursor/',
        'date_field': 'created',
    },
}

OUTPUT_DIR = Path('data/daily')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def search_github(query, search_type='issues', max_pages=10):
    if search_type == 'commits':
        url = 'https://api.github.com/search/commits'
        headers = {**HEADERS, 'Accept': 'application/vnd.github.cloak-preview+json'}
    else:
        url = 'https://api.github.com/search/issues'
        headers = HEADERS

    all_items = []
    page = 1

    while page <= max_pages:
        params = {'q': query, 'per_page': 100, 'page': page, 'sort': 'created', 'order': 'asc'}
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 403:
            reset = int(response.headers.get('X-RateLimit-Reset', 0))
            wait = max(reset - int(time.time()), 5)
            print(f'  Rate limited, waiting {wait}s...')
            time.sleep(wait + 1)
            continue
        if response.status_code in (422, 500, 502, 503):
            print(f'  Error {response.status_code}, stopping')
            break
        if response.status_code != 200:
            print(f'  Error: {response.status_code}')
            break

        data = response.json()
        items = data.get('items', [])
        if not items:
            break

        all_items.extend(items)
        if len(items) < 100:
            break
        page += 1
        time.sleep(0.5)

    return all_items


def extract_repos_from_commits(items):
    repos = {}
    for item in items:
        repo_info = item.get('repository', {})
        nwo = repo_info.get('full_name', '')
        if nwo and nwo not in repos:
            repos[nwo] = {
                'full_name': nwo,
                'name': nwo.split('/')[-1],
                'description': repo_info.get('description') or '',
            }
    return repos


def extract_repos_from_prs(items):
    repos = {}
    for item in items:
        repo_url = item.get('repository_url', '')
        nwo = repo_url.split('/repos/')[-1] if '/repos/' in repo_url else ''
        if not nwo:
            html = item.get('html_url', '')
            parts = html.replace('https://github.com/', '').split('/')
            nwo = f"{parts[0]}/{parts[1]}" if len(parts) >= 2 else ''
        if nwo and nwo not in repos:
            repos[nwo] = {
                'full_name': nwo,
                'name': nwo.split('/')[-1],
                'description': '',
            }
    return repos


def main():
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%d')

    print(f'Fetching data for {yesterday}...\n')

    results = {}

    for agent_id, config in AGENTS.items():
        print(f'=== {agent_id} ===')

        query = f'{config["query_base"]} {config["date_field"]}:{yesterday}'
        print(f'  Query: {query}')

        items = search_github(query, config['search_type'])
        print(f'  Found {len(items)} items')

        if config['search_type'] == 'commits':
            repos = extract_repos_from_commits(items)
        else:
            repos = extract_repos_from_prs(items)

        results[agent_id] = {
            'date': yesterday,
            'item_count': len(items),
            'repo_count': len(repos),
            'repos': list(repos.values())
        }
        print(f'  Unique repos: {len(repos)}\n')

    output_file = OUTPUT_DIR / f'{yesterday}.json'
    with open(output_file, 'w') as f:
        json.dump(results, f)

    print(f'Saved to {output_file}')
    for agent_id, data in results.items():
        print(f'  {agent_id}: {data["repo_count"]} repos')


if __name__ == '__main__':
    main()
