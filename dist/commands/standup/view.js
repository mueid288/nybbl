import { Command } from '@oclif/core';
import { getJobs, getUpdates } from '../../lib/store.js';
import { syncPull } from '../../lib/sync.js';
import chalk from 'chalk';
import { colorMember } from '../../lib/display.js';
export default class StandupView extends Command {
    static description = "View today's standups from the whole team";
    async run() {
        await syncPull();
        const todayStr = new Date().toISOString().split('T')[0];
        const updates = await getUpdates(todayStr);
        const jobs = await getJobs();
        // Filter only standup-style updates (start with 📋 Yesterday:)
        const standups = updates.filter(u => u.message.startsWith('📋 Yesterday:'));
        this.log('');
        this.log(`  ${chalk.bold.hex('#06d6a0')('📜 Today\'s Standups')} ${chalk.gray('— ' + new Date().toLocaleDateString())}`);
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        if (standups.length === 0) {
            this.log(chalk.gray('\n  No standups logged yet today.\n'));
            return;
        }
        for (const s of standups) {
            const job = jobs.find(j => j.id === s.job);
            const jobName = job?.name || s.job;
            this.log('');
            this.log(`  ${colorMember(s.member)} ${chalk.gray(`(${jobName})`)}`);
            // Parse the standup message lines
            const lines = s.message.split('\n');
            for (const line of lines) {
                if (line.startsWith('📋 Yesterday:')) {
                    this.log(`    ${chalk.hex('#f4a261')('📋 Yesterday:')} ${line.replace('📋 Yesterday: ', '')}`);
                }
                else if (line.startsWith('🎯 Today:')) {
                    this.log(`    ${chalk.hex('#06d6a0')('🎯 Today:')}     ${line.replace('🎯 Today: ', '')}`);
                }
                else if (line.startsWith('🚧 Blocker:')) {
                    this.log(`    ${chalk.hex('#e63946')('🚧 Blocker:')}   ${line.replace('🚧 Blocker: ', '')}`);
                }
            }
        }
        this.log('');
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        this.log(chalk.gray(`  ${standups.length} standup${standups.length !== 1 ? 's' : ''} logged today`));
        this.log('');
    }
}
