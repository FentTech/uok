const fs = require('fs');
const path = require('path');

const LANGUAGES = ['zh', 'ja', 'ar', 'fr', 'ko', 'es', 'pt'];
const NAMESPACES = ['common', 'home', 'auth', 'dashboard', 'contact', 'pages', 'validation'];

const enLocalesDir = path.join(__dirname, '../client/i18n/locales/en');

console.log('Creating translation file stubs...');

LANGUAGES.forEach(lang => {
  const langDir = path.join(__dirname, `../client/i18n/locales/${lang}`);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  NAMESPACES.forEach(ns => {
    const enFile = path.join(enLocalesDir, `${ns}.json`);
    const langFile = path.join(langDir, `${ns}.json`);

    // Skip if file already exists
    if (fs.existsSync(langFile)) {
      console.log(`✓ ${lang}/${ns}.json exists`);
      return;
    }

    try {
      // Read English file
      const enContent = fs.readFileSync(enFile, 'utf-8');
      
      // For now, create copy of English as placeholder
      // This will be translated using the API endpoint later
      fs.writeFileSync(langFile, enContent);
      
      console.log(`✓ Created ${lang}/${ns}.json`);
    } catch (error) {
      console.error(`✗ Error creating ${lang}/${ns}.json:`, error.message);
    }
  });
});

console.log('✨ Done! Run: npm run translate:generate (with CLAUDE_API_KEY set) to fill in proper translations');
