# Daily maintenance

Each maintained repository has one daily Maintenance schedule, with independent Renovate and OSV jobs. Pull request and default-branch dependency scans remain separate event triggers. A scan failure does not prevent remediation.

The shared workflow follows main. Renovate retains two internal passes because routine uv resolutions use a 14-day cutoff while security fixes must bypass it. There is no weekly/daily cron router. Manual update runs default to dry-run; ordinary CI still decides whether an update is acceptable.

Repository discovery in infra/github excludes archived/private repositories and the maintenance-disabled topic. Contribution-only forks use that topic; maintained forks retain maintenance. Existing registry destinations, product acceptance tests and publishing workflows remain local.
