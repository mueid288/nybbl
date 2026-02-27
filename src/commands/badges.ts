import { Command } from '@oclif/core';
import { getMembers, getAllTimelogs, getUpdates } from '../lib/store.js';
import { readIdentity } from '../lib/identity.js';
import { syncPull } from '../lib/sync.js';
import { getUnlockedAchievements, getLockedAchievements, formatAchievementList } from '../lib/achievements.js';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';

export default class Badges extends Command {
    static description = 'View your achievements and badges';

    async run() {
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        await syncPull();

        const members = await getMembers();
        const member = members.find(m => m.handle === identity.handle);
        if (!member) {
            this.log(chalk.gray('  Member not found in data repo.'));
            return;
        }

        const allLogs = await getAllTimelogs();
        const myLogs = allLogs.filter(l => l.member === identity.handle);
        const totalMinutes = myLogs.reduce((acc, l) => acc + l.duration, 0);
        const totalHours = totalMinutes / 60;

        // Count total pulse updates across all days
        let totalPulses = 0;
        const repo = identity.dataRepo;
        const updatesDir = path.join(repo, 'updates');
        try {
            const files = await fs.readdir(updatesDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const data = await fs.readFile(path.join(updatesDir, file), 'utf-8');
                    const updates = JSON.parse(data);
                    totalPulses += updates.filter((u: any) => u.member === identity.handle).length;
                }
            }
        } catch { }

        const data = {
            member,
            totalHours,
            totalPulses,
            totalTimelogs: myLogs.length
        };

        const unlocked = getUnlockedAchievements(data);
        const locked = getLockedAchievements(data);

        this.log('');
        this.log(`  ${chalk.bold.hex('#06d6a0')('🏆 Achievements')} ${chalk.gray('—')} ${chalk.bold(identity.handle)}`);
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        this.log(`  ${chalk.gray(`${Math.round(totalHours)}h logged · ${totalPulses} pulses · 🔥 ${member.streak} streak`)}`);
        this.log('');
        this.log(formatAchievementList(unlocked, locked));
        this.log('');
        this.log(chalk.hex('#555')(`  ${unlocked.length}/${unlocked.length + locked.length} badges unlocked`));
        this.log('');
    }
}
