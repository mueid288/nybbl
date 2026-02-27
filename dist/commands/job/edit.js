import { Command, Args } from '@oclif/core';
import { input, select } from '@inquirer/prompts';
import { getJobs, saveJobs } from '../../lib/store.js';
import { syncPull, syncPush } from '../../lib/sync.js';
import { printSuccess } from '../../lib/display.js';
export default class Edit extends Command {
    static description = 'Edit job details';
    static args = {
        job: Args.string({ description: 'ID of the job to edit', required: true })
    };
    async run() {
        const { args } = await this.parse(Edit);
        await syncPull();
        const jobs = await getJobs();
        const jobIndex = jobs.findIndex(j => j.id === args.job);
        if (jobIndex === -1) {
            this.error(`Job with ID "${args.job}" not found.`);
        }
        const job = jobs[jobIndex];
        const name = await input({ message: 'Job name:', default: job.name });
        const client = await input({ message: 'Client name:', default: job.client });
        const description = await input({ message: 'Short description:', default: job.description });
        const tagsInput = await input({ message: 'Tags (comma-separated):', default: job.tags.join(', ') });
        const status = await select({
            message: 'Status:',
            choices: [
                { name: 'Active', value: 'active' },
                { name: 'Archived', value: 'archived' }
            ],
            default: job.status
        });
        job.name = name;
        job.client = client;
        job.description = description;
        job.status = status;
        job.tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];
        jobs[jobIndex] = job;
        await saveJobs(jobs);
        await syncPush(`Edit job: ${job.id}`);
        printSuccess(`Job "${job.name}" updated!`);
    }
}
