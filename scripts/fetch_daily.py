#!/usr/bin/env python3
"""
Fetch new PRs and commits from GitHub API for all AI coding agents.
Extracts unique repos and fetches their full metadata.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

GITHUB_TOKEN = os.environ.get('GH_TOKEN') or os.environ.get('GITHUB_TOKEN')
if not GITHUB_TOKEN:
    raise RuntimeError('Missing GH_TOKEN or GITHUB_TOKEN environment variable')

HEADERS = {
    'Authorization': f'Bearer {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

AGENTS = {
    'claude': {
        'type': 'commit',
        'query': 'author-name:"Claude" author-email:noreply@anthropic.com'
    },
    'copilot': {
        'type': 'commit',
        'query': 'author-name:"Copilot" author-email:noreply@github.com'
    },
    'codex': {
        'type': 'commit',
        'query': 'author-name:"Codex" author-email:noreply@openai.com'
    },
    'cursor': {
        'type': 'pr',
        'query': 'head:cursor/'
    }
}

OUTPUT_DIR = Path('data/daily')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def search_github(query, search_type='issues', max_pages=10):
    """Generic GitHub search with pagination."""
    if search_type == 'commits':
        url = 'https://api.github.com/search/commits'
        headers = {**HEADERS, 'Accept': 'application/vnd.github.cloak-preview+json'}
    else:
        url = 'https://api.github.com/search/issues'
        headers = HEADERS

    all_items = []
    page = 1

    while page <= max_pages:
        params = {'q': query, 'per_page': 100, 'page': page}
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == 422:
            print(f'  Search validation error (too many results), stopping at page {page}')
            break
        if response.status_code != 200:
            print(f'  Error: {response.status_code} - {response.text[:200]}')
            break

        data = response.json()
        items = data.get('items', [])
        if not items:
            break

        all_items.extend(items)
        print(f'  Page {page}: +{len(items)} (total: {len(all_items)}/{data.get("total_count", "?")})')

        if len(items) < 100:
            break
        page += 1

    return all_items


def extract_repo_names(items, search_type):
    """Extract unique repo full_names from search results."""
    repos = set()
    for item in items:
        if search_type == 'commits':
            # Commit search: repository info is at item.repository.full_name
            repo = item.get('repository', {})
            if repo.get('full_name'):
                repos.add(repo['full_name'])
        else:
            # PR/Issue search: repo URL is in repository_url
            repo_url = item.get('repository_url', '')
            if repo_url:
                # https://api.github.com/repos/owner/repo -> owner/repo
                parts = repo_url.split('/repos/')
                if len(parts) == 2:
                    repos.add(parts[1])
            # Also try html_url pattern
            elif item.get('html_url'):
                parts = item['html_url'].split('github.com/')
                if len(parts) == 2:
                    # owner/repo/pull/123
                    repo_parts = parts[1].split('/')
                    if len(repo_parts) >= 2:
                        repos.add(f'{repo_parts[0]}/{repo_parts[1]}')
    return repos


def fetch_repo_metadata(repo_full_name):
    """Fetch full metadata for a single repository."""
    url = f'https://api.github.com/repos/{repo_full_name}'
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        return None
    data = response.json()
    return {
        'id': data['id'],
        'full_name': data['full_name'],
        'name': data['name'],
        'description': data.get('description') or '',
        'topics': data.get('topics', [])
    }


def main():
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    today = datetime.utcnow().strftime('%Y-%m-%d')

    print(f'Fetching data since {yesterday}...\n')

    results = {}

    for agent_id, config in AGENTS.items():
        print(f'=== {agent_id} ===')

        if config['type'] == 'pr':
            query = f'is:pr {config["query"]} created:>{yesterday}'
            items = search_github(query, 'issues')
            search_type = 'issues'
        else:
            query = f'{config["query"]} committer-date:>{yesterday}'
            items = search_github(query, 'commits')
            search_type = 'commits'

        print(f'  Found {len(items)} items')

        # Extract unique repos
        repo_names = extract_repo_names(items, search_type)
        print(f'  Unique repos: {len(repo_names)}')

        # Fetch metadata for each repo (rate limit aware)
        repos = []
        for i, name in enumerate(sorted(repo_names)):
            if i > 0 and i % 50 == 0:
                print(f'  Fetching metadata: {i}/{len(repo_names)}...')
            meta = fetch_repo_metadata(name)
            if meta:
                repos.append(meta)

        results[agent_id] = {
            'count': len(items),
            'repo_count': len(repos),
            'repos': repos
        }
        print(f'  Fetched metadata for {len(repos)} repos\n')

    # Save results
    output_file = OUTPUT_DIR / f'{today}.json'
    with open(output_file, 'w') as f:
        json.dump(results, f)

    print(f'Saved results to {output_file}')
    print('\n=== Summary ===')
    for agent_id, data in results.items():
        print(f'{agent_id}: {data["count"]} items, {data["repo_count"]} repos')


if __name__ == '__main__':
    main()
