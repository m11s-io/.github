# Project guidelines

## Ownership and repository profiles

`infra/github/repository-policies.tf` records the intended profile and each
repository's independent Renovate and OSV enrollment. A fork is not necessarily
a contribution-only fork: deployment forks such as `dub`, `fider`, `gatus`, and
`terraform-provider-nexus` remain maintained by m11s-io. The contribution
profile currently covers `frr-k8s`, `longhorn`, and `longhorn-manager`; avoid
changing their upstream files or automation. Distribution repositories publish
shared packages, images, charts, or workflows. Infrastructure repositories
hold deployment and operator configuration. Maintained repositories are
projects owned and developed by m11s-io.

Keep the policy explicit when repository ownership or automation changes. Update
both the repository policy and its rollout notes. Renovate and OSV enrollment
are separate choices; do not derive one from the other or from `fork` status.

## Changes, tests, and dependencies

Read the repository's README, contribution notes, and CI workflows before
editing. Use its documented local format, lint, build, and test commands; when
no local command is documented, inspect the CI workflow and run the relevant
job commands where practical. Report commands that could not be run and why.
Keep tests that protect user-visible behavior and add coverage when changing
behavior or interfaces.

Keep dependencies focused and use the project's lockfile and supported runtime.
Review transitive and development dependencies as part of the change. Generated
files should be updated only through the documented generator where practical.

## Releases and identity

Follow the repository's existing release process. Preserve module, package,
container, and registry names when changing repository names or build setup.
Use the project's established release tags and signing configuration; do not
publish from a personal account or introduce a new release identity without
reviewing its impact on consumers.

## Secrets and permissions

Never commit credentials, private keys, access tokens, or real secret values.
Use organization-managed Actions secrets and variables already documented for
the workflow. Keep token permissions and repository scope to the minimum needed,
and do not pass secrets to untrusted pull request code. Describe any new
credential or permission requirement in the change and its rollout notes.

## Documentation

Update user-facing documentation when behavior, configuration, prerequisites,
or release steps change. Keep examples aligned with supported defaults and
avoid placing machine-specific values or credentials in committed examples.

## Shared workflow changes

Before changing a reusable workflow, identify all callers and review their
inputs, permissions, secrets, and default-branch behavior. Keep third-party
Actions pinned to verified full commit SHAs with release comments. Validate the
workflow and representative callers locally, then document required caller
changes and rollout order. Merge shared workflow changes before caller changes
that depend on them. A caller following `main` adopts shared changes as soon as
they merge, so consider compatibility and rollback in the review.
