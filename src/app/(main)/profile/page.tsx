'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Edit, Crown, Music2, Clock, ListMusic, FileText, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SongRow } from '@/components/songs/SongRow';
import { mockSongs } from '@/mocks/songs';
import { mockPlaylists } from '@/mocks/playlists';
import { useAuthStore } from '@/stores/auth.store';
import Image from 'next/image';
import Link from 'next/link';

const stats = [
  { label: 'Bài đã hát', value: '247', icon: Music2 },
  { label: 'Thời gian hát', value: '32h', icon: Clock },
  { label: 'Playlist', value: '8', icon: ListMusic },
  { label: 'Đóng góp lyrics', value: '12', icon: FileText },
];

// Mock activity heatmap (deterministic — tránh hydration mismatch).
const activity = Array.from({ length: 30 }, (_, i) => ({ day: i, count: (i * 3 + 2) % 10 }));

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (!user) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        {isLoading ? 'Đang tải...' : 'Vui lòng đăng nhập'}
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    router.replace('/login');
  };

  return (
    <div className="container py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
        <div className="relative">
          <Avatar className="h-32 w-32 ring-4 ring-primary/30">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="text-3xl">{user.displayName[0]}</AvatarFallback>
          </Avatar>
          <Button
            size="icon-sm"
            variant="gradient"
            className="absolute bottom-0 right-0 rounded-full"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            {user.isPremium && (
              <Badge variant="default">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          {user.email && <p className="text-muted-foreground">{user.email}</p>}
          {user.bio && <p className="text-sm">{user.bio}</p>}
          <p className="text-xs text-muted-foreground">
            Thành viên từ{' '}
            {new Date(user.createdAt).toLocaleDateString('vi-VN', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-4 text-center space-y-1">
            <s.icon className="h-5 w-5 mx-auto text-primary" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="bg-card rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Hoạt động 30 ngày qua</h3>
        <div className="grid grid-cols-15 sm:grid-cols-30 gap-1">
          {activity.map((a) => (
            <div
              key={a.day}
              className="aspect-square rounded"
              style={{
                backgroundColor:
                  a.count === 0 ? 'hsl(var(--muted))' : `hsl(343 100% ${72 - a.count * 5}%)`,
              }}
              title={`Ngày ${a.day + 1}: ${a.count} bài`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Ít hơn</span>
          {[1, 3, 5, 7, 9].map((c) => (
            <div
              key={c}
              className="w-3 h-3 rounded"
              style={{ backgroundColor: `hsl(343 100% ${72 - c * 5}%)` }}
            />
          ))}
          <span>Nhiều hơn</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Hoạt động gần đây</TabsTrigger>
          <TabsTrigger value="playlists">Playlist công khai</TabsTrigger>
          <TabsTrigger value="recordings">Bản thu</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <div className="bg-card rounded-2xl p-3 space-y-1">
            {mockSongs.slice(0, 8).map((song) => (
              <SongRow key={song.youtubeId} song={song} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="playlists">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockPlaylists
              .filter((p) => p.isPublic)
              .map((pl) => (
                <Link
                  key={pl.id}
                  href={`/playlist/${pl.id}`}
                  className="rounded-2xl bg-card hover:bg-accent p-3 transition-all"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    {pl.coverUrl && (
                      <Image src={pl.coverUrl} alt={pl.name} fill className="object-cover" />
                    )}
                  </div>
                  <h4 className="font-semibold truncate">{pl.name}</h4>
                  <p className="text-xs text-muted-foreground">{pl.songCount} bài</p>
                </Link>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recordings">
          <div className="bg-card rounded-2xl p-12 text-center">
            <Music2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Tính năng đang phát triển</h3>
            <p className="text-sm text-muted-foreground">
              Sắp tới bạn sẽ có thể ghi âm và chia sẻ bản hát của mình
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
