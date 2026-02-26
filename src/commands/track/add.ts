import { Command, Args, Flags } from '@oclif/core';
import { getJobs, getTimelogs, saveTimelogs, getMembers, saveMembers } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printError } from '../../lib/display.js';
import { parseDuration, formatDuration } from '../../lib/duration.js';
import { TimeEntry } from '../../types/index.js';

export default class Add extends Command {
    static description = 'Manual time entry (e.g., 3h, 45m, 1h30m)';

    static args = {
        duration: Args.string({ description: 'Duration to log', required: true })
    };

    static flags = {
        job: Flags.string({ char: 'j', description: 'Job ID', required: true }),
        note: Flags.string({ char: 'n', description: 'Note for the time entry', default: '' })
    };

    async run() {
        const { args, flags } = await this.parse(Add);

        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }

        const durationMins = parseDuration(args.duration);
        if (durationMins <= 0) {
            printError('Invalid duration format. Use e.g. 1h30m, 45m, 2h');
            this.exit(1);
        }

        await syncPull();

        const jobs = await getJobs();
        const job = jobs.find(j => j.id === flags.job);
        if (!job) {
            printError(`Job "${flags.job}" not found.`);
            this.exit(1);
        }

        const now = new Date();
        // Approximate start time by subtracting duration
        const start = new Date(now.getTime() - durationMins * 60000);

        const timeEntry: TimeEntry = {
            id: `t_${Date.now()}`,
            member: identity.handle,
            job: flags.job,
            date: now.toISOString().split('T')[0],
            startTime: start.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
            endTime: now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
            duration: durationMins,
            note: flags.note,
            type: 'manual'
        };

        const logs = await getTimelogs(identity.handle);
        logs.push(timeEntry);
        await saveTimelogs(identity.handle, logs);

        // Update streak
        const members = await getMembers();
        const member = members.find(m => m.handle === identity.handle);
        if (member) {
            member.streak += 1;
            await saveMembers(members);
        }

        await syncPush(`Manual time log for ${job.name}`);

        printSuccess(`Logged ${formatDuration(durationMins)} to "${job.name}"`);
    }
}
