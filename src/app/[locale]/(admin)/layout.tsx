// src/app/[locale]/(admin)/layout.tsx
import { Toaster } from 'sonner';
import { getSmtpSettings } from '@/lib/services/smtp.service';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { ScatteredPixels } from '@/components/motion/ScatteredPixels';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSmtpSettings();
  const hasSmtp = settings !== null;

  return (
    <div className="flex min-h-screen bg-white relative">
      <ScatteredPixels />
      <AdminSidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <AdminLayoutClient hasSmtp={hasSmtp}>
            {children}
          </AdminLayoutClient>
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
}
