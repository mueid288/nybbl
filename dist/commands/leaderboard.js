import { Command } from '@oclif/core';
import { getMembers, getAllTimelogs, getUpdates } from '../lib/store.js';
import { syncPull } from '../lib/sync.js';
import { formatDuration } from '../lib/duration.js';
import chalk from 'chalk';
export default class Leaderboard extends Command {
    static description = 'Weekly leaderboard (hours, updates, streaks)';
    async run() {
        await syncPull();
        const members = await getMembers();
        const allLogs = await getAllTimelogs();
        // Last 7 days dates
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentLogs = allLogs.filter(l => new Date(l.date) >= weekAgo);
        const logsByMember = {};
        for (const l of recentLogs) {
            logsByMember[l.member] = (logsByMember[l.member] || 0) + l.duration;
        }
        const updatesCount = {};
        for (let i = 0; i < 7; i++) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const updates = await getUpdates(d);
            for (const u of updates) {
                updatesCount[u.member] = (updatesCount[u.member] || 0) + 1;
            }
        }
        this.log('\n  🏆 Nybbl Leaderboard — Last 7 Days\n');
        // Sort by hours
        const hourLeaders = members
            .map(m => ({ handle: m.handle, mins: logsByMember[m.handle] || 0 }))
            .sort((a, b) => b.mins - a.mins)
            .slice(0, 3);
        this.log('  HOURS LOGGED:');
        const medals = ['🥇', '🥈', '🥉'];
        hourLeaders.forEach((l, i) => {
            this.log(`  ${medals[i] || '  '} ${chalk.cyan(l.handle.padEnd(10))} — ${formatDuration(l.mins)}`);
        });
        this.log('\n  UPDATES POSTED:');
        const updateLeaders = members
            .map(m => ({ handle: m.handle, count: updatesCount[m.handle] || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
        updateLeaders.forEach((l, i) => {
            this.log(`  ${medals[i] || '  '} ${chalk.cyan(l.handle.padEnd(10))} — ${l.count} updates`);
        });
        this.log('\n  LONGEST STREAK:');
        const streakLeaders = [...members]
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3);
        streakLeaders.forEach((l) => {
            this.log(`  🔥 ${chalk.cyan(l.handle.padEnd(10))} — ${l.streak} days`);
        });
        this.log('');
    }
}
