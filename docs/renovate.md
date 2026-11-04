# Renovate dependency updates

Renovate runs in GitHub Actions using a GitHub App to create dependency update
pull requests.

## Files

- `renovate-config.json`: shared dependency policy inherited by repositories.
- `renovate-host.cjs`: deployment settings for routine and security runs.
- `.github/workflows/renovate-run.yml`: shared reusable workflow.
- `.github/workflows/maintenance.yml`: daily Renovate and OSV orchestration.
- `.github/workflows/renovate.yml` in each repository: small caller following
  the shared Maintenance workflow on `main`.
- `scripts/check-renovate-host.cjs` and the validation workflow: checks for mode
  separation, explicit dry-run settings, and valid configuration.

Each caller issues a short-lived App token restricted to its own repository.
Logs and seven-day diagnostic artifacts remain in that repository.

## Policy

Routine updates wait 14 days. The routine bot sets `UV_EXCLUDE_NEWER=14 days`
centrally; Python projects do not need to repeat that setting.

The security run uses Renovate's security-only preset and a forced disable rule
for normal dependencies. Detected vulnerability fixes override it, bypass the uv
cutoff (`UV_EXCLUDE_NEWER=false`), and may auto-merge after checks pass. This
requires GitHub Dependency Graph and Dependabot alerts to detect vulnerabilities.
It is not a general malware scanner or a Docker vulnerability scanner.

Separate branch prefixes prevent the two runs from touching each other's PRs.
Routine updates retain each repository's merge policy. Application CI must pass;
artifact failures must be resolved before merging an affected update. A passing
vulnerability scan alone does not authorize a merge.

## Configuration and credentials

Organization Actions **variable**: `RENOVATE_CLIENT_ID`.
Organization Actions **secret**: `RENOVATE_APP_PRIVATE_KEY`.
Both need access to the calling repositories. The App must be installed there
with the permissions documented by
[Renovate](https://docs.renovatebot.com/modules/platform/github/#running-as-a-github-app).
No webhook server or App implementation is needed.

## Run and maintain

Callers run once daily through Maintenance. Use **Actions → Maintenance → Run workflow** for
an immediate run; manual dispatch defaults to dry run. Clear that checkbox only
when live writes are wanted. Manage exceptional pauses through
`renovate_disabled_repositories` in `infra/github`; contribution-only repositories
use the `maintenance-disabled` topic.

Both the reusable workflow reference and its `host-ref` checkout follow `main`
in `m11s-io/.github`. When updating the shared runner or host configuration,
validate both modes and review the PR before merging: the next run in every
calling repository uses the updated shared code. Third-party actions and the
Renovate runtime remain versioned independently.

For an intentional rollback or fixed revision, pin both the reusable workflow
reference and `host-ref` to the same full commit SHA.

Some forks inherit release branches that do not exist locally, and some projects
have pre-existing dependency/build failures. Inspect the diagnostic artifact;
a successful Actions status does not guarantee every package update succeeded.
