# Terraform provider releases

The Fider, Hugging Face, and qBittorrent provider repositories call
`.github/workflows/provider-release.yml` from `m11s-io/.github`. The reusable
workflow checks out the calling repository (so its `go.mod`, `.goreleaser.yml`,
metadata, and acceptance-test files remain authoritative), fetches full history
for changelog generation, imports the caller's existing GPG signing secrets,
and runs GoReleaser for version tags.

The workflow grants `contents: write` only for its publishing job. The caller
must also grant `contents: write`, because a reusable workflow cannot elevate
the caller's token. Callers should remain tag-triggered (`v*`) and pass only the
existing `GPG_PRIVATE_KEY` and `GPG_PASSPHRASE` secrets. The shared workflow
checks that the invocation comes from a pushed `v` tag before running any
steps, so a non-tag call does not receive a release job or signing operation.

Callers follow `m11s-io/.github/.github/workflows/provider-release.yml@main`.
This trusts changes merged to shared `main`; protect that branch and review
workflow changes with the same care as changes to provider release code. If a
caller needs a deliberate immutable workflow revision, replace `@main` with a
reviewed full commit SHA and document the pin and update owner in that caller.

Roll out in this order:

1. Merge this workflow and documentation to shared `main`.
2. Merge each provider caller update after the shared workflow is available.
3. Confirm repository secrets remain configured before the next tagged release.

The callers preserve their existing runner, timeout, and GoReleaser version
choices through the narrow `runs_on`, `timeout_minutes`, and
`goreleaser_version` inputs. An empty GoReleaser version retains the action's
existing default. Keep provider-specific GoReleaser configuration, metadata,
signing behavior, and acceptance tests in each provider repository.
