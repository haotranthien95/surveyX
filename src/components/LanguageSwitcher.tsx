'use client';

// src/components/LanguageSwitcher.tsx
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');

  function switchLocale() {
    const targetLocale = locale === 'en' ? 'my' : 'en';
    // Replace current locale prefix in pathname
    // e.g. /en/admin -> /my/admin, /my/login -> /en/login
    const newPath = pathname.replace(/^\/(en|my)/, `/${targetLocale}`);
    router.push(newPath);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={switchLocale}
      className="text-xs font-medium bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
      aria-label={locale === 'en' ? 'Switch to Burmese' : 'Switch to English'}
    >
      {locale === 'en' ? t('burmese') : t('english')}
    </Button>
  );
}
