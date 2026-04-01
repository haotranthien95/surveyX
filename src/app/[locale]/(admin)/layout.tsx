// src/app/[locale]/(admin)/layout.tsx
import { Toaster } from 'sonner';
import { cachedGetSmtpSettings } from '@/lib/cache';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { ScatteredPixels } from '@/components/motion/ScatteredPixels';
import { QueryProvider } from '@/components/providers/QueryProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await cachedGetSmtpSettings();
  const hasSmtp = settings !== null;

  return (
    <div className="flex min-h-screen bg-white relative">
      <ScatteredPixels />
      <AdminSidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <QueryProvider>
            <AdminLayoutClient hasSmtp={hasSmtp}>
              {children}
            </AdminLayoutClient>
          </QueryProvider>
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
}
