import { Command } from '@oclif/core';
export default class SetConfig extends Command {
    static description: string;
    static args: {
        key: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
        value: import("@oclif/core/lib/interfaces/parser.js").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
