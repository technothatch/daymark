# Architecture

Daymark is a static Vite application. There is no API, database, account system, analytics SDK, or server runtime.

## Runtime model

- `src/main.ts` owns the local state model and event wiring.
- `src/style.css` owns the app shell and mood themes.
- `localStorage` stores tasks, notes, intention memory, daily history, and statistics.
- First-party `SameSite=Lax` cookies store only small preferences such as mood and timer length.
- `public/*.html` contains static SEO landing pages that link into the app.
- `.github/workflows/deploy-pages.yml` builds `dist/` and deploys it to GitHub Pages.

## Performance rules

The timer updates its small display nodes in place. Interaction rerenders disable the initial reveal animation, and task entry restores focus after a render. Keep future changes local and avoid introducing a client framework or remote runtime unless the static model stops meeting a real need.

## Build

```sh
npm ci
npm run build
```
