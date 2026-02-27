# nybbl 🧩

> Take a byte out of the boring stuff.

A beautiful CLI tool for teams to track hours, log standups, and stay in sync — right from your terminal.

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⏱️ **Time Tracking** | Start/stop timers or log hours manually |
| 🧍 **Daily Standups** | Yesterday / Today / Blockers — once per day |
| 📊 **Burndown Chart** | ASCII chart of hours logged this week |
| 🏆 **Achievements** | 10 unlockable badges for milestones |
| 👥 **Teams** | Members grouped by shared job |
| 🚨 **Blocker Alerts** | See teammate blockers on your dashboard |
| 🔥 **Streaks** | Color-coded activity streaks |
| ☀️ **Smart Greetings** | Time-of-day welcome messages |
| 🔄 **Auto Sync** | Git-based data sync with animated spinners |

## 🚀 Install

### Prerequisites

- **Node.js** v18 or higher — [download here](https://nodejs.org/)
- **Git** — [download here](https://git-scm.com/downloads)

### macOS / Linux

```bash
git clone https://github.com/mueid288/nybbl.git
cd nybbl
npm install
npm run build
npm link
```

### Windows (PowerShell)

```powershell
git clone https://github.com/mueid288/nybbl.git
cd nybbl
npm install
npm run build
npm link
```

### First Run

```bash
nybbl
```

The setup wizard will ask for your name, handle, and automatically clone the shared data repo.

---

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `permission denied` on macOS | Run `sudo npm link` instead of `npm link` |
| `nybbl not recognized` on Windows | Close and reopen PowerShell after `npm link` |
| `execution policy` error on Windows | Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| `tsc: command not found` | Run `npm install` first — TypeScript is included |

## 📸 Dashboard

```
  ███╗   ██╗██╗   ██╗██████╗ ██████╗ ██╗
  ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██║
  ██╔██╗ ██║ ╚████╔╝ ██████╔╝██████╔╝██║
  ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██╗██║
  ██║ ╚████║   ██║   ██████╔╝██████╔╝███████╗
  ╚═╝  ╚═══╝   ╚═╝   ╚═════╝ ╚═════╝ ╚══════╝

  ✔ Data synced
  ☀️ Good morning, @mueid!

  │ 🟢 Online · 📋 1 job · 🔥 4 · ⏱ 24m 16s │

  ── Work ────────────────────────
    ⏱️  Track time
    🧍  Daily standup
    💬  Log an update
  ── Insights ────────────────────
    📊  Burndown chart
    📈  View report
    🏆  My badges
  ── Team ────────────────────────
    📜  View standups
    👥  My team
    🌐  Team status
```

## 📖 Commands

### Work
| Command | Description |
|---------|-------------|
| `nybbl track start` | Start a timer (interactive job picker) |
| `nybbl track stop` | Stop timer and log the hours |
| `nybbl track add` | Manually log past hours |
| `nybbl track log` | View your time log history |
| `nybbl standup` | Log your daily standup |
| `nybbl pulse` | Post a quick update |

### Insights
| Command | Description |
|---------|-------------|
| `nybbl burndown` | ASCII chart of hours this week |
| `nybbl report` | Hours/metrics report (--today, --week, --month) |
| `nybbl badges` | View your achievements and unlocked badges |

### Team
| Command | Description |
|---------|-------------|
| `nybbl standup view` | See today's standups from everyone |
| `nybbl team` | View teams grouped by job |
| `nybbl status` | Full team status matrix |
| `nybbl leaderboard` | Weekly leaderboard rankings |

### Manage
| Command | Description |
|---------|-------------|
| `nybbl job add` | Create a new job |
| `nybbl job list` | List all jobs |
| `nybbl job info <id>` | View job details |
| `nybbl assign <handle> <job>` | Assign a member to a job |
| `nybbl member add` | Add a teammate |
| `nybbl member list` | List all members |

### Fun
| Command | Description |
|---------|-------------|
| `nybbl streak` | View your activity streak 🔥 |
| `nybbl motivation` | Get a dev quote |
| `nybbl vibes` | See who's grinding and who's chilling |

## 🏆 Achievements

| Badge | Name | How to Unlock |
|-------|------|---------------|
| 🏅 | First Pulse | Log your first update |
| ⏰ | Time Keeper | Log time for the first time |
| 🔥 | On a Roll | 3-day streak |
| ⚔️ | Weekly Warrior | 7-day streak |
| 💪 | Unstoppable | 14-day streak |
| 🚀 | Getting Started | 10+ hours logged |
| 💎 | Dedicated | 50+ hours logged |
| 💯 | 100 Hours Club | 100+ hours logged |
| 💬 | Communicator | 10+ pulse updates |
| 📢 | Town Crier | 50+ pulse updates |

## 🔧 How It Works

All data lives in a shared Git repo (`nybbl-data`):

```
nybbl-data/
├── members.json        # Team members
├── jobs.json           # Projects / ventures
├── assignments.json    # Who works on what
├── timelogs/
│   └── mueid.json      # Per-member time entries
└── updates/
    └── 2026-02-27.json # Daily pulse updates & standups
```

Every command automatically **pulls** the latest data before reading and **pushes** after writing — so your whole team stays in sync through Git.

## 📄 License

MIT
