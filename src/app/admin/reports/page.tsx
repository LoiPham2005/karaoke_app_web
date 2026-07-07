'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminReports, useUpdateAdminReport } from '@/lib/queries';

const FILTERS = [
  { id: 'PENDING', label: 'Chờ xử lý' },
  { id: 'RESOLVED', label: 'Đã xử lý' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: '', label: 'Tất cả' },
];

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'destructive' | 'outline'> = {
  PENDING: 'warning',
  RESOLVED: 'success',
  REJECTED: 'destructive',
};

export default function AdminReportsPage() {
  const [filter, setFilter] = useState('PENDING');
  const { data, isLoading } = useAdminReports(filter);
  const update = useUpdateAdminReport();
  const reports = data?.items ?? [];

  const resolve = (id: string, status: string) =>
    update.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast.success(status === 'RESOLVED' ? 'Đã xử lý' : 'Đã từ chối'),
        onError: () => toast.error('Không cập nhật được'),
      },
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Báo cáo bài hát</h1>
        <p className="text-muted-foreground mt-1">{data?.total ?? 0} báo cáo</p>
      </div>

      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <Badge
            key={f.id || 'all'}
            variant={filter === f.id ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-1.5 text-sm"
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Đang tải...
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Không có báo cáo
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl p-4 flex items-center gap-4">
              <Link
                href={`/play/${r.song?.youtubeId}`}
                className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-accent flex items-center justify-center"
              >
                {r.song?.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.song.thumbnailUrl}
                    alt={r.song.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Play className="h-5 w-5 text-muted-foreground" />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{r.song?.title}</p>
                <p className="text-xs text-primary">{r.reason}</p>
                {r.detail && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.detail}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">
                  bởi {r.user?.displayName ?? r.user?.email}
                </p>
              </div>

              <Badge variant={STATUS_BADGE[r.status] ?? 'outline'} className="shrink-0">
                {r.status}
              </Badge>

              {r.status === 'PENDING' && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Đã xử lý"
                    onClick={() => resolve(r.id, 'RESOLVED')}
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title="Từ chối"
                    onClick={() => resolve(r.id, 'REJECTED')}
                  >
                    <X className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
