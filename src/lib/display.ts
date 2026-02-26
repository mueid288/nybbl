import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';

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
