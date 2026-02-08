import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LANGUAGES = ["zh", "ja", "ar", "fr", "ko", "es", "pt"];
const NAMESPACES = [
  "common",
  "home",
  "auth",
  "dashboard",
  "contact",
  "pages",
  "validation",
];

const enLocalesDir = path.join(__dirname, "../client/i18n/locales/en");

console.log("Copying English translations to all languages...");

LANGUAGES.forEach((lang) => {
  const langDir = path.join(__dirname, `../client/i18n/locales/${lang}`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
    console.log(`Created directory: ${lang}`);
  }

  NAMESPACES.forEach((ns) => {
    const enFile = path.join(enLocalesDir, `${ns}.json`);
    const langFile = path.join(langDir, `${ns}.json`);

    // Skip if already exists
    if (fs.existsSync(langFile)) {
      console.log(`✓ ${lang}/${ns}.json exists`);
      return;
    }

    try {
      // Read English file
      const enContent = fs.readFileSync(enFile, "utf-8");

      // Write to language directory
      fs.writeFileSync(langFile, enContent);

      console.log(`✓ Created ${lang}/${ns}.json`);
    } catch (error) {
      console.error(`✗ Error creating ${lang}/${ns}.json:`, error.message);
    }
  });
});

console.log("✨ Done! All files are now in place.");
console.log(
  "Next: Use the Claude API endpoint to translate them properly:\n" +
    '  export CLAUDE_API_KEY="sk_..."\n' +
    "  node scripts/generate-translations.ts",
);
