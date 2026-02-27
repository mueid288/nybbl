import { Command } from '@oclif/core';
export default class List extends Command {
    static description: string;
    run(): Promise<void>;
}
