import { Command, Args } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { getTimelogs, saveTimelogs } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printError } from '../../lib/display.js';
import { parseDuration } from '../../lib/duration.js';
export default class Edit extends Command {
    static description = 'Edit a time entry';
    static args = {
        entryId: Args.string({ description: 'ID of the time entry', required: true })
    };
    async run() {
        const { args } = await this.parse(Edit);
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }
        await syncPull();
        const logs = await getTimelogs(identity.handle);
        const logIndex = logs.findIndex(l => l.id === args.entryId);
        if (logIndex === -1) {
            printError(`Time entry "${args.entryId}" not found.`);
            this.exit(1);
        }
        const log = logs[logIndex];
        this.log(`Editing entry ${log.id} (${log.date})`);
        const durInput = await input({
            message: 'Duration (e.g. 1h30m):',
            default: `${Math.floor(log.duration / 60)}h ${log.duration % 60}m`.trim()
        });
        const note = await input({ message: 'Note:', default: log.note || '' });
        const newDur = parseDuration(durInput);
        if (newDur > 0) {
            log.duration = newDur;
        }
        log.note = note.trim();
        logs[logIndex] = log;
        await saveTimelogs(identity.handle, logs);
        await syncPush(`Edit time log: ${log.id}`);
        printSuccess(`Time entry "${log.id}" updated.`);
    }
}
