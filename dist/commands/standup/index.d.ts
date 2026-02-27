import { Command } from '@oclif/core';
export default class Standup extends Command {
    static description: string;
    run(): Promise<void>;
}
