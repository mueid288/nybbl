import { Command } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import { getJobs, getAssignments, getMembers, getUpdates, saveUpdates } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printWarning } from '../../lib/display.js';
import { PulseUpdate } from '../../types/index.js';
import chalk from 'chalk';

export default class Standup extends Command {
    static description = 'Daily standup mode — Yesterday / Today / Blockers';

    async run() {
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        await syncPull();

        // Check if user already logged a standup today
        const todayStr = new Date().toISOString().split('T')[0];
        const existingUpdates = await getUpdates(todayStr);
        const alreadyDone = existingUpdates.some(
            u => u.member === identity.handle && u.message.startsWith('📋 Yesterday:')
        );

        if (alreadyDone) {
            printWarning("You've already done your standup today! Come back tomorrow.");
            return;
        }

        const jobs = await getJobs();
        const assignments = await getAssignments();

        const myJobs = assignments
            .filter(a => a.member === identity.handle)
            .map(a => jobs.find(j => j.id === a.job))
            .filter(j => j && j.status === 'active');

        if (myJobs.length === 0) {
            this.log(chalk.gray('  You have no active jobs for standup.'));
            return;
        }

        this.log('');
        this.log(`  ${chalk.bold.hex('#06d6a0')('🧍 Daily Standup')} ${chalk.gray('— ' + new Date().toLocaleDateString())}`);
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        this.log('');

        // Select job
        let jobId: string;
        if (myJobs.length === 1) {
            jobId = myJobs[0]!.id;
            this.log(chalk.gray(`  Job: ${myJobs[0]!.name}\n`));
        } else {
            jobId = await select({
                message: 'Which job is this standup for?',
                choices: myJobs.map(j => ({ name: j!.name, value: j!.id }))
            });
        }

        const yesterday = await input({
            message: chalk.hex('#f4a261')('What did you do yesterday?'),
            required: true
        });

        const today = await input({
            message: chalk.hex('#06d6a0')('What are you working on today?'),
            required: true
        });

        const blockerInput = await input({
            message: chalk.hex('#e63946')('Any blockers?') + chalk.gray(' (leave blank if none)'),
            default: ''
        });

        const blocker = blockerInput.trim() || undefined;

        // Build standup message
        const standupMessage = `📋 Yesterday: ${yesterday}\n🎯 Today: ${today}${blocker ? `\n🚧 Blocker: ${blocker}` : ''}`;

        const update: PulseUpdate = {
            member: identity.handle,
            job: jobId,
            message: standupMessage,
            blocker,
            timestamp: new Date().toISOString()
        };

        const updates = await getUpdates(todayStr);
        updates.push(update);
        await saveUpdates(todayStr, updates);

        await syncPush(`Standup from ${identity.handle}`);

        const job = jobs.find(j => j.id === jobId);
        printSuccess(`Standup logged for "${job?.name || jobId}"!`);

        // Show a recap
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        this.log(`  ${chalk.hex('#f4a261')('📋 Yesterday:')} ${yesterday}`);
        this.log(`  ${chalk.hex('#06d6a0')('🎯 Today:')}     ${today}`);
        if (blocker) {
            this.log(`  ${chalk.hex('#e63946')('🚧 Blocker:')}   ${blocker}`);
        }
        this.log('');
    }
}
