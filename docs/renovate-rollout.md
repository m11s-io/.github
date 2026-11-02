# Self-hosted Renovate rollout

## Structure

`renovate-config.json` holds shared dependency policy. `renovate-host.cjs` holds
self-hosted execution settings. `.github/workflows/renovate.yml` is a reusable
workflow. `infra/github/renovate.tf` deploys a small caller to each of its 25
repositories on that repository's actual default branch. Logs and artifacts stay
in each calling repository, including the private repository.

Each caller mints a short-lived token restricted to its own repository. It runs
security and routine scans sequentially, on separate branch prefixes. Both are
full dry runs until the repository is explicitly enabled for live execution.

- Routine: shared 14-day policy; `UV_EXCLUDE_NEWER=14 days` for package managers.
- Security: Renovate's `security:only-security-updates` preset;
  `UV_EXCLUDE_NEWER=false`; immediate vulnerability PRs, auto-merge only after
  checks pass; no lock-file-maintenance updates.

The security run force-disables normal dependencies so repository opt-in rules
cannot re-enable them; Renovate appends vulnerability-alert force-enable rules
afterward. The audit found one such ordinary opt-in in helm-charts. Check the
resolved security run for non-security update proposals before live cutover.
Do not treat a passing configuration validator as proof of end-to-end behavior.

## One-time GitHub App setup

No app code, web server, OAuth callback, or webhook endpoint is needed.

1. Open <https://github.com/organizations/m11s-io/settings/apps/new>.
2. Name the App `m11s-renovate` (choose another available name if needed).
   Homepage: <https://github.com/m11s-io/.github>. Disable webhooks and leave
   user authorization callbacks unused. Make the App private to this organization.
3. Set repository permissions:

   | Permission | Access |
   | --- | --- |
   | Administration | Read |
   | Checks | Read and write |
   | Commit statuses | Read and write |
   | Contents | Read and write |
   | Dependabot alerts | Read |
   | Issues | Read and write |
   | Pull requests | Read and write |
   | Workflows | Read and write |
   | Metadata | Read (automatic) |

   Set organization **Members** permission to **Read**. Merge queues permission
   is needed only if a target repository uses a merge queue.
4. Install the App on the repositories in
   `infra/github/files/renovate-repositories.json`, or use the
   `renovate_installation_repositories` OpenTofu output. Keep Mend installed for now.
5. Generate an App private key. Store the App ID as organization Actions secret
   `RENOVATE_APP_ID` and the PEM contents as `RENOVATE_APP_PRIVATE_KEY`.
   Grant both secrets to the same selected repositories. Do not paste the PEM
   into chat or commit it. The existing infrastructure App's provider cannot
   create these organization secrets; an organization owner must do this setup.
6. For OpenTofu deployment of `.github/workflows/renovate.yml`, give the existing
   `m11s-tofu` infrastructure App **Workflows: read and write** and approve the
   installation permission update. Its current Contents permission alone is
   insufficient to provision workflow files. This does not make it the Renovate
   runtime identity; runtime tokens still come from the dedicated App.

Reference: <https://docs.renovatebot.com/modules/platform/github/#running-as-a-github-app>.

## Deployment and verification

1. Merge the reviewed shared workflow and record its full commit SHA.
2. Set `renovate_workflow_ref` to that SHA and
   `renovate_deploy_workflows=true` in the infrastructure configuration.
   Leave `renovate_live_repositories=[]`.
3. Review an OpenTofu plan limited to the new workflow resources. The working
   infrastructure checkout contains unrelated ongoing changes; do not apply a
   broad plan just to deploy Renovate. Existing workflow paths must be imported
   before management; `overwrite_on_create=false` prevents silent replacement.
   Protected default branches may require deployment via reviewed PRs instead of
   direct provider commits. Do not weaken branch protections.
4. Manually dispatch **Renovate** in each repository. Verify token creation,
   repository access, both configuration validations, lookup/artifact results,
   and log upload. Check that the security pass proposes only security fixes.
   A fresh security fix must resolve with the uv cutoff disabled and normal CI
   must pass before live security auto-merge is considered verified.
5. For uv projects, remove project-level `exclude-newer` only as part of their
   tested cutover. uv records resolver options in its locks, so regenerate/check
   locks and adjust lock-consistency checks as needed. Confirm ordinary CI and
   security PR CI do not independently impose the routine cutoff.
6. Once verified, disable Mend's access for the repository and add its name to
   `renovate_live_repositories`. Apply only the reviewed caller change. The next
   manual live dispatch or hourly schedule runs the replacement.

For organization-wide Mend removal, first check for installed repositories
outside this infrastructure inventory. Do not interrupt repositories outside the
migration scope. After all scoped repositories are healthy, uninstall the old
**Renovate** App at organization Settings → GitHub Apps → Renovate → Configure.
If other repositories still need it, retain a selected-repository installation
for those repositories instead.

Do not delete old Mend PRs or branches blindly. Close superseded bot-authored PRs
only after the replacement has successfully proposed the corresponding updates.
New prefixes keep the two writers isolated during dry runs and validation.

## Rollback

Remove a repository from `renovate_live_repositories` to stop scheduled writes;
manual dispatch defaults to dry run. Re-enable Mend only after self-hosted writes
have stopped. App-token revocation runs automatically at the end of each job.
The old pilot remains a read-only diagnostic workflow until it is deliberately
retired.
