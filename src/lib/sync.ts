import { simpleGit, SimpleGit } from 'simple-git';
import { readIdentity } from './identity.js';
import { printWarning } from './display.js';

export async function getGit(): Promise<SimpleGit> {
    const id = await readIdentity();
    if (!id) throw new Error('Identity not configured. Run "nybbl" setup first.');
    if (!id.dataRepo) throw new Error('dataRepo not configured in ~/.nybblrc');
    return simpleGit({ baseDir: id.dataRepo });
}

export async function syncPull(): Promise<void> {
    try {
        const git = await getGit();
        const isRepo = await git.checkIsRepo();
        if (!isRepo) throw new Error('Data repository is not a valid git repository.');

        // We try to pull (fast-forward or merge).
        // If it fails due to offline or conflicts, we warn.
        await git.pull();
    } catch (err: any) {
        if (err.message.includes('Identity not configured')) throw err;
        printWarning('Could not sync (pull) from remote repo. Continuing with local data.');
    }
}

export async function syncPush(message: string): Promise<void> {
    try {
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
    } catch (err: any) {
        printWarning('Could not sync (push). Changes saved locally. Will retry on next command.');
    }
}
