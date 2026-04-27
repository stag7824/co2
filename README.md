# 🌀 ReduceCO2Now

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Built with Astro](https://img.shields.io/badge/built%20with-Astro%205-FF5D01.svg)](https://astro.build)

> Climate action, grounded in science — driven by people.

Bilingual (DE / EN) static website for the **ReduceCO2Now** initiative.
Built with [Astro](https://astro.build) + a few [React](https://react.dev) islands for the
interactive charts. Designed to be hosted on **Strato** shared hosting (Germany)
and fully compliant with German law on day one (TMG/DDG, MStV, DSGVO).

- 🌍 Production: <https://reduceco2now.com>
- 🇩🇪 German is the default locale (`/`)
- 🇬🇧 English at `/en/`

---

## ⚡ Quick start

```bash
git clone <repo-url>
cd reduceCo2Now/co2
npm install
npm run dev          # → http://localhost:4321
```

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Astro dev server with HMR                   |
| `npm run build`   | Static build → `dist/`                      |
| `npm run preview` | Serve the built site locally to verify      |

Requirements: **Node.js ≥ 18** (developed and CI'd on Node 22).

---

## 🐳 Run in Docker

A multi-stage `Dockerfile` is included. It builds the Astro site and serves the
static `dist/` via nginx on **port 3000**.

```bash
cd co2

# build
docker build -t reduceco2now .

# run
docker run --rm -p 3000:3000 --name reduceco2now reduceco2now
# → http://localhost:3000
```

Or with `docker compose` (drop this in `docker-compose.yml`):

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

The container ships gzip + sensible cache headers + the same security headers
as the Strato `.htaccess` (HSTS aside — terminate TLS at your proxy/CDN).

---

## 🗂 Project structure

```
co2/
├─ astro.config.mjs            # i18n DE/EN, sitemap, trailingSlash policy
├─ Dockerfile                  # build + nginx on :3000
├─ TODO.md                     # ★ pre-launch checklist (read this!)
├─ public/
│  ├─ logo.svg                 # ★ vector site logo
│  ├─ favicon.svg              # browser tab icon
│  ├─ .htaccess                # HTTPS + security headers (Strato Apache)
│  └─ robots.txt
└─ src/
   ├─ config.ts                # ★ all legal placeholders + site config
   ├─ i18n/
   │  ├─ index.ts              # nested-key translation loader
   │  └─ locales/{de,en}.json  # bilingual strings
   ├─ data/                    # JSON-driven content (charts, social, sources, ...)
   ├─ layouts/BaseLayout.astro
   ├─ components/
   │  ├─ Header.astro          # variant 'home' | 'simple'
   │  ├─ Footer.astro
   │  ├─ AddressBlock.astro
   │  ├─ Placeholder.astro     # highlights [TODO: ...] values yellow
   │  ├─ sections/             # one .astro per page section
   │  └─ islands/              # React: CO2Chart, ImpactPredictor, TimelineViz
   ├─ pages/
   │  ├─ index.astro           # / (DE home)
   │  ├─ impressum.astro       # /impressum
   │  ├─ datenschutz.astro     # /datenschutz
   │  ├─ 404.astro
   │  └─ en/
   │     ├─ index.astro        # /en/
   │     ├─ legal-notice.astro
   │     └─ privacy-policy.astro
   └─ styles/global.css
```

---

## ⚖️ German legal compliance — what's already done

The site ships with everything needed to launch from Germany **on day one**:

- ✅ **Impressum** (`/impressum`) — § 5 DDG / § 18 MStV
- ✅ **Legal Notice** (`/en/legal-notice`) — English translation
- ✅ **Datenschutzerklärung** (`/datenschutz`) — Art. 13 DSGVO,
  hosting (Strato) named, server logs, contact, newsletter placeholder,
  social links, data-subject rights, supervisory authority
- ✅ **Privacy Policy** (`/en/privacy-policy`) — English translation
- ✅ **No tracking, no third-party embeds, no non-essential cookies**
  → no consent banner needed under § 25 TDDDG / TTDSG
- ✅ Self-hosted fonts (`@fontsource/*`) — no Google Fonts CDN
- ✅ Footer with permanent links to Impressum + Datenschutz on every page
- ✅ HTTPS redirect, HSTS, CSP, security headers via `.htaccess`
- ✅ `robots.txt` + auto-generated sitemap

### What you still need to fill in

All legally required values are centralized in **`src/config.ts`** and any
`[TODO: …]` placeholder is rendered with a yellow background so it can't be
missed.

👉 See [`TODO.md`](./TODO.md) for the full pre-launch checklist.

> ⚠️ **If you later add** Google Fonts, Analytics, embedded YouTube,
> Mailchimp, etc., you must (1) add a consent banner, (2) update both
> privacy pages with the new processor, and (3) sign a DPA (AVV).

---

## 🚀 Deploying to Strato

Strato shared hosting serves static files via Apache out of the box.

1. **Build:**

   ```bash
   cd co2
   npm install
   npm run build
   ```

   This produces `dist/` containing all HTML/CSS/JS/assets and the
   `.htaccess` (copied from `public/`).

2. **Upload `dist/` contents** to your Strato webspace root (typically `/`,
   sometimes `htdocs/` — check your Strato package).

   - Use **SFTP** (preferred) or the Strato HiDrive / FTP credentials from
     the customer panel.
   - Tools: [FileZilla](https://filezilla-project.org/),
     [Cyberduck](https://cyberduck.io/), `rsync`, or `lftp`.
   - Upload the **contents of `dist/`**, not the `dist` folder itself.
   - Make sure hidden files like `.htaccess` are uploaded (toggle "show
     hidden files" in your client).

3. **Domain & SSL:** in the Strato customer panel, point `reduceco2now.com`
   (and `www.reduceco2now.com`) to the package's web root and enable the
   free Let's Encrypt certificate. The shipped `.htaccess` enforces HTTPS
   automatically.

4. **Verify:**
   - <https://reduceco2now.com> → DE home
   - <https://reduceco2now.com/en/> → EN home
   - <https://reduceco2now.com/impressum> + `/datenschutz`
   - <https://reduceco2now.com/sitemap-index.xml>
   - `curl -I https://reduceco2now.com/` should include `Strict-Transport-Security`
     and `X-Content-Type-Options: nosniff`.

### Optional: rsync deploy

```bash
# .deploy.env — keep out of git
HOST=ssh.strato.de
USER=your-strato-user
REMOTE=/                  # adjust to your package's web root

cd co2 && npm run build \
  && rsync -avz --delete dist/ "$USER@$HOST:$REMOTE"
```

---

## 🤝 Contributing

We welcome contributions — translations, content fixes, accessibility
improvements, new sections.

### Workflow

1. Fork & branch off `main`: `git checkout -b feat/my-change`
2. Run the dev server: `npm run dev`
3. Make your change. Keep these in mind:
   - **Astro components** for static content; **React islands** only when
     interactivity is genuinely needed.
   - **No external JS/CSS/font CDNs** without updating Datenschutz first.
   - **Strings live in JSON**, never inline. Add to both
     `src/i18n/locales/de.json` and `en.json` (the build verifies parity).
   - **Data lives in `src/data/*.json`** — charts, social links, sources,
     timelines, etc.
4. `npm run build` must complete cleanly with **0 missing translation keys**.
5. Open a PR. Describe the change and its DE+EN impact (if any).

### Adding a new language

The i18n loader is data-driven. To add e.g. French:

1. Copy `src/i18n/locales/en.json` → `fr.json` and translate.
2. Register `'fr'` in `src/i18n/index.ts` (the `Lang` type and locale map).
3. Add `fr` to the `astro.config.mjs` i18n locales list.
4. Mirror `src/pages/en/*.astro` under `src/pages/fr/*.astro`.
5. Update `Header.astro`'s language switcher if you want >2 languages.

### Style

- Comment only what needs clarification — most code should be
  self-documenting.
- 2-space indent (matches Astro / Prettier defaults).
- Prefer composition over flags — split a component before adding a 4th
  prop.

### Reporting issues

Please include: page URL, browser + OS, repro steps, expected vs actual.
Screenshots / DevTools network tab are very helpful for layout / hydration
bugs.

---

## 📄 License

This project is **open source** under the [MIT License](./LICENSE).

You are free to use, modify, and redistribute the code for any purpose,
including commercial, provided you retain the copyright notice and license
text. We'd love to hear about it if you build something cool with it.

Note: textual content of the **legal pages** (Impressum / Datenschutz /
Privacy Policy / Legal Notice) describes the operator of
`reduceco2now.com`. If you reuse the code for your own site, you must
**replace those texts entirely** with your own legally-required information
— do not copy ours.
