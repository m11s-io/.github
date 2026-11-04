# Terraform provider releases

`.github/workflows/provider-release.yml` shares the existing GoReleaser and GPG
signing steps. It checks out the calling repository, uses its `go.mod` and local
GoReleaser configuration, and runs only for pushed version tags beginning with
`v`. Provider-specific metadata, acceptance tests and release configuration stay
in the provider repository.

A caller must grant `contents: write` to the release job: a reusable workflow
cannot increase the caller's token permissions. Pass the existing signing
secrets explicitly:

```yaml
name: Release

on:
  push:
    tags: ['v*']

permissions:
  contents: read

jobs:
  release:
    permissions:
      contents: write
    uses: m11s-io/.github/.github/workflows/provider-release.yml@main
    secrets:
      GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
      GPG_PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}
```

The optional `runs_on`, `timeout_minutes`, and `goreleaser_version` inputs
preserve repository-specific runner, time budget and CLI-version choices. Their
defaults are `ubuntu-latest`, 360 minutes and the action's latest CLI version.

Callers following `main` receive shared workflow changes automatically. This
workflow is available for provider callers to adopt; adding it does not change
an existing standalone release workflow or publish a release.
