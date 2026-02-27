import { Command } from '@oclif/core';
export default class Team extends Command {
    static description: string;
    run(): Promise<void>;
}
