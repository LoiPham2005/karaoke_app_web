'use client';

import { useState } from 'react';
import { User, Palette, Music2, Bell, Shield, Crown, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'account', label: 'Tài khoản', icon: User },
  { id: 'appearance', label: 'Giao diện', icon: Palette },
  { id: 'playback', label: 'Phát nhạc', icon: Music2 },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'privacy', label: 'Riêng tư', icon: Shield },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'help', label: 'Hỗ trợ', icon: HelpCircle },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Tùy chỉnh trải nghiệm của bạn</p>
      </div>

      <div className="grid lg:grid-cols-[240px,1fr] gap-6">
        {/* Sidebar */}
        <nav className="space-y-1 lg:sticky lg:top-20 self-start">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'account' && <AccountSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'playback' && <PlaybackSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
          {activeTab === 'premium' && <PremiumSettings />}
          {activeTab === 'help' && <HelpSettings />}
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      <Separator />
      {children}
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1">
        <label className="text-sm font-medium">{label}</label>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function AccountSettings() {
  return (
    <Section title="Thông tin tài khoản">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tên hiển thị</label>
          <Input defaultValue="Demo User" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input defaultValue="demo@karaoke.local" disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Input defaultValue="Yêu hát karaoke 🎤" />
        </div>
        <Button variant="gradient">Lưu thay đổi</Button>

        <Separator className="my-6" />

        <div className="space-y-2">
          <h3 className="font-semibold">Đổi mật khẩu</h3>
          <Input type="password" placeholder="Mật khẩu cũ" />
          <Input type="password" placeholder="Mật khẩu mới" />
          <Input type="password" placeholder="Xác nhận mật khẩu mới" />
          <Button variant="outline">Đổi mật khẩu</Button>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <h3 className="font-semibold text-destructive">Vùng nguy hiểm</h3>
          <p className="text-sm text-muted-foreground">
            Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn
          </p>
          <Button variant="destructive">Xóa tài khoản</Button>
        </div>
      </div>
    </Section>
  );
}

function AppearanceSettings() {
  return (
    <Section title="Giao diện">
      <Row label="Chế độ" desc="Tối / Sáng / Theo hệ thống">
        <div className="flex gap-2">
          <Button variant="default" size="sm">
            🌙 Tối
          </Button>
          <Button variant="outline" size="sm">
            ☀️ Sáng
          </Button>
          <Button variant="outline" size="sm">
            Auto
          </Button>
        </div>
      </Row>
      <Separator />
      <Row label="Ngôn ngữ">
        <select className="bg-card border border-input rounded-lg px-3 py-1.5 text-sm">
          <option>Tiếng Việt</option>
          <option>English</option>
        </select>
      </Row>
      <Separator />
      <Row label="Animations" desc="Bật/tắt các hiệu ứng chuyển động">
        <Switch defaultChecked />
      </Row>
    </Section>
  );
}

function PlaybackSettings() {
  return (
    <Section title="Phát nhạc">
      <Row label="Tự động phát bài tiếp theo">
        <Switch defaultChecked />
      </Row>
      <Separator />
      <Row label="Crossfade giữa các bài" desc="Chuyển bài mượt mà">
        <Switch />
      </Row>
      <Separator />
      <Row label="Karaoke effect" desc="Highlight từng chữ theo nhịp">
        <Switch defaultChecked />
      </Row>
      <Separator />
      <Row label="Chất lượng video">
        <select className="bg-card border border-input rounded-lg px-3 py-1.5 text-sm">
          <option>Tự động</option>
          <option>1080p</option>
          <option>720p</option>
          <option>480p</option>
        </select>
      </Row>
      <Separator />
      <Row label="Font size lyrics">
        <select className="bg-card border border-input rounded-lg px-3 py-1.5 text-sm">
          <option>Nhỏ</option>
          <option>Vừa</option>
          <option selected>Lớn</option>
          <option>Rất lớn</option>
        </select>
      </Row>
    </Section>
  );
}

function NotificationSettings() {
  return (
    <Section title="Thông báo">
      <Row label="Email mỗi tuần" desc="Tóm tắt hoạt động hát của bạn">
        <Switch defaultChecked />
      </Row>
      <Separator />
      <Row label="Bài mới của ca sĩ yêu thích">
        <Switch defaultChecked />
      </Row>
      <Separator />
      <Row label="Bạn bè mời vào phòng">
        <Switch defaultChecked />
      </Row>
      <Separator />
      <Row label="Lyrics đóng góp được duyệt">
        <Switch defaultChecked />
      </Row>
    </Section>
  );
}

function PrivacySettings() {
  return (
    <Section title="Quyền riêng tư">
      <Row label="Lịch sử hát công khai" desc="Cho phép người khác xem bài bạn đã hát">
        <Switch />
      </Row>
      <Separator />
      <Row label="Cho phép follow" desc="Người khác có thể theo dõi bạn">
        <Switch defaultChecked />
      </Row>
      <Separator />
      <Row label="Hiển thị trong tìm kiếm">
        <Switch defaultChecked />
      </Row>
    </Section>
  );
}

function PremiumSettings() {
  return (
    <Section title="Premium">
      <div className="text-center py-8 gradient-primary rounded-2xl text-white">
        <Crown className="h-16 w-16 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Nâng cấp Premium</h2>
        <p className="opacity-90 mb-6">Trải nghiệm karaoke không quảng cáo, không giới hạn</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto px-4">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <p className="text-sm opacity-80">1 tháng</p>
            <p className="text-2xl font-bold">39k</p>
            <Button variant="outline" className="mt-2 w-full bg-white text-primary hover:bg-white/90">
              Chọn
            </Button>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 ring-2 ring-white">
            <Badge variant="default" className="mb-2 bg-amber-400 text-amber-950">
              Tiết kiệm 40%
            </Badge>
            <p className="text-sm opacity-80">12 tháng</p>
            <p className="text-2xl font-bold">299k</p>
            <Button variant="outline" className="mt-2 w-full bg-white text-primary hover:bg-white/90">
              Chọn
            </Button>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
            <p className="text-sm opacity-80">Trọn đời</p>
            <p className="text-2xl font-bold">999k</p>
            <Button variant="outline" className="mt-2 w-full bg-white text-primary hover:bg-white/90">
              Chọn
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

function HelpSettings() {
  return (
    <Section title="Hỗ trợ">
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start">FAQ - Câu hỏi thường gặp</Button>
        <Button variant="ghost" className="w-full justify-start">Liên hệ hỗ trợ</Button>
        <Button variant="ghost" className="w-full justify-start">Báo lỗi</Button>
        <Button variant="ghost" className="w-full justify-start">Điều khoản dịch vụ</Button>
        <Button variant="ghost" className="w-full justify-start">Chính sách bảo mật</Button>
        <Button variant="ghost" className="w-full justify-start text-destructive">Đăng xuất</Button>
      </div>
    </Section>
  );
}
