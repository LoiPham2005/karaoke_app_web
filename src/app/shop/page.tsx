'use client';

import Link from 'next/link';
import {
  DoorOpen,
  DoorClosed,
  Radio,
  ShoppingBag,
  CalendarDays,
  Wallet,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useShopMe, useShopStats, useShopSubscription } from '@/lib/shop';
import { formatVnd } from '@/lib/utils';

export default function ShopDashboardPage() {
  const { data: shop } = useShopMe();
  const { data: stats, isLoading, isError } = useShopStats();
  const { data: sub } = useShopSubscription();

  // Chỉ nhắc khi chưa kích hoạt thuê bao (dùng thử / hết hạn / tạm khoá).
  const showSubBanner = !!sub && !sub.active;

  const cards = [
    {
      label: 'Tổng số phòng',
      value: stats ? String(stats.roomsTotal) : '—',
      icon: DoorClosed,
      color: 'text-sky-400',
    },
    {
      label: 'Đang sử dụng',
      value: stats ? String(stats.roomsOccupied) : '—',
      icon: DoorOpen,
      color: 'text-amber-400',
    },
    {
      label: 'Phiên đang mở',
      value: stats ? String(stats.activeSessions) : '—',
      icon: Radio,
      color: 'text-emerald-400',
    },
    {
      label: 'Đơn hôm nay',
      value: stats ? String(stats.ordersToday) : '—',
      icon: ShoppingBag,
      color: 'text-violet-400',
    },
    {
      label: 'Doanh thu hôm nay',
      value: stats ? formatVnd(stats.revenueToday) : '—',
      icon: Wallet,
      color: 'text-primary',
    },
    {
      label: 'Doanh thu tháng',
      value: stats ? formatVnd(stats.revenueMonth) : '—',
      icon: CalendarDays,
      color: 'text-rose-400',
    },
  ];

  const links = [
    { href: '/shop/live', label: 'Vận hành quầy', icon: Radio },
    { href: '/shop/rooms', label: 'Quản lý phòng', icon: DoorClosed },
    { href: '/shop/menu', label: 'Menu sản phẩm', icon: ShoppingBag },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{shop?.name ?? 'Dashboard'}</h1>
        <p className="text-muted-foreground mt-1">
          Tổng quan hoạt động của tiệm
        </p>
      </div>

      {showSubBanner && (
        <Link href="/shop/subscription">
          <Card className="p-4 flex items-center gap-3 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15 transition-all">
            <CreditCard className="h-5 w-5 text-amber-400 shrink-0" />
            <span className="text-sm flex-1">
              {sub?.shopStatus === 'TRIAL'
                ? 'Bạn đang dùng thử. Đăng ký gói phần mềm để tiếp tục sử dụng.'
                : 'Thuê bao phần mềm cần gia hạn. Nhấn để xem các gói.'}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Card>
        </Link>
      )}

      {isError ? (
        <Card className="p-8 text-center text-sm text-destructive">
          Không tải được số liệu. Vui lòng thử lại.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Card key={c.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold mt-3">
                {isLoading ? '...' : c.value}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <Card className="p-5 flex items-center gap-3 hover:bg-accent transition-all">
                <l.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium flex-1">{l.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
