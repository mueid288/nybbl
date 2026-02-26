import { Command } from '@oclif/core';
import { readIdentity } from '../lib/identity.js';
import { getAssignments, getJobs } from '../lib/store.js';
import { syncPull } from '../lib/sync.js';
import { createTable } from '../lib/display.js';

export default class Whoami extends Command {
    static description = 'Show your assigned jobs and active timers';

    async run() {
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured. Run "nybbl" setup first.');
        }

        await syncPull();

        const assignments = await getAssignments();
        const jobs = await getJobs();

        const myAssignments = assignments.filter(a => a.member === identity.handle);
        const activeJobs = myAssignments
            .map(a => ({ assignment: a, job: jobs.find(j => j.id === a.job) }))
            .filter(item => item.job && item.job.status === 'active');

        this.log(`\n  👤 ${identity.handle} — ${identity.name}\n`);
        this.log('  Active Jobs:');

        if (activeJobs.length === 0) {
            this.log('  No active jobs assigned to you.\n');
            return;
        }

        const table = createTable(['Job', 'Role', 'Since']);
        for (const item of activeJobs) {
            const role = item.job!.owner === identity.handle ? 'Owner' : 'Member';
            const assignedDate = new Date(item.assignment.assignedAt).toLocaleDateString();
            table.push([
                `💼 ${item.job!.name}`,
                role,
                assignedDate
            ]);
        }

        this.log(table.toString());
        this.log('');
    }
}
