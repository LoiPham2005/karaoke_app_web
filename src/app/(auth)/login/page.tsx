'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const loginAction = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await loginAction(email.trim(), password);
      toast.success(`Chào ${user.displayName}!`);
      // Admin/Super admin → vào trang quản trị; còn lại vào app người dùng.
      router.push(
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
          ? '/admin'
          : user.role === 'OWNER'
            ? '/shop'
            : user.role === 'STAFF'
              ? '/shop/live'
              : '/home',
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  // 🧪 DEV: đăng nhập nhanh bằng TÀI KHOẢN SEED THẬT ở backend (prisma/seed.ts).
  // Tất cả mật khẩu = "123456". Xoá block này khi lên production.
  const DEV_ACCOUNTS = [
    { email: 'user@gmail.com', icon: '🎤', label: 'Người dùng', desc: 'USER' },
    { email: 'premium@gmail.com', icon: '💎', label: 'Premium', desc: 'USER + Premium' },
    { email: 'owner@gmail.com', icon: '🏪', label: 'Chủ tiệm', desc: 'OWNER' },
    { email: 'staff@gmail.com', icon: '🧑‍💼', label: 'Nhân viên', desc: 'STAFF' },
    { email: 'admin@gmail.com', icon: '👑', label: 'Quản trị', desc: 'ADMIN' },
    { email: 'superadmin@gmail.com', icon: '⭐', label: 'Chủ hệ thống', desc: 'SUPER_ADMIN' },
  ] as const;
  const DEV_PASSWORD = '123456';

  const quickLogin = async (devEmail: string) => {
    setIsLoading(true);
    try {
      const user = await loginAction(devEmail, DEV_PASSWORD);
      toast.success(`Chào ${user.displayName}!`);
      router.push(
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
          ? '/admin'
          : user.role === 'OWNER'
            ? '/shop'
            : user.role === 'STAFF'
              ? '/shop/live'
              : '/home',
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Đăng nhập</h1>
        <p className="text-muted-foreground">Chào mừng bạn quay lại! Đăng nhập để tiếp tục hát 🎤</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="ban@gmail.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Mật khẩu</label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
        </div>
      </div>

      <Button 
        type="button"
        variant="outline" 
        className="w-full" 
        size="lg"
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => {
            router.push('/home');
            setIsLoading(false);
          }, 500);
        }}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
        </svg>
        Đăng nhập với Google
      </Button>

      {/* 🧪 Đăng nhập nhanh bằng tài khoản seed thật (Dev) */}
      <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          ⚡ Đăng nhập nhanh (Dev) · mật khẩu chung: 123456
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEV_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              disabled={isLoading}
              onClick={() => quickLogin(a.email)}
              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 text-center transition hover:border-primary hover:bg-primary/5 disabled:opacity-50"
            >
              <span className="text-2xl leading-none">{a.icon}</span>
              <span className="text-xs font-semibold">{a.label}</span>
              <span className="text-[10px] text-muted-foreground">{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
