import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const CONFIG_PATH = path.join(os.homedir(), '.nybblrc');
export async function readIdentity() {
    try {
        const data = await fs.readFile(CONFIG_PATH, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        if (err.code === 'ENOENT')
            return null;
        throw err;
    }
}
export async function saveIdentity(config) {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
