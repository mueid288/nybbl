import { Command, Flags } from '@oclif/core';
import { getJobs, getAssignments, getAllTimelogs } from '../../lib/store.js';
import { syncPull } from '../../lib/sync.js';
import { createTable } from '../../lib/display.js';
export default class List extends Command {
    static description = 'List all jobs';
    static flags = {
        all: Flags.boolean({ char: 'a', description: 'Show archived jobs too' })
    };
    async run() {
        const { flags } = await this.parse(List);
        await syncPull();
        let jobs = await getJobs();
        const assignments = await getAssignments();
        const allLogs = await getAllTimelogs();
        if (!flags.all) {
            jobs = jobs.filter(j => j.status === 'active');
        }
        if (jobs.length === 0) {
            this.log('No jobs found.');
            return;
        }
        this.log('\n  📋 Job List\n');
        const table = createTable(['Job', 'Client', 'Status', 'Members', 'Total Hours']);
        for (const job of jobs) {
            const memberCount = assignments.filter(a => a.job === job.id).length;
            const jobLogs = allLogs.filter(l => l.job === job.id);
            const totalMinutes = jobLogs.reduce((acc, l) => acc + (l.duration || 0), 0);
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            const timeStr = `${hours}h ${mins}m`;
            table.push([
                job.name,
                job.client,
                job.status,
                memberCount.toString(),
                timeStr
            ]);
        }
        this.log(table.toString());
        this.log('');
    }
}
