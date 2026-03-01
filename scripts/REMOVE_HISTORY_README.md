Purpose
-------
This folder contains scripts to remove `firebaseConfig.ts` from Git history. Use these only after you have rotated/revoked the exposed credentials.

Prerequisites
-------------
- Ensure you have a backup of the repository and coordinated with all collaborators.
- Install `git`.
- Recommended: install `git-filter-repo` (Python package):

  pip install --user git-filter-repo

Alternative: use the BFG repo cleaner (https://rtyley.github.io/bfg-repo-cleaner/).

How to use (safe recommended flow)
---------------------------------
1. Rotate/revoke exposed Firebase keys in Firebase/GCP (DO THIS FIRST).
2. Run the script from another machine (not on a working clone):

   - Shell (Linux/macOS/WSL/Cygwin/Git Bash):

     ./remove-firebase-history.sh git@github.com:YOUR/REPO.git firebaseConfig.ts

   - PowerShell (Windows):

     .\remove-firebase-history.ps1 -RepoUrl 'git@github.com:YOUR/REPO.git' -FilePath 'firebaseConfig.ts'

3. After the script completes, notify all collaborators to re-clone the repository:

   git clone git@github.com:YOUR/REPO.git

Notes and cautions
------------------
- Rewriting history is destructive: it changes commit SHAs. Any forks, open PRs, or local branches will be affected.
- After force-pushing rewritten history, open PRs will likely need to be recreated or rebased against the new history.
- Consider contacting GitHub Support if you need help with large or complex histories.

Post-action checklist
---------------------
- Verify the sensitive file is no longer present in the mirrored repo (use `git ls-tree` or `git log --all -- <path>`).
- Verify CI/CD pipelines and deployments do not have cached copies of the old secret.
- Ensure new keys are restricted (HTTP referrers, app package names, IPs) where possible.
