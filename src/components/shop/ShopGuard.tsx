'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const SHOP_ROLES = ['OWNER', 'STAFF'];

/// Chặn truy cập khu B2B /shop với người không phải OWNER/STAFF.
/// Chưa đăng nhập → /login; sai role → /home.
export function ShopGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const allowed = !!user && SHOP_ROLES.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace('/login');
    else if (!allowed) router.replace('/home');
  }, [isLoading, user, allowed, router]);

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Đang tải...</div>;
  }
  if (!allowed) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Bạn không có quyền truy cập khu vực này.
      </div>
    );
  }
  return <>{children}</>;
}
