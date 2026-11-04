function resolveModes(mode, schedule, securityCron, routineCron) {
  if (mode === undefined || mode === '' || mode === 'both') {
    return ['routine', 'security'];
  }
  if (mode === 'scheduled') {
    if (!securityCron || !routineCron || securityCron === routineCron) {
      throw new Error('Scheduled Renovate crons must be configured and distinct');
    }
    if (schedule === securityCron) return ['security'];
    if (schedule === routineCron) return ['routine'];
    throw new Error(`Schedule ${schedule} is not a configured Renovate schedule`);
  }
  if (mode === 'routine' || mode === 'security') return [mode];
  throw new Error('Renovate mode must be routine, security, or both');
}

if (require.main === module) {
  try {
    const modes = resolveModes(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
    process.stdout.write(`matrix=${JSON.stringify(modes)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { resolveModes };
