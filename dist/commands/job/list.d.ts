import { Command } from '@oclif/core';
export default class List extends Command {
    static description: string;
    static flags: {
        all: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
    };
    run(): Promise<void>;
}
