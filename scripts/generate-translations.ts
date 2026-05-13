import fs from "fs";
import path from "path";

const API_URL = process.env.API_URL || "http://localhost:8080";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

const SUPPORTED_LANGUAGES = ["zh", "ja", "ar", "fr", "ko", "es", "pt"];
const TRANSLATION_NAMESPACES = [
  "common",
  "home",
  "auth",
  "dashboard",
  "contact",
  "pages",
  "validation",
];

async function translateJson(json: any, targetLanguage: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/translate/json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to translate to ${targetLanguage}:`,
        response.statusText,
      );
      return json; // Return original if translation fails
    }

    const data = await response.json();
    return data.translation;
  } catch (error) {
    console.error(`Error translating to ${targetLanguage}:`, error);
    return json;
  }
}

async function generateTranslations() {
  console.log("Starting translation generation...");

  if (!CLAUDE_API_KEY) {
    console.warn("⚠️  CLAUDE_API_KEY not set. Using placeholder translations.");
    console.warn(
      "Set CLAUDE_API_KEY environment variable to enable AI translations.",
    );
  }

  const enLocalesDir = path.join(process.cwd(), "client/i18n/locales/en");

  // Get all English translation files
  const enFiles = fs
    .readdirSync(enLocalesDir)
    .filter((f) => f.endsWith(".json"));

  console.log(`Found ${enFiles.length} English translation files`);

  // For each language
  for (const lang of SUPPORTED_LANGUAGES) {
    const langDir = path.join(process.cwd(), `client/i18n/locales/${lang}`);

    // Create directory if it doesn't exist
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }

    // For each translation file
    for (const file of enFiles) {
      const enFile = path.join(enLocalesDir, file);
      const langFile = path.join(langDir, file);

      // Skip if already exists
      if (fs.existsSync(langFile)) {
        console.log(`✓ ${lang}/${file} already exists`);
        continue;
      }

      try {
        // Read English file
        const enContent = JSON.parse(fs.readFileSync(enFile, "utf-8"));

        console.log(`📝 Translating ${file} to ${lang}...`);

        // Translate
        const translatedContent = await translateJson(enContent, lang);

        // Write translated file
        fs.writeFileSync(langFile, JSON.stringify(translatedContent, null, 2));

        console.log(`✓ Generated ${lang}/${file}`);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`✗ Error generating ${lang}/${file}:`, error);
      }
    }
  }

  console.log("✨ Translation generation complete!");
}

generateTranslations().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
