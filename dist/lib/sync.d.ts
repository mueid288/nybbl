import { SimpleGit } from 'simple-git';
export declare function getGit(): Promise<SimpleGit>;
export declare function syncPull(): Promise<void>;
export declare function syncPush(message: string): Promise<void>;
