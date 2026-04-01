'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Menu,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');

  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, href: 'admin' },
    { key: 'surveys', icon: ClipboardList, href: 'admin/surveys' },
    { key: 'settings', icon: Settings, href: 'admin/settings' },
  ] as const;

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push(`/${locale}/login`);
  }

  function NavLink({ item }: { item: typeof navItems[number] }) {
    const href = `/${locale}/${item.href}`;
    const isActive = pathname === href || pathname.startsWith(href + '/');

    const link = (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-lg text-sm transition-all duration-150',
          collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
          isActive
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <item.icon className={cn('flex-shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
        {!collapsed && <span>{t(item.key)}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger >{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {t(item.key)}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  }

  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-200',
      collapsed ? 'w-[60px]' : 'w-[224px]'
    )}>
      {/* Brand header */}
      <div className={cn(
        'flex items-center border-b border-gray-100',
        collapsed ? 'justify-center py-3 px-2' : 'justify-between py-3 px-4'
      )}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900">{t('brand')}</span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 hidden md:flex"
              aria-label={t('toggleCollapse')}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 hidden md:flex"
            aria-label={t('toggleExpand')}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <TooltipProvider >
        <nav className={cn('flex-1 space-y-1', collapsed ? 'px-1.5 py-2' : 'px-3 py-3')}>
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
      </TooltipProvider>

      {/* Footer */}
      <Separator className="bg-gray-100" />
      <div className={cn(collapsed ? 'px-1.5 py-2' : 'px-3 py-3')}>
        <TooltipProvider >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger >
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 w-full transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{t('signOut')}</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 w-full transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('signOut')}</span>
            </button>
          )}
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={t('toggleMenu')}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-[224px] shadow-xl">{sidebarContent}</div>
          <div className="flex-1 bg-black/30 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)}>
            <button
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 shadow-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0">{sidebarContent}</div>
    </>
  );
}
