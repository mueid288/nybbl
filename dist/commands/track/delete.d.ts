import { Command } from '@oclif/core';
export default class Delete extends Command {
    static description: string;
    static args: {
        entryId: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
