import fs from 'node:fs/promises';
import path from 'node:path';
import { readIdentity } from './identity.js';
import { Job, Member, Assignment, TimeEntry, PulseUpdate, TeamConfig } from '../types/index.js';

async function getRepoPath(): Promise<string> {
    const id = await readIdentity();
    if (!id) throw new Error('Identity not configured. Run "nybbl" setup first.');
    if (!id.dataRepo) throw new Error('dataRepo not configured in ~/.nybblrc');
    return id.dataRepo;
}

async function ensureDir(dirPath: string) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (e) {
        // Ignore error
    }
}

async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    const repo = await getRepoPath();
    const filePath = path.join(repo, filename);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as T;
    } catch (err: any) {
        if (err.code === 'ENOENT') return defaultValue;
        throw err;
    }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
    const repo = await getRepoPath();
    const filePath = path.join(repo, filename);
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getJobs(): Promise<Job[]> {
    return readJsonFile<Job[]>('jobs.json', []);
}

export async function saveJobs(jobs: Job[]): Promise<void> {
    return writeJsonFile('jobs.json', jobs);
}

export async function getMembers(): Promise<Member[]> {
    return readJsonFile<Member[]>('members.json', []);
}

export async function saveMembers(members: Member[]): Promise<void> {
    return writeJsonFile('members.json', members);
}

export async function getAssignments(): Promise<Assignment[]> {
    return readJsonFile<Assignment[]>('assignments.json', []);
}

export async function saveAssignments(assignments: Assignment[]): Promise<void> {
    return writeJsonFile('assignments.json', assignments);
}

export async function getTimelogs(handle: string): Promise<TimeEntry[]> {
    const safeHandle = handle.replace('@', '');
    return readJsonFile<TimeEntry[]>(`timelogs/${safeHandle}.json`, []);
}

export async function getAllTimelogs(): Promise<TimeEntry[]> {
    const repo = await getRepoPath();
    const timelogsDir = path.join(repo, 'timelogs');
    let files: string[] = [];
    try {
        files = await fs.readdir(timelogsDir);
    } catch (err: any) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }

    const allLogs: TimeEntry[] = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const p = path.join(timelogsDir, file);
            try {
                const data = await fs.readFile(p, 'utf-8');
                const logs = JSON.parse(data) as TimeEntry[];
                allLogs.push(...logs);
            } catch (e) { }
        }
    }
    return allLogs;
}

export async function saveTimelogs(handle: string, logs: TimeEntry[]): Promise<void> {
    const safeHandle = handle.replace('@', '');
    return writeJsonFile(`timelogs/${safeHandle}.json`, logs);
}

export async function getUpdates(date: string): Promise<PulseUpdate[]> {
    // date should be YYYY-MM-DD
    return readJsonFile<PulseUpdate[]>(`updates/${date}.json`, []);
}

export async function saveUpdates(date: string, updates: PulseUpdate[]): Promise<void> {
    return writeJsonFile(`updates/${date}.json`, updates);
}

export async function getTeamConfig(): Promise<TeamConfig | null> {
    return readJsonFile<TeamConfig | null>('config.json', null);
}

export async function saveTeamConfig(config: TeamConfig): Promise<void> {
    return writeJsonFile('config.json', config);
}
