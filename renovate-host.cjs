const mode = process.env.M11S_RENOVATE_MODE;
const repository = process.env.M11S_RENOVATE_REPOSITORY;
const dryRun = process.env.M11S_RENOVATE_DRY_RUN;
if (!['routine', 'security'].includes(mode)) throw new Error('Set M11S_RENOVATE_MODE to routine or security');
if (!/^m11s-io\/[A-Za-z0-9_.-]+$/.test(repository || '')) throw new Error('An explicit m11s-io repository is required');
if (!['true', 'false'].includes(dryRun)) throw new Error('Set M11S_RENOVATE_DRY_RUN explicitly');
const security = mode === 'security';
// Keep this list aligned with infra/github's repositories that have enforced,
// meaningful PR checks. Other repositories can still receive Renovate PRs.
const automergeRepositories = new Set([
  'm11s-io/docker-images',
  'm11s-io/domain-connect-terraform-agent',
  'm11s-io/jina-proxy',
  'm11s-io/helm-charts',
  'm11s-io/redis-http-proxy',
  'm11s-io/symspell-go',
  'm11s-io/t9s',
  'm11s-io/terraform-provider-fider',
  'm11s-io/terraform-provider-huggingface',
  'm11s-io/terraform-provider-qbittorrent',
  'm11s-io/wordninja-go',
]);
const automerge = automergeRepositories.has(repository);
module.exports = {
  platform: 'github',
  repositories: [repository],
  extends: [
    'github>m11s-io/.github:renovate-config',
    ...(security ? ['security:only-security-updates'] : []),
  ],
  onboarding: false,
  requireConfig: 'optional',
  dryRun: dryRun === 'true' ? 'full' : null,
  repositoryCache: 'disabled',
  // Vulnerability alerts may opt normal dependencies back in after the preset.
  // Routine auto-merge is explicitly restricted to repositories with required CI.
  packageRules: [
    ...(security ? [{ matchPackageNames: ['*'], force: { enabled: false } }] : []),
    ...(automerge ? [{
      description: 'Auto-merge patch and minor updates only with required repository checks',
      matchUpdateTypes: ['patch', 'minor'],
      automerge: true,
      automergeType: 'pr',
      platformAutomerge: false,
      ignoreTests: false,
    }] : []),
    {
      description: 'Keep major updates manual even if a repository rule enables automerge',
      matchUpdateTypes: ['major'],
      force: { automerge: false },
    },
  ],
  customEnvVariables: { UV_EXCLUDE_NEWER: security ? 'false' : '14 days' },
  force: {
    // Existing repository package rules cannot enable automerge outside the
    // explicit protected-repository enrollment set.
    ...(!automerge ? { automerge: false } : {}),
    branchPrefix: security ? 'renovate-security/' : 'renovate-selfhosted/',
    dependencyDashboard: false,
    pruneStaleBranches: false,
    osvVulnerabilityAlerts: security,
    ...(security ? { lockFileMaintenance: { enabled: false } } : {}),
    vulnerabilityAlerts: {
      enabled: security,
      minimumReleaseAge: '0 days',
      prCreation: 'immediate',
      platformAutomerge: false,
      ignoreTests: false,
    },
  },
};
