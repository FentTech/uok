import { Router, Request, Response } from "express";
import { z } from "zod";

const translateRouter = Router();

// Translation schema
const translateRequestSchema = z.object({
  text: z.string().min(1),
  targetLanguage: z.enum(["zh", "ja", "ar", "fr", "ko", "es", "pt"]),
});

type TranslationCache = {
  [key: string]: {
    [lang: string]: string;
  };
};

// Simple in-memory cache for translations
const translationCache: TranslationCache = {};

// Language names for context
const languageNames: { [key: string]: string } = {
  zh: "Chinese (Simplified)",
  ja: "Japanese",
  ar: "Arabic",
  fr: "French",
  ko: "Korean",
  es: "Spanish",
  pt: "Portuguese",
};

// Function to call Claude for translation
async function translateWithClaude(
  text: string,
  targetLanguage: string,
): Promise<string> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    // Fallback: return placeholder if no API key
    return `[${targetLanguage}] ${text}`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Translate the following text to ${languageNames[targetLanguage]}. Return ONLY the translated text, no explanations:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.statusText);
      return `[${targetLanguage}] ${text}`;
    }

    const data = await response.json();
    const translatedText =
      data.content[0]?.text || `[${targetLanguage}] ${text}`;
    return translatedText.trim();
  } catch (error) {
    console.error("Translation error:", error);
    return `[${targetLanguage}] ${text}`;
  }
}

// Batch translate multiple strings
async function batchTranslate(
  strings: string[],
  targetLanguage: string,
): Promise<string[]> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    return strings.map((s) => `[${targetLanguage}] ${s}`);
  }

  try {
    const stringsList = strings.map((s, i) => `${i + 1}. ${s}`).join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `Translate the following numbered items to ${languageNames[targetLanguage]}. Return ONLY the translated items in the same numbered format, no explanations:\n\n${stringsList}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.statusText);
      return strings.map((s) => `[${targetLanguage}] ${s}`);
    }

    const data = await response.json();
    const responseText = data.content[0]?.text || "";

    // Parse numbered responses
    const translatedStrings = responseText
      .split("\n")
      .filter((line: string) => line.trim())
      .map((line: string) => {
        // Remove numbering and return just the translation
        return line.replace(/^\d+\.\s*/, "").trim();
      });

    return translatedStrings.length === strings.length
      ? translatedStrings
      : strings.map((s) => `[${targetLanguage}] ${s}`);
  } catch (error) {
    console.error("Batch translation error:", error);
    return strings.map((s) => `[${targetLanguage}] ${s}`);
  }
}

// POST /api/translate/single
translateRouter.post("/single", async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = translateRequestSchema.parse(req.body);

    // Check cache
    const cacheKey = `${text}-${targetLanguage}`;
    if (translationCache[cacheKey]?.[targetLanguage]) {
      return res.json({
        success: true,
        text: translationCache[cacheKey][targetLanguage],
        cached: true,
      });
    }

    // Translate
    const translatedText = await translateWithClaude(text, targetLanguage);

    // Cache result
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {};
    }
    translationCache[cacheKey][targetLanguage] = translatedText;

    res.json({
      success: true,
      text: translatedText,
      cached: false,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(400).json({
      success: false,
      error: "Translation failed",
    });
  }
});

// POST /api/translate/batch
translateRouter.post("/batch", async (req: Request, res: Response) => {
  try {
    const { strings, targetLanguage } = z
      .object({
        strings: z.array(z.string()),
        targetLanguage: z.enum(["zh", "ja", "ar", "fr", "ko", "es", "pt"]),
      })
      .parse(req.body);

    // Check for cached translations
    const results: string[] = [];
    const uncachedIndices: number[] = [];
    const uncachedStrings: string[] = [];

    for (let i = 0; i < strings.length; i++) {
      const cacheKey = `${strings[i]}-${targetLanguage}`;
      if (translationCache[cacheKey]?.[targetLanguage]) {
        results[i] = translationCache[cacheKey][targetLanguage];
      } else {
        uncachedIndices.push(i);
        uncachedStrings.push(strings[i]);
      }
    }

    // Translate uncached strings
    if (uncachedStrings.length > 0) {
      const translatedUncached = await batchTranslate(
        uncachedStrings,
        targetLanguage,
      );

      for (let i = 0; i < uncachedIndices.length; i++) {
        const idx = uncachedIndices[i];
        results[idx] = translatedUncached[i];

        // Cache result
        const cacheKey = `${strings[idx]}-${targetLanguage}`;
        if (!translationCache[cacheKey]) {
          translationCache[cacheKey] = {};
        }
        translationCache[cacheKey][targetLanguage] = translatedUncached[i];
      }
    }

    res.json({
      success: true,
      translations: results,
      targetLanguage,
    });
  } catch (error) {
    console.error("Batch translation error:", error);
    res.status(400).json({
      success: false,
      error: "Batch translation failed",
    });
  }
});

// POST /api/translate/json
// Translate an entire JSON object
translateRouter.post("/json", async (req: Request, res: Response) => {
  try {
    const { json, targetLanguage } = z
      .object({
        json: z.record(z.any()),
        targetLanguage: z.enum(["zh", "ja", "ar", "fr", "ko", "es", "pt"]),
      })
      .parse(req.body);

    // Extract all string values
    const strings: string[] = [];
    const stringPaths: string[] = [];

    function extractStrings(obj: any, path: string = "") {
      if (typeof obj === "string") {
        strings.push(obj);
        stringPaths.push(path);
      } else if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, i) => {
            extractStrings(item, `${path}[${i}]`);
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            extractStrings(value, path ? `${path}.${key}` : key);
          });
        }
      }
    }

    extractStrings(json);

    // Translate all strings
    const translatedStrings = await batchTranslate(strings, targetLanguage);

    // Reconstruct JSON
    const result: any = JSON.parse(JSON.stringify(json));

    function setValues(obj: any, path: string, value: string) {
      const parts = path.split(".");
      let current = obj;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (part.includes("[")) {
          const [key, indexStr] = part.split("[");
          const index = parseInt(indexStr.replace("]", ""));
          if (!current[key]) current[key] = [];
          if (!current[key][index]) current[key][index] = {};
          current = current[key][index];
        } else {
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }

      const lastPart = parts[parts.length - 1];
      if (lastPart.includes("[")) {
        const [key, indexStr] = lastPart.split("[");
        const index = parseInt(indexStr.replace("]", ""));
        if (!current[key]) current[key] = [];
        current[key][index] = value;
      } else {
        current[lastPart] = value;
      }
    }

    for (let i = 0; i < stringPaths.length; i++) {
      setValues(result, stringPaths[i], translatedStrings[i]);
    }

    res.json({
      success: true,
      translation: result,
      targetLanguage,
      stringsTranslated: strings.length,
    });
  } catch (error) {
    console.error("JSON translation error:", error);
    res.status(400).json({
      success: false,
      error: "JSON translation failed",
    });
  }
});

export { translateRouter };
