import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const TIMER_PATH = path.join(os.homedir(), '.nybbl-timer');

export interface ActiveTimer {
    job: string;
    startTime: string; // ISO string Date
}

export async function getActiveTimer(): Promise<ActiveTimer | null> {
    try {
        const data = await fs.readFile(TIMER_PATH, 'utf-8');
        return JSON.parse(data) as ActiveTimer;
    } catch (err: any) {
        if (err.code === 'ENOENT') return null;
        throw err;
    }
}

export async function setActiveTimer(timer: ActiveTimer | null): Promise<void> {
    if (!timer) {
        try {
            await fs.unlink(TIMER_PATH);
        } catch (e) { }
        return;
    }
    await fs.writeFile(TIMER_PATH, JSON.stringify(timer, null, 2), 'utf-8');
}
