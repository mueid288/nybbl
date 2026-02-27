import fs from 'node:fs/promises';
import path from 'node:path';
import { readIdentity } from './identity.js';
async function getRepoPath() {
    const id = await readIdentity();
    if (!id)
        throw new Error('Identity not configured. Run "nybbl" setup first.');
    if (!id.dataRepo)
        throw new Error('dataRepo not configured in ~/.nybblrc');
    return id.dataRepo;
}
async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    }
    catch (e) {
        // Ignore error
    }
}
async function readJsonFile(filename, defaultValue) {
    const repo = await getRepoPath();
    const filePath = path.join(repo, filename);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (err) {
        if (err.code === 'ENOENT')
            return defaultValue;
        throw err;
    }
}
async function writeJsonFile(filename, data) {
    const repo = await getRepoPath();
    const filePath = path.join(repo, filename);
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
export async function getJobs() {
    return readJsonFile('jobs.json', []);
}
export async function saveJobs(jobs) {
    return writeJsonFile('jobs.json', jobs);
}
export async function getMembers() {
    return readJsonFile('members.json', []);
}
export async function saveMembers(members) {
    return writeJsonFile('members.json', members);
}
export async function getAssignments() {
    return readJsonFile('assignments.json', []);
}
export async function saveAssignments(assignments) {
    return writeJsonFile('assignments.json', assignments);
}
export async function getTimelogs(handle) {
    const safeHandle = handle.replace('@', '');
    return readJsonFile(`timelogs/${safeHandle}.json`, []);
}
export async function getAllTimelogs() {
    const repo = await getRepoPath();
    const timelogsDir = path.join(repo, 'timelogs');
    let files = [];
    try {
        files = await fs.readdir(timelogsDir);
    }
    catch (err) {
        if (err.code === 'ENOENT')
            return [];
        throw err;
    }
    const allLogs = [];
    for (const file of files) {
        if (file.endsWith('.json')) {
            const p = path.join(timelogsDir, file);
            try {
                const data = await fs.readFile(p, 'utf-8');
                const logs = JSON.parse(data);
                allLogs.push(...logs);
            }
            catch (e) { }
        }
    }
    return allLogs;
}
export async function saveTimelogs(handle, logs) {
    const safeHandle = handle.replace('@', '');
    return writeJsonFile(`timelogs/${safeHandle}.json`, logs);
}
export async function getUpdates(date) {
    // date should be YYYY-MM-DD
    return readJsonFile(`updates/${date}.json`, []);
}
export async function saveUpdates(date, updates) {
    return writeJsonFile(`updates/${date}.json`, updates);
}
export async function getTeamConfig() {
    return readJsonFile('config.json', null);
}
export async function saveTeamConfig(config) {
    return writeJsonFile('config.json', config);
}
