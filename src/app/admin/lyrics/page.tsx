'use client';

import { useState } from 'react';
import { Check, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockSongs } from '@/mocks/songs';
import { mockLrcContent } from '@/mocks/lyrics';

const mockContributions = mockSongs.slice(0, 6).map((song, i) => ({
  id: `c-${i + 1}`,
  song,
  user: { name: `contributor_${i + 1}` },
  content: mockLrcContent,
  status: i % 3 === 0 ? 'APPROVED' : 'PENDING',
  createdAt: `${i + 1} giờ trước`,
}));

export default function AdminLyricsPage() {
  const [selected, setSelected] = useState(mockContributions[0]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Duyệt lyrics đóng góp</h1>
        <p className="text-muted-foreground mt-1">{mockContributions.length} đóng góp từ cộng đồng</p>
      </div>

      <div className="grid lg:grid-cols-[400px,1fr] gap-4 min-h-[600px]">
        {/* List */}
        <div className="space-y-2">
          {mockContributions.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left bg-card rounded-2xl p-3 flex gap-3 hover:bg-accent transition-all ${
                selected.id === c.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <img
                src={c.song.thumbnailUrl}
                alt={c.song.title}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{c.song.title}</h4>
                <p className="text-xs text-muted-foreground">@{c.user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {c.status === 'PENDING' && <Badge variant="warning" className="text-xs">Chờ duyệt</Badge>}
                  {c.status === 'APPROVED' && <Badge variant="success" className="text-xs">Đã duyệt</Badge>}
                  <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{selected.song.title}</h2>
              <p className="text-sm text-muted-foreground">
                {selected.song.artist} · Đóng góp bởi @{selected.user.name}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Phát thử với lyrics
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">LYRICS ĐỀ XUẤT</h3>
              <pre className="bg-background rounded-xl p-4 text-xs max-h-96 overflow-y-auto font-mono whitespace-pre-wrap">
                {selected.content}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">LYRICS HIỆN TẠI</h3>
              <pre className="bg-background rounded-xl p-4 text-xs max-h-96 overflow-y-auto font-mono">
                {`[00:00.00]Chưa có lyrics
[00:00.00]Lần đầu được đóng góp`}
              </pre>
            </div>
          </div>

          {selected.status === 'PENDING' && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button variant="destructive">
                <X className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
              <Button variant="gradient">
                <Check className="h-4 w-4 mr-2" />
                Duyệt
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
