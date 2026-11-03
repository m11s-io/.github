# m11s-io shared GitHub files

This repository contains organization-wide project guidance, reusable GitHub
Actions workflows, and shared configuration. Start with
[project guidelines](docs/project-guidelines.md) before changing a project or a
shared workflow.

Workflows are called by repositories in the organization. A change merged to
`main` can affect every caller that follows `main`; check the caller and rollout
requirements in the workflow's documentation before merging.

See [provider release workflows](docs/provider-releases.md) for the shared
Terraform provider release workflow and its rollout order.
