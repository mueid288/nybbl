export interface ActiveTimer {
    job: string;
    startTime: string;
}
export declare function getActiveTimer(): Promise<ActiveTimer | null>;
export declare function setActiveTimer(timer: ActiveTimer | null): Promise<void>;
