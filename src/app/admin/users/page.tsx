'use client';

import { useEffect, useState } from 'react';
import { Search, Crown, Shield, Ban, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminUsers, useUpdateAdminUser, useSetUserPremium } from '@/lib/queries';

const ROLE_FILTERS = ['', 'USER', 'STAFF', 'OWNER', 'ADMIN', 'SUPER_ADMIN'];
const ROLE_LABEL: Record<string, string> = {
  '': 'Tất cả',
  USER: 'User',
  STAFF: 'Staff',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole] = useState('');

  // Debounce ô tìm kiếm 400ms.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isLoading } = useAdminUsers(debounced, role);
  const updateUser = useUpdateAdminUser();
  const setPremium = useSetUserPremium();
  const users = data?.items ?? [];

  const togglePremium = (id: string, isPremium: boolean) => {
    setPremium.mutate(
      { id, days: isPremium ? 0 : 30 },
      {
        onSuccess: () =>
          toast.success(isPremium ? 'Đã gỡ Premium' : 'Đã cấp Premium 30 ngày'),
        onError: () => toast.error('Không cập nhật được'),
      },
    );
  };

  const toggleBan = (id: string, status: string) => {
    const next = status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    updateUser.mutate(
      { id, status: next },
      {
        onSuccess: () => toast.success(next === 'BANNED' ? 'Đã khoá' : 'Đã mở khoá'),
        onError: () => toast.error('Không cập nhật được'),
      },
    );
  };

  const changeRole = (id: string, role: string) => {
    updateUser.mutate(
      { id, role },
      {
        onSuccess: () => toast.success('Đã đổi vai trò'),
        onError: () => toast.error('Không cập nhật được'),
      },
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo email / tên..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {ROLE_FILTERS.map((r) => (
            <Badge
              key={r || 'all'}
              variant={role === r ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1.5 text-sm shrink-0"
              onClick={() => setRole(r)}
            >
              {ROLE_LABEL[r]}
            </Badge>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Không có người dùng
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.displayName} />}
                <AvatarFallback>{u.displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{u.displayName}</p>
                  {u.isPremium && <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
              </div>

              <Badge variant="outline" className="hidden sm:inline-flex shrink-0">
                <Shield className="h-3 w-3 mr-1" />
                {ROLE_LABEL[u.role] ?? u.role}
              </Badge>
              {u.status === 'BANNED' && (
                <Badge variant="destructive" className="shrink-0">
                  Đã khoá
                </Badge>
              )}

              {/* Đổi role nhanh */}
              <select
                value={u.role}
                onChange={(e) => changeRole(u.id, e.target.value)}
                className="hidden md:block rounded-lg border border-border bg-background px-2 py-1 text-xs"
              >
                {['USER', 'STAFF', 'OWNER', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                variant={u.isPremium ? 'outline' : 'ghost'}
                disabled={setPremium.isPending}
                onClick={() => togglePremium(u.id, u.isPremium)}
                title={u.isPremium ? 'Gỡ Premium' : 'Cấp Premium 30 ngày'}
                className="shrink-0"
              >
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="hidden lg:inline ml-1.5">
                  {u.isPremium ? 'Gỡ Premium' : 'Cấp Premium 30 ngày'}
                </span>
              </Button>

              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => toggleBan(u.id, u.status)}
                title={u.status === 'BANNED' ? 'Mở khoá' : 'Khoá'}
              >
                {u.status === 'BANNED' ? (
                  <RotateCcw className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Ban className="h-4 w-4 text-red-400" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
