import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import ora, { Ora } from 'ora';

// Gradient colors for the logo (cyan → magenta → blue)
const gradientColors = [
    '#06d6a0', '#07c4a8', '#08b2b0', '#0a9fb8',
    '#0b8dc0', '#0d7bc8', '#0e69d0', '#1057d8'
];

export const LOGO_LINES = [
    '  ███╗   ██╗██╗   ██╗██████╗ ██████╗ ██╗    ',
    '  ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║    ',
    '  ██╔██╗ ██║ ╚████╔╝ ██████╔╝██████╔╝██║    ',
    '  ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██╗██║    ',
    '  ██║ ╚████║   ██║   ██████╔╝██████╔╝███████╗',
    '  ╚═╝  ╚═══╝   ╚═╝   ╚═════╝ ╚═════╝ ╚══════╝'
];

export function printLogo(version: string = '1.0.0') {
    console.log('');
    LOGO_LINES.forEach((line, i) => {
        console.log(chalk.hex(gradientColors[i] || gradientColors[gradientColors.length - 1])(line));
    });
    console.log('');
    console.log(chalk.hex('#888')(`         nybbl ventures ${chalk.hex('#555')('·')} ${chalk.hex('#06d6a0')(`v${version}`)}`));
    console.log(chalk.hex('#555')('  ─────────────────────────────────────────'));
    console.log('');
}

export function printSuccess(message: string) {
    console.log(
        boxen(chalk.green(`✅  ${message}`), {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: { top: 1, bottom: 1, left: 2, right: 0 },
            borderStyle: 'round',
            borderColor: 'green',
            dimBorder: true
        })
    );
}

export function printError(message: string) {
    console.log(
        boxen(chalk.red(`❌  ${message}`), {
            padding: { top: 0, bottom: 0, left: 1, right: 1 },
            margin: { top: 1, bottom: 1, left: 2, right: 0 },
            borderStyle: 'round',
            borderColor: 'red',
            dimBorder: true
        })
    );
}

export function printWarning(message: string) {
    console.log(chalk.hex('#f4a261')(`  ⚠  ${message}`));
}

export function printDivider(label?: string) {
    if (label) {
        const line = '─'.repeat(18);
        console.log(chalk.hex('#555')(`  ${line} ${chalk.hex('#06d6a0')(label)} ${line}`));
    } else {
        console.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
    }
}

export function createTable(head: string[]): Table.Table {
    return new Table({
        head: head.map(h => chalk.bold.hex('#06d6a0')(h)),
        chars: {
            'top': '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐',
            'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘',
            'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
            'right': '│', 'right-mid': '┤', 'middle': '│'
        },
        style: {
            head: [],
            border: ['gray'],
            'padding-left': 1,
            'padding-right': 1,
        }
    });
}

export function printBox(title: string, message: string) {
    console.log(boxen(message, {
        title: chalk.bold.hex('#06d6a0')(title),
        padding: 1,
        margin: { top: 1, bottom: 1, left: 2, right: 0 },
        borderStyle: 'round',
        borderColor: '#06d6a0',
        dimBorder: true
    }));
}

export function printHeader(emoji: string, text: string) {
    console.log('');
    console.log(`  ${emoji}  ${chalk.bold.hex('#06d6a0')(text)}`);
    console.log(chalk.hex('#555')('  ' + '─'.repeat(42)));
    console.log('');
}

// ─── Animated Spinner ────────────────────

export function createSpinner(text: string): Ora {
    return ora({
        text: chalk.gray(text),
        spinner: 'dots',
        color: 'cyan',
        indent: 2
    });
}

// ─── Color-coded Streaks ─────────────────

export function formatStreak(streak: number): string {
    if (streak === 0) return chalk.hex('#555')('○ 0');
    if (streak <= 3) return chalk.hex('#888')(`🔥 ${streak}`);
    if (streak <= 7) return chalk.hex('#f4a261')(`🔥 ${streak}`);
    return chalk.hex('#e63946').bold(`🔥 ${streak}`);
}

// ─── Welcome Message (time-based) ────────

export function getWelcomeMessage(handle: string): string {
    const hour = new Date().getHours();
    let greeting: string;
    let emoji: string;

    if (hour >= 5 && hour < 12) {
        greeting = 'Good morning';
        emoji = '☀️';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
        emoji = '🌤️';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'Good evening';
        emoji = '🌅';
    } else if (hour >= 21 && hour < 24) {
        greeting = 'Late night grind';
        emoji = '🌙';
    } else {
        greeting = 'Burning the midnight oil';
        emoji = '🦉';
    }

    return `  ${emoji} ${chalk.hex('#06d6a0')(greeting)}, ${chalk.bold(handle)}!`;
}

// ─── Live Timer Elapsed ──────────────────

export function formatElapsedTimer(startTime: string): string {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);

    const timeStr = hours > 0
        ? `${hours}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
        : `${mins}m ${String(secs).padStart(2, '0')}s`;

    return chalk.hex('#06d6a0').bold(`⏱ ${timeStr}`);
}

// ─── Colored Member Avatars ──────────────

const MEMBER_COLORS = [
    '#06d6a0', '#f4a261', '#e76f51', '#2a9d8f',
    '#e9c46a', '#264653', '#a8dadc', '#457b9d',
    '#f72585', '#7209b7', '#3a0ca3', '#4cc9f0'
];

export function getMemberColor(handle: string): string {
    let hash = 0;
    for (const ch of handle) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
    return MEMBER_COLORS[Math.abs(hash) % MEMBER_COLORS.length];
}

export function colorMember(handle: string, isMe: boolean = false): string {
    const color = getMemberColor(handle);
    const dot = chalk.hex(color)('●');
    const name = chalk.hex(color).bold(handle);
    return isMe ? `${dot} ${name} ${chalk.hex('#06d6a0')('★')}` : `${dot} ${name}`;
}

// ─── Status Bar ─────────────────────────

export function printStatusBar(parts: string[]) {
    const joined = parts.join(chalk.hex('#555')(' · '));
    console.log(chalk.hex('#555')('  │ ') + joined + chalk.hex('#555')(' │'));
    console.log('');
}

// ─── Section Box ───────────────────────

export function printSectionBox(title: string, content: string, borderColor: string = '#06d6a0') {
    console.log(boxen(content, {
        title: chalk.bold.hex(borderColor)(title),
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 0, left: 2, right: 0 },
        borderStyle: 'round',
        borderColor: borderColor,
        dimBorder: true
    }));
}

// ─── Menu Separator ────────────────────

export function menuSeparator(label: string) {
    return { name: chalk.hex('#555')(`── ${chalk.hex('#06d6a0')(label)} ${'─'.repeat(Math.max(0, 28 - label.length))}`), value: '__sep__', disabled: '' };
}
