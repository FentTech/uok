import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  fr: { name: 'Français', flag: '🇫🇷' },
  ko: { name: '한국어', flag: '🇰🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  pt: { name: 'Português', flag: '🇵🇹' },
};

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === i18n.language) return;

    setIsLoading(true);
    try {
      // Change language in i18n
      await i18n.changeLanguage(langCode);

      // Save preference to localStorage
      localStorage.setItem('preferredLanguage', langCode);

      // Set HTML lang attribute for accessibility
      document.documentElement.lang = langCode;

      // Set text direction for RTL languages (Arabic)
      if (langCode === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
        document.body.dir = 'ltr';
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLanguage = SUPPORTED_LANGUAGES[i18n.language as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES.en;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Select language"
          disabled={isLoading}
        >
          <Globe className="w-4 h-4" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-sm font-medium">
            {currentLanguage.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={`cursor-pointer flex items-center gap-2 ${
              code === i18n.language ? 'bg-blue-50 dark:bg-blue-900' : ''
            }`}
          >
            <span className="text-lg w-6">{flag}</span>
            <span className="flex-1">{name}</span>
            {code === i18n.language && (
              <span className="text-blue-600 dark:text-blue-400 font-semibold">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
