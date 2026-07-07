'use client';

// Menu hành động cho 1 bài hát ở màn hát: Thêm yêu thích / Thêm vào playlist /
// Chia sẻ / Báo lỗi. Tự build dropdown + modal (chưa có shadcn dialog/dropdown).
import { useEffect, useRef, useState } from 'react';
import {
  Settings,
  Heart,
  ListPlus,
  Share2,
  Flag,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { type Playlist, type SongRef } from '@/lib/library';
import {
  usePlaylists,
  useAddToPlaylist,
  useCreatePlaylist,
  useReportSong,
} from '@/lib/queries';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';

const REPORT_REASONS = [
  'Video không phát được',
  'Sai lời bài hát',
  'Sai tên / nghệ sĩ',
  'Nội dung không phù hợp',
  'Khác',
];

export function SongActions({
  song,
  isFav,
  onToggleFav,
}: {
  song: SongRef;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const requireAuth = () => {
    if (!user) {
      toast('Đăng nhập để dùng tính năng này');
      return false;
    }
    return true;
  };

  const share = async () => {
    setMenuOpen(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: song.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Đã copy link bài hát');
      }
    } catch {
      /* user huỷ share → bỏ qua */
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <Button size="icon-sm" variant="ghost" onClick={() => setMenuOpen((o) => !o)}>
        <Settings className="h-4 w-4" />
      </Button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-xl z-50 py-1.5">
          <MenuItem
            icon={<Heart className={cn('h-4 w-4', isFav && 'fill-current text-primary')} />}
            label={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            onClick={() => {
              setMenuOpen(false);
              onToggleFav();
            }}
          />
          <MenuItem
            icon={<ListPlus className="h-4 w-4" />}
            label="Thêm vào playlist"
            onClick={() => {
              setMenuOpen(false);
              if (requireAuth()) setPlaylistOpen(true);
            }}
          />
          <MenuItem
            icon={<Share2 className="h-4 w-4" />}
            label="Chia sẻ"
            onClick={share}
          />
          <MenuItem
            icon={<Flag className="h-4 w-4" />}
            label="Báo lỗi"
            onClick={() => {
              setMenuOpen(false);
              if (requireAuth()) setReportOpen(true);
            }}
          />
        </div>
      )}

      {playlistOpen && (
        <PlaylistModal song={song} onClose={() => setPlaylistOpen(false)} />
      )}
      {reportOpen && (
        <ReportModal song={song} onClose={() => setReportOpen(false)} />
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}

function Overlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlaylistModal({ song, onClose }: { song: SongRef; onClose: () => void }) {
  const { data: playlists = [], isLoading: loading, isError } = usePlaylists();
  const addToPlaylistMut = useAddToPlaylist();
  const createMut = useCreatePlaylist();
  const [newName, setNewName] = useState('');
  const busy = addToPlaylistMut.isPending || createMut.isPending;

  useEffect(() => {
    if (isError) toast.error('Không tải được playlist');
  }, [isError]);

  const add = (pl: Playlist) => {
    addToPlaylistMut.mutate(
      { id: pl.id, song },
      {
        onSuccess: () => {
          toast(`Đã thêm vào "${pl.name}"`);
          onClose();
        },
        onError: () => toast.error('Không thể thêm vào playlist'),
      },
    );
  };

  const createAndAdd = () => {
    const name = newName.trim();
    if (!name) return;
    createMut.mutate(
      { name },
      {
        onSuccess: (pl) => {
          addToPlaylistMut.mutate(
            { id: pl.id, song },
            {
              onSuccess: () => {
                toast(`Đã tạo & thêm vào "${pl.name}"`);
                onClose();
              },
              onError: () => toast.error('Không thể thêm vào playlist'),
            },
          );
        },
        onError: () => toast.error('Không thể tạo playlist'),
      },
    );
  };

  return (
    <Overlay title="Thêm vào playlist" onClose={onClose}>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {playlists.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Chưa có playlist nào — tạo mới bên dưới
              </p>
            ) : (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  disabled={busy}
                  onClick={() => add(pl)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <span className="truncate">{pl.name}</span>
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </div>

          <div className="flex gap-2 border-t border-border pt-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tên playlist mới..."
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
            />
            <Button onClick={createAndAdd} disabled={busy || !newName.trim()}>
              Tạo
            </Button>
          </div>
        </div>
      )}
    </Overlay>
  );
}

function ReportModal({ song, onClose }: { song: SongRef; onClose: () => void }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [detail, setDetail] = useState('');
  const reportMut = useReportSong();
  const busy = reportMut.isPending;

  const submit = () => {
    reportMut.mutate(
      { song, reason, detail: detail.trim() || undefined },
      {
        onSuccess: () => {
          toast('Đã gửi báo lỗi, cảm ơn bạn!');
          onClose();
        },
        onError: () => toast.error('Không gửi được báo lỗi'),
      },
    );
  };

  return (
    <Overlay title="Báo lỗi bài hát" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                reason === r
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent',
              )}
            >
              <span
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2',
                  reason === r ? 'border-primary bg-primary' : 'border-muted-foreground',
                )}
              />
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Mô tả thêm (không bắt buộc)..."
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <Button className="w-full" variant="gradient" disabled={busy} onClick={submit}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gửi báo lỗi'}
        </Button>
      </div>
    </Overlay>
  );
}
