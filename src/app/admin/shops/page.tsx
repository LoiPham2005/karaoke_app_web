'use client';

import { useEffect, useState } from 'react';
import { Search, Store, Plus, Check, Ban, Trash2, Users, DoorOpen, X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useAdminShops,
  useCreateShop,
  useUpdateShop,
  useDeleteShop,
  type ShopStatus,
} from '@/lib/super-admin';

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: '', label: 'Tất cả' },
  { id: 'TRIAL', label: 'Dùng thử' },
  { id: 'ACTIVE', label: 'Đang hoạt động' },
  { id: 'SUSPENDED', label: 'Tạm khoá' },
  { id: 'EXPIRED', label: 'Hết hạn' },
];

const STATUS_BADGE: Record<ShopStatus, 'success' | 'secondary' | 'destructive'> = {
  ACTIVE: 'success',
  TRIAL: 'secondary',
  SUSPENDED: 'destructive',
  EXPIRED: 'destructive',
};

const STATUS_LABEL: Record<ShopStatus, string> = {
  TRIAL: 'Dùng thử',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm khoá',
  EXPIRED: 'Hết hạn',
};

function CreateShopDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const createShop = useCreateShop();

  const submit = () => {
    if (!name.trim() || !slug.trim()) {
      toast.error('Vui lòng nhập tên và slug');
      return;
    }
    createShop.mutate(
      {
        name: name.trim(),
        slug: slug.trim(),
        ownerEmail: ownerEmail.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Đã tạo tiệm');
          onClose();
        },
        onError: (e) =>
          toast.error(
            e instanceof Error && e.message.includes('409')
              ? 'Slug đã tồn tại'
              : e instanceof Error
                ? e.message
                : 'Không tạo được tiệm',
          ),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tạo tiệm mới</h2>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Tên tiệm</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Karaoke ABC" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="karaoke-abc"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">
              Email chủ tiệm (tuỳ chọn)
            </label>
            <Input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@example.com"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={submit} disabled={createShop.isPending}>
            {createShop.isPending ? 'Đang tạo...' : 'Tạo tiệm'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShopsPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading, isError } = useAdminShops({ search: debounced, status });
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();
  const shops = data?.items ?? [];

  const setStatusOf = (id: string, next: ShopStatus, label: string) => {
    updateShop.mutate(
      { id, status: next },
      {
        onSuccess: () => toast.success(label),
        onError: () => toast.error('Không cập nhật được'),
      },
    );
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Xoá tiệm "${name}"?`)) return;
    deleteShop.mutate(id, {
      onSuccess: () => toast.success('Đã xoá tiệm'),
      onError: () => toast.error('Không xoá được'),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tiệm</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} tiệm</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo tiệm
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên / slug..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <Badge
              key={f.id || 'all'}
              variant={status === f.id ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-sm shrink-0"
              onClick={() => setStatus(f.id)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            Không tải được danh sách tiệm
          </div>
        ) : shops.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Không có tiệm</div>
        ) : (
          shops.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <Store className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold truncate">{s.name}</p>
                  <span className="text-xs text-muted-foreground">/{s.slug}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {s.owner
                    ? `${s.owner.displayName}${s.owner.email ? ` · ${s.owner.email}` : ''}`
                    : 'Chưa có chủ'}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1">
                    <DoorOpen className="h-3.5 w-3.5" />
                    {s._count.rooms} phòng
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {s._count.users} nhân sự
                  </span>
                </div>
              </div>

              <Badge variant={STATUS_BADGE[s.status]} className="shrink-0">
                {STATUS_LABEL[s.status]}
              </Badge>

              {s.status !== 'ACTIVE' && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={updateShop.isPending}
                  onClick={() => setStatusOf(s.id, 'ACTIVE', 'Đã duyệt tiệm')}
                  title="Duyệt (kích hoạt)"
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                </Button>
              )}
              {s.status !== 'SUSPENDED' && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  disabled={updateShop.isPending}
                  onClick={() => setStatusOf(s.id, 'SUSPENDED', 'Đã khoá tiệm')}
                  title="Khoá tiệm"
                >
                  <Ban className="h-4 w-4 text-amber-400" />
                </Button>
              )}
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={deleteShop.isPending}
                onClick={() => remove(s.id, s.name)}
                title="Xoá tiệm"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))
        )}
      </div>

      {showCreate && <CreateShopDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
