import { Command } from '@oclif/core';
import { readIdentity } from '../../lib/identity.js';
import chalk from 'chalk';
import { createTable } from '../../lib/display.js';
export default class Config extends Command {
    static description = 'View current config';
    async run() {
        const config = await readIdentity();
        if (!config) {
            this.error('Config not found. Run `nybbl setup` first.');
        }
        this.log('\n  ⚙️ Nybbl Configuration\n');
        const table = createTable(['Key', 'Value']);
        for (const [key, value] of Object.entries(config)) {
            table.push([chalk.cyan(key), String(value)]);
        }
        this.log(table.toString());
        this.log('');
    }
}
