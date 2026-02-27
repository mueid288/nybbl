import { Command } from '@oclif/core';
export default class Report extends Command {
    static description: string;
    static flags: {
        today: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        week: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        month: import("@oclif/core/lib/interfaces/parser.js").BooleanFlag<boolean>;
        job: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        member: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        export: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
