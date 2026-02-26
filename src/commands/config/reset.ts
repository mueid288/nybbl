import { Command } from '@oclif/core';
import { confirm } from '@inquirer/prompts';
import { readIdentity, saveIdentity } from '../../lib/identity.js';
import { printSuccess } from '../../lib/display.js';

export default class ResetConfig extends Command {
    static description = 'Reset config to defaults';

    async run() {
        const config = await readIdentity();
        if (!config) {
            this.error('Config not found. Run `nybbl setup` first.');
        }

        const answer = await confirm({
            message: 'Are you sure you want to reset config? (name, handle and dataRepo will be kept)',
            default: false
        });

        if (!answer) {
            this.log('Reset cancelled.');
            return;
        }

        config.autoSync = true;
        config.theme = 'default';
        delete config.defaultJob;

        await saveIdentity(config);
        printSuccess('Configuration reset to defaults.');
    }
}
