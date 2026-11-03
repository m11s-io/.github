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
    for (const [repository, enrolled] of [
      ['m11s-io/docker-images', true],
      ['m11s-io/domain-connect-terraform-agent', true],
      ['m11s-io/jina-proxy', true],
      ['m11s-io/helm-charts', true],
      ['m11s-io/redis-http-proxy', true],
      ['m11s-io/symspell-go', true],
      ['m11s-io/t9s', true],
      ['m11s-io/terraform-provider-fider', true],
      ['m11s-io/terraform-provider-huggingface', true],
      ['m11s-io/terraform-provider-qbittorrent', true],
      ['m11s-io/wordninja-go', true],
      ['m11s-io/.github', false],
      ['m11s-io/frr-k8s', false],
      ['m11s-io/longhorn', false],
    ]) {
      const c = load(mode, repository, dryRun);
      assert.deepEqual(c.repositories, [repository]);
      assert.equal(c.dryRun, dryRun === 'true' ? 'full' : null);
      assert.equal(c.customEnvVariables.UV_EXCLUDE_NEWER, mode === 'security' ? 'false' : '14 days');
      assert.equal(c.force.vulnerabilityAlerts.enabled, mode === 'security');
      assert.equal(Object.hasOwn(c.force.vulnerabilityAlerts, 'automerge'), false);
      assert.equal(c.force.automerge, enrolled ? undefined : false);
      assert.equal(c.force.vulnerabilityAlerts.ignoreTests, false);
      assert(c.packageRules.some(rule =>
        rule.matchUpdateTypes?.includes('major') && rule.force?.automerge === false
      ));
      if (mode === 'security') {
        assert(c.extends.includes('security:only-security-updates'));
        assert.equal(c.packageRules[0].force.enabled, false);
        assert.equal(c.force.lockFileMaintenance.enabled, false);
        assert.equal(c.packageRules.filter(rule => rule.automerge === true).length, enrolled ? 1 : 0);
      } else {
        assert(!c.extends.includes('security:only-security-updates'));
        assert.equal(c.packageRules.length, enrolled ? 2 : 1);
        if (enrolled) {
          const patchMinor = c.packageRules.find(rule => rule.automerge === true);
          assert.deepEqual(patchMinor.matchUpdateTypes, ['patch', 'minor']);
          assert.equal(patchMinor.ignoreTests, false);
          assert(!patchMinor.matchUpdateTypes.includes('major'));
        }
      }
    }
  }
}
assert.notEqual(load('routine', 'm11s-io/.github', 'true').force.branchPrefix,
                load('security', 'm11s-io/.github', 'true').force.branchPrefix);
assert.throws(() => load('security', 'another-org/repo', 'false'));
assert.throws(() => load('typo', 'm11s-io/repo', 'false'));
assert.throws(() => load('routine', 'm11s-io/repo', ''));

console.log('Routine/security modes, CI enrollment and dry-run defaults passed');
