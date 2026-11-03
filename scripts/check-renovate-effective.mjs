import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// This runs inside the pinned Renovate image so it exercises Renovate's own
// package-rule matcher and mergeChildConfig force precedence.
const require = createRequire(import.meta.url);
const { applyPackageRules } = await import(
  '/usr/local/renovate/dist/util/package-rules/index.js'
);
const { mergeChildConfig } = await import('/usr/local/renovate/dist/config/utils.js');
const hostPath = '/config/renovate-host.cjs';

function load(mode, repository) {
  process.env.M11S_RENOVATE_MODE = mode;
  process.env.M11S_RENOVATE_REPOSITORY = repository;
  process.env.M11S_RENOVATE_DRY_RUN = 'true';
  delete require.cache[hostPath];
  return require(hostPath);
}

async function effectiveAutomerge(mode, repository, updateType, {
  repoAutomerge,
  repoRules = [],
  vulnerabilityAlert = false,
} = {}) {
  const host = load(mode, repository);
  const packageRules = [...repoRules];
  if (vulnerabilityAlert) {
    // This is the same alert rule shape Renovate 44.200.0 appends from the
    // merged vulnerabilityAlerts config in workers/repository/init/vulnerability.
    packageRules.push({
      isVulnerabilityAlert: true,
      force: { ...host.force.vulnerabilityAlerts },
    });
  }
  const update = mergeChildConfig(host, {
    depName: 'example/library',
    packageFile: 'charts/example/Chart.yaml',
    updateType,
    isMajor: updateType === 'major',
    isMinor: updateType === 'minor',
    isPatch: updateType === 'patch',
    isVulnerabilityAlert: vulnerabilityAlert,
    automerge: repoAutomerge,
    packageRules,
  });
  return (await applyPackageRules(update, 'update-type-merge')).automerge === true;
}

for (const mode of ['routine', 'security']) {
  for (const updateType of ['patch', 'minor']) {
    assert.equal(
      await effectiveAutomerge(mode, 'm11s-io/terraform-provider-fider', updateType, {
        vulnerabilityAlert: mode === 'security',
      }),
      true,
      `${mode} ${updateType} should use the protected repository's passing checks`,
    );
  }
  assert.equal(
    await effectiveAutomerge(mode, 'm11s-io/terraform-provider-fider', 'major', {
      repoAutomerge: true,
      vulnerabilityAlert: mode === 'security',
    }),
    false,
    `${mode} major update remains manual despite inherited automerge`,
  );
  assert.equal(
    await effectiveAutomerge(mode, 'm11s-io/terraform-provider-fider', 'major', {
      repoRules: [{ matchUpdateTypes: ['major'], automerge: true }],
      vulnerabilityAlert: mode === 'security',
    }),
    false,
    `${mode} major update remains manual despite a repository major rule`,
  );
}

for (const mode of ['routine', 'security']) {
  assert.equal(
    await effectiveAutomerge(mode, 'm11s-io/longhorn', 'patch', {
      repoAutomerge: true,
      vulnerabilityAlert: mode === 'security',
    }),
    false,
    `${mode} unenrolled contribution repository stays manual with repo-local automerge`,
  );
}
assert.equal(
  await effectiveAutomerge('routine', 'm11s-io/helm-charts', 'patch', {
    repoRules: [{ matchFileNames: ['charts/**'], automerge: false }],
  }),
  false,
  'an enrolled repository package exclusion stays manual',
);

console.log('Pinned Renovate merge/apply helpers confirm patch/minor gates, manual majors, unenrolled repositories, and package exclusions');
