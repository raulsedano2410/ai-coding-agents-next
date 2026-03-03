#!/usr/bin/env python3
"""
Classify new repositories using the NAICS classifier.
Reads repos from fetch_daily.py output, classifies with RoBERTa on CPU.
"""

import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path


def load_classifier():
    from transformers import pipeline
    token = os.environ.get('HF_TOKEN') or None
    return pipeline(
        'text-classification',
        model='aquiro1994/naics-github-classifier',
        device=-1,  # CPU
        token=token,
        truncation=True,
        max_length=512,
    )


def get_repo_text(repo: dict) -> str:
    parts = []
    if repo.get('name'):
        parts.append(repo['name'])
    if repo.get('description'):
        parts.append(repo['description'])
    if repo.get('topics'):
        parts.append(' '.join(repo['topics']))
    return ' '.join(parts)[:200]


def main():
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime('%Y-%m-%d')
    input_file = Path('data/daily') / f'{yesterday}.json'
    output_file = Path('data/daily') / f'{yesterday}_classified.json'

    if not input_file.exists():
        print(f'No input file found: {input_file}')
        return

    with open(input_file) as f:
        data = json.load(f)

    # Collect unique repos per agent
    agent_repos = {}
    for agent_id, agent_data in data.items():
        repos = agent_data.get('repos', [])
        agent_repos[agent_id] = repos

    # All unique repos for classification
    all_repos = {}
    repo_agents = {}
    for agent_id, repos in agent_repos.items():
        for repo in repos:
            nwo = repo.get('full_name', '')
            if nwo:
                all_repos[nwo] = repo
                if nwo not in repo_agents:
                    repo_agents[nwo] = []
                repo_agents[nwo].append(agent_id)

    if not all_repos:
        print('No new repos to classify')
        with open(output_file, 'w') as f:
            json.dump([], f)
        return

    print(f'Classifying {len(all_repos)} unique repositories...')

    classifier = load_classifier()
    classified = []

    for nwo, repo in all_repos.items():
        text = get_repo_text(repo)
        if not text.strip():
            continue

        try:
            prediction = classifier(text)[0]
            classified.append({
                'full_name': nwo,
                'naics_code': prediction['label'],
                'confidence': round(prediction['score'], 4),
                'agents': sorted(repo_agents.get(nwo, []))
            })
        except Exception as e:
            print(f"  Error classifying {nwo}: {e}")

    with open(output_file, 'w') as f:
        json.dump(classified, f, indent=2)

    print(f'Classified {len(classified)} repos')
    # Summary by agent
    for agent_id in data.keys():
        count = sum(1 for c in classified if agent_id in c.get('agents', []))
        print(f'  {agent_id}: {count} classified')


if __name__ == '__main__':
    main()
