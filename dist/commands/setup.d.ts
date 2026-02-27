import { Command } from '@oclif/core';
export default class Setup extends Command {
    static description: string;
    static aliases: string[];
    run(): Promise<void>;
}
