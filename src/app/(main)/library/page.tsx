'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Plus, ListMusic, Heart, History, Trash2, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SongRow } from '@/components/songs/SongRow';
import { useAuthStore } from '@/stores/auth.store';
import {
  usePlaylists,
  useFavorites,
  useHistory,
  useCreatePlaylist,
  useDeletePlaylist,
  useClearHistory,
} from '@/lib/queries';

export default function LibraryPage() {
  const user = useAuthStore((s) => s.user);

  // Mở đúng tab theo ?tab= (sidebar: Playlist/Yêu thích/Lịch sử) — và đổi tab
  // ngay cả khi đang ở /library (Tabs controlled).
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') ?? 'playlists';
  const [tab, setTab] = useState(tabParam);
  useEffect(() => setTab(tabParam), [tabParam]);

  const { data: playlists = [], isLoading: loadingPlaylists } = usePlaylists();
  const { data: favorites = [], isLoading: loadingFavorites } = useFavorites();
  const { data: history = [], isLoading: loadingHistory } = useHistory();

  const createMut = useCreatePlaylist();
  const deleteMut = useDeletePlaylist();
  const clearHistoryMut = useClearHistory();

  const handleCreatePlaylist = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    const name = window.prompt('Tên playlist mới:')?.trim();
    if (!name) return;
    createMut.mutate(
      { name },
      {
        onSuccess: () => toast.success('Đã tạo playlist'),
        onError: (e) =>
          toast.error(e instanceof Error ? e.message : 'Tạo playlist thất bại'),
      },
    );
  };

  const handleDeletePlaylist = (id: string, name: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!window.confirm(`Xoá playlist "${name}"?`)) return;
    deleteMut.mutate(id, {
      onSuccess: () => toast.success('Đã xoá playlist'),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'Xoá playlist thất bại'),
    });
  };

  const handleClearHistory = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!window.confirm('Xoá toàn bộ lịch sử hát?')) return;
    clearHistoryMut.mutate(undefined, {
      onSuccess: () => toast.success('Đã xoá lịch sử'),
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'Xoá lịch sử thất bại'),
    });
  };

  // Chưa đăng nhập → mời đăng nhập, không gọi API.
  if (!user) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Thư viện của tôi</h1>
            <p className="text-muted-foreground mt-1">Playlist, yêu thích và lịch sử hát</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-10 text-center">
          <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Đăng nhập để xem thư viện</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Lưu playlist, bài yêu thích và lịch sử hát của bạn.
          </p>
          <Link href="/login">
            <Button variant="gradient">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Thư viện của tôi</h1>
          <p className="text-muted-foreground mt-1">Playlist, yêu thích và lịch sử hát</p>
        </div>
        <Button variant="gradient" onClick={handleCreatePlaylist}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo playlist
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="playlists">
            <ListMusic className="h-4 w-4 mr-2" />
            Playlist
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Yêu thích
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* PLAYLISTS */}
        <TabsContent value="playlists" className="mt-6">
          {loadingPlaylists ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-card animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Create new */}
              <button
                onClick={handleCreatePlaylist}
                className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-card transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary"
              >
                <Plus className="h-12 w-12" />
                <span className="font-medium">Tạo playlist mới</span>
              </button>
              {playlists.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/playlist/${pl.id}`}
                  className="group rounded-2xl bg-card hover:bg-accent transition-all p-3"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    {pl.coverUrl ? (
                      <Image src={pl.coverUrl} alt={pl.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center">
                        <ListMusic className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {pl.isPublic ? (
                        <Badge variant="success" className="text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-background/80">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{pl.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {pl.description || 'Playlist'}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeletePlaylist(pl.id, pl.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* FAVORITES */}
        <TabsContent value="favorites" className="mt-6">
          {loadingFavorites ? (
            <div className="bg-card rounded-2xl p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-accent/50 animate-pulse" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-card rounded-2xl p-10 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Bạn chưa có bài hát yêu thích nào.</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-3 space-y-1">
              {favorites.map((fav, idx) => (
                <SongRow key={fav.id} song={fav.song} index={idx + 1} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="mt-6">
          <div className="flex items-center justify-end mb-3">
            <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={history.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Xoá lịch sử
            </Button>
          </div>
          {loadingHistory ? (
            <div className="bg-card rounded-2xl p-3 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-accent/50 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-card rounded-2xl p-10 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Chưa có lịch sử hát nào.</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-3 space-y-1">
              {history.map((h) => (
                <SongRow key={h.id} song={h.song} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
