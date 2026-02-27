import { simpleGit, SimpleGit } from 'simple-git';
import { readIdentity } from './identity.js';
import { createSpinner } from './display.js';

export async function getGit(): Promise<SimpleGit> {
    const id = await readIdentity();
    if (!id) throw new Error('Identity not configured. Run "nybbl" setup first.');
    if (!id.dataRepo) throw new Error('dataRepo not configured in ~/.nybblrc');
    return simpleGit({ baseDir: id.dataRepo });
}

export async function syncPull(): Promise<void> {
    const spinner = createSpinner('Syncing latest data...');
    try {
        spinner.start();
        const git = await getGit();
        const isRepo = await git.checkIsRepo();
        if (!isRepo) throw new Error('Data repository is not a valid git repository.');

        await git.pull();
        spinner.succeed('Data synced');
    } catch (err: any) {
        if (err.message.includes('Identity not configured')) {
            spinner.stop();
            throw err;
        }
        spinner.warn('Offline — using local data');
    }
}

export async function syncPush(message: string): Promise<void> {
    const spinner = createSpinner('Saving to cloud...');
    try {
        spinner.start();
        const id = await readIdentity();
        const git = await getGit();

        // Set author to the nybbl user so commits show the right name on GitHub
        if (id) {
            await git.addConfig('user.name', id.name, false, 'local');
            await git.addConfig('user.email', `${id.handle.replace('@', '')}@nybbl.local`, false, 'local');
        }

        await git.add('./*');
        await git.commit(message);
        await git.push();
        spinner.succeed('Saved & synced');
    } catch (err: any) {
        spinner.warn('Saved locally — will sync later');
    }
}
