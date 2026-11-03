# Public repository maintenance design

## Intent and authorization
Implement the architectural audit as seven separately reviewable workstreams. The user approved contribution-only forks, a standalone Redis proxy, CI-gated security and routine automerge, guidelines and shared provider release workflows, existing shared credentials, shared infrastructure defaults with exceptions, weekly routine updates and daily security/OSV scans. The user requested one Luna high implementer per point, review, and branch pushes. No further design approval is required by this document: it records those explicit decisions.

## Approach
Use the existing m11s-io/.github repository for human-facing guidelines, inherited community files, dependency policy and narrow provider release workflows. Keep product source, acceptance tests, Dockerfiles and GoReleaser settings local. Use one small infrastructure catalog with profiles and exceptions, preserving remote repository identities. Preserve current check names unless a caller is intentionally migrated.

Alternatives considered: universal shared build workflows were rejected by the user in favor of guidelines and provider releases only; separate publishing credentials were rejected because they add operational burden; keeping duplicate Redis sources was rejected in favor of the standalone repository.

## Boundaries
Contribution-only: frr-k8s, longhorn, longhorn-manager. Preserve upstream structure, secret scanning and push protection; opt out of Renovate/OSV ownership and publishing credentials. Maintained forks: dub, gatus, fider, terraform-provider-nexus. Other maintained public repositories retain appropriate maintenance; homebrew-tap is distribution-only and .github is shared infrastructure. demo-repository remains private.

redis-http-proxy is canonical for source, tests, documentation and m11s/redis-http-proxy publishing. Remove its duplicate source and build target from docker-images. Do not archive or delete repositories. Preserve public image name and runtime interface. Avoid overwriting release tags on every main push.

Automerge covers security fixes and routine patch/minor updates only after meaningful required CI. Major upgrades remain manual (controller default stated to user). No blanket merge permission without a required check. Prefer modest meaningful tests over mirrored configuration tests. Do not replace project-specific acceptance suites with shared generic tests.

Actions default to read-only with explicit publishing-job permissions. Keep existing shared Docker and signing credentials and existing variable interfaces; do not rotate, expose, split or provision credentials. A documentation change cannot claim to narrow the actual existing token scope.

Routine Renovate runs weekly, security Renovate daily, OSV daily. Preserve repository-scoped runtime tokens, manual dry-run behavior, cooldown and pinned third-party dependencies. A mode must run only at its intended cadence; merely reducing the outer schedule while still running both modes daily is insufficient.

## Deployment
Prepare and push review branches only. Do not apply OpenTofu, merge branches, create releases, publish packages/images, archive repositories, or write messages to others. Cross-repository changes list merge order and prerequisites. Work on fresh remote defaults in isolated worktrees, preserving existing local branches and uncommitted work. Multi-point changes in the same repository use explicit stacked branches, documented as such.

## Validation
Use actionlint for changed workflows; Go test/vet for affected applications; existing host configuration tests and focused scheduling tests; OpenTofu formatting/validation and an offline inventory-equivalence check for state refactoring. Never claim a no-destroy plan without a real authenticated plan; document that limit. Capture exact checks and failures in reports. Before pushing, review full diffs and verify commits. Remote CI can be inspected after push without triggering releases.
