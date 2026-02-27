import { Command } from '@oclif/core';
export default class Dashboard extends Command {
    static description: string;
    run(): Promise<void>;
}
