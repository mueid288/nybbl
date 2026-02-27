import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
const TIMER_PATH = path.join(os.homedir(), '.nybbl-timer');
export async function getActiveTimer() {
    try {
        const data = await fs.readFile(TIMER_PATH, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        if (err.code === 'ENOENT')
            return null;
        throw err;
    }
}
export async function setActiveTimer(timer) {
    if (!timer) {
        try {
            await fs.unlink(TIMER_PATH);
        }
        catch (e) { }
        return;
    }
    await fs.writeFile(TIMER_PATH, JSON.stringify(timer, null, 2), 'utf-8');
}
