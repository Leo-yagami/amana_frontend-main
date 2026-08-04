import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { syncDocumentDirection } from '@/i18n/syncDocumentDir';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    syncDocumentDirection(languageCode);
  };

  const currentLanguage = languages.find((lang) =>
    i18n.language?.toLowerCase().startsWith(lang.code)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="w-fit gap-2"
          aria-label={t('common.changeLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">
            {currentLanguage?.name || t('common.language')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={
              i18n.language?.toLowerCase().startsWith(lang.code) ? 'bg-primary/20' : ''
            }
          >
            <span className="mr-2">{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
