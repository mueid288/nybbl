import { Command } from '@oclif/core';
import { getMembers, getAssignments, getJobs } from '../../lib/store.js';
import { syncPull } from '../../lib/sync.js';
import { createTable } from '../../lib/display.js';
import chalk from 'chalk';
export default class List extends Command {
    static description = 'List all team members';
    async run() {
        await syncPull();
        const members = await getMembers();
        const assignments = await getAssignments();
        const jobs = await getJobs();
        if (members.length === 0) {
            this.log('No members found.');
            return;
        }
        this.log('\n  👥 Team Members\n');
        const table = createTable(['Handle', 'Name', 'Active Jobs', 'Streak']);
        for (const member of members) {
            const memberAssignments = assignments.filter(a => a.member === member.handle);
            const activeJobs = memberAssignments
                .map(a => jobs.find(j => j.id === a.job))
                .filter(j => j && j.status === 'active')
                .map(j => j?.name);
            const jobsStr = activeJobs.length > 0 ? activeJobs.join(', ') : chalk.gray('None');
            const streakStr = member.streak > 0 ? `🔥 ${member.streak}` : '0';
            table.push([
                chalk.cyan(member.handle),
                member.name,
                jobsStr,
                streakStr
            ]);
        }
        this.log(table.toString());
        this.log('');
    }
}
