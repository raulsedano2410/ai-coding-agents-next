#!/usr/bin/env python3
"""
Classify new repositories using the NAICS classifier.
Reads repos from the new fetch_daily.py format.
"""

import json
import os
from datetime import datetime, UTC
from pathlib import Path


def load_classifier():
    from transformers import pipeline
    token = os.environ.get('HF_TOKEN')
    return pipeline(
        'text-classification',
        model='aquiro1994/naics-github-classifier',
        device=-1,  # CPU
        token=token,
    )


def get_repo_text(repo: dict) -> str:
    """Combine repo fields into classification text."""
    parts = []
    if repo.get('name'):
        parts.append(repo['name'])
    if repo.get('description'):
        parts.append(repo['description'])
    if repo.get('topics'):
        parts.append(' '.join(repo['topics']))
    return ' '.join(parts)[:512]


def main():
    today = datetime.now(UTC).strftime('%Y-%m-%d')
    input_file = Path('data/daily') / f'{today}.json'
    output_file = Path('data/daily') / f'{today}_classified.json'

    if not input_file.exists():
        print(f'No input file found: {input_file}')
        return

    with open(input_file) as f:
        data = json.load(f)

    # Extract unique repos from all agents (new structure: agent.repos[])
    unique_repos = {}
    agent_repo_map = {}  # repo_id -> set of agent_ids

    for agent_id, agent_data in data.items():
        for repo in agent_data.get('repos', []):
            repo_id = repo.get('id')
            if repo_id:
                unique_repos[repo_id] = repo
                if repo_id not in agent_repo_map:
                    agent_repo_map[repo_id] = set()
                agent_repo_map[repo_id].add(agent_id)

    if not unique_repos:
        print('No new repos to classify')
        # Save empty result
        with open(output_file, 'w') as f:
            json.dump([], f)
        return

    print(f'Classifying {len(unique_repos)} unique repositories...')

    classifier = load_classifier()
    classified = []

    for repo in unique_repos.values():
        text = get_repo_text(repo)
        if not text.strip():
            continue

        try:
            prediction = classifier(text)[0]
            classified.append({
                'repo_id': repo['id'],
                'full_name': repo.get('full_name', ''),
                'naics_code': prediction['label'],
                'confidence': round(prediction['score'], 4),
                'agents': sorted(agent_repo_map.get(repo['id'], []))
            })
        except Exception as e:
            print(f"  Error classifying {repo.get('full_name')}: {e}")

    with open(output_file, 'w') as f:
        json.dump(classified, f, indent=2)

    print(f'Saved {len(classified)} classifications to {output_file}')


if __name__ == '__main__':
    main()
