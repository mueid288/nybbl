import { Command } from '@oclif/core';
import { getTimelogs, getJobs } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull } from '../../lib/sync.js';
import { createTable } from '../../lib/display.js';
import { formatDuration } from '../../lib/duration.js';
import chalk from 'chalk';

export default class Log extends Command {
    static description = 'View your time log';

    async run() {
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        await syncPull();

        const logs = await getTimelogs(identity.handle);
        const jobs = await getJobs();

        if (logs.length === 0) {
            this.log('No time logged yet.');
            return;
        }

        // Sort logs descending by date/time
        logs.sort((a, b) => b.id.localeCompare(a.id));

        this.log(`\n  ⏱️ Time Log for ${identity.handle}\n`);

        const table = createTable(['Date', 'Time', 'Job', 'Duration', 'Note']);

        for (const log of logs.slice(0, 20)) { // Show last 20 entries
            const job = jobs.find(j => j.id === log.job);
            const jobName = job ? job.name : log.job;

            table.push([
                log.date,
                `${log.startTime} - ${log.endTime}`,
                chalk.cyan(jobName),
                formatDuration(log.duration),
                log.note || chalk.gray('(no note)')
            ]);
        }

        this.log(table.toString());
        this.log(chalk.gray(`\n  Showing last ${Math.min(20, logs.length)} entries.\n`));
    }
}
