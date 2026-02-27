import { Command } from '@oclif/core';
export default class Assign extends Command {
    static description: string;
    static args: {
        handle: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        job: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
