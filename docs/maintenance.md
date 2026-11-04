# Daily maintenance workflow

The reusable `maintenance.yml` workflow combines the shared Renovate update and OSV dependency scan workflows. It is intended for the docker-images and gatus pilot callers. The two jobs run independently: an update failure does not prevent the dependency scan from running.

Callers provide the shared host configuration revision and Renovate private key. `live` defaults to false so Renovate runs in dry-run mode unless a caller explicitly enables writes. The OSV job uses the existing shared scan policy and uploads SARIF when supported.

This workflow does not change Renovate configuration, vulnerability policy, or any repository host configuration. The pilot callers schedule it once daily and retain manual dry-run dispatch. Wider adoption and pull request reconciliation remain deferred until the pilot is reviewed.
