# Dependency vulnerability scanning

The shared `.github/workflows/osv-scanner.yml` delegates scanning and SARIF
reporting to Google's OSV-Scanner workflows, pinned to a release commit.
It scans source manifests and lockfiles recursively, with OSV's default call
analysis. It does not build or scan published container images.

Pull requests compare the proposed code with the target branch and fail on newly
introduced vulnerabilities. Pushes, scheduled runs, and manual runs scan the full
dependency tree and fail on any reported vulnerability. Scanner errors also fail
the job. Results appear in Security > Code scanning and workflow artifacts.

## Pilot and rollout

1. Publish the shared workflow commit before enabling callers.
2. Pilot on `terraform-provider-fider` and `redis-http-proxy`.
3. Verify PR comparison, a default-branch full scan, and SARIF upload in Actions.
4. Triage existing findings before making the PR check required in branch rules.
5. Expand to maintained application/library repos. Assess upstream forks and
   container/chart repositories separately.

Each caller must explicitly grant `actions: read`, `contents: read`, and
`security-events: write`. No secrets are passed. Use `pull_request`, not
`pull_request_target`, for scanning contributions. Public repositories support
SARIF code scanning; private repositories need the corresponding GitHub entitlement.

Create `.github/workflows/osv-scanner.yml` in each repository:

```yaml
name: OSV dependency scan

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '43 6 * * 2'
  workflow_dispatch:

permissions:
  actions: read
  contents: read
  security-events: write

concurrency:
  group: osv-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  scan:
    uses: m11s-io/.github/.github/workflows/osv-scanner.yml@<published-commit-sha>
```

Use the repository's actual default branch and a staggered weekly schedule.
Always pin the shared workflow to a published commit SHA. The optional
`scan-args` string accepts one argument per line; do not override OSV's output
format or output path, which the upstream workflows manage.

Merge queues are outside this pilot; validate comparison behavior before adding
a `merge_group` trigger. Keep Renovate for dependency update PRs and retain
existing CodeQL or language-specific checks where they provide useful coverage.

## Validation

Run `actionlint` against the shared workflow and both caller files before rollout.
GitHub execution is required to verify cross-repository workflow resolution,
fork PR permissions, scanner runtime, and SARIF ingestion. Local linting cannot
establish that the repositories have no vulnerable dependencies.
