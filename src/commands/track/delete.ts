import { Command, Args } from '@oclif/core';
import { confirm } from '@inquirer/prompts';
import { getTimelogs, saveTimelogs } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printError } from '../../lib/display.js';

export default class Delete extends Command {
    static description = 'Delete a time entry';

    static args = {
        entryId: Args.string({ description: 'ID of the time entry', required: true })
    };

    async run() {
        const { args } = await this.parse(Delete);

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

        const answer = await confirm({
            message: `Are you sure you want to delete time entry "${args.entryId}"?`,
            default: false
        });

        if (!answer) {
            this.log('Delete cancelled.');
            return;
        }

        const newLogs = logs.filter(l => l.id !== args.entryId);
        await saveTimelogs(identity.handle, newLogs);
        await syncPush(`Delete time log: ${args.entryId}`);

        printSuccess(`Time entry "${args.entryId}" deleted.`);
    }
}
