import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại đăng nhập
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Quên mật khẩu?</h1>
        <p className="text-muted-foreground">
          Đừng lo! Nhập email và chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
        </p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="email" placeholder="ban@gmail.com" className="pl-10" required />
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full" size="lg">
          Gửi link đặt lại
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Nhớ ra rồi?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
