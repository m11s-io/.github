const assert = require('node:assert/strict');
const file = require.resolve('../renovate-host.cjs');
function load(mode, repository, dryRun) {
  process.env.M11S_RENOVATE_MODE = mode;
  process.env.M11S_RENOVATE_REPOSITORY = repository;
  process.env.M11S_RENOVATE_DRY_RUN = dryRun;
  delete require.cache[file];
  return require(file);
}
for (const mode of ['routine', 'security']) {
  for (const dryRun of ['true', 'false']) {
    const c = load(mode, 'm11s-io/docker-images', dryRun);
    assert.deepEqual(c.repositories, ['m11s-io/docker-images']);
    assert.equal(c.dryRun, dryRun === 'true' ? 'full' : null);
    assert.equal(c.customEnvVariables.UV_EXCLUDE_NEWER, mode === 'security' ? 'false' : '14 days');
    assert.equal(c.force.vulnerabilityAlerts.enabled, mode === 'security');
    assert.equal(c.force.vulnerabilityAlerts.ignoreTests, false);
    if (mode === 'security') {
      assert(c.extends.includes('security:only-security-updates'));
      assert.equal(c.packageRules[0].force.enabled, false);
      assert.equal(c.force.lockFileMaintenance.enabled, false);
    } else {
      assert(!c.extends.includes('security:only-security-updates'));
    }
  }
}
assert.notEqual(load('routine', 'm11s-io/.github', 'true').force.branchPrefix,
                load('security', 'm11s-io/.github', 'true').force.branchPrefix);
assert.throws(() => load('security', 'another-org/repo', 'false'));
assert.throws(() => load('typo', 'm11s-io/repo', 'false'));
assert.throws(() => load('routine', 'm11s-io/repo', ''));
console.log('Both execution modes, repository isolation and dry-run defaults passed');
