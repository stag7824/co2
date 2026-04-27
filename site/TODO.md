# TODO — Before going live

This is the canonical pre-launch checklist. Anything marked `[TODO: …]` in the
rendered pages (yellow highlight) maps back to a value here.

## 🟥 Required before launch (legal blockers)

These **must** be filled in or the site is not legally compliant for a German
audience under TMG/DDG, MStV, and DSGVO.

### 1. Operator identity → `site/src/config.ts` → `LEGAL`
- [ ] `responsibleName` — full legal name of the operator
      (e.g. "ReduceCO2Now e. V." or "Dr. Thomas Buro")
- [ ] `legalForm` — `e. V.` / `gGmbH` / `GmbH` / empty for natural person
- [ ] `street` — postal street address (PO box alone is **not** sufficient)
- [ ] `postalCode` + `city` — German postal code and city
- [ ] `country` — usually "Germany" / "Deutschland"
- [ ] `email` — contact email (required, must be reachable)
- [ ] `phone` — strongly recommended; courts often require a "second
      independent channel" alongside email

### 2. Editorial / content-responsible person → `LEGAL`
Required by § 18 (2) MStV for sites with journalistic-editorial content.
- [ ] `representative` — Vorstand / Geschäftsführer (if Verein/GmbH)
- [ ] `contentResponsibleName` — physical person responsible for content
- [ ] `contentResponsibleAddress` — must be an address inside Germany

### 3. Register entries (only if applicable) → `LEGAL`
- [ ] `registerEntry` — Vereinsregister / Handelsregister number + court
      (e.g. "Amtsgericht Hamburg, VR 12345")
- [ ] `vatId` — USt-IdNr. per § 27a UStG (only if VAT-registered)

### 4. Last-updated date → `LEGAL_LAST_UPDATED`
- [ ] Bump every time legal text changes

### 5. Social URLs → `site/src/config.ts` → `SOCIAL[]` and
      `site/src/data/social-platforms.json`
- [ ] Replace any `[TODO: …]` URLs with real ones, **or** remove the
      entry. Listing a placeholder/non-functional account is legally
      misleading.
- [ ] Discord invite → `DISCORD_INVITE`
- [ ] WhatsApp / Telegram / Reddit / Mastodon / Bluesky / etc. — set or hide

## 🟧 Recommended before launch

### Newsletter
The form is currently a no-op placeholder (no provider).
- [ ] Pick a provider (Brevo / MailerLite / Listmonk-self-hosted recommended
      for GDPR).
- [ ] Sign an AVV / DPA with the provider.
- [ ] Wire up the form in `src/components/sections/Newsletter.astro`.
- [ ] Add the processor to **both** privacy pages
      (`pages/datenschutz.astro`, `pages/en/privacy-policy.astro`).
- [ ] Implement double-opt-in confirmation flow.

### Domain & TLS (Strato)
- [ ] Point `reduceco2now.com` and `www.reduceco2now.com` to the Strato
      package web root.
- [ ] Activate Let's Encrypt (free) in the Strato customer area.
- [ ] Verify HTTP→HTTPS redirect after first deploy.

## 🟦 Nice-to-have (post-launch)

- [ ] OG / Twitter card images (`/og-image.png`, 1200×630)
- [ ] Apple touch icon (`/apple-touch-icon.png`, 180×180)
- [ ] PWA manifest with proper icons (192/512)
- [ ] French / Spanish / additional language JSONs in
      `src/i18n/locales/` (architecture already supports it)
- [ ] Replace newsletter placeholder with real provider
- [ ] Hook up analytics — only **after** signing AVV and adding provider
      to Datenschutz and adding a consent banner if it sets non-essential
      cookies.

## 🟪 If you ever add any of these → re-do the privacy review

Adding any of the following changes the legal posture and **requires**
updates to the Datenschutz pages, possibly a consent banner, and DPAs:

- Google Fonts (external CDN)
- Google Analytics, Plausible (self-hosted is fine, hosted needs review),
  Matomo, Fathom
- Embedded YouTube, Vimeo, Spotify
- Mailchimp / Constant Contact (US providers — extra DSGVO scrutiny)
- Stripe / payment providers
- Discord widget (embedded), Twitter/X embeds
- Any third-party JS, fonts, images, or pixels

## 🧪 Pre-launch QA

- [ ] Run `npm run build` — must complete with 0 missing i18n keys
- [ ] Open every legal page on the staging host and confirm **no yellow
      `[TODO]` highlights remain**
- [ ] Test `/`, `/en/`, `/impressum`, `/datenschutz`,
      `/en/legal-notice`, `/en/privacy-policy`, `/sitemap-index.xml`
- [ ] `curl -I https://reduceco2now.com/` should return
      `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, etc.
- [ ] Run [securityheaders.com](https://securityheaders.com/) and
      [pagespeed.web.dev](https://pagespeed.web.dev/) on production URL
