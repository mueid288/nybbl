import { Command, Args, Flags } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import { getJobs, getAssignments, getUpdates, saveUpdates, getMembers, saveMembers } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess } from '../../lib/display.js';
import { PulseUpdate } from '../../types/index.js';

export default class Index extends Command {
    static description = 'Log a daily progress update';

    static args = {
        message: Args.string({ description: 'Quick one-liner update' })
    };

    static flags = {
        job: Flags.string({ char: 'j', description: 'Job ID' }),
        blocker: Flags.string({ char: 'b', description: 'Any blockers?' })
    };

    async run() {
        const { args, flags } = await this.parse(Index);

        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        await syncPull();

        const jobs = await getJobs();
        const assignments = await getAssignments();

        // If no message provided, we do interactive mode
        let message = args.message;
        let jobId = flags.job;
        let blocker = flags.blocker;

        if (!message) {
            const activeJobs = assignments
                .filter(a => a.member === identity.handle)
                .map(a => jobs.find(j => j.id === a.job))
                .filter(j => j && j.status === 'active');

            if (activeJobs.length === 0) {
                this.log('You are not assigned to any active jobs to post an update.');
                return;
            }

            this.log(`\n  💬 Daily Pulse — ${new Date().toLocaleDateString()}\n`);

            if (!jobId) {
                const selectedJob = await select({
                    message: 'Which job?',
                    choices: activeJobs.map(j => ({ name: j!.name, value: j!.id }))
                });
                jobId = selectedJob;
            }

            message = await input({ message: 'What did you do?', required: true });
            blocker = await input({ message: 'Any blockers? (leave blank if none)', default: '' });
        }

        if (!jobId) {
            this.error('You must specify a job using --job when passing a message argument.');
        }

        const job = jobs.find(j => j.id === jobId);
        if (!job) {
            this.error(`Job "${jobId}" not found.`);
        }

        const today = new Date().toISOString().split('T')[0];
        const update: PulseUpdate = {
            member: identity.handle,
            job: jobId,
            message: message!,
            blocker: blocker?.trim() || undefined,
            timestamp: new Date().toISOString()
        };

        const updates = await getUpdates(today);
        updates.push(update);
        await saveUpdates(today, updates);

        // Update streak
        const members = await getMembers();
        const member = members.find(m => m.handle === identity.handle);
        if (member) {
            member.streak += 1;
            await saveMembers(members);
        }

        await syncPush(`Pulse update for ${job.name}`);

        printSuccess(`Update logged for "${job.name}"!`);
    }
}
