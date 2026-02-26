export interface Member {
    handle: string;
    name: string;
    joinedAt: string;
    streak: number;
}

export interface Job {
    id: string;
    name: string;
    client: string;
    description: string;
    status: 'active' | 'archived';
    owner: string;
    createdAt: string;
    tags: string[];
}

export interface Assignment {
    member: string;
    job: string;
    assignedAt: string;
    assignedBy: string;
}

export interface TimeEntry {
    id: string;
    member: string;
    job: string;
    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:MM (24-hour)
    endTime: string;    // HH:MM (24-hour)
    duration: number;   // Minutes
    note: string;
    type: 'timer' | 'manual';
}

export interface PulseUpdate {
    member: string;
    job: string;
    message: string;
    blocker?: string;
    timestamp: string;  // ISO string
}

export interface TeamConfig {
    teamName: string;
    version: string;
    createdAt: string;
}

export interface LocalConfig {
    name: string;
    handle: string;
    dataRepo: string;
    autoSync: boolean;
    defaultJob?: string;
    theme: 'default' | 'minimal' | 'neon';
}
