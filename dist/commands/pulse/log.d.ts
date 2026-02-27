import { Command } from '@oclif/core';
export default class Log extends Command {
    static description: string;
    static flags: {
        date: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
