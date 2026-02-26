import { Command } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { getActiveTimer, setActiveTimer } from '../../lib/timer.js';
import { readIdentity } from '../../lib/identity.js';
import { getTimelogs, saveTimelogs, getJobs, getMembers, saveMembers } from '../../lib/store.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, createTable } from '../../lib/display.js';
import { TimeEntry } from '../../types/index.js';

export default class Stop extends Command {
    static description = 'Stop the active timer';

    async run() {
        const active = await getActiveTimer();
        if (!active) {
            this.log('You have no active timer running.');
            return;
        }

        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        await syncPull();

        const jobs = await getJobs();
        const job = jobs.find(j => j.id === active.job);
        const jobName = job ? job.name : active.job;

        const start = new Date(active.startTime);
        const end = new Date();

        // Duration in minutes
        const diffMs = end.getTime() - start.getTime();
        const durationMins = Math.round(diffMs / 60000);

        this.log('\n  ⏱️ Timer stopped.\n');

        const table = createTable(['Job', 'Time', 'Note']);
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const timeStr = `${hours}h ${mins}m`;

        table.push([
            `💼 ${jobName}`,
            timeStr,
            '(no note)'
        ]);

        this.log(table.toString());

        // Fix: Wait for inquirer prompt using input
        const note = await input({ message: 'Add a note?', default: '' });

        const timeEntry: TimeEntry = {
            id: `t_${Date.now()}`,
            member: identity.handle,
            job: active.job,
            date: start.toISOString().split('T')[0],
            startTime: Object.assign(start).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
            endTime: Object.assign(end).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
            duration: durationMins,
            note: note.trim(),
            type: 'timer'
        };

        const logs = await getTimelogs(identity.handle);
        logs.push(timeEntry);
        await saveTimelogs(identity.handle, logs);

        // Update streak
        const members = await getMembers();
        const member = members.find(m => m.handle === identity.handle);
        if (member) {
            // Very basic streak: just +1 for logging today (ignores duplicate days for now)
            member.streak += 1;
            await saveMembers(members);
        }

        await setActiveTimer(null);
        await syncPush(`Log time for ${jobName}`);

        printSuccess(`Logged ${timeStr} to "${jobName}"`);
    }
}
