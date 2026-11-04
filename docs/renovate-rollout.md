# Renovate operations

Renovate runs in GitHub Actions using the organization-owned `m11s-renovate`
App. Mend's hosted App has been uninstalled. The private `demo-repository` and
the contribution-only forks `frr-k8s`, `longhorn`, and `longhorn-manager` are
excluded. The active rollout covers 21 public repositories selected by the
explicit policies in `infra/github`.

## Files

- `renovate-config.json`: shared dependency policy inherited by repositories.
- `renovate-host.cjs`: deployment settings for routine and security runs.
- `.github/workflows/renovate.yml`: shared reusable workflow.
- `.github/workflows/renovate-managed.yml` in each repository: small caller following
  the shared workflow on `main`. Managed by `infra/github/renovate.tf`.
- `scripts/check-renovate-host.cjs` and the validation workflow: checks for mode
  separation, explicit dry-run settings, and valid configuration.

Each caller issues a short-lived App token restricted to its own repository.
Logs and seven-day diagnostic artifacts remain in that repository.

## Policy

Routine updates wait 14 days. The routine bot sets `UV_EXCLUDE_NEWER=14 days`
centrally; Python projects do not need to repeat that setting.

The security run uses Renovate's security-only preset and a forced disable rule
for normal dependencies. Detected vulnerability fixes bypass the uv cutoff
(`UV_EXCLUDE_NEWER=false`). Only patch and minor updates may auto-merge, after
the repository's required checks pass; major updates stay manual. This requires
GitHub Dependency Graph and Dependabot alerts to detect vulnerabilities. It is
not a general malware scanner or a Docker vulnerability scanner.

Separate branch prefixes prevent the two runs from touching each other's PRs.
Automerge is limited to docker-images, helm-charts, redis-http-proxy,
terraform-provider-fider, wordninja-go, terraform-provider-huggingface,
terraform-provider-qbittorrent, symspell-go, jina-proxy, t9s, and
domain-connect-terraform-agent. Each has explicit required application checks
in the infrastructure policy. Other repositories still receive dependency PRs
but cannot auto-merge. Chart release bumps, ComfyUI ROCm updates, and package
rules with explicit `automerge: false` remain manual.

Roll out in this order: merge CI changes and wait for successful application
checks, apply the required branch protections, then merge the shared Renovate
automerge configuration. This avoids enabling auto-merge before its gate exists.
Required checks are `droast`, `image-checks`, `runtime-contracts`, and `renovate`
for docker-images; `lint-test` and `generate-schema` for helm-charts; `test` for
redis-http-proxy, wordninja-go, symspell-go, and domain-connect-terraform-agent;
`build` for terraform-provider-fider; `unit`, `acceptance (terraform)`, and
`acceptance (tofu)` for each enrolled Terraform provider; `test-and-publish` for
jina-proxy; and `verify` for t9s. The t9s Docs `validate` job only runs for
documentation paths, so it is not required for dependency PRs. Deploy jobs and
OSV full-scan results are not required CI contexts.

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

At steady state, managed callers run routine updates weekly and security updates
daily. The infrastructure catalog assigns stable per-repository schedule slots,
and each caller passes its exact `github.event.schedule` identity to select one
mode. Adding a repository does not move existing runs. OSV scans remain daily.
During rollout, callers that omit the mode keep the current behavior and run
both Renovate modes.

Use **Actions → Renovate → Run workflow** for an immediate run. Updated callers
let the operator choose routine, security, or both; routine is the default
mode, and manual dispatch defaults to dry run. Clear that checkbox only when
live writes are wanted. To pause live writes, restore the caller's live setting
to false. Do not reinstall Mend alongside an active writer.

Both the reusable workflow reference and its `host-ref` checkout follow `main`
in `m11s-io/.github`. When updating the shared runner or host configuration,
validate both modes and review the PR before merging: the next run in every
calling repository uses the updated shared code. Third-party actions and the
Renovate runtime remain versioned independently.

For an intentional rollback or fixed revision, set `renovate_workflow_ref` to a
full commit SHA through the infrastructure configuration; it supplies both
references. Existing callers are adopted with the conditional import block;
do not overwrite protected branches to bypass review.

Some forks inherit release branches that do not exist locally, and some projects
have pre-existing dependency/build failures. Inspect the diagnostic artifact;
a successful Actions status does not guarantee every package update succeeded.

## Main reference rollout

[Infrastructure MR !5](https://gitlab.com/m11s/infra/github/-/merge_requests/5)
updates the OpenTofu source and examples. Caller PRs are listed below.

| Repository | Pull request |
| --- | --- |
| .github | [#19](https://github.com/m11s-io/.github/pull/19) |
| docker-images | [#175](https://github.com/m11s-io/docker-images/pull/175) |
| domain-connect-terraform-agent | [#13](https://github.com/m11s-io/domain-connect-terraform-agent/pull/13) |
| dub | [#19](https://github.com/m11s-io/dub/pull/19) |
| fider | [#18](https://github.com/m11s-io/fider/pull/18) |
| frr-k8s | [#4](https://github.com/m11s-io/frr-k8s/pull/4) |
| gatus | [#19](https://github.com/m11s-io/gatus/pull/19) |
| helm-charts | [#80](https://github.com/m11s-io/helm-charts/pull/80) |
| homebrew-tap | [#4](https://github.com/m11s-io/homebrew-tap/pull/4) |
| js | [#12](https://github.com/m11s-io/js/pull/12) |
| longhorn | [#5](https://github.com/m11s-io/longhorn/pull/5) |
| longhorn-manager | [#8](https://github.com/m11s-io/longhorn-manager/pull/8) |
| redis-http-proxy | [#17](https://github.com/m11s-io/redis-http-proxy/pull/17) |
| jina-proxy | [#12](https://github.com/m11s-io/jina-proxy/pull/12) |
| symspell-go | [#10](https://github.com/m11s-io/symspell-go/pull/10) |
| t9s | [#43](https://github.com/m11s-io/t9s/pull/43) |
| terraform-cloudflare-modules | [#5](https://github.com/m11s-io/terraform-cloudflare-modules/pull/5) |
| terraform-provider-fider | [#16](https://github.com/m11s-io/terraform-provider-fider/pull/16) |
| terraform-provider-ghost | [#16](https://github.com/m11s-io/terraform-provider-ghost/pull/16) |
| terraform-provider-huggingface | [#21](https://github.com/m11s-io/terraform-provider-huggingface/pull/21) |
| terraform-provider-nexus | [#18](https://github.com/m11s-io/terraform-provider-nexus/pull/18) |
| terraform-provider-qbittorrent | [#18](https://github.com/m11s-io/terraform-provider-qbittorrent/pull/18) |
| wordninja-go | [#4](https://github.com/m11s-io/wordninja-go/pull/4) |
| zick | [#17](https://github.com/m11s-io/zick/pull/17) |
