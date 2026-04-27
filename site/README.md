# ReduceCO2Now — website

Static site built with [Astro](https://astro.build), deployed to **Strato** shared hosting.
Domain: <https://reduceco2now.com>

## Project structure

```
site/
  astro.config.mjs        # Astro config (site, i18n DE/EN, sitemap)
  src/
    config.ts             # ★ All legal placeholders + site-wide config (edit this!)
    i18n/ui.ts            # Translation strings (DE/EN)
    layouts/BaseLayout.astro
    components/
      Header.astro
      Footer.astro
      AddressBlock.astro
      Placeholder.astro   # Highlights [TODO: ...] values
    pages/
      index.astro                 # / (DE home)
      impressum.astro             # /impressum
      datenschutz.astro           # /datenschutz
      404.astro
      en/
        index.astro               # /en/
        legal-notice.astro        # /en/legal-notice
        privacy-policy.astro      # /en/privacy-policy
    styles/global.css
  public/
    .htaccess             # HTTPS redirect, security headers, pretty URLs (Strato Apache)
    robots.txt
    favicon.svg
```

## Local development

```bash
cd site
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs static files to site/dist/
npm run preview      # preview the build locally
```

Requires Node.js ≥ 18 (developed on Node 22).

## ⚠️ Before you publish: fill in the legal placeholders

All legally required values are centralized in **`site/src/config.ts`**.
Anything starting with `[TODO: ...]` is highlighted with a yellow background on the rendered pages so you can spot them immediately.

You **must** fill in these before going live in Germany:

- `LEGAL.responsibleName` — full legal name of the operator (Vereinsname / company / person)
- `LEGAL.legalForm` — e.g. `e. V.`, `GmbH`, or empty for a private individual
- `LEGAL.street`, `LEGAL.postalCode`, `LEGAL.city` — full postal address (no PO Box only)
- `LEGAL.email` — required contact email
- `LEGAL.phone` — strongly recommended; many courts treat it as required
- `LEGAL.representative` — Vorstand / Geschäftsführer (if a Verein/company)
- `LEGAL.registerEntry` — Vereinsregister or Handelsregister entry (if applicable)
- `LEGAL.vatId` — VAT ID per § 27a UStG (only if you have one)
- `LEGAL.contentResponsibleName` + `contentResponsibleAddress` — § 18 (2) MStV. Person responsible for editorial content. Address must be in Germany.

Also update:

- `SOCIAL[]` in `config.ts` — replace `[TODO: ...]` URLs with real ones, or set `href: null` to hide the entry
- `LEGAL_LAST_UPDATED` — bump the date when you change the legal texts
- `src/i18n/ui.ts` — adjust copy / nav labels if needed

## Compliance posture (as shipped)

- ✅ **Impressum** (DE) per § 5 DDG / § 18 MStV — `/impressum`
- ✅ **Legal notice** (EN translation) — `/en/legal-notice`
- ✅ **Datenschutzerklärung** (DE) per Art. 13 DSGVO — `/datenschutz`
  - Hosting (Strato) named, server logs disclosed, contact, newsletter (placeholder), social links, data subject rights, supervisory authority
- ✅ **Privacy Policy** (EN translation) — `/en/privacy-policy`
- ✅ **No tracking, no third-party embeds, no non-essential cookies** → no consent banner needed under TTDSG / § 25 TDDDG
- ✅ Footer with permanent links to Impressum + Datenschutz on every page
- ✅ HTTPS redirect, HSTS, CSP, and standard security headers via `.htaccess`
- ✅ `robots.txt` + auto-generated sitemap

If you later add Google Fonts (external), Analytics, embedded YouTube, Mailchimp, etc., you must:

1. Add a consent banner (e.g. Klaro!, Cookiebot) before loading those resources,
2. Update `src/pages/datenschutz.astro` and `src/pages/en/privacy-policy.astro` with the new processor info, and
3. Sign a DPA (AVV) with each processor.

## Deploying to Strato

Strato shared hosting serves static files via Apache out of the box.

1. **Build:**
   ```bash
   cd site
   npm install
   npm run build
   ```
   This produces `site/dist/` containing all HTML/CSS/JS/assets and the `.htaccess` (copied from `public/`).

2. **Upload `dist/` contents** to your Strato webspace root, typically `/` (or whatever your package's web root is — Strato often uses the package's home directory or a `htdocs/` subdir; check your Strato Paket).
   - Use **SFTP** (recommended) or the Strato HiDrive / FTP credentials from your Strato customer panel.
   - Tools: [FileZilla](https://filezilla-project.org/), [Cyberduck](https://cyberduck.io/), `rsync`, or `lftp`.
   - Upload the **contents of `dist/`**, not the `dist` folder itself.
   - Make sure hidden files like `.htaccess` are uploaded (most clients have a "show hidden files" toggle).

3. **Domain & SSL:** in the Strato customer panel, point `reduceco2now.com` (and `www.reduceco2now.com`) to the package's web root and enable the free Let's Encrypt SSL certificate. The `.htaccess` will then enforce HTTPS automatically.

4. **Verify:**
   - <https://reduceco2now.com> → DE home
   - <https://reduceco2now.com/en/> → EN home
   - <https://reduceco2now.com/impressum> and `/datenschutz`
   - <https://reduceco2now.com/sitemap-index.xml>
   - HTTP must redirect to HTTPS, and HTTPS responses should include `Strict-Transport-Security`, `X-Content-Type-Options`, etc. (test with `curl -I` or [securityheaders.com](https://securityheaders.com/)).

### Optional: rsync deploy script

```bash
# .env-style — keep out of git
HOST=ssh.strato.de
USER=your-strato-user
REMOTE=/                 # adjust to your package's web root

cd site && npm run build \
  && rsync -avz --delete dist/ "$USER@$HOST:$REMOTE"
```

## License / content

© ReduceCO2Now. Code intended for the project's own deployment.
