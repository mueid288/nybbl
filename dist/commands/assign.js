import { Command, Args } from '@oclif/core';
import { getAssignments, saveAssignments, getMembers, getJobs } from '../lib/store.js';
import { readIdentity } from '../lib/identity.js';
import { syncPull, syncPush } from '../lib/sync.js';
import { printSuccess, printError } from '../lib/display.js';
export default class Assign extends Command {
    static description = 'Assign a member to a job';
    static args = {
        handle: Args.string({ description: 'Member handle', required: true }),
        job: Args.string({ description: 'Job ID', required: true })
    };
    async run() {
        const { args } = await this.parse(Assign);
        const handle = args.handle.startsWith('@') ? args.handle : '@' + args.handle;
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured. Run "nybbl" setup first.');
        }
        await syncPull();
        const members = await getMembers();
        if (!members.find(m => m.handle === handle)) {
            printError(`Member "${handle}" not found.`);
            this.exit(1);
        }
        const jobs = await getJobs();
        const job = jobs.find(j => j.id === args.job);
        if (!job) {
            printError(`Job "${args.job}" not found.`);
            this.exit(1);
        }
        const assignments = await getAssignments();
        if (assignments.find(a => a.member === handle && a.job === args.job)) {
            this.log(`Member ${handle} is already assigned to "${job.name}".`);
            return;
        }
        assignments.push({
            member: handle,
            job: args.job,
            assignedAt: new Date().toISOString(),
            assignedBy: identity.handle
        });
        await saveAssignments(assignments);
        await syncPush(`Assign ${handle} to job ${args.job}`);
        printSuccess(`${handle} assigned to "${job.name}"`);
    }
}
