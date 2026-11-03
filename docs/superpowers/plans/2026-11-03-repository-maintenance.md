# Repository Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Reduce public-repository maintenance through explicit ownership, one source per artifact, meaningful CI and narrow shared tooling.

**Architecture:** Extend the existing shared .github repository. Preserve product-specific configuration. Use stable OpenTofu identities and a small catalog with defaults and exceptions.

**Tech Stack:** GitHub Actions, OpenTofu GitHub provider 6.12.1, Go, GoReleaser, Node.js.

**Spec:** ../specs/2026-11-03-repository-maintenance-design.md

## Global Constraints

- Use gpt-6-luna with high reasoning for each workstream implementer, as requested by the user. Implementers must not spawn subagents.
- Only work in assigned isolated worktrees; preserve unrelated checkouts and changes.
- Push review branches only after controller review; no merges, applies, publishing, repository deletion/archive, credential rotation or secret output.
- Keep existing shared credentials. No separate-credential operational burden.
- Share guidelines and provider releases only; keep other build workflows local.
- Contribution-only forks are frr-k8s, longhorn and longhorn-manager; retained deployment forks are dub, gatus, fider and terraform-provider-nexus.
- Redis source and publisher remain in standalone redis-http-proxy; preserve image name and runtime interface.
- Automerge security and routine patch/minor updates only with required meaningful CI; majors manual.
- Routine Renovate weekly; security Renovate daily; OSV daily. Preserve manual dry runs and repository-scoped App tokens.
- Preserve repository identities using explicit moved blocks; no remote state writes. OpenTofu, never Terraform CLI for infrastructure.
- Pin third-party actions to existing verified full SHAs; do not invent future versions or introduce universal workflow frameworks.

## Review Focus

- Removing contribution forks from managed file resources must not remove upstream files or leave org-owned scheduled callers running unintentionally; document review/apply order and deletions.
- Redis publisher removal must cover matrix, filters, documentation and validation tooling without breaking other images.
- Automerge must be blocked when required CI is absent or skipped; write gates and retain necessary application tests.
- Reusable release workflows must preserve caller repository context, tags, signing, local GoReleaser settings and least privilege; callers require shared workflow merge first.
- Catalog refactoring must preserve every old attribute and resource identity, including private/demo and fork exceptions; schedules must not depend on sorted index churn.

## Execution and branch map

Controller keeps worktrees, reports, ledger and diff packages in /private/tmp/m11s-maintenance-20261103. Save full task reports there. Each point gets a fresh Luna high implementer. Execute points 1, 2, 4, 3, 5, 6, 7, so provider workflow interfaces exist before CI policy consumes them. Within each repo, later points may stack on earlier reviewed branches; record exact base and head commits. No force pushes.

### Task 1: Ownership profiles and shared project guidelines

**Files:** infra/github: create repository-policies.tf, update renovate.tf, osv.tf and rollout documentation; shared .github: create README.md, docs/project-guidelines.md, CONTRIBUTING.md, SECURITY.md and a small PR template if useful.
**Interfaces:** Produce local.repository_policies keyed by exact repository name, with profile, renovate and osv flags. Preserve existing github_repository resource addresses for task 6. Use maintained, deployment-fork, contribution, distribution, infrastructure profiles. Policy does not infer maintenance from fork=true.
- [ ] Inspect current remote-default files and existing shared workflows before editing. Record baseline and branch bases.
- [ ] Encode all 25 repositories, exempt the three contribution forks from Renovate and OSV, and derive independent inventories from policy rather than deriving OSV from Renovate. Remove stale live-list entries in committed examples; ignored local tfvars must not be changed.
- [ ] Account for already-deployed fork callers: provide explicit rollout handling to remove only org-managed callers without changing inherited upstream CI. Do not execute remote deletions.
- [ ] Write concise practical guidelines covering ownership, local CI commands, tests, dependencies, release identity, secrets, documentation, fork exceptions and the shared workflow change process. Avoid promises of support/security response times and do not create an unsupported private vulnerability-reporting channel.
- [ ] Verify formatting and catalog membership/independent enrollment. Commit each repository separately, report exact checks, files and merge/apply prerequisites. Do not push.

### Task 2: One Redis proxy source and publisher

**Files:** docker-images/redis-http-proxy/** and references in .github/workflows/build.yaml, lint/validation scripts/docs; standalone redis-http-proxy source, README.md, Dockerfile, .github/workflows/build.yaml and meaningful Go tests where needed.
**Interfaces:** Standalone repo owns m11s/redis-http-proxy and current HTTP/env interface. docker-images no longer contains application source or a publisher for that image. Do not rename image or archive repos.
- [ ] Compare current remote versions and retain unique fixes, dependency pins and runtime behavior in standalone repo. Inspect every tracked reference before deletion.
- [ ] Add focused HTTP/encoding/auth behavior tests where missing; run tests. Avoid unrelated application rewrites.
- [ ] Remove duplicated source and all build/filter/matrix/catalog references in docker-images; keep a short pointer only if necessary for consumers.
- [ ] Ensure standalone PR CI tests/builds without secrets; publish only trusted events. Main pushes use commit tags; version tags are published from matching release tags rather than rewriting 0.1.0 on every push. Document latest semantics and preserve existing released tags.
- [ ] Verify Go tests/vet, relevant docker-images validation and actionlint; Docker build if available. Commit both repo branches, document merge order and consumer considerations; do not publish or push.

### Task 4: Shared provider release workflow

**Files:** shared .github/.github/workflows/provider-release.yml and documentation; terraform-provider-fider, terraform-provider-huggingface, terraform-provider-qbittorrent .github/workflows/release.yml.
**Interfaces:** Reusable tag-triggered release workflow consumes existing GPG_PRIVATE_KEY and GPG_PASSPHRASE explicitly, uses local go.mod and local GoReleaser config, and grants contents:write only for publishing. Caller uses shared main after workflow merge, or full SHA for a documented intentional pin. No shared Go CI/container workflow.
- [ ] Compare existing provider release workflows and preserve required fetch depth, signing, version configuration, local metadata and release behavior. Narrow inputs to actual variation.
- [ ] Implement one reusable provider release workflow using existing verified action pins, explicit secrets and persist-credentials:false where appropriate. Restrict releases to version tag contexts; no PR credentials. Document shared-main trust and protected shared workflow changes.
- [ ] Replace the three existing workflows with thin callers. Keep local GoReleaser files and acceptance tests unchanged unless a concrete compatibility fix is needed.
- [ ] Run actionlint on shared workflow and callers, local GoReleaser check when feasible. Document shared merge first, then caller merges; commit every repo separately and do not push.

### Task 3: Meaningful CI and gated dependency automerge

**Files:** shared .github/renovate-config.json, renovate-host.cjs and existing host tests/docs; infra/github branch-protection policy resources; local CI in terraform-provider-fider, wordninja-go, redis-http-proxy and any other maintained repository with demonstrated missing CI gates.
**Interfaces:** Consume Task 1 policy and Task 2 canonical Redis behavior. Retain local CI rather than add universal workflows. Enable security and routine patch/minor automerge only for explicitly enrolled repos with enforced required checks. Disable major automerge.
- [ ] Inventory maintained repo PR checks from current remote defaults. Use truthful explicit enrollment: no automerge for repositories with no meaningful required CI. Do not guess status-check contexts.
- [ ] Close demonstrated CI gaps: wordninja-go runs existing tests on PRs, Fider provider executes go test and has meaningful client tests, canonical Redis executes tests on PRs. Preserve existing stronger provider acceptance suites and useful check names.
- [ ] Add/manage required checks for enrolled maintained repositories with explicit appropriate exceptions for automation/distribution. Never require a nonexistent job or a check that does not execute on dependency PRs. Document applying protections after first successful checks.
- [ ] Enable shared patch/minor routine automerge, security automerge only through the same CI gate, and keep majors manual. Preserve cooldown, mode separation, explicit ignoreTests:false and safe settings for unenrolled repos. Test host/policy behavior including unprotected and contribution repos.
- [ ] Run changed application Go tests/vet, workflow lint, host tests and tofu validation. Commit per repo, record protected check names and merge/apply order; do not apply or push.

### Task 5: Read-only Actions baseline without new credentials

**Files:** infra/github/actions.tf, credential/deployment guidance; any maintained workflow genuinely relying on implicit write permissions.
**Interfaces:** Existing credential names, values and sharing remain unchanged. Default GITHUB_TOKEN permission becomes read, with explicit job-scoped publishing writes. No split signing keys or registry credential provisioning.
- [ ] Inspect existing workflow permission declarations and required publishing capabilities, including shared provider workflow from Task 4. Identify jobs affected by the default change.
- [ ] Set organization default workflow permissions to read. Add only necessary explicit job permissions to maintained workflows; do not restructure contribution-fork CI.
- [ ] Document existing shared credential trust, rotation responsibility, and short-lived App/OIDC patterns without claiming passwords were scoped or rotated. Keep secret material out of every report and diff.
- [ ] Verify actionlint and tofu format/validation. Commit separately per repo; explain any inherited upstream workflow limitations and safe rollout order. Do not apply or push.

### Task 6: Shared infrastructure defaults with explicit exceptions

**Files:** infra/github/repositories.tf, repository-policies.tf from Task 1, repository catalog/default locals, moved.tf, and all references to renamed repository resource addresses in *.tf.
**Interfaces:** One catalog drives all 25 existing repositories and independent policy sets. Use a single github_repository resource with for_each or a comparably thin module. Preserve every existing remote name, visibility, fork source, initialization semantics and nondefault setting. Keep downstream policy keys stable.
- [ ] Capture a machine-readable before inventory of all explicitly configured repository attributes and all github_repository references. Preserve it outside the git tree for review.
- [ ] Consolidate repeated visibility/security/wiki/project/merge settings into shared defaults with explicit exceptions. Unify policy metadata without duplicating the repository inventory. Keep private demo security block behavior unchanged.
- [ ] Add an explicit moved block for each existing resource address; update branch protections, secret resources, license files, outputs and workflow inventories. Refactor license repetition only if it reduces complexity and also preserves addresses.
- [ ] Verify all 25 before/after identities and effective configured attributes match, moved mapping is bijective, and no stale references remain. Run tofu fmt -check/validate and offline invariant verification. Do not claim zero destroys without an actual authenticated plan; no state/apply operations.
- [ ] Commit one task branch stacked on prior infra tasks; report reference/move counts and deployment validation still required. Do not push.

### Task 7: Weekly routine and daily security automation

**Files:** infra/github/files/renovate-caller.yml.tftpl, renovate.tf, osv.tf and examples/docs; shared .github/.github/workflows/renovate.yml, host tests, own Renovate caller and rollout docs; checked-out maintained caller files as needed for consistent reviewed deployment.
**Interfaces:** Weekly routine Renovate, daily security Renovate, daily OSV. Preserve per-repo App tokens, manual dry-run default and existing action/runtime pins. Contribution repos stay excluded via Task 1. Shared workflow must remain backward compatible for old callers during rollout.
- [ ] Split execution mode selection so daily runs execute security only and weekly runs execute routine only. Manual dispatch supports deliberate selected mode(s) with dry-run default. Do not run both matrix modes every day.
- [ ] Stagger schedules using a stable per-repository derivation rather than sorted-index positions. Ensure valid cron minutes and weekly day; keep OSV daily and stable when another repo is added.
- [ ] Update caller template, shared workflow interface, shared own caller, examples and operations docs consistently. Avoid coupling weekly behavior to mutable dispatch timestamps; derive scheduled mode from explicit schedule identity.
- [ ] Test both scheduled modes, manual dry runs, old caller compatibility, invalid selections, stable schedule derivation and contribution exclusion. Use existing host tests plus narrow new tests for behavior, actionlint, tofu format/validation.
- [ ] Commit per repo; document shared workflow merge before callers and infrastructure apply prerequisites. Do not apply or push.
