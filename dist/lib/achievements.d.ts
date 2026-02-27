import { Member } from '../types/index.js';
export interface Achievement {
    id: string;
    name: string;
    emoji: string;
    description: string;
    check: (data: AchievementData) => boolean;
}
interface AchievementData {
    member: Member;
    totalHours: number;
    totalPulses: number;
    totalTimelogs: number;
}
export declare function getUnlockedAchievements(data: AchievementData): Achievement[];
export declare function getLockedAchievements(data: AchievementData): Achievement[];
export declare function formatAchievementBadges(unlocked: Achievement[]): string;
export declare function formatAchievementList(unlocked: Achievement[], locked: Achievement[]): string;
export {};
