'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

/// Chặn truy cập admin với người không đủ quyền (redirect về /home).
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = !!user && ADMIN_ROLES.includes(user.role);

  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace('/home');
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Đang tải...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Bạn không có quyền truy cập trang quản trị.
      </div>
    );
  }
  return <>{children}</>;
}
