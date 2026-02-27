import { Command } from '@oclif/core';
import { input } from '@inquirer/prompts';
import { getJobs, saveJobs } from '../../lib/store.js';
import { readIdentity } from '../../lib/identity.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess, printError } from '../../lib/display.js';
export default class Add extends Command {
    static description = 'Create a new job';
    async run() {
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured. Run "nybbl" first.');
        }
        this.log('\n  ➕ New Job\n');
        const name = await input({ message: 'Job name:', required: true });
        const client = await input({ message: 'Client name:', required: true });
        const description = await input({ message: 'Short description:' });
        const tagsInput = await input({ message: 'Tags (comma-separated):' });
        await syncPull();
        const jobs = await getJobs();
        // Create a URL-friendly ID from name
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (jobs.find(j => j.id === id)) {
            printError(`A job with ID "${id}" already exists.`);
            this.exit(1);
        }
        const newJob = {
            id,
            name,
            client,
            description,
            status: 'active',
            owner: identity.handle,
            createdAt: new Date().toISOString(),
            tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : []
        };
        jobs.push(newJob);
        await saveJobs(jobs);
        await syncPush(`Add job: ${newJob.name}`);
        printSuccess(`Job "${newJob.name}" created! (id: ${newJob.id})\n     Owner: ${newJob.owner}`);
    }
}
