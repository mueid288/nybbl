# 🧩 nybbl — Product Requirements Document (PRD)

**Product Name:** nybbl
**Team:** Nybbl Venture
**Version:** 1.0
**Date:** February 26, 2026
**Status:** Draft

---

## 1. Overview

**nybbl** is an internal CLI tool for the Nybbl Venture team — a dev team of 6–15 members that works across multiple client jobs simultaneously. The boss takes on contracts from different clients (wallets, social media apps, AI bots, etc.) and distributes tasks among team members.

The tool solves the team's core pain points: tracking hours and progress across multiple client jobs, knowing who's assigned where, and eliminating the chaos of manual assignment via chat/call.

### Tagline
> *"Take a byte out of the boring stuff."*

---

## 2. Problem Statement

| Problem | Current State | Impact |
|---------|--------------|--------|
| No centralized job tracking | Boss assigns via chat/call, no record | Tasks get lost, duplicated, or forgotten |
| No time tracking | No visibility into hours spent per job | Can't bill clients accurately, no accountability |
| Context switching confusion | Members on 1–3 jobs don't know what's current | Wasted time figuring out "where was I?" |
| No team visibility | Nobody knows who's working on what | Boss has to manually check in with everyone |
| No progress history | Updates are scattered across Slack/WhatsApp | Weekly recaps are guesswork |

---

## 3. Solution

A **Node.js CLI tool** that runs in the terminal, stores data as **local JSON files synced via a shared Git repo**, and provides every team member with:

- A list of all active jobs and who's assigned
- A personal dashboard of their assignments
- Time tracking with start/stop timers and manual entry
- Progress logging (quick daily updates)
- Team-wide status and reporting

---

## 4. Architecture

### 4.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (v18+) |
| CLI Framework | oclif (Salesforce's CLI framework) |
| Interactive Prompts | @inquirer/prompts |
| Terminal UI | chalk, cli-table3, ora (spinners), boxen |
| Data Storage | Local JSON files |
| Data Sync | Git (shared repo — `nybbl-data`) |
| Package Manager | npm |

### 4.2 Data Storage Design

All data lives in a **shared Git repository** called `nybbl-data`. Every team member clones this repo. The CLI reads/writes JSON files and auto-commits + pushes changes.

```
nybbl-data/
├── jobs.json            # All registered jobs
├── members.json         # All team members
├── assignments.json     # Who is assigned to which job
├── timelogs/
│   ├── ali.json         # Ali's time entries
│   ├── sara.json        # Sara's time entries
│   └── ...
├── updates/
│   ├── 2026-02-26.json  # Daily progress updates
│   └── ...
└── config.json          # Team-level config
```

### 4.3 Sync Strategy

| Action | Behavior |
|--------|----------|
| Any read command (`nybbl`, `nybbl status`, etc.) | Auto `git pull` before displaying data |
| Any write command (`nybbl track`, `nybbl pulse`, etc.) | Auto `git pull`, write file, `git add + commit + push` |
| Offline mode | Writes locally, syncs on next online command |
| Conflicts | JSON merge strategy (last-write-wins per field) |

### 4.4 Identity System

- **No authentication.** No passwords, no tokens.
- On first run, user sets their **name** and **handle** (e.g., `@ali`).
- Stored locally at `~/.nybblrc` as JSON.
- Handle is used to identify the user across all data files.
- Any member can add/edit jobs, assign people, and log time — **fully flat, trust-based system.**
- The person who creates a job is tagged as **"owner"** (informational only, no permission lock).

---

## 5. User Personas

### The Boss
- Takes on client contracts
- Needs to assign jobs to team members
- Wants visibility into hours and progress across all jobs
- Runs `nybbl status` and `nybbl report` frequently

### The Developer (Team Member)
- Works on 1–3 client jobs at a time
- Needs to track hours per job
- Wants a quick way to log daily progress
- Runs `nybbl`, `nybbl track`, and `nybbl pulse` daily

---

## 6. User Flow

### 6.1 First-Time Setup

```
$ npm install -g nybbl

$ nybbl

  ███╗   ██╗██╗   ██╗██████╗ ██████╗ ██╗
  ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║
  ██╔██╗ ██║ ╚████╔╝ ██████╔╝██████╔╝██║
  ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██╗██║
  ██║ ╚████║   ██║   ██████╔╝██████╔╝███████╗
  ╚═╝  ╚═══╝   ╚═╝   ╚═════╝ ╚═════╝ ╚══════╝
                    nybbl venture · v1.0.0

  Welcome to nybbl! Let's get you set up.

  ? What's your name? Ali Hassan
  ? Pick a handle: @ali
  ? Path to nybbl-data repo: ~/projects/nybbl-data

  ✅ You're all set, @ali! Type `nybbl` to get started.
```

### 6.2 Returning User — Home Screen

```
$ nybbl

  ███╗   ██╗██╗   ██╗██████╗ ██████╗ ██╗
  ...
                    nybbl venture · v1.0.0

  👋 Hey @ali! You're on 2 active jobs.

  ┌──────────────────┬─────────────┬────────────┐
  │ Job              │ Today       │ This Week  │
  ├──────────────────┼─────────────┼────────────┤
  │ 💼 Wallet App    │ 2h 15m      │ 12h 30m    │
  │ 🤖 AI Call Bot   │ ⏱️ running   │ 8h 45m     │
  └──────────────────┴─────────────┴────────────┘

  ? What do you want to do?
  ❯ ⏱️  Track time
    📋  My jobs
    📊  View report
    💬  Log an update
    👥  Team status
    ➕  Add a job
    👤  Manage members
    ⚙️  Settings
```

---

## 7. Commands Reference

### 7.1 Root Command

| Command | Description |
|---------|-------------|
| `nybbl` | Shows ASCII logo, personal dashboard, and interactive menu |

### 7.2 Job Management

| Command | Description |
|---------|-------------|
| `nybbl job add` | Interactive wizard to create a new job |
| `nybbl job list` | List all active jobs with member count and total hours |
| `nybbl job info <job>` | Detailed view of a job: assigned members, hours, recent updates |
| `nybbl job edit <job>` | Edit job name, client, status, description |
| `nybbl job archive <job>` | Mark a job as archived (hides from active list) |
| `nybbl job delete <job>` | Remove a job (with confirmation prompt) |

**Job Data Schema:**
```json
{
  "id": "wallet-app",
  "name": "Wallet App",
  "client": "XYZ Corp",
  "description": "Mobile wallet with crypto support",
  "status": "active",
  "owner": "@ali",
  "createdAt": "2026-02-01T10:00:00Z",
  "tags": ["mobile", "fintech"]
}
```

**Example Flow:**
```
$ nybbl job add

  ➕ New Job

  ? Job name: Wallet App
  ? Client name: XYZ Corp
  ? Short description: Mobile wallet with crypto support
  ? Tags (comma-separated): mobile, fintech

  ✅ Job "Wallet App" created! (id: wallet-app)
     Owner: @ali
```

### 7.3 Member Management

| Command | Description |
|---------|-------------|
| `nybbl member add` | Add a new team member |
| `nybbl member list` | List all members with their current job assignments |
| `nybbl member remove <handle>` | Remove a member (with confirmation) |

### 7.4 Assignment

| Command | Description |
|---------|-------------|
| `nybbl assign <handle> <job>` | Assign a member to a job |
| `nybbl unassign <handle> <job>` | Remove a member from a job |
| `nybbl whoami` | Show your assigned jobs and active timers |

**Example:**
```
$ nybbl assign @sara wallet-app

  ✅ @sara assigned to "Wallet App"

$ nybbl whoami

  👤 @ali — Ali Hassan

  Active Jobs:
  ┌──────────────────┬────────────┬────────────┐
  │ Job              │ Role       │ Since      │
  ├──────────────────┼────────────┼────────────┤
  │ 💼 Wallet App    │ Owner      │ Feb 1      │
  │ 🤖 AI Call Bot   │ Member     │ Feb 10     │
  └──────────────────┴────────────┴────────────┘
```

### 7.5 Time Tracking

| Command | Description |
|---------|-------------|
| `nybbl track start <job>` | Start a timer for a job |
| `nybbl track stop` | Stop the active timer |
| `nybbl track add <duration> --job <job>` | Manual time entry (e.g., `3h`, `45m`, `1h30m`) |
| `nybbl track log` | View your time log (today, this week, or custom range) |
| `nybbl track edit <entry-id>` | Edit a time entry |
| `nybbl track delete <entry-id>` | Delete a time entry |

**Time Entry Schema:**
```json
{
  "id": "t_20260226_001",
  "member": "@ali",
  "job": "wallet-app",
  "date": "2026-02-26",
  "startTime": "09:00",
  "endTime": "11:30",
  "duration": 150,
  "note": "Implemented auth flow",
  "type": "timer"
}
```

**Example Flow:**
```
$ nybbl track start wallet-app

  ⏱️ Timer started for "Wallet App" at 9:00 AM

  ... (2 hours later) ...

$ nybbl track stop

  ⏱️ Timer stopped.

  ┌──────────────────┬─────────┬──────────────────────┐
  │ Job              │ Time    │ Note                  │
  ├──────────────────┼─────────┼──────────────────────┤
  │ 💼 Wallet App    │ 2h 00m  │ (no note)             │
  └──────────────────┴─────────┴──────────────────────┘

  ? Add a note? Implemented auth flow
  ✅ Logged 2h 00m to "Wallet App"

$ nybbl track add 1h30m --job ai-bot --note "Fixed voice API latency"

  ✅ Logged 1h 30m to "AI Call Bot"
```

### 7.6 Progress Updates (Pulse)

| Command | Description |
|---------|-------------|
| `nybbl pulse` | Interactive daily update prompt |
| `nybbl pulse "<message>" --job <job>` | Quick one-liner update |
| `nybbl pulse log` | View recent updates (yours or team-wide) |

**Example:**
```
$ nybbl pulse "Deployed auth module to staging" --job wallet-app

  💬 Update logged for "Wallet App"!

$ nybbl pulse

  💬 Daily Pulse — Feb 26, 2026

  ? Which job? (select)
  ❯ Wallet App
    AI Call Bot

  ? What did you do? Deployed auth module to staging
  ? Any blockers? Waiting on design for dashboard

  ✅ Pulse logged!
```

### 7.7 Team Status

| Command | Description |
|---------|-------------|
| `nybbl status` | Team-wide overview: who's working on what, active timers |
| `nybbl status <job>` | Status of a specific job |

**Example:**
```
$ nybbl status

  👥 Nybbl Venture — Team Status

  ┌─────────┬──────────────────┬───────────┬──────────────────────────┐
  │ Member  │ Current Job      │ Today     │ Last Update              │
  ├─────────┼──────────────────┼───────────┼──────────────────────────┤
  │ @ali    │ 🤖 AI Call Bot   │ ⏱️ 1h 20m │ Fixed voice API latency  │
  │ @sara   │ 💼 Wallet App    │ 3h 15m    │ Auth module deployed     │
  │ @usman  │ 📱 Social App    │ 0h 00m    │ (no updates today)       │
  │ @hina   │ 💼 Wallet App    │ 2h 45m    │ Payment gateway testing  │
  └─────────┴──────────────────┴───────────┴──────────────────────────┘

  Active Jobs: 3 | Total Hours Today: 7h 20m
```

### 7.8 Reports

| Command | Description |
|---------|-------------|
| `nybbl report` | Interactive report builder |
| `nybbl report --today` | Today's summary |
| `nybbl report --week` | This week's report |
| `nybbl report --month` | This month's report |
| `nybbl report --job <job>` | Report filtered by job |
| `nybbl report --member <handle>` | Report filtered by member |
| `nybbl report --export csv` | Export report as CSV |
| `nybbl report --export json` | Export report as JSON |

**Example:**
```
$ nybbl report --week

  📊 Weekly Report — Feb 20–26, 2026

  BY JOB:
  ┌──────────────────┬──────────┬──────────┬────────────┐
  │ Job              │ Members  │ Hours    │ Updates    │
  ├──────────────────┼──────────┼──────────┼────────────┤
  │ 💼 Wallet App    │ 3        │ 42h 30m  │ 12         │
  │ 🤖 AI Call Bot   │ 2        │ 28h 15m  │ 8          │
  │ 📱 Social App    │ 2        │ 18h 00m  │ 5          │
  └──────────────────┴──────────┴──────────┴────────────┘

  BY MEMBER:
  ┌──────────┬──────────┬───────────────────────────────┐
  │ Member   │ Hours    │ Jobs                          │
  ├──────────┼──────────┼───────────────────────────────┤
  │ @ali     │ 24h 15m  │ Wallet App, AI Call Bot       │
  │ @sara    │ 20h 30m  │ Wallet App                    │
  │ @usman   │ 18h 00m  │ Social App                    │
  │ @hina    │ 26h 00m  │ Wallet App, Social App        │
  └──────────┴──────────┴───────────────────────────────┘

  Total: 88h 45m across 3 jobs
```

### 7.9 Settings

| Command | Description |
|---------|-------------|
| `nybbl config` | View current config |
| `nybbl config set <key> <value>` | Update a config value |
| `nybbl config reset` | Reset to defaults |

**Configurable Options:**
| Key | Default | Description |
|-----|---------|-------------|
| `name` | (set on first run) | Display name |
| `handle` | (set on first run) | Unique handle |
| `dataRepo` | `~/nybbl-data` | Path to shared data repo |
| `autoSync` | `true` | Auto git pull/push on commands |
| `defaultJob` | `null` | Default job for quick tracking |
| `theme` | `default` | Color theme (default, minimal, neon) |

---

## 8. Fun Features & Easter Eggs 🎉

| Command | Description |
|---------|-------------|
| `nybbl motivation` | Random motivational/dev quote |
| `nybbl leaderboard` | Weekly leaderboard: most hours, most updates, longest streak |
| `nybbl streak` | Your current logging streak ("🔥 5 days!") |
| `nybbl vibes` | Team vibe check — who's busy, who's free, who's on fire |

### Streak System
- Logging time or a pulse update counts as a "day"
- Consecutive days build a streak: 🔥
- Milestones: 5, 10, 25, 50, 100 days
- Shows on your dashboard and leaderboard

### Leaderboard
```
$ nybbl leaderboard

  🏆 Nybbl Leaderboard — This Week

  HOURS LOGGED:
  🥇 @hina    — 26h 00m
  🥈 @ali     — 24h 15m
  🥉 @sara    — 20h 30m

  UPDATES POSTED:
  🥇 @ali     — 8 updates
  🥈 @sara    — 6 updates
  🥉 @hina    — 5 updates

  LONGEST STREAK:
  🔥 @ali     — 12 days
  🔥 @sara    — 9 days
  🔥 @usman   — 5 days
```

---

## 9. Data Schemas

### members.json
```json
[
  {
    "handle": "@ali",
    "name": "Ali Hassan",
    "joinedAt": "2026-02-01T00:00:00Z",
    "streak": 12
  }
]
```

### jobs.json
```json
[
  {
    "id": "wallet-app",
    "name": "Wallet App",
    "client": "XYZ Corp",
    "description": "Mobile wallet with crypto support",
    "status": "active",
    "owner": "@ali",
    "createdAt": "2026-02-01T10:00:00Z",
    "tags": ["mobile", "fintech"]
  }
]
```

### assignments.json
```json
[
  {
    "member": "@ali",
    "job": "wallet-app",
    "assignedAt": "2026-02-01T10:00:00Z",
    "assignedBy": "@ali"
  }
]
```

### timelogs/ali.json
```json
[
  {
    "id": "t_20260226_001",
    "job": "wallet-app",
    "date": "2026-02-26",
    "startTime": "09:00",
    "endTime": "11:30",
    "duration": 150,
    "note": "Implemented auth flow",
    "type": "timer"
  }
]
```

### updates/2026-02-26.json
```json
[
  {
    "member": "@ali",
    "job": "wallet-app",
    "message": "Deployed auth module to staging",
    "blocker": "Waiting on design for dashboard",
    "timestamp": "2026-02-26T17:30:00Z"
  }
]
```

### config.json (team-level)
```json
{
  "teamName": "Nybbl Venture",
  "version": "1.0.0",
  "createdAt": "2026-02-01T00:00:00Z"
}
```

---

## 10. Installation & Setup

### Prerequisites
- Node.js v18+
- Git
- Access to the shared `nybbl-data` Git repository

### Install
```bash
npm install -g nybbl
```

### First Run
```bash
# 1. Clone the shared data repo
git clone git@github.com:nybbl-venture/nybbl-data.git ~/nybbl-data

# 2. Run nybbl — it will walk you through setup
nybbl
```

---

## 11. Project Structure (CLI Codebase)

```
nybbl/
├── package.json
├── bin/
│   └── run.js                  # Entry point
├── src/
│   ├── commands/
│   │   ├── index.ts            # Root command (dashboard + menu)
│   │   ├── job/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   ├── info.ts
│   │   │   ├── edit.ts
│   │   │   ├── archive.ts
│   │   │   └── delete.ts
│   │   ├── member/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   └── remove.ts
│   │   ├── assign.ts
│   │   ├── unassign.ts
│   │   ├── whoami.ts
│   │   ├── track/
│   │   │   ├── start.ts
│   │   │   ├── stop.ts
│   │   │   ├── add.ts
│   │   │   ├── log.ts
│   │   │   ├── edit.ts
│   │   │   └── delete.ts
│   │   ├── pulse/
│   │   │   ├── index.ts        # Interactive pulse
│   │   │   └── log.ts
│   │   ├── status.ts
│   │   ├── report.ts
│   │   ├── config.ts
│   │   ├── leaderboard.ts
│   │   ├── streak.ts
│   │   ├── motivation.ts
│   │   └── vibes.ts
│   ├── lib/
│   │   ├── store.ts            # JSON read/write layer
│   │   ├── sync.ts             # Git pull/push logic
│   │   ├── identity.ts         # User identity (~/.nybblrc)
│   │   ├── timer.ts            # Active timer management
│   │   ├── duration.ts         # Parse/format durations
│   │   ├── display.ts          # Tables, boxes, ASCII art
│   │   └── quotes.ts           # Motivational quotes
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── test/
│   └── ...
└── README.md
```

---

## 12. Milestones & Phases

### Phase 1 — MVP (Week 1–2)
- [ ] Project setup (oclif, TypeScript)
- [ ] First-run setup wizard (name, handle, data repo path)
- [ ] Root command (ASCII logo + dashboard + interactive menu)
- [ ] `nybbl job add / list / info`
- [ ] `nybbl member add / list`
- [ ] `nybbl assign / unassign / whoami`
- [ ] `nybbl track start / stop / add / log`
- [ ] Local JSON storage layer
- [ ] Git auto-sync (pull before read, commit+push after write)

### Phase 2 — Daily Use (Week 3)
- [ ] `nybbl pulse` (progress updates)
- [ ] `nybbl status` (team dashboard)
- [ ] `nybbl report` (with filters and date ranges)
- [ ] Streak system
- [ ] Export to CSV/JSON

### Phase 3 — Fun & Polish (Week 4)
- [ ] `nybbl leaderboard`
- [ ] `nybbl motivation`
- [ ] `nybbl vibes`
- [ ] Color themes
- [ ] Tab auto-completion
- [ ] Error handling & edge cases
- [ ] README & onboarding docs

### Phase 4 — Future (Optional)
- [ ] Slack integration (post pulse updates to a channel)
- [ ] Web dashboard (read-only view of data)
- [ ] API server (replace Git sync with real-time API)
- [ ] Mobile notifications

---

## 13. Success Metrics

| Metric | Target |
|--------|--------|
| Daily active users | 80%+ of team uses nybbl daily |
| Time logged | Every member logs time every working day |
| Pulse updates | At least 1 update per member per day |
| Report generation | Boss generates weekly report in <10 seconds |
| Setup time | New member up and running in <5 minutes |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Git merge conflicts on JSON | Use per-member files for timelogs; shallow data structures |
| Team forgets to log time | Streak system + leaderboard gamification |
| Too many commands to remember | Interactive menu on bare `nybbl` command |
| Offline/no internet | Local-first design; syncs when back online |
| Handle collisions | Enforce unique handles in members.json |

---

## 15. Non-Goals (Out of Scope for v1)

- No web UI or mobile app
- No real-time collaboration or live updates
- No integration with external project management tools (Jira, Linear)
- No invoicing or billing features
- No role-based access control
- No database or API server

---

*Built with ❤️ by Nybbl Venture*