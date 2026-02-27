import { Command } from '@oclif/core';
export default class Streak extends Command {
    static description: string;
    run(): Promise<void>;
}
