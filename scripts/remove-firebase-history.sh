#!/usr/bin/env bash
set -euo pipefail

# Removes a file from a repo's history using git-filter-repo.
# Usage: ./remove-firebase-history.sh <git-repo-url> [path-to-file]
# Example: ./remove-firebase-history.sh git@github.com:you/yourrepo.git firebaseConfig.ts

REPO_URL=${1:-}
FILEPATH=${2:-firebaseConfig.ts}

if [[ -z "$REPO_URL" ]]; then
  echo "Usage: $0 <git-repo-url> [path-to-file]"
  exit 2
fi

TMPDIR=$(mktemp -d)
echo "Cloning mirror into $TMPDIR..."
git clone --mirror "$REPO_URL" "$TMPDIR/repo.git"
cd "$TMPDIR/repo.git"

echo "Running git-filter-repo to remove $FILEPATH..."
# Requires: pip install git-filter-repo
git filter-repo --invert-paths --path "$FILEPATH"

echo "Pushing rewritten history (force)..."
git push --force --all
git push --force --tags

echo "Done. Cleaned repo pushed."
echo "IMPORTANT: All collaborators must re-clone the repository. See the accompanying README for details."
