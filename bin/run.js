#!/usr/bin/env node
import { execute } from '@oclif/core';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Intercept empty calls and route to dashboard natively
if (process.argv.length === 2 && !process.argv.includes('--help') && !process.argv.includes('-h')) {
    process.argv.push('dashboard');
}

execute({ dir: __dirname }).catch((error) => {
    console.error(error);
    process.exit(1);
});
