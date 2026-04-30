# PHASE 0 — RECONNAISSANCE REPORT

**Project**: coktech.tech (repo: `8run3r/bcbtech`, deployed at `bcbtech.vercel.app` and `coktech.tech`)
**Stack**: Vite 5 + React 18 + TypeScript 5.8 + Tailwind 3.4 + Framer Motion 12 + Supabase
**Audit date**: 2026-04-30
**Auditor**: forensic security/architecture review
**Status**: read-only reconnaissance, no code changed

---

## 0.0 Discrepancies between prompt and reality

The audit prompt assumes a state that does **not** match the current code. Three significant deltas — these change the scope of later phases:

| Prompt assumes | Reality in repo |
|---|---|
| Colors `#7B61FF` violet, `#00F5C4` mint, `#FF3D71` coral | `src/index.css:11` `--neon-primary: #00ffaa`, `:12` `--neon-secondary: #FF8C00`, `:13` `--neon-accent: #FF3D71`. Only coral matches. **Violet/mint hex don't appear anywhere.** HSL primary `159 100% 51%` = `#00ffaa`. |
| Fonts: Syne / DM Sans / JetBrains Mono | `src/index.css:1` imports Syne + DM Sans + JetBrains Mono **plus** Orbitron, Space Grotesk, VT323, Space Mono. `tailwind.config.ts:25-27` defines `font-sans: Sora`, `font-mono: Inter` — neither imported. **Tailwind ↔ CSS drift.** |
| Two-section `Digital + Automate` | App has 11 routes (`src/App.tsx:54-74`): `/`, `/portfolio`, `/balicky`, `/logika`, `/kontakt`, `/archive`, `/node-map`, `/memory`, `/void`, `/doom`, `/admin`. Subworlds `digital/` + `automation/` exist as 3D scenes inside storytelling, not whole site. |
| `VITE_*` exposing API keys, direct AI calls from client | **Not true.** Anthropic key only in `.env.example:4`, never referenced in `src/`. All AI traffic goes through `supabase/functions/ai-proxy/` with admin JWT + rate limit + model whitelist. See §0.3. |
| Pre-existing pnpm | Repo has `package-lock.json` + `bun.lockb`, no `pnpm-lock.yaml`. `vercel.json:4` uses `npm install`. |

**→ Audit proceeds against actual code, not promised state. Brand-token "preserve exactly" rule cannot mean "preserve the values in the prompt" because they don't exist; it means "preserve the values currently rendered in production".**

---

## 0.1 Repo topology

```
CokTech/
├── .env.example               # 4 placeholders (incl. dead VITE_ANTHROPIC_API_KEY)
├── .gitignore                 # OK — excludes .env, .env.* (allows .env.example)
├── README.md                  # not yet read
├── components.json            # shadcn/ui config
├── eslint.config.js           # flat config, minimal rules
├── index.html                 # SPA entry, JSON-LD Organization, OG/Twitter tags
├── package.json               # 80+ deps, npm scripts dev/build/lint/preview/test
├── package-lock.json          # npm lockfile
├── bun.lockb                  # also a bun lockfile (dual-lock smell)
├── postcss.config.js
├── tailwind.config.ts         # CSS vars + font drift (see §0.0)
├── tsconfig.json              # strict OFF, noImplicitAny OFF
├── tsconfig.app.json          # strict OFF
├── tsconfig.node.json
├── vercel.json                # CSP + HSTS + COOP/CORP, SPA rewrite
├── vite.config.ts             # manualChunks for three/framer/vendor, no analyzer
├── vitest.config.ts
├── public/                    # CT.png, cameras/, favicon.ico, placeholder.svg, robots.txt, sitemap.xml
├── src/
│   ├── App.tsx                  # router, 11 routes, lazy-loaded pages
│   ├── main.tsx                 # entry
│   ├── index.css                # 7 Google Fonts imports, full design-token vars
│   ├── vite-env.d.ts
│   ├── pages/
│   │   ├── Index.tsx              # landing
│   │   ├── Portfolio.tsx
│   │   ├── Packages.tsx           # /balicky
│   │   ├── Logika.tsx             # /logika (replaces /riesenia legacy)
│   │   ├── Kontakt.tsx
│   │   ├── Admin.tsx              # admin dashboard host
│   │   ├── Archive.tsx, NodeMap.tsx, Memory.tsx, Void.tsx, Doom.tsx  # hidden/easter-egg
│   │   ├── Konfigurator.tsx       # legacy, redirected to /balicky
│   │   ├── Riesenia.tsx           # legacy, redirected to /logika
│   │   └── NotFound.tsx
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── win98.tsx
│   │   └── pages/                 # Agents, Analytics, Cameras, Dashboard, Marketing, Messages, Projects, Settings
│   ├── components/
│   │   ├── ContactModal.tsx, KonfiguratorModal.tsx, ReservationModal.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── NavLink.tsx, ScrollToTop.tsx, SmoothScroll.tsx, SocialLinks.tsx
│   │   ├── RequireAdmin.tsx       # admin route guard
│   │   ├── RotatingCaptcha.tsx    # IP-fetch + captcha
│   │   ├── WorldEntryAnimation.tsx
│   │   ├── admin/                 # CameraEditRow, PortfolioEditRow
│   │   ├── doom/DoomGame.tsx      # easter egg
│   │   ├── landing/               # 30 sections (Hero, Services, Contact, BeforeAfter, Boot, Cameras, AIMarketing, FAQ, Footer*, Glitch, Header, ParticleField, Portfolio, Projects, Scroll*, Services*, Showcase, Stats, StoryScroll3D, TechStack, Testimonials, VertexNetwork3D, Marquee, Navbar, FluidCursor, ExitIntentPopup, PageLoader, LandingTerminal)
│   │   ├── story-scroll/          # 3D scrollytelling: stations, voxels, shaders, lighting, camera rig
│   │   ├── subworlds/
│   │   │   ├── automation/AutomationWorld.tsx, CircuitBoard.tsx
│   │   │   ├── digital/CityScape.tsx, DigitalWorld.tsx
│   │   │   └── shared/PixelCard, PixelProgressBar, StationModel, WorldTeleporter, WorldTransition
│   │   └── ui/                    # ~60 shadcn primitives + custom (anime-hud, anime-pretext, data-rain, encrypted-text, glitch-transition, hero-terminal, hidden-interactions, interactive-hover-button, light-speed, magnetic-button, pretext-headline, progressive-blur, retro-cursor, ripple-button, scanlines, system-messages, word-scatter, file-tree, images-badge)
│   ├── contexts/AuthContext.tsx     # Supabase auth provider
│   ├── hooks/use-form-security.ts   # honeypot + 30s rate limit + 10/session cap
│   ├── hooks/use-mobile.tsx
│   ├── hooks/use-toast.ts
│   ├── integrations/supabase/client.ts, types.ts
│   ├── lib/
│   │   ├── ai-client.ts           # client → /functions/v1/ai-proxy with JWT
│   │   ├── integrations.ts        # wrappers for send-email/post-social/notify/trigger-n8n
│   │   ├── utils.ts               # cn() helper
│   │   └── word-to-vertex.ts      # 3D text helper
│   └── test/example.test.ts, setup.ts
└── supabase/
    └── functions/
        ├── _shared/auth.ts        # JWT + admin role check
        ├── ai-proxy/index.ts      # Anthropic Messages API proxy
        ├── notify/index.ts        # Slack + Discord webhooks
        ├── on-new-record/index.ts # DB webhook → Resend email + Telegram
        ├── post-social/index.ts   # IG + LinkedIn + Facebook
        ├── send-email/index.ts    # SendGrid
        └── trigger-n8n/index.ts   # n8n webhook
```

Total source: ~150 `.ts/.tsx` files in `src/`, 7 edge functions in `supabase/functions/`.

---

## 0.2 Dependency inventory & vulnerabilities

### `npm audit` highlights (CVEs)

| Severity | Package | Issue | Fix |
|---|---|---|---|
| **HIGH** | `@chenglou/pretext` ≤0.0.4 | DoS via algorithmic complexity in text analysis (`GHSA-5478-66c3-rhxr`, CWE-407) | upgrade to 0.0.6 (major) |
| **HIGH** | `@remix-run/router` ≤1.23.1 (via `react-router-dom@6.30.1`) | XSS via open redirects (`GHSA-2w69-qvjg-hvjx`, CVSS 8.0) | bump react-router-dom to 6.30.2+ |
| MODERATE | `dompurify` ≤3.3.3 (via `jspdf` deep dep) | `ADD_TAGS` form bypasses `FORBID_TAGS` (`GHSA-39q2-94rc-95cp`) | upgrade jspdf chain |
| MODERATE | `ajv` <6.14.0 | ReDoS with `$data` option (`GHSA-2g4f-4pwh-qvx6`) | upgrade transitive |
| MODERATE | `brace-expansion` <1.1.13 ǁ <2.0.3 | Zero-step DoS (`GHSA-f886-m6hf-6m8v`, CVSS 6.5) | upgrade |
| LOW | `@tootallnate/once` <3.0.1 (via `jsdom`) | Control flow scoping | bump jsdom to 29 (major) |

(Full audit JSON at the time: HIGH×2, MODERATE×4, LOW×1. Numbers may shift after lockfile bump.)

### Suspect / likely unused

Grep for usage in `src/` returned **0 matches** for these direct deps:

| Package | In `package.json` | Usage in `src/` | Verdict |
|---|---|---|---|
| `@ai-sdk/openai` 3.0.52 | dep | none | likely dead |
| `openai` 6.34.0 | dep | none | likely dead |
| `ai` 6.0.154 | dep | none | likely dead |
| `sharp` 0.34.5 | dep | none (server-only lib) | misplaced or dead |

→ Verify via `knip` / `depcheck` before removal.

### Outdated (cosmetic / non-blocking)

- `three@0.160.1` (latest ~0.171) — keep unless WebGPU/perf wanted
- `vite@5.4.19` (vite 6 is GA) — major upgrade, defer
- `react@18.3.1` — keep on 18 line for ecosystem stability

### Dual lockfile smell

Both `package-lock.json` (≈2 MB) and `bun.lockb` exist. Vercel uses npm (`vercel.json:4`). Decide on one and delete the other to avoid drift.

---

## 0.3 Secret & credential scan

### Active secrets in client (`VITE_*`)

| Var | Used in | Classification |
|---|---|---|
| `VITE_SUPABASE_URL` | `src/integrations/supabase/client.ts:4`, `src/lib/ai-client.ts:3` | **public** (project URL) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `src/integrations/supabase/client.ts:5` | **public-by-design** (Supabase anon key, RLS-protected) |
| `VITE_ANTHROPIC_API_KEY` | nowhere in `src/` (only `.env.example:4`) | **dead — must be removed from .env.example** |

### Direct outbound calls from client

Grep `fetch(` / `axios` / `XMLHttpRequest` in `src/`:

| File:Line | Target | Verdict |
|---|---|---|
| `src/lib/ai-client.ts:32` | `${SUPABASE_URL}/functions/v1/ai-proxy` | safe — server proxy |
| `src/components/RotatingCaptcha.tsx:156` | `https://api.ipify.org?format=json` | safe — public IP service |

**No direct call to `api.anthropic.com`, `api.openai.com`, `api.replicate.com` from the client.** Confirmed via `grep` against `src/` and against built `dist/`.

### Built bundle scan (`dist/`)

Grep for `sk-ant-`, `sk-proj-`, `SG.`, `re_`, `ghp_`, `xoxb-`, `AKIA`, `SUPABASE_SERVICE_ROLE`: **0 matches**. Bundle is clean.

### Git history scan

| Commit | What was committed |
|---|---|
| pre-`3358f46` (commit `3358f46` deletes it) | `.env` containing `VITE_SUPABASE_PROJECT_ID="hysdwsgxequjvwjjoqvp"`, `VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_a2rjA0L1y1kLqrrKH5QiLA_S5pdLQNT"`, `VITE_SUPABASE_URL="https://hysdwsgxequjvwjjoqvp.supabase.co"` |
| `3358f46` | adds `.env.example`, removes `.env` from tracking |

`git log -S` searches:
- `"sk-ant-"` → 0 commits (Anthropic key never in tree)
- `"SG."` → matches in commit `3358f46` because `_shared`/`send-email` reference SendGrid env var name; key value never present
- `"re_"`, `"sb_secret"`, `"ghp_"`, `"xoxb-"` → 0 hits with actual values

**Verdict**: only the Supabase publishable (anon) key + project URL leaked, and those are public-by-design. **No actual secret API key exists in git history.**

History sanitization is therefore *optional*, not urgent. Recommended only if Supabase project ID disclosure is a concern (it's not — the URL is anyway visible at runtime).

### Secrets that exist server-side (Supabase Edge Function env)

Referenced by `Deno.env.get(...)` — must remain only in Supabase Dashboard, never in repo:

`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `SENDGRID_API_KEY`, `SLACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`, `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_ORG_ID`, `FACEBOOK_PAGE_ID`, `FACEBOOK_ACCESS_TOKEN`, `N8N_WEBHOOK_URL`, `N8N_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFY_EMAIL`.

Verified by code reference. Repo grep shows no values, only env-var lookups. **Action**: confirm each is set in Supabase Dashboard and not also pasted in any local `.env` checked into git ignored locations.

---

## 0.4 Network surface map

| File:Line | Call | Classification |
|---|---|---|
| `src/lib/ai-client.ts:32` | `fetch(SUPABASE_URL/functions/v1/ai-proxy)` | (a) safe |
| `src/components/RotatingCaptcha.tsx:156` | `fetch(https://api.ipify.org)` | (a) safe |
| `src/integrations/supabase/client.ts` | implicit Supabase WebSocket + REST | (a) safe |
| `src/lib/integrations.ts:19` | `supabase.functions.invoke(fnName)` for send-email/post-social/notify/trigger-n8n | (a) safe — admin-only |
| `index.html:26-27` | `preconnect` to fonts.googleapis.com, fonts.gstatic.com | (a) safe |
| `src/index.css:1` | `@import url('https://fonts.googleapis.com/css2?...')` | (a) safe — but render-blocking; preload critical fonts instead |

CSP `connect-src` (`vercel.json:21`) allows: `'self'`, `*.supabase.co`, `wss://*.supabase.co`, `api.anthropic.com`, `api.rss2json.com`, `api.ipify.org`.

`api.anthropic.com` is **redundant** — client never reaches it. `api.rss2json.com` is allowed but I see no usage in `src/` (likely from removed blog feature). Tighten CSP in Phase 1.

No iframes, no external `<script src>` other than the Vite bundle.

---

## 0.5 Build artifact inspection

`dist/` already exists from prior build (3.1 MB total).

| Chunk | Size | Note |
|---|---|---|
| `three-fqYBdxqm.js` | **925 KB** | three + R3F + drei manual chunk; gzipped ~250 KB |
| `Admin-DzBkviHB.js` | **551 KB** | admin lazy chunk — only loaded on `/admin` |
| `index-Bxa8O8n5.js` | **415 KB** | entry |
| `framer-motion-D_4SrLwk.js` | 128 KB | manual chunk |
| `index-BkfuoFFE.css` | **90 KB** | unusually large CSS — investigate Tailwind purge |
| `use-form-security-C1bjhMPt.js` | 53 KB | likely also pulls form deps |
| `SubworldContainer-CfeVTN1h.js` | 45 KB | 3D subworld |
| `Packages-C9ijzbMo.js` | 27 KB | route chunk |
| `Logika-j9sykezU.js` | 24 KB | route chunk |

Bundle clean of secrets (see §0.3).

**Quick wins**: investigate why CSS is 90 KB (possible Tailwind safelist/safelist-from-3D-shaders or CSS-vars-as-shaders). Audit `index.css` for unused custom CSS.

---

## 0.6 Configuration audit

### `tsconfig.json` — **CRITICAL**

```json
"noImplicitAny": false,
"noUnusedParameters": false,
"skipLibCheck": true,
"allowJs": true,
"noUnusedLocals": false,
"strictNullChecks": false
```

`tsconfig.app.json` (the one used for `tsc`):
```json
"strict": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noImplicitAny": false,
"noFallthroughCasesInSwitch": false
```

Conflicts with user's own `CLAUDE.md` rule "TypeScript strict — NEVER use `any`". Phase 2 priority.

### `eslint.config.js`

Flat config with minimal rules:
- `js.configs.recommended` + `tseslint.configs.recommended`
- `react-hooks` recommended
- `react-refresh/only-export-components` warn
- `@typescript-eslint/no-unused-vars: off` ← **disabled, masks dead code**

Missing: `import/order`, `jsx-a11y`, `react`, no `strict-type-checked`. Phase 5 fix.

### `.prettierrc`

Not present. Prettier 3.8.1 in devDeps but no config or formatter script. Phase 5.

### `vercel.json`

Headers (`vercel.json:11-22`) — strong baseline:
- `X-Frame-Options: DENY` ✓
- `X-Content-Type-Options: nosniff` ✓
- `Referrer-Policy: strict-origin-when-cross-origin` ✓
- `Permissions-Policy` (camera/mic/geo/payment/usb/bluetooth all `()`) ✓
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` ✓
- `X-DNS-Prefetch-Control: off` ✓
- `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin` ✓
- CSP — see §0.4 (tighten)

SPA rewrite ✓. Build/install commands ✓.

### `vite.config.ts`

- HMR overlay disabled (developer choice, fine)
- `manualChunks` for `three`, `framer-motion`, `vendor` ✓
- No bundle visualizer plugin
- No `build.target` set (defaults to `modules` ≈ ESM with Object.fromEntries support)

### `tailwind.config.ts`

`content` includes `./pages/**`, `./components/**`, `./app/**`, `./src/**` — but only `./src/**` is real in this project. Harmless.
Defines CSS-var-based theme tokens. Brand colors (`#7B61FF` etc.) are **not** in this file. Sora/Inter fonts declared but **never imported**, while seven actually imported fonts in `index.css` are not declared in Tailwind config. Phase 2 cleanup.

---

## 0.7 Risk register

| ID | Severity | Category | Finding | File:Line | Why it matters | Fix complexity |
|---|---|---|---|---|---|---|
| R-01 | **HIGH** | Security/Deps | `@chenglou/pretext ≤0.0.4` DoS CVE | `package.json:17` | Hero animation lib could be DoS'd by crafted input | Low — bump to 0.0.6 (major), test |
| R-02 | **HIGH** | Security/Deps | `react-router-dom 6.30.1` open-redirect XSS | `package.json:79` | Real app routing — patched in 6.30.2 | Low — patch bump |
| R-03 | **HIGH** | Architecture | TS strict mode OFF | `tsconfig.app.json:19`, `tsconfig.json:9-14` | Hides null/undefined bugs, allows implicit any | High — many fixes needed |
| R-04 | MEDIUM | Security | Edge fn CORS `*` | `supabase/functions/_shared/auth.ts:7`, `ai-proxy/index.ts:8` | Any origin can hit endpoints (admin auth still required, but tightening is defense in depth) | Low |
| R-05 | MEDIUM | Security | `ai-proxy` rate limit is in-memory `Map` | `supabase/functions/ai-proxy/index.ts:13-27` | Resets on cold start, doesn't share across instances | Medium — DB table |
| R-06 | MEDIUM | Security | No Zod validation on edge fn inputs | all of `supabase/functions/*/index.ts` | Manual `if` checks miss edge cases; `zod` already in deps | Medium |
| R-07 | MEDIUM | Code quality | 15 `any` in src | `src/lib/integrations.ts:17`, `src/admin/pages/AgentsPage.tsx`, `MarketingPage.tsx`, `AnalyticsPage.tsx`, `MessagesPage.tsx` | Erodes type safety | Medium |
| R-08 | MEDIUM | Performance | `three` chunk 925 KB | bundle | Long initial load on first 3D-touching page | Medium — drei tree-shake, lazy scenes |
| R-09 | MEDIUM | Performance | `index.css` chunk 90 KB | bundle | Large CSS payload | Medium — investigate Tailwind & custom CSS |
| R-10 | MEDIUM | Deps | `@ai-sdk/openai`, `openai`, `ai` likely unused | `package.json:16,55,69` | ~600 KB of unused deps in lockfile, install time, supply-chain surface | Low — `knip`, then remove |
| R-11 | MEDIUM | Deps | `sharp` is server-only in client app | `package.json:81` | Likely dead, large native binary | Low — confirm + remove |
| R-12 | LOW | Security | CSP `connect-src` allows `api.anthropic.com` | `vercel.json:21` | Defense in depth — client never calls it | Low |
| R-13 | LOW | Security | `.env.example` lists dead `VITE_ANTHROPIC_API_KEY` | `.env.example:4` | Misleading — implies client uses Anthropic key | Trivial — delete line |
| R-14 | LOW | Security | Supabase publishable key + URL in git history | commit `3358f46` and earlier | Low real impact (anon key public-by-design); cosmetic | Optional — git filter-repo |
| R-15 | LOW | DX | Dual lockfiles (`package-lock.json` + `bun.lockb`) | repo root | Drift risk between local (bun) and CI (npm) | Trivial — delete one |
| R-16 | LOW | DX | No Prettier config, no Husky/lint-staged, no commitlint | repo root | Manual hygiene only | Low |
| R-17 | LOW | DX | No real tests (1 example) | `src/test/example.test.ts` | No regression safety net | Medium — Vitest smoke tests |
| R-18 | LOW | Security | CSP `connect-src` allows `api.rss2json.com` | `vercel.json:21` | Allowed but no usage found in `src/` (legacy blog) | Trivial — remove |
| R-19 | LOW | Code quality | `tailwind.config.ts` font drift (Sora/Inter declared, never imported) | `tailwind.config.ts:25-27` | Misleading; default tokens disagree with `index.css` | Low |
| R-20 | INFO | Architecture | Edge Functions in Supabase, not Vercel `/api/*` | `supabase/functions/` | Prompt assumed Vercel functions; current setup works and is a valid choice | None — confirm direction |
| R-21 | MODERATE | Security/Deps | `dompurify ≤3.3.3` (via jspdf) `ADD_TAGS` bypass | transitive via `jspdf@4.2.1` | Indirect; only matters if dompurify is reachable | Low — bump jspdf chain |
| R-22 | MODERATE | Security/Deps | `ajv <6.14.0` ReDoS | transitive | Low real exposure | Low — `npm audit fix` |
| R-23 | MODERATE | Security/Deps | `brace-expansion` DoS | transitive | Low real exposure | Low — `npm audit fix` |

**Summary**: 2 HIGH (both deps, easy bumps), 4 MEDIUM (real architecture/perf), several MODERATE transitive CVEs, plus DX/cleanup items.

**No actual secrets at risk.** The premise of the audit prompt — "VITE_* exposing API keys, direct AI calls" — is not borne out by code.

---

## 0.8 Phased plan proposal

Adapted to actual findings.

### Phase 1 — Security cleanup (P0, low risk)
- Bump `react-router-dom` to ≥6.30.2 (R-02)
- Bump `@chenglou/pretext` to 0.0.6 + verify hero still works (R-01)
- `npm audit fix` for transitive moderate CVEs (R-21..23)
- Edge fn CORS whitelist (R-04)
- `ai-proxy` rate limit → DB table (R-05)
- Add Zod schemas to all edge fn inputs (R-06)
- Tighten CSP `connect-src` — drop `api.anthropic.com`, `api.rss2json.com` (R-12, R-18)
- Remove dead `VITE_ANTHROPIC_API_KEY` from `.env.example` (R-13)
- **Commit**: `security: patch CVEs, tighten CSP and edge-fn CORS, validate inputs`
- **Estimated effort**: 4–8 h

### Phase 2 — TypeScript strict (P0)
- Enable `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch` (defer `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature` until base strict passes)
- Eliminate 15 `any` (R-07)
- Fix every resulting error file-by-file
- **Commit**: `refactor: enable TS strict, eliminate any types`
- **Estimated effort**: 8–16 h

### Phase 3 — Dependency hygiene & dead code
- Run `knip` and `depcheck`
- Remove `@ai-sdk/openai`, `openai`, `ai`, `sharp` if confirmed unused (R-10, R-11)
- Remove dual lockfile (R-15)
- **Commit**: `chore: remove dead dependencies, single lockfile`
- **Estimated effort**: 2–4 h

### Phase 4 — Performance
- `rollup-plugin-visualizer` → identify cuts
- Audit `index.css` 90 KB cause (R-09)
- Lazy-load 3D scenes that aren't above the fold (R-08)
- WebP/AVIF for `public/cameras/` and `public/CT.png`
- `loading="lazy"`, `decoding="async"` audit
- Lighthouse run — targets Perf ≥ 90, A11y ≥ 95, Best Practices = 100, SEO ≥ 95
- **Commit**: `perf: bundle trim, image formats, lazy 3D`
- **Estimated effort**: 8–12 h

### Phase 5 — A11y & SEO
- Semantic HTML pass on landing sections
- Focus-visible in brand colors
- ARIA labels for icon buttons (Navbar, social icons, command palette)
- `axe-core` run, fix every violation
- Verify `sitemap.xml` and `robots.txt` are accurate
- **Commit**: `a11y+seo: semantic html, focus, axe fixes`
- **Estimated effort**: 6–10 h

### Phase 6 — Code quality / tooling
- Prettier config + format pass
- ESLint upgrade: `strict-type-checked`, `jsx-a11y`, `import/order`
- Husky + lint-staged + `gitleaks` pre-commit + commitlint
- **Commit**: `chore: prettier, stricter eslint, husky+lint-staged, commitlint`
- **Estimated effort**: 4–6 h

### Phase 7 — Tests + docs
- Vitest smoke tests for routes, `useFormSecurity`, `ai-client` mock, edge fn validators
- README, ARCHITECTURE.md, CONTRIBUTING.md, SECURITY.md
- **Commit**: `docs+test: smoke tests and developer docs`
- **Estimated effort**: 6–10 h

### Phase 8 — Final verification
- Lighthouse, axe, gitleaks, npm audit final passes
- Visual regression at 320/768/1024/1440/1920
- Manual smoke of every route + every form
- Final report
- **Estimated effort**: 4–6 h

**Total**: ~42–72 h of focused work, depending on TS strict pain in Phase 2.

---

## Open questions for approval before Phase 1

1. **Brand truth**: do we keep current colors `#00ffaa / #FF8C00 / #FF3D71` and fonts as imported in `index.css`, or migrate to prompt's `#7B61FF / #00F5C4 / #FF3D71` + Syne/DM Sans/JetBrains Mono? (Phase 2 design-tokens task depends on this.)
2. **Vercel `/api/*` vs Supabase Edge Functions**: keep Supabase (recommended — already wired, secured) or migrate? Migration is ~12 h extra for no practical gain.
3. **Git history sanitization**: only the public-by-design Supabase keys leaked. `git filter-repo` is invasive for collaborators. Recommend **skip**.
4. **Package manager**: lock to `npm` (matches Vercel build), delete `bun.lockb`?
5. **Approve Phase 1 list above** — I'll create branch `refactor/security-audit` and start.
