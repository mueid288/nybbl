import { Command } from '@oclif/core';
import { getMembers } from '../lib/store.js';
import { readIdentity } from '../lib/identity.js';
import { syncPull } from '../lib/sync.js';
import chalk from 'chalk';
export default class Streak extends Command {
    static description = 'View your current logging streak';
    async run() {
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }
        await syncPull();
        const members = await getMembers();
        const member = members.find(m => m.handle === identity.handle);
        if (!member) {
            this.error('Member profile not found on the team.');
        }
        this.log(`\n  🔥 Your current streak is ${chalk.bold.cyan(member.streak)} days! Keep it up!\n`);
    }
}
