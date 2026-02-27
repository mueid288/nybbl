import { Command, Args } from '@oclif/core';
import { getJobs, getAssignments, getAllTimelogs } from '../../lib/store.js';
import { syncPull } from '../../lib/sync.js';
import { printBox, createTable } from '../../lib/display.js';
import chalk from 'chalk';
export default class Info extends Command {
    static description = 'Detailed view of a job';
    static args = {
        job: Args.string({ description: 'ID of the job', required: true })
    };
    async run() {
        const { args } = await this.parse(Info);
        await syncPull();
        const jobs = await getJobs();
        const job = jobs.find(j => j.id === args.job);
        if (!job) {
            this.error(`Job with ID "${args.job}" not found.`);
        }
        const assignments = await getAssignments();
        const jobAssignments = assignments.filter(a => a.job === job.id);
        const allLogs = await getAllTimelogs();
        const jobLogs = allLogs.filter(l => l.job === job.id);
        const totalMinutes = jobLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        printBox(`💼 ${job.name} (${job.id})`, `Client: ${job.client}\n` +
            `Status: ${job.status}\n` +
            `Owner:  ${job.owner}\n` +
            `Tags:   ${job.tags.join(', ') || 'N/A'}\n\n` +
            `Description: ${job.description || 'N/A'}\n\n` +
            `Total Time Logged: ${hours}h ${mins}m`);
        this.log(chalk.bold('Assigned Members:'));
        if (jobAssignments.length === 0) {
            this.log('  None\n');
        }
        else {
            const table = createTable(['Member', 'Role', 'Assigned Since']);
            for (const a of jobAssignments) {
                table.push([
                    a.member,
                    a.member === job.owner ? 'Owner' : 'Member',
                    new Date(a.assignedAt).toLocaleDateString()
                ]);
            }
            this.log(table.toString());
            this.log('');
        }
    }
}
