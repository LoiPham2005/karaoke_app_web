'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAdminPayments } from '@/lib/queries';
import { formatVnd } from '@/lib/utils';

const FILTERS = [
  { id: '', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ thanh toán' },
  { id: 'PAID', label: 'Đã thanh toán' },
  { id: 'FAILED', label: 'Thất bại' },
  { id: 'REFUNDED', label: 'Hoàn tiền' },
];

const STATUS_BADGE: Record<string, 'success' | 'secondary' | 'destructive' | 'outline'> = {
  PAID: 'success',
  PENDING: 'secondary',
  FAILED: 'destructive',
  REFUNDED: 'destructive',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Hoàn tiền',
};

function formatDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleString('vi-VN');
}

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState('');
  const { data, isLoading, isError } = useAdminPayments(filter);
  const payments = data?.items ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thanh toán</h1>
        <p className="text-muted-foreground mt-1">{data?.total ?? 0} giao dịch</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <Badge
            key={f.id || 'all'}
            variant={filter === f.id ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-1.5 text-sm shrink-0"
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
        ) : isError ? (
          <div className="bg-card rounded-2xl p-8 text-center text-sm text-destructive">
            Không tải được danh sách thanh toán
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Không có giao dịch
          </div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{formatVnd(p.amount)}</p>
                  <Badge variant="outline" className="text-xs">
                    {p.provider}
                  </Badge>
                  {p.subscription?.userPlan && (
                    <Badge variant="secondary" className="text-xs">
                      {p.subscription.userPlan}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {p.user?.displayName ?? '—'}
                  {p.user?.email ? ` · ${p.user.email}` : ''}
                </p>
                {p.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="hidden sm:block text-right shrink-0">
                <p className="text-xs text-muted-foreground">Tạo: {formatDate(p.createdAt)}</p>
                {p.paidAt && (
                  <p className="text-xs text-muted-foreground">TT: {formatDate(p.paidAt)}</p>
                )}
              </div>

              <Badge variant={STATUS_BADGE[p.status] ?? 'outline'} className="shrink-0">
                {STATUS_LABEL[p.status] ?? p.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
