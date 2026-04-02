import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl({
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
});
