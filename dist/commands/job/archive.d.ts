import { Command } from '@oclif/core';
export default class Archive extends Command {
    static description: string;
    static args: {
        job: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
