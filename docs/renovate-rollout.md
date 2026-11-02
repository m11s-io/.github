# Renovate operations

Renovate runs in GitHub Actions using the organization-owned `m11s-renovate`
App. Mend's hosted App has been uninstalled. The private `demo-repository` is
excluded; the rollout covers the 24 public repositories managed by `infra/github`.

## Files

- `renovate-config.json`: shared dependency policy inherited by repositories.
- `renovate-host.cjs`: deployment settings for routine and security runs.
- `.github/workflows/renovate.yml`: shared reusable workflow.
- `.github/workflows/renovate-managed.yml` in each repository: small caller pinned
  to an immutable shared revision. Managed by `infra/github/renovate.tf`.
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
Routine updates retain each repository's merge policy. Application CI and branch
protection remain in effect; artifact failures must be resolved before merging
an affected update.

## Configuration and credentials

Organization Actions **variable**: `RENOVATE_CLIENT_ID`.
Organization Actions **secret**: `RENOVATE_APP_PRIVATE_KEY`.
Both need access to the calling repositories. The App must be installed there
with the permissions documented by
[Renovate](https://docs.renovatebot.com/modules/platform/github/#running-as-a-github-app).
No webhook server or App implementation is needed.

The separate infrastructure identity uses variable `TOFU_CLIENT_ID` and secret
`TOFU_APP_PRIVATE_KEY`. OpenTofu's numeric `github_app_id` provider variable is
separate and remains required. Never put private keys in Actions Variables.

## Run and maintain

Live-enabled callers run hourly. Use **Actions → Renovate → Run workflow** for
an immediate run; manual dispatch defaults to dry run. Clear that checkbox only
when live writes are wanted. To pause schedules, restore the caller's live flag
to false. Do not reinstall Mend alongside an active writer.

When updating the shared runner, validate both modes, review the commit, and
update caller pins through the infrastructure configuration. Existing callers
are adopted with its conditional import block; do not overwrite protected
branches to bypass review.

Some forks inherit release branches that do not exist locally, and some projects
have pre-existing dependency/build failures. Inspect the diagnostic artifact;
a successful Actions status does not guarantee every package update succeeded.
