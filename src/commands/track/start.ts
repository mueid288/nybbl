import { Command, Args } from '@oclif/core';
import { select } from '@inquirer/prompts';
import { getJobs, getAssignments } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull } from '../../lib/sync.js';
import { getActiveTimer, setActiveTimer } from '../../lib/timer.js';
import { printSuccess, printError } from '../../lib/display.js';

export default class Start extends Command {
    static description = 'Start a timer for a job';

    static args = {
        job: Args.string({ description: 'ID of the job', required: false })
    };

    async run() {
        const { args } = await this.parse(Start);

        const active = await getActiveTimer();
        if (active) {
            printError(`You already have a timer running for job "${active.job}". Stop it first.`);
            return;
        }

        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        await syncPull();
        const jobs = await getJobs();
        const assignments = await getAssignments();

        let jobId = args.job;

        if (!jobId) {
            // Prompt: show only the user's assigned active jobs
            const myJobs = assignments
                .filter(a => a.member === identity.handle)
                .map(a => jobs.find(j => j.id === a.job))
                .filter(j => j && j.status === 'active');

            if (myJobs.length === 0) {
                printError('You are not assigned to any active jobs.');
                return;
            }

            jobId = await select({
                message: 'Which job do you want to track time for?',
                choices: myJobs.map(j => ({ name: j!.name, value: j!.id }))
            });
        }

        const job = jobs.find(j => j.id === jobId);
        if (!job) {
            printError(`Job "${jobId}" not found.`);
            return;
        }

        const now = new Date();
        await setActiveTimer({
            job: job!.id,
            startTime: now.toISOString()
        });

        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        printSuccess(`Timer started for "${job!.name}" at ${timeStr}`);
    }
}
