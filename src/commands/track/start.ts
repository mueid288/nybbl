import { Command, Args } from '@oclif/core';
import { select } from '@inquirer/prompts';
import { getJobs, getAssignments } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull } from '../../lib/sync.js';
import { getActiveTimer, setActiveTimer } from '../../lib/timer.js';
import { printSuccess, printError } from '../../lib/display.js';
import chalk from 'chalk';

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

        // Show a brief live ticking display
        this.log(chalk.gray('  Timer is running... (go back to dashboard to stop)'));
        await new Promise<void>((resolve) => {
            let ticks = 0;
            const interval = setInterval(() => {
                ticks++;
                const elapsed = `${ticks}s`;
                process.stdout.write(`\r  ${chalk.hex('#06d6a0')('⏱')}  ${chalk.bold.hex('#06d6a0')(elapsed)} elapsed`);
                if (ticks >= 3) {
                    clearInterval(interval);
                    process.stdout.write('\n\n');
                    resolve();
                }
            }, 1000);
        });
    }
}
