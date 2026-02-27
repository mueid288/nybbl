import { Command } from '@oclif/core';
import chalk from 'chalk';
const QUOTES = [
    "Code represents your thoughts. Be clear.",
    "Make it work, make it right, make it fast.",
    "First, solve the problem. Then, write the code.",
    "The best error message is the one that never shows up.",
    "Simplicity is the soul of efficiency.",
    "Talk is cheap. Show me the code.",
    "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.",
    "It’s not a bug, it’s an undocumented feature.",
    "There are two ways to write error-free programs; only the third one works.",
    "Software and cathedrals are much the same – first we build them, then we pray."
];
export default class Motivation extends Command {
    static description = 'Get a random motivational quote';
    async run() {
        const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        this.log(`\n  💡 ${chalk.italic.cyan(`"${quote}"`)}\n`);
    }
}
