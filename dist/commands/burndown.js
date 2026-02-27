import { Command } from '@oclif/core';
import { getAllTimelogs } from '../lib/store.js';
import { readIdentity } from '../lib/identity.js';
import { syncPull } from '../lib/sync.js';
import chalk from 'chalk';
export default class Burndown extends Command {
    static description = 'Show an ASCII chart of hours logged this week';
    async run() {
        await syncPull();
        const identity = await readIdentity();
        if (!identity) {
            this.error('Identity not configured.');
        }
        const allLogs = await getAllTimelogs();
        // Get the last 7 days
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = dayNames[d.getDay()];
            const isToday = i === 0;
            const dayLogs = allLogs.filter(l => l.date === dateStr);
            const totalMinutes = dayLogs.reduce((acc, l) => acc + l.duration, 0);
            days.push({
                label: isToday ? chalk.hex('#06d6a0').bold('Today') : chalk.gray(dayName),
                date: dateStr,
                minutes: totalMinutes
            });
        }
        const maxMinutes = Math.max(...days.map(d => d.minutes), 60); // min scale = 1h
        const barWidth = 30;
        this.log('');
        this.log(`  ${chalk.bold.hex('#06d6a0')('📊 Weekly Burndown')} ${chalk.gray('— Last 7 Days')}`);
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        this.log('');
        for (const day of days) {
            const hours = Math.floor(day.minutes / 60);
            const mins = day.minutes % 60;
            const timeStr = day.minutes > 0 ? `${hours}h ${mins}m` : '';
            const filled = Math.round((day.minutes / maxMinutes) * barWidth);
            const empty = barWidth - filled;
            const bar = filled > 0
                ? chalk.hex('#06d6a0')('█'.repeat(filled)) + chalk.hex('#333')('░'.repeat(empty))
                : chalk.hex('#333')('░'.repeat(barWidth));
            this.log(`  ${day.label.padEnd(12)} ${bar}  ${chalk.gray(timeStr)}`);
        }
        // Weekly total
        const totalMinutes = days.reduce((acc, d) => acc + d.minutes, 0);
        const totalH = Math.floor(totalMinutes / 60);
        const totalM = totalMinutes % 60;
        this.log('');
        this.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
        this.log(`  ${chalk.gray('Total:')} ${chalk.bold.hex('#06d6a0')(`${totalH}h ${totalM}m`)} ${chalk.gray('this week')}`);
        this.log('');
    }
}
