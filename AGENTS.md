# Development and release status

Stefan authorized npm publication and the live website update on 2026-10-12 (Europe/Belgrade).

- Version 1.0.1 was submitted successfully with npm publish on 2026-10-12 at approximately 21:20 UTC. npm reported processing; the public registry currently shows its temporary 0.0.0-stage placeholder. Verify availability of 1.0.1 before reporting the package installable. Do not republish while processing. No staged approval is listed for the account.
- All 23 tests and typecheck pass. The package contains 60 spinners and automatic browser styles.
- The former 24-hour npm name cooldown has expired. Version 1.0.0 must not be reused.
- The npm link is active on the website and temporary release-wait messages have been removed.
- Gallery is live; verified production deploy 6acd4f49c243ac2b0b6220fa on 2026-10-12 at approximately 21:22 UTC. Deployed directly from site-dist.
- Netlify project: stefans-spinners (72f0acf1-2737-4dcc-a2db-6f766977d4f5), domain https://spinners.stefanmihajlovic.com.
- Local preview: npm run build:site, then npm run dev (http://127.0.0.1:4173).
- Never commit credentials.
