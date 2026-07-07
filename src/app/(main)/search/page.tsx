'use client';

import { useEffect, useState } from 'react';
import { Search as SearchIcon, X, Clock, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SongCard } from '@/components/songs/SongCard';
import { SongRow } from '@/components/songs/SongRow';
import {
  useSearch,
  useSearchHistory,
  useAddSearchHistory,
  useRemoveSearchHistory,
  useClearSearchHistory,
} from '@/lib/queries';
import { useAuthStore } from '@/stores/auth.store';

const filters = ['Tất cả', 'Karaoke', 'Có lời', 'Không lời', 'Beat', 'Demo'];

export default function SearchPage() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState('Tất cả');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Debounce 400ms: chỉ cập nhật `debounced` (key của useSearch) sau khi ngừng gõ
  // → tránh gọi YouTube mỗi ký tự (tiết kiệm quota). TanStack Query lo cache/huỷ.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching, isError } = useSearch(debounced);
  const loading = isFetching && debounced.length > 0;
  const error = isError ? 'Tìm kiếm thất bại' : null;

  // Lịch sử tìm kiếm (DB, đồng bộ web ↔ mobile).
  const { data: recent = [] } = useSearchHistory();
  const addHistory = useAddSearchHistory();
  const removeHistory = useRemoveSearchHistory();
  const clearHistory = useClearSearchHistory();

  // Lưu từ khoá khi "chốt" tìm kiếm (Enter hoặc bấm vào 1 kết quả).
  const saveSearch = (q: string) => {
    const v = q.trim();
    if (user && v.length >= 2) addHistory.mutate(v);
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveSearch(query);
            }}
            placeholder="Tìm bài hát, ca sĩ, playlist..."
            className="pl-12 pr-12 h-14 text-base rounded-2xl"
            autoFocus
          />
          {query && (
            <Button
              size="icon-sm"
              variant="ghost"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <Badge
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-1.5 text-sm shrink-0"
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            <Button size="icon-sm" variant="ghost">
              <Filter className="h-4 w-4" />
            </Button>
            <div className="flex bg-card rounded-lg p-0.5">
              <Button
                size="icon-sm"
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="icon-sm"
                variant={view === 'list' ? 'secondary' : 'ghost'}
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty / Recent / Results */}
      {!query ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tìm kiếm gần đây
            </h3>
            {recent.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => clearHistory.mutate()}
              >
                Xóa tất cả
              </Button>
            )}
          </div>
          {!user ? (
            <p className="text-sm text-muted-foreground">
              Đăng nhập để lưu &amp; đồng bộ lịch sử tìm kiếm.
            </p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lịch sử tìm kiếm.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-1 pl-4 pr-2 py-2 rounded-full bg-card hover:bg-accent text-sm transition-colors"
                >
                  <button onClick={() => setQuery(item.query)}>{item.query}</button>
                  <button
                    onClick={() => removeHistory.mutate(item.id)}
                    className="opacity-50 hover:opacity-100"
                    aria-label="Xóa"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Kiểm tra backend đã chạy (cổng 3001) và YOUTUBE_API_KEY.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Không tìm thấy bài nào cho &quot;{query}&quot;
        </div>
      ) : (
        <div onClickCapture={() => saveSearch(debounced)}>
          <p className="text-sm text-muted-foreground mb-4">
            Tìm thấy <span className="font-semibold text-foreground">{results.length}</span> kết quả
            cho &quot;{query}&quot;
          </p>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((song) => (
                <SongCard key={song.youtubeId} song={song} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-3 space-y-1">
              {results.map((song, idx) => (
                <SongRow key={song.youtubeId} song={song} index={idx + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
