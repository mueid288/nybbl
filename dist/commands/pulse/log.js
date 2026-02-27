import { Command, Flags } from '@oclif/core';
import { getUpdates, getJobs, getMembers } from '../../lib/store.js';
import { syncPull } from '../../lib/sync.js';
import { createTable } from '../../lib/display.js';
import chalk from 'chalk';
export default class Log extends Command {
    static description = 'View recent updates (team-wide)';
    static flags = {
        date: Flags.string({ char: 'd', description: 'Specific date (YYYY-MM-DD)', default: new Date().toISOString().split('T')[0] })
    };
    async run() {
        const { flags } = await this.parse(Log);
        const targetDate = flags.date;
        await syncPull();
        const updates = await getUpdates(targetDate);
        if (updates.length === 0) {
            this.log(`\n  No updates logged on ${targetDate}.\n`);
            return;
        }
        const jobs = await getJobs();
        const members = await getMembers();
        this.log(`\n  💬 Daily Pulse — ${targetDate}\n`);
        const table = createTable(['Member', 'Job', 'Update', 'Blockers', 'Time']);
        // Sort chronologically
        updates.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        for (const update of updates) {
            const job = jobs.find(j => j.id === update.job);
            const member = members.find(m => m.handle === update.member);
            const timeStr = new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            table.push([
                chalk.cyan(update.member),
                chalk.bold(job ? job.name : update.job),
                update.message,
                update.blocker ? chalk.red(update.blocker) : chalk.gray('None'),
                timeStr
            ]);
        }
        this.log(table.toString());
        this.log('');
    }
}
