'use client';

import Link from 'next/link';
import { Users, Music2, Play, Crown, ListMusic, Flag, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminStats, useAdminReports } from '@/lib/queries';
import { formatNumber, formatVnd } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: pending } = useAdminReports('PENDING');

  const cards = [
    { label: 'Tổng người dùng', value: stats?.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Người dùng Premium', value: stats?.premiumUsers, icon: Crown, color: 'text-amber-400' },
    {
      label: 'Doanh thu',
      value: stats?.revenueVnd,
      icon: DollarSign,
      color: 'text-emerald-400',
      isMoney: true,
    },
    { label: 'Bài hát (cache)', value: stats?.totalSongs, icon: Music2, color: 'text-pink-400' },
    { label: 'Lượt phát trong app', value: stats?.totalPlays, icon: Play, color: 'text-emerald-400' },
    { label: 'Playlist', value: stats?.totalPlaylists, icon: ListMusic, color: 'text-purple-400' },
    { label: 'Báo cáo chờ xử lý', value: stats?.pendingReports, icon: Flag, color: 'text-red-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hệ thống</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-2xl p-5 space-y-2">
            <c.icon className={`h-5 w-5 ${c.color}`} />
            <p className="text-2xl font-bold">
              {isLoading || c.value == null
                ? '—'
                : c.isMoney
                  ? formatVnd(c.value)
                  : formatNumber(c.value)}
            </p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Báo cáo chờ xử lý */}
      <div className="bg-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Báo cáo chờ xử lý</h3>
          <Link href="/admin/reports">
            <Button size="sm" variant="ghost">
              Xem tất cả →
            </Button>
          </Link>
        </div>
        {!pending || pending.items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Không có báo cáo nào đang chờ.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.items.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <Badge variant="outline" className="text-xs shrink-0">
                  {r.reason}
                </Badge>
                <span className="text-sm truncate flex-1">{r.song?.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {r.user?.displayName ?? r.user?.email}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
