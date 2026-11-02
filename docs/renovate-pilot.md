# Renovate Actions pilot

Run **Actions → Renovate pilot → Run workflow** in `m11s-io/.github`.
The pilot scans only the public `m11s-io/docker-images` repository. It uses
Renovate's full dry-run mode and the workflow's read-only GitHub token.
It cannot create branches, update PRs, or merge changes. Mend remains active.
There is no schedule during the pilot.
Pull requests changing the workflow or deployment configuration run the same
read-only pilot automatically, so the first run can be reviewed before merging.

`renovate-pilot.cjs` contains deployment settings. The target repository continues
to inherit dependency policy from `renovate-config.json`. The uv cutoff is
supplied centrally using `customEnvVariables`, so future live deployment does not
require repeating it in every Python project.

The workflow validates its configuration before scanning. Read its console log
and download the `renovate-pilot-*` artifact for JSON diagnostics. A failure to
resolve an existing pin under the cutoff is a useful pilot result, not a reason
to disable the cutoff silently.

## Limits before a live rollout

- The read-only token cannot read security alerts in the target repository.
  Security alert handling is disabled for this pilot and remains enabled in
  the common production policy.
- A dedicated GitHub App is needed for cross-repository writes, PR CI triggers,
  workflow updates, and security-alert access. Do not reuse the infrastructure
  App or broaden its permissions for this purpose.
- A global `UV_EXCLUDE_NEWER` applies to security updates as well. The pilot
  does not solve conditional security-update bypass. Resolve that integration
  before enabling live security auto-merge or removing the project cutoffs.
- Disable Mend for a repository before switching it to a live writer. The
  pilot branch prefix is distinct as an additional isolation measure.

Success means that configuration validation passes, repository extraction and
lookups run, and diagnostic logs are available without any target-repository
mutation. Review artifact-generation errors separately before live rollout.

## First run: November 2, 2026

[Run 41415574056](https://github.com/m11s-io/.github/actions/runs/41415574056)
passed configuration validation, scanned 44 files and 255 dependencies, completed
lookups, and uploaded 1,150 diagnostic records. Logged write operations were
marked `DRY-RUN`.

Two uv artifact updates failed because the target's current `main` pins
`huggingface-hub==2.3.0`, which is newer than the cutoff. This confirms that uv
received the central cutoff. The compliant pin and regenerated locks are in
[docker-images PR #146](https://github.com/m11s-io/docker-images/pull/146).
The successful workflow status does not imply that every artifact update
succeeded; inspect the diagnostic log when assessing readiness.
