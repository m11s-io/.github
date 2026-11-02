module.exports = {
  platform: 'github',
  repositories: ['m11s-io/docker-images'],
  onboarding: false,
  requireConfig: 'required',
  dryRun: 'full',
  repositoryCache: 'disabled',
  customEnvVariables: {
    UV_EXCLUDE_NEWER: '14 days',
  },
  force: {
    branchPrefix: 'renovate-pilot/',
    dependencyDashboard: false,
    automerge: false,
    vulnerabilityAlerts: { enabled: false },
  },
};
