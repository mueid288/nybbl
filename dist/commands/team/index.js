import { Command } from '@oclif/core';
import { getJobs, getAssignments, getMembers, getUpdates } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull } from '../../lib/sync.js';
import chalk from 'chalk';
import { createTable, formatStreak, colorMember } from '../../lib/display.js';
export default class Team extends Command {
    static description = 'View all teams and their members';
    async run() {
        await syncPull().catch(() => { });
        const identity = await readIdentity();
        const jobs = await getJobs();
        const assignments = await getAssignments();
        const members = await getMembers();
        const today = new Date().toISOString().split('T')[0];
        const todayUpdates = await getUpdates(today);
        const activeJobs = jobs.filter(j => j.status === 'active');
        this.log('\n  👥 Nybbl Ventures — Teams\n');
        for (const job of activeJobs) {
            const teamAssignments = assignments.filter(a => a.job === job.id);
            const teamMembers = teamAssignments
                .map(a => members.find(m => m.handle === a.member))
                .filter(Boolean);
            if (teamMembers.length === 0)
                continue;
            this.log(chalk.cyan(`  💼 ${job.name}`));
            const table = createTable(['Member', 'Streak', "Today's Update"]);
            for (const member of teamMembers) {
                const memberUpdates = todayUpdates.filter(u => u.member === member.handle && u.job === job.id);
                const lastUpdate = memberUpdates.length > 0
                    ? memberUpdates[memberUpdates.length - 1].message
                    : chalk.gray('(no updates today)');
                const isMe = !!(identity && member.handle === identity.handle);
                const nameStr = colorMember(member.handle, isMe);
                table.push([nameStr, formatStreak(member.streak), lastUpdate]);
            }
            this.log(table.toString());
            this.log('');
        }
    }
}
