import { Command, Args } from '@oclif/core';
import { readIdentity, saveIdentity } from '../../lib/identity.js';
import { printSuccess } from '../../lib/display.js';

export default class SetConfig extends Command {
    static description = 'Update a config value';

    static args = {
        key: Args.string({ required: true, description: 'Config key to set' }),
        value: Args.string({ required: true, description: 'Value to set' })
    };

    async run() {
        const { args } = await this.parse(SetConfig);
        const config = await readIdentity();
        if (!config) {
            this.error('Config not found. Run `nybbl setup` first.');
        }

        // Parse booleans correctly
        let value: any = args.value;
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        (config as any)[args.key] = value;
        await saveIdentity(config);
        printSuccess(`Config "${args.key}" set to "${value}"`);
    }
}
