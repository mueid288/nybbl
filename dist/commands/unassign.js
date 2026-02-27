import { Command, Args } from '@oclif/core';
import { getAssignments, saveAssignments, getJobs } from '../lib/store.js';
import { syncPull, syncPush } from '../lib/sync.js';
import { printSuccess, printError } from '../lib/display.js';
export default class Unassign extends Command {
    static description = 'Remove a member from a job';
    static args = {
        handle: Args.string({ description: 'Member handle', required: true }),
        job: Args.string({ description: 'Job ID', required: true })
    };
    async run() {
        const { args } = await this.parse(Unassign);
        const handle = args.handle.startsWith('@') ? args.handle : '@' + args.handle;
        await syncPull();
        let assignments = await getAssignments();
        const assignmentIndex = assignments.findIndex(a => a.member === handle && a.job === args.job);
        if (assignmentIndex === -1) {
            printError(`Member "${handle}" is not assigned to job "${args.job}".`);
            this.exit(1);
        }
        const jobs = await getJobs();
        const job = jobs.find(j => j.id === args.job);
        const jobName = job ? job.name : args.job;
        assignments = assignments.filter((_, i) => i !== assignmentIndex);
        await saveAssignments(assignments);
        await syncPush(`Unassign ${handle} from job ${args.job}`);
        printSuccess(`${handle} removed from "${jobName}"`);
    }
}
