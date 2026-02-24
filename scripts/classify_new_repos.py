#!/usr/bin/env python3
"""
Classify new repositories using the NAICS classifier.

This runs on CPU in GitHub Actions.
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Only import heavy libraries if we have data to process
def load_classifier():
    from transformers import pipeline
    return pipeline(
        'text-classification',
        model='alexanderquispe/naics-github-classifier',
        device=-1  # CPU
    )


def get_repo_text(repo_data: dict) -> str:
    """Combine repo fields into classification text."""
    parts = []

    if repo_data.get('name'):
        parts.append(repo_data['name'])

    if repo_data.get('description'):
        parts.append(repo_data['description'])

    if repo_data.get('topics'):
        parts.append(' '.join(repo_data['topics']))

    return ' '.join(parts)[:512]  # Truncate to 512 chars


def classify_repos(repos: list, classifier) -> list:
    """Classify a list of repositories."""
    results = []

    for repo in repos:
        text = get_repo_text(repo)
        if not text.strip():
            continue

        try:
            prediction = classifier(text)[0]
            results.append({
                'repo_id': repo.get('id'),
                'full_name': repo.get('full_name'),
                'naics_code': prediction['label'],
                'confidence': prediction['score']
            })
        except Exception as e:
            print(f"Error classifying {repo.get('full_name')}: {e}")

    return results


def main():
    today = datetime.utcnow().strftime('%Y-%m-%d')
    input_file = Path('data/daily') / f'{today}.json'
    output_file = Path('data/daily') / f'{today}_classified.json'

    if not input_file.exists():
        print(f'No input file found: {input_file}')
        return

    with open(input_file) as f:
        data = json.load(f)

    # Extract unique repos from all agents
    repos = {}
    for agent, agent_data in data.items():
        for item in agent_data.get('items', []):
            # Extract repo info from PR or commit
            repo = item.get('repository') or {}
            if repo.get('id'):
                repos[repo['id']] = {
                    'id': repo['id'],
                    'full_name': repo.get('full_name'),
                    'name': repo.get('name'),
                    'description': repo.get('description'),
                    'topics': repo.get('topics', [])
                }

    if not repos:
        print('No new repos to classify')
        return

    print(f'Classifying {len(repos)} repositories...')

    # Load classifier and process
    classifier = load_classifier()
    classified = classify_repos(list(repos.values()), classifier)

    # Save results
    with open(output_file, 'w') as f:
        json.dump(classified, f, indent=2)

    print(f'Saved {len(classified)} classifications to {output_file}')


if __name__ == '__main__':
    main()
