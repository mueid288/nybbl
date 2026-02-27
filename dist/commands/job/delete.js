import { Command, Args } from '@oclif/core';
import { confirm } from '@inquirer/prompts';
import { getJobs, saveJobs, getAssignments, saveAssignments } from '../../lib/store.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess } from '../../lib/display.js';
export default class Delete extends Command {
    static description = 'Delete a job';
    static args = {
        job: Args.string({ description: 'ID of the job to delete', required: true })
    };
    async run() {
        const { args } = await this.parse(Delete);
        await syncPull();
        let jobs = await getJobs();
        const jobIndex = jobs.findIndex(j => j.id === args.job);
        if (jobIndex === -1) {
            this.error(`Job with ID "${args.job}" not found.`);
        }
        const job = jobs[jobIndex];
        const answer = await confirm({
            message: `Are you sure you want to delete the job "${job.name}" (${job.id})? This will also remove all assignments. Timelogs will not be deleted but will point to an orphan job.`,
            default: false
        });
        if (!answer) {
            this.log('Delete cancelled.');
            return;
        }
        jobs = jobs.filter(j => j.id !== args.job);
        await saveJobs(jobs);
        let assignments = await getAssignments();
        assignments = assignments.filter(a => a.job !== args.job);
        await saveAssignments(assignments);
        await syncPush(`Delete job: ${args.job}`);
        printSuccess(`Job "${job.name}" deleted.`);
    }
}
