import { Command } from '@oclif/core';
import { getMembers, getUpdates, getAllTimelogs } from '../lib/store.js';
import { syncPull } from '../lib/sync.js';
import chalk from 'chalk';

export default class Vibes extends Command {
    static description = 'Team vibe check (who\'s busy, who\'s free)';

    async run() {
        await syncPull();

        const members = await getMembers();
        const today = new Date().toISOString().split('T')[0];
        const todayUpdates = await getUpdates(today);

        const allLogs = await getAllTimelogs();
        const todayLogs = allLogs.filter(l => l.date === today);

        this.log('\n  🌊 Team Vibes\n');

        for (const member of members) {
            const logs = todayLogs.filter(l => l.member === member.handle);
            const updates = todayUpdates.filter(u => u.member === member.handle);

            const mins = logs.reduce((a, b) => a + b.duration, 0);
            const hasBlockers = updates.some(u => !!u.blocker);

            let vibe = '';
            if (hasBlockers) vibe = chalk.red('🚨 Blocked');
            else if (mins > 480) vibe = chalk.magenta('🔥 On fire (8h+)');
            else if (mins > 0) vibe = chalk.green('💻 Busy coding');
            else vibe = chalk.gray('🏖️  Chilling (or forgot to log)');

            this.log(`  ${chalk.cyan(member.handle.padEnd(10))} | ${vibe}`);
        }
        this.log('');
    }
}
