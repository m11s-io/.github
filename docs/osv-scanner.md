# Dependency vulnerability scanning

The shared `.github/workflows/osv-scanner.yml` delegates scanning and SARIF
reporting to Google's OSV-Scanner workflows, pinned to a release commit.
It scans source manifests and lockfiles recursively, with OSV's default call
analysis. It does not build or scan published container images.

Pull requests compare the proposed code with the target branch and fail on newly
introduced vulnerabilities. Pushes, scheduled runs, and manual runs scan the full
dependency tree and fail on any reported vulnerability. Scanner errors also fail
the job. Results appear in Security > Code scanning and workflow artifacts.
Repositories with no supported dependency files allow an empty scan, so the
workflow is ready when dependencies are added. An empty scan does not establish
coverage of Helm chart dependencies, Terraform providers, or container images.

## Organization rollout

1. Merge shared workflow changes to `main` before enabling callers.
2. Deploy callers to repositories with `osv = true` in
   `infra/github/repository-policies.tf`. Contribution-only forks (`frr-k8s`,
   `longhorn`, and `longhorn-manager`) are excluded; deployment forks remain
   enrolled. Removing an org-managed caller from a contribution fork does not
   alter workflows inherited from its upstream repository. Before retirement,
   inspect caller provenance in each fork; remove only the org-added
   `.github/workflows/osv-scanner.yml` file, using a reviewed change when it is
   not tracked by OpenTofu.
3. Use each repository's actual default branch and run a daily scan in a
   repository-specific staggered slot. Each infrastructure-managed caller runs
   at the same daily slot, assigned from the active sorted repository inventory.
4. Verify PR comparison, a default-branch full scan, and SARIF upload in Actions.
5. Triage existing findings before making the PR check required in branch rules.

The pilot PR scans passed in `terraform-provider-fider` and `redis-http-proxy`,
including SARIF upload. The broader rollout includes repos without supported
manifests so future dependencies receive the same checks automatically.

Each caller must explicitly grant `actions: read`, `contents: read`, and
`security-events: write`. No secrets are passed. Use `pull_request`, not
`pull_request_target`, for scanning contributions. Public repositories support
SARIF code scanning; private repositories need the corresponding GitHub entitlement.
Set `with: {upload-sarif: false}` on the caller job where code scanning is
unavailable (currently `demo-repository`). Scanning still fails on vulnerabilities
and retains SARIF as an Actions artifact.

Create `.github/workflows/osv-scanner.yml` in each repository:

```yaml
name: OSV dependency scan

on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: '43 6 * * *'
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
    uses: m11s-io/.github/.github/workflows/osv-scanner.yml@main
```

Use the repository's actual default branch and a daily cron. The example runs at
06:43 UTC; infrastructure-managed callers receive staggered daily slots based
on the active sorted repository inventory. Callers follow the shared workflow on
`main`, so a shared-workflow merge takes effect across all repositories
immediately. Google upstream workflows remain pinned to a release commit. The optional
`scan-args` string accepts one argument per line; do not override OSV's output
format or output path, which the upstream workflows manage.

Merge queues are outside this rollout; validate comparison behavior before adding
a `merge_group` trigger. Keep Renovate for dependency update PRs and retain
existing CodeQL or language-specific checks where they provide useful coverage.

## Validation

Run `actionlint` against the shared workflow and every caller file before rollout.
GitHub execution is required to verify cross-repository workflow resolution,
fork PR permissions, scanner runtime, and SARIF ingestion. Local linting cannot
establish that the repositories have no vulnerable dependencies.

## Rollout pull requests

| Repository | Pull request |
| --- | --- |
| .github | [#18](https://github.com/m11s-io/.github/pull/18) |
| demo-repository | [#2](https://github.com/m11s-io/demo-repository/pull/2) |
| docker-images | [#174](https://github.com/m11s-io/docker-images/pull/174) |
| domain-connect-terraform-agent | [#12](https://github.com/m11s-io/domain-connect-terraform-agent/pull/12) |
| dub | [#18](https://github.com/m11s-io/dub/pull/18) |
| fider | [#17](https://github.com/m11s-io/fider/pull/17) |
| frr-k8s | [#3](https://github.com/m11s-io/frr-k8s/pull/3) |
| gatus | [#18](https://github.com/m11s-io/gatus/pull/18) |
| helm-charts | [#79](https://github.com/m11s-io/helm-charts/pull/79) |
| homebrew-tap | [#3](https://github.com/m11s-io/homebrew-tap/pull/3) |
| jina-proxy | [#11](https://github.com/m11s-io/jina-proxy/pull/11) |
| js | [#11](https://github.com/m11s-io/js/pull/11) |
| longhorn | [#4](https://github.com/m11s-io/longhorn/pull/4) |
| longhorn-manager | [#7](https://github.com/m11s-io/longhorn-manager/pull/7) |
| redis-http-proxy | [#16](https://github.com/m11s-io/redis-http-proxy/pull/16) |
| symspell-go | [#9](https://github.com/m11s-io/symspell-go/pull/9) |
| t9s | [#42](https://github.com/m11s-io/t9s/pull/42) |
| terraform-cloudflare-modules | [#4](https://github.com/m11s-io/terraform-cloudflare-modules/pull/4) |
| terraform-provider-fider | [#15](https://github.com/m11s-io/terraform-provider-fider/pull/15) |
| terraform-provider-ghost | [#15](https://github.com/m11s-io/terraform-provider-ghost/pull/15) |
| terraform-provider-huggingface | [#20](https://github.com/m11s-io/terraform-provider-huggingface/pull/20) |
| terraform-provider-nexus | [#17](https://github.com/m11s-io/terraform-provider-nexus/pull/17) |
| terraform-provider-qbittorrent | [#17](https://github.com/m11s-io/terraform-provider-qbittorrent/pull/17) |
| wordninja-go | [#3](https://github.com/m11s-io/wordninja-go/pull/3) |
| zick | [#16](https://github.com/m11s-io/zick/pull/16) |
