import { Command } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { saveIdentity } from '../lib/identity.js';
import { printLogo, printSuccess } from '../lib/display.js';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs/promises';
import { simpleGit } from 'simple-git';
import chalk from 'chalk';

export default class Setup extends Command {
    static description = 'First-time setup for nybbl CLI';

    static aliases = ['setup'];

    async run() {
        this.log('Welcome to nybbl! Let\'s get you set up.\n');

        const name = await input({
            message: 'What\'s your name?',
            required: true
        });

        const handleInput = await input({
            message: 'Pick a handle:',
            default: '@' + name.split(' ')[0].toLowerCase(),
            required: true
        });

        const handle = handleInput.startsWith('@') ? handleInput : '@' + handleInput;

        const dataRepo = path.join(os.homedir(), 'nybbl-data');

        await saveIdentity({
            name,
            handle,
            dataRepo,
        });

        const REMOTE_URL = 'https://github.com/mueid288/nybbl-data.git';

        const folderExists = await fs.access(dataRepo).then(() => true).catch(() => false);

        if (!folderExists) {
            // Fresh install: clone directly
            this.log(`\n📦 Cloning shared data repository...`);
            try {
                await simpleGit().clone(REMOTE_URL, dataRepo);
                this.log(chalk.green(`✅ Repository cloned to ${dataRepo}`));
            } catch (e: any) {
                this.log(chalk.yellow(`⚠️ Could not clone repository: ${e.message}`));
            }
        } else {
            // Folder exists — check if it has the right remote
            const git = simpleGit({ baseDir: dataRepo });
            const isRepo = await git.checkIsRepo().catch(() => false);
            if (!isRepo) {
                // Plain folder, not a git repo — init and pull from remote
                await git.init();
            }
            const remotes = await git.getRemotes(true);
            const hasOrigin = remotes.some((r: any) => r.name === 'origin');
            if (!hasOrigin) {
                this.log(`\n📦 Connecting to shared data repository...`);
                await git.addRemote('origin', REMOTE_URL);
                await git.fetch('origin');
                await git.reset(['--hard', 'origin/main']);
                this.log(chalk.green(`✅ Repository connected and updated!`));
            } else {
                this.log(`\n📦 Syncing latest data...`);
                await git.pull('origin', 'main').catch(() => { });
            }
        }

        printSuccess(`You're all set, ${handle}! Type \`nybbl\` (or select an option from the menu) to get started.`);
    }
}
