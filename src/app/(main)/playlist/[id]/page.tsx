'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Reorder } from 'framer-motion';
import { Play, Shuffle, Share2, Edit, MoreVertical, ListMusic, Clock, Globe, Lock, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SongRow } from '@/components/songs/SongRow';
import { usePlaylist, qk } from '@/lib/queries';
import {
  addToQueue,
  clearQueue,
  deletePlaylist,
  reorderPlaylist,
  removeFromPlaylist,
  toSongRef,
  updatePlaylist,
} from '@/lib/library';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { cn, formatDuration } from '@/lib/utils';
import type { Song } from '@/types';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = String(params.id ?? '');
  const user = useAuthStore((s) => s.user);
  const [enqueuing, setEnqueuing] = useState(false);
  // Bản sao thứ tự cục bộ để kéo-thả (reorder); orderRef giữ giá trị mới nhất
  // cho onDragEnd (tránh stale closure).
  const [order, setOrder] = useState<Song[]>([]);
  const orderRef = useRef<Song[]>([]);
  orderRef.current = order;
  // Header actions: edit modal + menu "..."
  const [showEdit, setShowEdit] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPublic, setEditPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: playlist, isLoading, isError } = usePlaylist(id);

  // Đồng bộ thứ tự từ server mỗi khi playlist đổi (load/thêm/xóa).
  useEffect(() => {
    setOrder(playlist?.items?.map((it) => it.song) ?? []);
  }, [playlist?.items]);

  // Chưa đăng nhập → mời đăng nhập (playlist là dữ liệu cá nhân, cần Bearer).
  if (!user) {
    return (
      <div className="container py-10 text-center">
        <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Đăng nhập để xem playlist</h3>
        <Link href="/login">
          <Button variant="gradient" className="mt-3">
            Đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-10 space-y-4">
        <div className="h-56 w-56 rounded-3xl bg-card animate-pulse" />
        <div className="h-8 w-64 rounded bg-card animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !playlist) {
    return (
      <div className="container py-10 text-center">
        <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Không tìm thấy playlist</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Playlist không tồn tại hoặc bạn không có quyền xem.
        </p>
        <Link href="/library?tab=playlists">
          <Button variant="outline">Về thư viện</Button>
        </Link>
      </div>
    );
  }

  // Hiển thị theo `order` (đã đồng bộ); fallback sang items cho frame đầu.
  const items = playlist.items?.map((it) => it.song) ?? [];
  const songs = order.length ? order : items;
  const totalDuration = songs.reduce((sum, s) => sum + (s.duration ?? 0), 0);

  // Lưu thứ tự sau khi thả (dùng orderRef để lấy thứ tự mới nhất).
  const persistOrder = () => {
    reorderPlaylist(
      id,
      orderRef.current.map((s) => s.youtubeId),
    )
      .then(() => qc.invalidateQueries({ queryKey: qk.playlist(id) }))
      .catch(() => {
        toast.error('Không thể lưu thứ tự');
        qc.invalidateQueries({ queryKey: qk.playlist(id) }); // revert theo server
      });
  };

  // Xóa 1 bài khỏi playlist (optimistic).
  const handleRemove = (song: Song) => {
    const prev = orderRef.current;
    setOrder((cur) => cur.filter((s) => s.youtubeId !== song.youtubeId));
    removeFromPlaylist(id, song.youtubeId)
      .then(() => {
        toast('Đã xóa khỏi playlist');
        qc.invalidateQueries({ queryKey: qk.playlist(id) });
      })
      .catch(() => {
        setOrder(prev);
        toast.error('Không thể xóa khỏi playlist');
      });
  };

  // Nạp danh sách vào hàng chờ (server /queue) rồi mở player bài đầu. Hàng chờ
  // ở màn hát đọc từ /queue nên phải enqueue thật thì sidebar mới hiện.
  const playList = async (list: Song[]) => {
    if (list.length === 0 || enqueuing) return;
    setEnqueuing(true);
    try {
      await clearQueue();
      // Thêm tuần tự để giữ đúng thứ tự (position do backend tăng dần).
      for (const s of list) {
        await addToQueue(toSongRef(s));
      }
      await qc.invalidateQueries({ queryKey: qk.queue });
      router.push(`/play/${list[0].youtubeId}`);
    } catch {
      toast.error('Không thể phát playlist');
      setEnqueuing(false);
    }
  };

  // Header actions
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: playlist.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Đã copy link playlist');
      }
    } catch {
      /* user hủy share — bỏ qua */
    }
  };

  const openEdit = () => {
    setEditName(playlist.name);
    setEditDesc(playlist.description ?? '');
    setEditPublic(playlist.isPublic);
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      toast.error('Tên playlist không được trống');
      return;
    }
    setSaving(true);
    try {
      await updatePlaylist(id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        isPublic: editPublic,
      });
      await qc.invalidateQueries({ queryKey: qk.playlist(id) });
      void qc.invalidateQueries({ queryKey: qk.playlists });
      toast.success('Đã lưu playlist');
      setShowEdit(false);
    } catch {
      toast.error('Không thể lưu playlist');
    } finally {
      setSaving(false);
    }
  };

  const togglePublic = async () => {
    setMoreOpen(false);
    try {
      await updatePlaylist(id, { isPublic: !playlist.isPublic });
      void qc.invalidateQueries({ queryKey: qk.playlist(id) });
      toast.success(playlist.isPublic ? 'Đã chuyển riêng tư' : 'Đã chuyển công khai');
    } catch {
      toast.error('Không thể cập nhật');
    }
  };

  const handleDelete = async () => {
    setMoreOpen(false);
    if (!confirm(`Xóa playlist "${playlist.name}"? Hành động không thể hoàn tác.`)) return;
    try {
      await deletePlaylist(id);
      void qc.invalidateQueries({ queryKey: qk.playlists });
      toast.success('Đã xóa playlist');
      router.push('/library?tab=playlists');
    } catch {
      toast.error('Không thể xóa playlist');
    }
  };

  const handlePlayAll = () => playList(songs);
  const handleShuffle = () =>
    playList([...songs].sort(() => Math.random() - 0.5));

  return (
    <div className="relative">
      {/* Hero backdrop */}
      <div className="relative h-[300px] -mt-16">
        <div className="absolute inset-0">
          {playlist.coverUrl && (
            <Image
              src={playlist.coverUrl}
              alt={playlist.name}
              fill
              className="object-cover blur-2xl opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      </div>

      <div className="container -mt-40 relative space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-2xl shrink-0">
            {playlist.coverUrl ? (
              <Image src={playlist.coverUrl} alt={playlist.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary flex items-center justify-center">
                <ListMusic className="h-24 w-24 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3 pb-4">
            <div className="flex items-center gap-2">
              {playlist.isPublic ? (
                <Badge variant="success">
                  <Globe className="h-3 w-3 mr-1" />
                  Công khai
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Riêng tư
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold">{playlist.name}</h1>
            {playlist.description && (
              <p className="text-muted-foreground">{playlist.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{songs.length} bài</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(totalDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            variant="gradient"
            onClick={handlePlayAll}
            disabled={songs.length === 0 || enqueuing}
          >
            {enqueuing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            Phát tất cả
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleShuffle}
            disabled={songs.length === 0 || enqueuing}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle
          </Button>
          <Button size="icon" variant="ghost" onClick={handleShare} title="Chia sẻ">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={openEdit} title="Sửa playlist">
            <Edit className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              title="Thêm"
              onClick={() => setMoreOpen((v) => !v)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card shadow-xl py-1">
                  <button
                    onClick={togglePublic}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                  >
                    {playlist.isPublic ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    {playlist.isPublic ? 'Chuyển riêng tư' : 'Chuyển công khai'}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa playlist
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Songs */}
        {songs.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center">
            <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Playlist trống. Thêm bài từ màn hát hoặc chi tiết bài.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-3 space-y-1">
            <div className="flex items-center gap-4 px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b border-border mb-2">
              <span className="w-6 text-center">#</span>
              <span className="w-12">&nbsp;</span>
              <span className="flex-1">Tiêu đề</span>
              <span className="hidden md:block">Lượt xem</span>
              <span className="w-12 text-right">
                <Clock className="h-4 w-4 ml-auto" />
              </span>
            </div>
            <Reorder.Group
              axis="y"
              values={songs}
              onReorder={setOrder}
              as="div"
              className="space-y-1"
            >
              {songs.map((song, idx) => (
                <Reorder.Item
                  key={song.youtubeId}
                  value={song}
                  as="div"
                  onDragEnd={persistOrder}
                  className="cursor-grab active:cursor-grabbing rounded-xl"
                  whileDrag={{ scale: 1.02, zIndex: 30 }}
                >
                  <SongRow
                    song={song}
                    index={idx + 1}
                    onRemoveFromPlaylist={() => handleRemove(song)}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}
      </div>

      {/* Modal sửa playlist */}
      {showEdit && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Sửa playlist</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tên playlist"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Mô tả (tuỳ chọn)"
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="button"
              onClick={() => setEditPublic((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                {editPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {editPublic ? 'Công khai' : 'Riêng tư'}
              </span>
              <span
                className={cn(
                  'h-5 w-9 rounded-full p-0.5 transition-colors',
                  editPublic ? 'bg-primary' : 'bg-muted',
                )}
              >
                <span
                  className={cn(
                    'block h-4 w-4 rounded-full bg-white transition-transform',
                    editPublic && 'translate-x-4',
                  )}
                />
              </span>
            </button>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowEdit(false)} disabled={saving}>
                Hủy
              </Button>
              <Button variant="gradient" onClick={saveEdit} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
