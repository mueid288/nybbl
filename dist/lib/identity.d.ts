export interface NybblRc {
    name: string;
    handle: string;
    dataRepo: string;
    autoSync?: boolean;
    defaultJob?: string;
    theme?: string;
}
export declare function readIdentity(): Promise<NybblRc | null>;
export declare function saveIdentity(config: NybblRc): Promise<void>;
