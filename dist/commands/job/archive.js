import { Command, Args } from '@oclif/core';
import { getJobs, saveJobs } from '../../lib/store.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess } from '../../lib/display.js';
export default class Archive extends Command {
    static description = 'Archive a job';
    static args = {
        job: Args.string({ description: 'ID of the job to archive', required: true })
    };
    async run() {
        const { args } = await this.parse(Archive);
        await syncPull();
        const jobs = await getJobs();
        const jobIndex = jobs.findIndex(j => j.id === args.job);
        if (jobIndex === -1) {
            this.error(`Job with ID "${args.job}" not found.`);
        }
        if (jobs[jobIndex].status === 'archived') {
            this.log(`Job "${args.job}" is already archived.`);
            return;
        }
        jobs[jobIndex].status = 'archived';
        await saveJobs(jobs);
        await syncPush(`Archive job: ${args.job}`);
        printSuccess(`Job "${jobs[jobIndex].name}" archived.`);
    }
}
