import { Command } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { getMembers, saveMembers } from '../../lib/store.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printError } from '../../lib/display.js';
import { Member } from '../../types/index.js';

export default class Add extends Command {
    static description = 'Add a new team member';

    async run() {
        this.log('\n  👤 Add Team Member\n');

        const name = await input({ message: 'Full name:', required: true });

        const handleInput = await input({
            message: 'Handle:',
            default: '@' + name.split(' ')[0].toLowerCase(),
            required: true
        });

        const handle = handleInput.startsWith('@') ? handleInput : '@' + handleInput;

        await syncPull();
        const members = await getMembers();

        if (members.find(m => m.handle === handle)) {
            printError(`Member with handle "${handle}" already exists.`);
            this.exit(1);
        }

        const newMember: Member = {
            handle,
            name,
            joinedAt: new Date().toISOString(),
            streak: 0
        };

        members.push(newMember);
        await saveMembers(members);
        await syncPush(`Add member: ${handle}`);

        printSuccess(`Member ${name} (${handle}) added successfully!`);
    }
}
