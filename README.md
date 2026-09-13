# Daymark

[![Build and Deploy](https://github.com/technothatch/general/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/technothatch/general/actions/workflows/deploy-pages.yml) [![License](https://img.shields.io/github/license/technothatch/general)](LICENSE) [![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-247da3)](https://technothatch.github.io/general/)

Daymark is a quiet, private daily focus tool for people who want a simple place to plan, focus, and reset without an account or an AI layer.

## Why this product

The research direction came from current public productivity discussions and search results: people repeatedly ask for simple daily planners, focus timers, and tools that reduce context switching. Recent maker conversations also show fatigue with bloated productivity products and AI being pushed into workflows where it is not needed. Daymark combines those high-frequency needs into one fast daily ritual.

## What is included

- Local-only intentions with completion progress
- A 25-minute focus timer
- A private daily note with a character limit
- A lightweight mood check-in
- JSON export and a clear-local-data control
- Responsive layout for desktop and mobile
- A reserved, clearly labeled sponsor area that can be replaced with an ad provider later

## Cost and maintenance

This is a static Vite app. It has no database, authentication, analytics, external API, server, or paid dependency. User data stays in browser localStorage. It can be hosted for free on GitHub Pages, Cloudflare Pages, Netlify, or Vercel. The only routine maintenance is updating dependencies occasionally and swapping the sponsor placeholder for an approved ad network when traffic justifies it.

The app uses two privacy-preserving browser stores: a first-party `SameSite=Lax` cookie for small preferences such as mood and timer length, and localStorage for tasks, notes, intention memory, and statistics. Nothing is sent to a server.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`. The generated `dist/` folder is ready for static hosting.

## Live demo and deployment

The intended public URL is [technothatch.github.io/general](https://technothatch.github.io/general/). Every push to `main` runs the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`. GitHub Pages must be enabled once in repository settings with **Source: GitHub Actions**; after that, deployment is automatic.

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