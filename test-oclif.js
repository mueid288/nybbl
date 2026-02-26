import { Config } from '@oclif/core';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const config = await Config.load({root: __dirname});
  console.log("Testing job:add...");
  try {
    await config.runCommand('job:add');
    console.log("job:add SUCCESS");
  } catch(e) { console.log(e.message); }

  console.log("Testing job add...");
  try {
    await config.runCommand('job add');
    console.log("job add SUCCESS");
  } catch(e) { console.log(e.message); }
}
main();
