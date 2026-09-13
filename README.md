# Daymark

[![Build and Deploy](https://github.com/technothatch/general/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/technothatch/general/actions/workflows/deploy-pages.yml)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-247da3?logo=github)](https://technothatch.github.io/general/)
[![License](https://img.shields.io/github/license/technothatch/general)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/technothatch/general?display_name=tag)](https://github.com/technothatch/general/tags)
[![Last commit](https://img.shields.io/github/last-commit/technothatch/general)](https://github.com/technothatch/general/commits/main)
[![Issues](https://img.shields.io/github/issues/technothatch/general)](https://github.com/technothatch/general/issues)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Static site](https://img.shields.io/badge/site-static-2ea44f)](ARCHITECTURE.md)
[![No tracking](https://img.shields.io/badge/analytics-none-2ea44f)](PRIVACY.md)
[![Data storage](https://img.shields.io/badge/data-local--only-2ea44f)](PRIVACY.md)
[![Responsive](https://img.shields.io/badge/layout-responsive-0ea5e9)](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

Daymark is a quiet, private daily focus tool for people who want a simple place to plan, focus, and reset without an account, tracking, or an AI layer.

## Why Daymark

Daymark is designed as one small daily ritual: choose a few intentions, give one thing your attention, and unload whatever is taking up space. It avoids streak pressure, rankings, account setup, and unnecessary notifications.

## What is included

- Local-only intentions with completion progress
- Focus timer presets for 5, 25, and 50 minutes
- A private daily note with a character limit
- A lightweight mood check-in
- JSON export and a clear-local-data control
- Responsive layout for desktop and mobile
- A reserved, clearly labeled sponsor area that can be replaced with an ad provider later

## Cost and maintenance

This is a static Vite app. It has no database, authentication, analytics, external API, server, or paid dependency. User data stays in browser storage. It can be hosted for free on GitHub Pages, Cloudflare Pages, Netlify, or Vercel. The only routine maintenance is updating dependencies occasionally and replacing the sponsor placeholder if the project ever needs one.

The app uses two privacy-preserving browser stores: a first-party `SameSite=Lax` cookie for small preferences such as mood and timer length, and localStorage for tasks, notes, intention memory, and statistics. Nothing is sent to a server.

## Run locally

```sh
npm ci
npm run dev
```

Create a production build with `npm run build`. The generated `dist/` folder is ready for static hosting.

## Live demo and deployment

The live demo is [technothatch.github.io/general](https://technothatch.github.io/general/). Every push to `main` runs the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`. Enable GitHub Pages once in repository settings with **Source: GitHub Actions**; after that, deployment is automatic.

SEO entry pages:

- [Daily planner](public/daily-planner.html)
- [Focus timer](public/focus-timer.html)
- [Mood planner](public/mood-planner.html)
- [Study timer](public/study-timer.html)
- [Private planner](public/private-planner.html)
- [Personal productivity](public/personal-productivity.html)

More project detail lives in [ARCHITECTURE.md](ARCHITECTURE.md), [PRIVACY.md](PRIVACY.md), [CONTRIBUTING.md](CONTRIBUTING.md), and [CHANGELOG.md](CHANGELOG.md).

## Research-informed design

Daymark uses a deliberately light-touch behavior model instead of streak pressure or attention-heavy gamification:

- **Autonomy and intrinsic motivation:** Ryan and Deci's self-determination theory review (2000) identifies autonomy, competence, and relatedness as core conditions for sustained motivation. The user chooses the mood, session length, and intentions; there are no forced streaks or rankings.
- **Concrete next actions:** Gollwitzer's implementation-intention research (1999) supports translating a vague goal into a specific action. Daymark's intention list, one-tap starters, and mood-specific focus suggestions turn reflection into a next step.
- **Attention restoration:** Kaplan's attention restoration theory (1995) describes directed attention as a limited resource and emphasizes opportunities for effortless attention and recovery. The timer, short reset option, uncluttered layout, and end-of-session breathing prompt are designed around deliberate recovery rather than endless engagement.
- **Notification restraint:** Alerts are opt-in, browser-native, and limited to the completion event the user asked for. No tracking, reminders, or notification server is required.

Reference papers:

- Ryan, R. M. and Deci, E. L. (2000), [Self-determination theory and the facilitation of intrinsic motivation](https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf).
- Gollwitzer, P. M. (1999), [Implementation intentions](https://doi.org/10.1207/S15327965PLI1002_01).
- Kaplan, S. (1995), [The restorative benefits of nature](https://doi.org/10.1016/0272-4944(95)90001-2).