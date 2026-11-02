const mode = process.env.M11S_RENOVATE_MODE;
const repository = process.env.M11S_RENOVATE_REPOSITORY;
const dryRun = process.env.M11S_RENOVATE_DRY_RUN;
if (!['routine', 'security'].includes(mode)) throw new Error('Set M11S_RENOVATE_MODE to routine or security');
if (!/^m11s-io\/[A-Za-z0-9_.-]+$/.test(repository || '')) throw new Error('An explicit m11s-io repository is required');
if (!['true', 'false'].includes(dryRun)) throw new Error('Set M11S_RENOVATE_DRY_RUN explicitly');
const security = mode === 'security';
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
  customEnvVariables: { UV_EXCLUDE_NEWER: security ? 'false' : '14 days' },
  force: {
    branchPrefix: security ? 'renovate-security/' : 'renovate-selfhosted/',
    dependencyDashboard: false,
    pruneStaleBranches: false,
    osvVulnerabilityAlerts: security,
    ...(security ? { lockFileMaintenance: { enabled: false } } : {}),
    vulnerabilityAlerts: {
      enabled: security,
      minimumReleaseAge: '0 days',
      prCreation: 'immediate',
      automerge: true,
      platformAutomerge: false,
      ignoreTests: false,
    },
  },
};
