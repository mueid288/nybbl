import { Command } from '@oclif/core';
import { select, Separator } from '@inquirer/prompts';
import { readIdentity } from '../lib/identity.js';
import { printLogo, createTable, getWelcomeMessage, formatElapsedTimer, printStatusBar, formatStreak, colorMember } from '../lib/display.js';
import { syncPull } from '../lib/sync.js';
import { getAssignments, getJobs, getUpdates, getMembers } from '../lib/store.js';
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
            // syncPull already shows spinner warning, continue.
        }

        const assignments = await getAssignments();
        const jobs = await getJobs();
        const members = await getMembers();
        const me = members.find(m => m.handle === identity.handle);

        const myAssignments = assignments.filter(a => a.member === identity.handle);
        const activeJobs = myAssignments.map(a => jobs.find(j => j.id === a.job)).filter(Boolean);

        // ─── Welcome + Status Bar ───
        this.log(getWelcomeMessage(identity.handle));
        this.log('');

        const activeTimer = await getActiveTimer();
        const statusParts: string[] = [
            chalk.hex('#06d6a0')('🟢 Online'),
            `📋 ${activeJobs.length} job${activeJobs.length !== 1 ? 's' : ''}`,
            formatStreak(me?.streak || 0),
        ];
        if (activeTimer) {
            statusParts.push(formatElapsedTimer(activeTimer.startTime));
        }
        printStatusBar(statusParts);

        // ─── Jobs Table ───
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

        // ─── Blocker Notifications ───
        const todayStr = new Date().toISOString().split('T')[0];
        const todayUpdates = await getUpdates(todayStr);
        const blockers = todayUpdates.filter(
            u => u.blocker && u.blocker.trim() !== '' && u.member !== identity.handle
        );

        if (blockers.length > 0) {
            this.log(chalk.hex('#e63946').bold('  🚨 Teammate Blockers:'));
            for (const b of blockers) {
                const job = jobs.find(j => j.id === b.job);
                this.log(
                    `    ${chalk.hex('#e63946')('●')} ${colorMember(b.member)} ` +
                    chalk.gray(`(${job?.name || b.job})`) +
                    `: ${chalk.hex('#f4a261')(b.blocker!)}`
                );
            }
            this.log('');
        }

        // ─── Main Menu Loop ───
        while (true) {
            const timer = await getActiveTimer();

            const timerChoice = timer
                ? { name: chalk.yellow(`⏹️  Stop timer`) + chalk.gray(` — ${timer.job} ${formatElapsedTimer(timer.startTime)}`), value: 'track:stop' }
                : { name: '⏱️  Track time', value: 'track:start' };

            const choices = [
                new Separator(chalk.hex('#555')(`── ${chalk.hex('#06d6a0')('Work')} ${'─'.repeat(28)}`)),
                timerChoice,
                { name: '🧍  Daily standup', value: 'standup' },
                { name: '💬  Log an update', value: 'pulse' },

                new Separator(chalk.hex('#555')(`── ${chalk.hex('#06d6a0')('Insights')} ${'─'.repeat(24)}`)),
                { name: '📊  Burndown chart', value: 'burndown' },
                { name: '📈  View report', value: 'report' },
                { name: '🏆  My badges', value: 'badges' },

                new Separator(chalk.hex('#555')(`── ${chalk.hex('#06d6a0')('Team')} ${'─'.repeat(28)}`)),
                { name: '📜  View standups', value: 'standup:view' },
                { name: '👥  My team', value: 'team' },
                { name: '🌐  Team status', value: 'status' },

                new Separator(chalk.hex('#555')(`── ${chalk.hex('#06d6a0')('Manage')} ${'─'.repeat(26)}`)),
                { name: '📋  My jobs', value: 'whoami' },
                { name: '➕  Add a job', value: 'job:add' },
                { name: '👤  Manage members', value: 'member:add' },

                new Separator(chalk.hex('#555')('─'.repeat(34))),
                { name: chalk.hex('#e63946')('❌  Exit'), value: 'exit' }
            ];

            const action = await select({
                message: 'What do you want to do?',
                loop: false,
                choices
            });

            if (action === 'exit') {
                this.log(chalk.gray('\n  👋 See you later!\n'));
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
