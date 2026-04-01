// src/app/layout.tsx
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/noto-sans-myanmar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
