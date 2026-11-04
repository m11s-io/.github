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

Call `.github/workflows/container-image.yml@main` with `source-ref` set to the exact caller commit. The reusable workflow checks out that ref with persisted credentials disabled, runs the fixed optional `.github/prepare-image.sh` hook before registry login, and accepts explicit `context`, `dockerfile`, `repository`, comma-separated `tags`, `platforms`, `cache-scope`, `cache-mode`, `free-space`, `description`, `readme-file`, and `push` inputs. Supply `DOCKER_USER` and `DOCKER_PASS` only to the job that calls it.

The `push` input is an additional request, not authorization. The reusable workflow only logs in, pushes, and updates the repository overview when the caller event is a push or manual dispatch on `refs/heads/main`; pull requests and manual runs on other refs can only build without publishing. A preparation script that needs Node should install or set up the version it needs itself.
