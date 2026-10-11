# Development and release status

Stefan explicitly authorized publishing this project again on 2026-10-12 (Europe/Belgrade).

- Package version 1.0.1 is prepared. Tests and typecheck pass.
- npm version 1.0.0 was unpublished on 2026-10-11 at 19:37:32 UTC. npm rejected the 1.0.1 publication because the same package name cannot be republished for 24 hours. Retry after 2026-10-12 19:37:32 UTC; do not reuse 1.0.0.
- After a successful npm publish, restore the npm link and remove the temporary release-wait messages from site/index.html and site/app.js, then rebuild and deploy the gallery.
- Gallery is live; verified production deploy 6acc0c7445b553c5dab41ba0 on 2026-10-11 22:23:50 UTC. Production was deployed directly from site-dist.
- Netlify project: stefans-spinners (72f0acf1-2737-4dcc-a2db-6f766977d4f5), domain https://spinners.stefanmihajlovic.com.
- Local preview: npm run build:site, then npm run dev (http://127.0.0.1:4173).
- Never commit credentials.
