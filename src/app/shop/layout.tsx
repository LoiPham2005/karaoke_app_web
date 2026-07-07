'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  UtensilsCrossed,
  CreditCard,
  Radio,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { ShopGuard } from '@/components/shop/ShopGuard';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const ALL_NAV = [
  { href: '/shop', label: 'Dashboard', icon: LayoutDashboard, ownerOnly: true },
  { href: '/shop/rooms', label: 'Phòng', icon: DoorOpen, ownerOnly: true },
  { href: '/shop/staff', label: 'Nhân viên', icon: Users, ownerOnly: true },
  { href: '/shop/menu', label: 'Menu', icon: UtensilsCrossed, ownerOnly: true },
  { href: '/shop/subscription', label: 'Gói phần mềm', icon: CreditCard, ownerOnly: true },
  { href: '/shop/live', label: 'Vận hành', icon: Radio, ownerOnly: false },
];

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === 'OWNER';
  const nav = ALL_NAV.filter((n) => isOwner || !n.ownerOnly);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card/30 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <Logo />
          <p className="text-xs text-muted-foreground mt-2">
            {isOwner ? 'Quản lý tiệm' : 'Vận hành quầy'}
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active =
              item.href === '/shop'
                ? pathname === '/shop'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/home"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-accent transition-all"
          >
            <LogOut className="h-4 w-4" />
            Về app người dùng
          </Link>
        </div>
      </aside>
      <main className="flex-1">
        <ShopGuard>{children}</ShopGuard>
      </main>
    </div>
  );
}
