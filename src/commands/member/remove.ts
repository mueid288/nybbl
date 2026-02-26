import { Command, Args } from '@oclif/core';
import { confirm } from '@inquirer/prompts';
import { getMembers, saveMembers, getAssignments, saveAssignments } from '../../lib/store.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printError } from '../../lib/display.js';

export default class Remove extends Command {
    static description = 'Remove a team member';

    static args = {
        handle: Args.string({ description: 'Handle of the member to remove', required: true })
    };

    async run() {
        const { args } = await this.parse(Remove);
        const handle = args.handle.startsWith('@') ? args.handle : '@' + args.handle;

        await syncPull();
        let members = await getMembers();
        const memberIndex = members.findIndex(m => m.handle === handle);

        if (memberIndex === -1) {
            printError(`Member with handle "${handle}" not found.`);
            this.exit(1);
        }

        const answer = await confirm({
            message: `Are you sure you want to remove ${members[memberIndex].name} (${handle})? This will unassign them from all jobs.`,
            default: false
        });

        if (!answer) {
            this.log('Remove cancelled.');
            return;
        }

        members = members.filter(m => m.handle !== handle);
        await saveMembers(members);

        let assignments = await getAssignments();
        assignments = assignments.filter(a => a.member !== handle);
        await saveAssignments(assignments);

        await syncPush(`Remove member: ${handle}`);

        printSuccess(`Member ${handle} removed successfully.`);
    }
}
