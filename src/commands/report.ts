import { Command, Flags } from '@oclif/core';
import { getJobs, getMembers, getAllTimelogs, getUpdates } from '../lib/store.js';
import { syncPull } from '../lib/sync.js';
import { createTable } from '../lib/display.js';
import { formatDuration } from '../lib/duration.js';
import chalk from 'chalk';
import fs from 'node:fs/promises';

export default class Report extends Command {
    static description = 'Generate reports (today, week, month)';

    static flags = {
        today: Flags.boolean({ description: "Today's summary" }),
        week: Flags.boolean({ description: "This week's report" }),
        month: Flags.boolean({ description: "This month's report" }),
        job: Flags.string({ description: 'Filter by job' }),
        member: Flags.string({ description: 'Filter by member handle' }),
        export: Flags.string({ description: 'Export format (csv or json)', options: ['csv', 'json'] })
    };

    async run() {
        const { flags } = await this.parse(Report);
        await syncPull();

        const jobs = await getJobs();
        const members = await getMembers();
        let allLogs = await getAllTimelogs();

        const now = new Date();
        let startDate = new Date(0); // Epoch by default (all time)
        let periodName = 'All Time';

        if (flags.today) {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            periodName = 'Today';
        } else if (flags.week) {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            periodName = 'Last 7 Days';
        } else if (flags.month) {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            periodName = 'Last 30 Days';
        }

        // Filter logs by date range
        allLogs = allLogs.filter(l => new Date(l.date) >= startDate);

        // Apply job filter
        if (flags.job) {
            allLogs = allLogs.filter(l => l.job === flags.job);
            periodName += ` (Job: ${flags.job})`;
        }

        // Apply member filter
        if (flags.member) {
            const handle = flags.member.startsWith('@') ? flags.member : '@' + flags.member;
            allLogs = allLogs.filter(l => l.member === handle);
            periodName += ` (Member: ${handle})`;
        }

        if (flags.export === 'json') {
            await fs.writeFile('report.json', JSON.stringify(allLogs, null, 2));
            this.log('Exported report to report.json');
            return;
        }

        if (flags.export === 'csv') {
            const csv = ['ID,Date,Member,Job,DurationMins,Note'];
            for (const l of allLogs) {
                csv.push(`${l.id},${l.date},${l.member},${l.job},${l.duration},"${l.note || ''}"`);
            }
            await fs.writeFile('report.csv', csv.join('\n'));
            this.log('Exported report to report.csv');
            return;
        }

        // Interactive/Console Report
        this.log(`\n  📊 Report — ${periodName}\n`);

        // Group by Job
        this.log('  BY JOB:');
        const jobTable = createTable(['Job', 'Hours']);
        const jobTotals: Record<string, number> = {};
        for (const l of allLogs) {
            jobTotals[l.job] = (jobTotals[l.job] || 0) + l.duration;
        }

        for (const [jobId, mins] of Object.entries(jobTotals)) {
            const job = jobs.find(j => j.id === jobId);
            jobTable.push([job ? job.name : jobId, formatDuration(mins)]);
        }
        this.log(jobTable.toString());

        // Group by Member
        this.log('\n  BY MEMBER:');
        const memberTable = createTable(['Member', 'Hours']);
        const memberTotals: Record<string, number> = {};
        for (const l of allLogs) {
            memberTotals[l.member] = (memberTotals[l.member] || 0) + l.duration;
        }

        for (const [handle, mins] of Object.entries(memberTotals)) {
            memberTable.push([chalk.cyan(handle), formatDuration(mins)]);
        }
        this.log(memberTable.toString());

        const totalMins = Object.values(jobTotals).reduce((a, b) => a + b, 0);
        this.log(chalk.gray(`\n  Total: ${formatDuration(totalMins)} logged in this period.\n`));
    }
}
