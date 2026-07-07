import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left - form */}
      <div className="flex-1 flex flex-col p-6 lg:p-12">
        <Link href="/" className="self-start">
          <Logo />
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © 2026 SingNow. Made with ❤️ in Vietnam
        </p>
      </div>

      {/* Right - decoration */}
      <div className="hidden lg:flex flex-1 relative gradient-primary items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="relative text-white text-center space-y-6 max-w-md">
          <div className="text-8xl">🎤</div>
          <h2 className="text-4xl font-bold">Sẵn sàng hát chưa?</h2>
          <p className="text-lg opacity-90">
            Hàng triệu bài hát đang chờ bạn — Từ Bolero, Vpop đến US-UK, tất cả miễn phí
          </p>
        </div>
      </div>
    </div>
  );
}
