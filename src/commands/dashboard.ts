import { Command } from '@oclif/core';
import { select } from '@inquirer/prompts';
import { readIdentity } from '../lib/identity.js';
import { printLogo, createTable } from '../lib/display.js';
import { syncPull } from '../lib/sync.js';
import { getAssignments, getJobs } from '../lib/store.js';
import { getActiveTimer } from '../lib/timer.js';
import Setup from './setup.js';
import { execute } from '@oclif/core';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

export default class Dashboard extends Command {
    static description = 'Nybbl Ventures Dashboard';

    async run() {
        printLogo();

        const identity = await readIdentity();
        if (!identity) {
            await Setup.run([]);
            return;
        }

        try {
            await syncPull();
        } catch (e: any) {
            // syncPull already logs a warning, continue.
        }

        const assignments = await getAssignments();
        const jobs = await getJobs();

        const myAssignments = assignments.filter(a => a.member === identity.handle);
        const activeJobs = myAssignments.map(a => jobs.find(j => j.id === a.job)).filter(Boolean);

        this.log(chalk.hex('#06d6a0')(`  👋 Hey ${chalk.bold(identity.handle)}!`) + chalk.gray(` You're on ${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''}.`));
        this.log('');

        if (activeJobs.length > 0) {
            const table = createTable(['Job', 'Client', 'Role']);
            for (const job of activeJobs) {
                if (job) {
                    const role = job.owner === identity.handle
                        ? chalk.hex('#06d6a0')('★ Owner')
                        : chalk.gray('Member');
                    table.push([`💼 ${chalk.bold(job.name)}`, chalk.gray(job.client), role]);
                }
            }
            this.log(table.toString());
            this.log('');
        }

        // Keep looping until the user explicitly chooses Exit
        while (true) {
            const activeTimer = await getActiveTimer();

            // Build choices dynamically based on timer state
            const timerChoice = activeTimer
                ? { name: chalk.yellow(`⏹️  Stop timer (${activeTimer.job})`), value: 'track:stop' }
                : { name: '⏱️  Track time', value: 'track:start' };

            const choices = [
                timerChoice,
                { name: '📋  My jobs', value: 'whoami' },
                { name: '👥  My team', value: 'team' },
                { name: '📊  View report', value: 'report' },
                { name: '💬  Log an update', value: 'pulse' },
                { name: '🌐  Team status', value: 'status' },
                { name: '➕  Add a job', value: 'job:add' },
                { name: '👤  Manage members', value: 'member:add' },
                { name: '❌  Exit', value: 'exit' }
            ];

            const action = await select({
                message: 'What do you want to do?',
                loop: false,
                choices
            });

            if (action === 'exit') {
                process.exit(0);
            }

            // Execute the chosen command — catch errors so the loop doesn't die
            try {
                await execute({ dir: dirname(fileURLToPath(import.meta.url)), args: action.split(':') });
            } catch (err: any) {
                this.log(chalk.red(`\n  ❌ ${err.message || 'Something went wrong.'}\n`));
            }

            this.log(''); // spacer before menu reappears
        }
    }
}
