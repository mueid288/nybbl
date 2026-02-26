# nybbl

Take a byte out of the boring stuff. 🧩

A CLI tool for the Nybbl Venture team to track hours, jobs, and daily pulse updates right from your terminal.

## Setup & First Run

Before you start, make sure you have cloned the shared `nybbl-data` repository to your local machine:
\`\`\`sh
git clone git@github.com:nybbl-venture/nybbl-data.git ~/nybbl-data
\`\`\`

Install the CLI globally (assuming you build it or link it):
\`\`\`sh
npm install
npm run build
npm link
\`\`\`

Run the setup wizard:
\`\`\`sh
nybbl
\`\`\`
It will prompt you for your name, a handle, and the location of your data repo. Your configuration is saved to `~/.nybblrc`.

## Usage & Commands

Typing \`nybbl\` natively boots up your dashboard where you can see your active jobs and an interactive menu.

**Jobs:**
- \`nybbl job add\` — Add a new job
- \`nybbl job list\` — List all active jobs
- \`nybbl job info <id>\` — View details and assigned members
- \`nybbl job edit <id>\` — Edit a job
- \`nybbl job archive <id>\` — Archive an old job
- \`nybbl job delete <id>\` — Delete a job completely

**Members:**
- \`nybbl member add\` — Re-register a member or add a teammate
- \`nybbl member list\` — List everyone on the team
- \`nybbl member remove <handle>\` — Delete a member

**Assignments:**
- \`nybbl assign <handle> <jobId>\` — Put a member on a job
- \`nybbl unassign <handle> <jobId>\` — Kick a member off a job
- \`nybbl whoami\` — Show your own assignments and job details

**Time Tracking:**
- \`nybbl track start <jobId>\` — Start a live timer for a job
- \`nybbl track stop\` — Stop the live timer and log hours
- \`nybbl track add 1h30m --job <jobId>\` — Manually log past hours
- \`nybbl track log\` — See your personal time log history

**Updates & Sync:**
- \`nybbl pulse\` — Interactively log a daily progress update
- \`nybbl pulse log\` — See all team pulse updates
- \`nybbl status\` — See a full matrix of who's doing what
- \`nybbl report\` — Generate hours/metrics over time (supports --today, --week, --month, --export)

**Fun:**
- \`nybbl leaderboard\` — Weekly leaderboard rankings!
- \`nybbl streak\` — View your current coding streak!
- \`nybbl motivation\` — Get a quick developer quote.
- \`nybbl vibes\` — See who is burning the midnight oil and who's slacking.

Everything automatically synchronizes via Git in the background!
