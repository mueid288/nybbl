import { Command, Args } from '@oclif/core';
import { getMembers, getJobs, getUpdates, getAllTimelogs, getAssignments } from '../lib/store.js';
import { syncPull } from '../lib/sync.js';
import { createTable, colorMember } from '../lib/display.js';
import chalk from 'chalk';
export default class Status extends Command {
    static description = 'Team-wide overview: who\'s working on what';
    static args = {
        job: Args.string({ description: 'Filter by job ID' })
    };
    async run() {
        const { args } = await this.parse(Status);
        await syncPull();
        const members = await getMembers();
        const jobs = await getJobs();
        const assignments = await getAssignments();
        const todayStr = new Date().toISOString().split('T')[0];
        const updates = await getUpdates(todayStr);
        const allLogs = await getAllTimelogs();
        const todayLogs = allLogs.filter(l => l.date === todayStr);
        let activeJobsCount = new Set();
        let totalMinutesToday = 0;
        const table = createTable(['Member', 'Current Job', 'Today', 'Last Update']);
        for (const member of members) {
            // Find today's logs for member
            const memberLogs = todayLogs.filter(l => l.member === member.handle);
            const minutes = memberLogs.reduce((acc, l) => acc + l.duration, 0);
            totalMinutesToday += minutes;
            const hoursStr = `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
            // Find member's most recent update
            const memberUpdates = updates.filter(u => u.member === member.handle);
            memberUpdates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const lastUpdate = memberUpdates[0]?.message || chalk.gray('(no updates today)');
            // Determine current job (latest log today, or fallback to first assigned active job)
            let currentJobName = chalk.gray('None');
            let currentJobId = null;
            if (memberLogs.length > 0) {
                // Sort by start time descending
                memberLogs.sort((a, b) => b.startTime.localeCompare(a.startTime));
                currentJobId = memberLogs[0].job;
            }
            else {
                const myAssignments = assignments.filter(a => a.member === member.handle);
                const activeAssigned = myAssignments
                    .map(a => jobs.find(j => j.id === a.job))
                    .filter(j => j && j.status === 'active');
                if (activeAssigned.length > 0) {
                    currentJobId = activeAssigned[0].id;
                }
            }
            const jobObj = jobs.find(j => j.id === currentJobId);
            if (jobObj) {
                currentJobName = jobObj.name;
                activeJobsCount.add(jobObj.id);
            }
            // Filter by job arg if provided
            if (args.job && currentJobId !== args.job) {
                continue;
            }
            table.push([
                colorMember(member.handle),
                currentJobName,
                hoursStr,
                lastUpdate
            ]);
        }
        this.log('');
        this.log(`  👥  ${chalk.bold.hex('#06d6a0')('Nybbl Ventures')} ${chalk.gray('— Team Status')}`);
        this.log(table.toString());
        const totalHoursStr = `${Math.floor(totalMinutesToday / 60)}h ${totalMinutesToday % 60}m`;
        this.log(chalk.gray(`\n  Active Jobs: ${activeJobsCount.size} | Total Hours Today: ${totalHoursStr}\n`));
    }
}
