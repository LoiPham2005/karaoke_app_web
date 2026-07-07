import Link from 'next/link';
import { Mic2, Music, Search, ListMusic, Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/common/Logo';

const features = [
  { icon: Search, title: 'Tìm bài siêu nhanh', desc: 'Kho nhạc vô tận từ YouTube — bài nào cũng có' },
  { icon: Music, title: 'Lyrics đồng bộ chuẩn', desc: 'Highlight từng chữ đúng nhịp, hát không bị lệch' },
  { icon: ListMusic, title: 'Playlist & hàng chờ', desc: 'Tạo playlist riêng, thêm bài chờ phát liên tục' },
  { icon: Users, title: 'Hát chung với bạn', desc: 'Phòng karaoke online, mời bạn bè cùng hát' },
  { icon: Sparkles, title: 'Chấm điểm AI', desc: 'AI phân tích giọng hát, biết bạn hát hay cỡ nào' },
  { icon: Heart, title: 'Hoàn toàn miễn phí', desc: 'Không giới hạn bài hát, không bắt buộc đăng ký' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container flex items-center justify-between py-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Tính năng
            </a>
            <a href="#how" className="text-muted-foreground hover:text-foreground transition">
              Cách dùng
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Premium
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient">Đăng ký</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Karaoke miễn phí cho mọi nhà</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Hát mọi lúc, <span className="text-gradient">mọi nơi</span>
              <br />
              cùng <span className="text-gradient">SingNow</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ứng dụng karaoke với kho nhạc vô tận từ YouTube. Lyrics đồng bộ chính xác, chấm điểm AI,
              chia sẻ phòng hát với bạn bè — tất cả hoàn toàn miễn phí.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/register">
                <Button size="lg" variant="gradient" className="min-w-48">
                  Bắt đầu hát ngay
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/home">
                <Button size="lg" variant="outline" className="min-w-48">
                  Khám phá thư viện
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="aspect-video rounded-3xl bg-card border border-border overflow-hidden shadow-2xl shadow-primary/20">
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <Mic2 className="h-32 w-32 text-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Tất cả những gì bạn cần để <span className="text-gradient">hát hay</span>
            </h2>
            <p className="text-muted-foreground">6 tính năng tuyệt vời để biến điện thoại thành dàn karaoke</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Chỉ <span className="text-gradient">3 bước</span> để hát
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { n: 1, t: 'Tìm bài', d: 'Gõ tên bài hoặc ca sĩ — kho nhạc vô tận' },
              { n: 2, t: 'Phát ngay', d: 'Video YouTube + lyrics đồng bộ tự động' },
              { n: 3, t: 'Cứ hát thôi!', d: 'Highlight từng chữ — không bao giờ bị lạc nhịp' },
            ].map((s) => (
              <div key={s.n} className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/30">
                  {s.n}
                </div>
                <h3 className="text-xl font-semibold">{s.t}</h3>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Sẵn sàng để hát chưa? 🎤
            </h2>
            <p className="text-lg text-muted-foreground">
              Tạo tài khoản miễn phí và bắt đầu hát ngay trong 30 giây
            </p>
            <Link href="/register">
              <Button size="lg" variant="gradient">
                Đăng ký miễn phí
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">© 2026 SingNow. Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
