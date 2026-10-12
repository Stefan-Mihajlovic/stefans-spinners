# Development and release status

Stefan authorized npm publication and the live website update on 2026-10-12 (Europe/Belgrade).

- Version 1.0.1 is published and tagged latest on npm. Verified a clean installation from the public registry on 2026-10-12 at approximately 21:25 UTC: all 60 exports are present and server imports render correctly. Do not republish 1.0.1; use a new version for the next release.
- All 23 tests and typecheck pass. The package contains 60 spinners and automatic browser styles.
- The former 24-hour npm name cooldown has expired. Version 1.0.0 must not be reused.
- The npm link is active on the website and temporary release-wait messages have been removed.
- Gallery is live; verified production deploy 6acd4f49c243ac2b0b6220fa on 2026-10-12 at approximately 21:22 UTC. Deployed directly from site-dist.
- Netlify project: stefans-spinners (72f0acf1-2737-4dcc-a2db-6f766977d4f5), domain https://spinners.stefanmihajlovic.com.
- Local preview: npm run build:site, then npm run dev (http://127.0.0.1:4173).
- Never commit credentials.
