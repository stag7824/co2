// Centralized site-wide configuration. Edit values here, not in the templates.
// Anything legally relevant is also surfaced from here.

export const SITE = {
  name: 'ReduceCO2Now',
  url: 'https://reduceco2now.com',
  defaultDescription: {
    de: 'ReduceCO2Now — Initiative zur Reduktion von CO₂-Emissionen. Mitmachen, informieren, handeln.',
    en: 'ReduceCO2Now — an initiative to reduce CO₂ emissions. Join, learn, take action.',
  },
} as const;

// === LEGAL / IMPRESSUM ===
// All [TODO: ...] values MUST be filled in before publishing the site.
// Required by §5 DDG (formerly TMG) and §18 MStV.
export const LEGAL = {
  // Name of the natural or legal person responsible for the site
  responsibleName: '[TODO: Vollständiger Name oder Vereins-/Firmenname]',
  // Legal form (e.g., 'e. V.', 'GmbH', 'Einzelperson') — leave empty string if private individual
  legalForm: '[TODO: Rechtsform — z. B. e. V., GmbH, Einzelperson]',
  // Postal address (mandatory — no PO Box only)
  street: '[TODO: Straße und Hausnummer]',
  postalCode: '[TODO: PLZ]',
  city: '[TODO: Ort]',
  country: 'Deutschland',
  // Contact (email mandatory; phone strongly recommended)
  email: '[TODO: kontakt@reduceco2now.com]',
  phone: '[TODO: +49 ...]',
  // For associations (Verein): Vereinsregister + Registernummer; for companies: Handelsregister
  registerEntry: '[TODO: z. B. Vereinsregister Amtsgericht XYZ, VR 12345 — oder leer lassen]',
  // Authorized representative(s) — Vorstand / Geschäftsführer
  representative: '[TODO: Name des/der Vertretungsberechtigten — z. B. Vorstand: Max Mustermann]',
  // VAT ID per §27a UStG (only if the entity has one)
  vatId: '[TODO: USt-IdNr. — oder leer lassen]',
  // Person responsible for editorial content per §18 Abs. 2 MStV (must be in DE)
  contentResponsibleName: '[TODO: Name der/des Verantwortlichen für den Inhalt]',
  contentResponsibleAddress: '[TODO: Anschrift — kann mit Hauptanschrift identisch sein]',
  // EU online dispute resolution — required link for businesses; safe to display in any case
  showODRLink: true,
} as const;

// === HOSTING ===
// Strato is the data processor for hosting; named in the Datenschutzerklärung.
export const HOSTING = {
  providerName: 'STRATO AG',
  providerAddress: 'Pascalstraße 10, 10587 Berlin, Deutschland',
  providerPrivacyUrl: 'https://www.strato.de/datenschutz/',
} as const;

// === SOCIAL / COMMUNITY LINKS ===
// External hyperlinks only — no embedded widgets, no tracking pixels.
// Replace the [TODO: ...] hrefs with real URLs (or set to null to hide).
export const SOCIAL: { label: string; href: string | null; rel?: string }[] = [
  { label: 'Discord', href: '[TODO: https://discord.gg/...]' },
  { label: 'Instagram', href: '[TODO: https://instagram.com/...]' },
  { label: 'LinkedIn', href: '[TODO: https://linkedin.com/company/...]' },
  { label: 'X / Twitter', href: '[TODO: https://x.com/...]' },
];

// Last update of legal texts — shown in Impressum/Datenschutz.
export const LEGAL_LAST_UPDATED = '2026-04-27';

// Public Discord invite — also surfaced in nav CTA & DiscordCTA section.
export const DISCORD_INVITE = 'https://discord.gg/J759vRuB';

// Newsletter provider URL — null until we connect AWeber (or another provider)
// and have the corresponding entries in the privacy policy.
export const NEWSLETTER: { providerUrl: string | null } = {
  providerUrl: null,
};
