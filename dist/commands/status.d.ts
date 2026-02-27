import { Command } from '@oclif/core';
export default class Status extends Command {
    static description: string;
    static args: {
        job: import("@oclif/core/lib/interfaces/parser.js").Arg<string | undefined, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
