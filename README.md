# m11s-io shared GitHub files

This repository contains organization-wide project guidance, reusable GitHub
Actions workflows, and shared configuration. Start with
[project guidelines](docs/project-guidelines.md) before changing a project or a
shared workflow.

Workflows are called by repositories in the organization. A change merged to
`main` can affect every caller that follows `main`; check the caller and rollout
requirements in the workflow's documentation before merging.

# Shared GitHub workflows

## Container image builder

Call `.github/workflows/container-image.yml@main` with `source-ref` set to the exact caller commit; `repository` and comma-separated `tags` are required. Context (`.`), Dockerfile (`Dockerfile`), platforms (`linux/amd64`), cache scope (`image`), cache mode (`max`), free-space (`false`), README (`README.md`), timeout (60 minutes), and push (`false`) have defaults. `description` and `node-version` default to empty. The reusable workflow checks out the exact ref with persisted credentials disabled, optionally sets up Node, then runs the fixed optional `.github/prepare-image.sh` hook before registry login. Supply `DOCKER_USER` and `DOCKER_PASS` to the calling job.

The `push` input is an additional request, not authorization. The reusable workflow computes one publishing guard and uses it for login, push, and repository overview updates. It allows a push or manual dispatch on the repository default branch only when `source-ref` equals `github.sha`; a successful same-repository default-branch `workflow_run` originating from a push only when `source-ref` equals that run's `head_sha`; and a published release only when `source-ref` equals `github.sha`. Pull-request workflow runs and `workflow_run` events originating from pull requests cannot publish. QEMU is configured when requested platforms include ARM.
