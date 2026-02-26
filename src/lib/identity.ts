import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const CONFIG_PATH = path.join(os.homedir(), '.nybblrc');

export interface NybblRc {
    name: string;
    handle: string;
    dataRepo: string;
    autoSync?: boolean;
    defaultJob?: string;
    theme?: string;
}

export async function readIdentity(): Promise<NybblRc | null> {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data) as NybblRc;
    } catch (err: any) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
}

export async function saveIdentity(config: NybblRc): Promise<void> {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
