# Contributing

Keep Daymark small, private, and easy to host.

## Local development

```sh
npm ci
npm run dev
```

Before opening a change, run:

```sh
npm run build
```

## Guidelines

- Prefer browser APIs and local state over new services.
- Do not add tracking, data collection, or account requirements.
- Keep interactions usable on mobile and keyboard accessible.
- Keep SEO pages useful and specific instead of adding keyword-only text.
- Do not commit generated `dist/` output.
