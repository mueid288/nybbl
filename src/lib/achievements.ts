import chalk from 'chalk';
import { Member, TimeEntry, PulseUpdate } from '../types/index.js';

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

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_pulse',
        name: 'First Pulse',
        emoji: '🏅',
        description: 'Logged your first daily update',
        check: (d) => d.totalPulses >= 1
    },
    {
        id: 'first_log',
        name: 'Time Keeper',
        emoji: '⏰',
        description: 'Logged time for the first time',
        check: (d) => d.totalTimelogs >= 1
    },
    {
        id: 'streak_3',
        name: 'On a Roll',
        emoji: '🔥',
        description: '3-day activity streak',
        check: (d) => d.member.streak >= 3
    },
    {
        id: 'streak_7',
        name: 'Weekly Warrior',
        emoji: '⚔️',
        description: '7-day activity streak',
        check: (d) => d.member.streak >= 7
    },
    {
        id: 'streak_14',
        name: 'Unstoppable',
        emoji: '💪',
        description: '14-day activity streak',
        check: (d) => d.member.streak >= 14
    },
    {
        id: 'hours_10',
        name: 'Getting Started',
        emoji: '🚀',
        description: 'Logged 10+ hours total',
        check: (d) => d.totalHours >= 10
    },
    {
        id: 'hours_50',
        name: 'Dedicated',
        emoji: '💎',
        description: 'Logged 50+ hours total',
        check: (d) => d.totalHours >= 50
    },
    {
        id: 'hours_100',
        name: '100 Hours Club',
        emoji: '💯',
        description: 'Logged 100+ hours total',
        check: (d) => d.totalHours >= 100
    },
    {
        id: 'pulses_10',
        name: 'Communicator',
        emoji: '💬',
        description: 'Posted 10+ pulse updates',
        check: (d) => d.totalPulses >= 10
    },
    {
        id: 'pulses_50',
        name: 'Town Crier',
        emoji: '📢',
        description: 'Posted 50+ pulse updates',
        check: (d) => d.totalPulses >= 50
    },
];

export function getUnlockedAchievements(data: AchievementData): Achievement[] {
    return ACHIEVEMENTS.filter(a => a.check(data));
}

export function getLockedAchievements(data: AchievementData): Achievement[] {
    return ACHIEVEMENTS.filter(a => !a.check(data));
}

export function formatAchievementBadges(unlocked: Achievement[]): string {
    if (unlocked.length === 0) return chalk.gray('No badges yet — keep going!');
    return unlocked.map(a => a.emoji).join(' ');
}

export function formatAchievementList(unlocked: Achievement[], locked: Achievement[]): string {
    const lines: string[] = [];

    if (unlocked.length > 0) {
        lines.push(chalk.hex('#06d6a0').bold('  Unlocked:'));
        for (const a of unlocked) {
            lines.push(`    ${a.emoji}  ${chalk.bold(a.name)} ${chalk.gray('—')} ${chalk.gray(a.description)}`);
        }
    }

    if (locked.length > 0) {
        lines.push('');
        lines.push(chalk.hex('#555').bold('  Locked:'));
        for (const a of locked) {
            lines.push(`    ${chalk.hex('#555')('🔒')}  ${chalk.hex('#555')(a.name)} ${chalk.hex('#444')('—')} ${chalk.hex('#444')(a.description)}`);
        }
    }

    return lines.join('\n');
}
