import { Command } from '@oclif/core';
export default class StandupView extends Command {
    static description: string;
    run(): Promise<void>;
}
