'use client';

import { useMemo, useState } from 'react';
import { DoorOpen, DoorClosed, Radio, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SessionPanel } from '@/components/shop/SessionPanel';
import {
  useRooms,
  useSessions,
  useOpenSession,
  type Room,
  type RoomStatus,
} from '@/lib/shop';
import { formatVnd } from '@/lib/utils';

const STATUS_BADGE: Record<RoomStatus, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'warning',
  CLEANING: 'secondary',
  MAINTENANCE: 'destructive',
};
const STATUS_LABEL: Record<RoomStatus, string> = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Đang dùng',
  CLEANING: 'Dọn dẹp',
  MAINTENANCE: 'Bảo trì',
};

export default function ShopLivePage() {
  const { data: rooms, isLoading, isError } = useRooms();
  const { data: openSessions } = useSessions('OPEN');
  const openSession = useOpenSession();

  // map roomId -> sessionId (phiên đang mở)
  const sessionByRoom = useMemo(() => {
    const m: Record<string, string> = {};
    (openSessions ?? []).forEach((s) => {
      m[s.roomId] = s.id;
    });
    return m;
  }, [openSessions]);

  const [openForm, setOpenForm] = useState<Room | null>(null);
  const [guestCount, setGuestCount] = useState('');
  // Số giờ đặt trước (null = "tính giờ sau"). Mặc định 2 giờ khi mở modal.
  const [hours, setHours] = useState<number | null>(2);
  const [activeSession, setActiveSession] = useState<{ id: string; room: Room } | null>(null);

  const submitOpen = () => {
    if (!openForm) return;
    const gc = guestCount ? Number(guestCount) : undefined;
    const plannedMinutes = hours != null ? hours * 60 : undefined;
    openSession.mutate(
      { roomId: openForm.id, guestCount: gc, plannedMinutes },
      {
        onSuccess: (session) => {
          toast.success(`Đã mở phòng "${openForm.name}"`);
          setActiveSession({ id: session.id, room: openForm });
          setOpenForm(null);
          setGuestCount('');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi mở phòng'),
      },
    );
  };

  const openRoom = (r: Room) => {
    const sid = sessionByRoom[r.id];
    if (sid) {
      setActiveSession({ id: sid, room: r });
    } else {
      setOpenForm(r);
      setGuestCount('');
      setHours(2);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Radio className="h-7 w-7 text-primary" />
          Vận hành quầy
        </h1>
        <p className="text-muted-foreground mt-1">Mở phòng, quản lý hàng chờ và gọi món</p>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Đang tải...</Card>
      ) : isError ? (
        <Card className="p-8 text-center text-sm text-destructive">Không tải được danh sách phòng.</Card>
      ) : !rooms || rooms.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có phòng nào.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((r) => {
            const occupied = r.status === 'OCCUPIED' || !!sessionByRoom[r.id];
            return (
              <Card key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.name}</p>
                    {r.code && <p className="text-xs text-muted-foreground">Mã: {r.code}</p>}
                  </div>
                  <Badge variant={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatVnd(r.hourlyPrice)}/giờ</p>

                {occupied ? (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => openRoom(r)}
                    disabled={!sessionByRoom[r.id]}
                  >
                    <DoorOpen className="h-4 w-4 mr-1.5" />
                    {sessionByRoom[r.id] ? 'Mở phiên' : 'Đang bận'}
                  </Button>
                ) : r.status === 'AVAILABLE' ? (
                  <Button className="w-full" onClick={() => openRoom(r)}>
                    <DoorClosed className="h-4 w-4 mr-1.5" />
                    Mở phòng
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {STATUS_LABEL[r.status]}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Form nhập số khách → mở phòng */}
      {openForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpenForm(null)}
        >
          <Card className="w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mở phòng {openForm.name}</h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setOpenForm(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Input
              type="number"
              placeholder="Số khách (tuỳ chọn)"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Thời lượng</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((h) => (
                  <Button
                    key={h}
                    variant={hours === h ? 'default' : 'outline'}
                    onClick={() => setHours(h)}
                  >
                    {h} giờ
                  </Button>
                ))}
              </div>
              <Button
                variant={hours === null ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setHours(null)}
              >
                Mở (tính giờ sau)
              </Button>
              {hours != null ? (
                <p className="text-sm text-muted-foreground">
                  Tạm tính:{' '}
                  <span className="font-medium text-foreground">
                    {formatVnd(hours * openForm.hourlyPrice)}
                  </span>{' '}
                  ({hours} giờ × {formatVnd(openForm.hourlyPrice)})
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tính tiền khi đóng phòng theo thời gian thực tế.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenForm(null)}>
                Huỷ
              </Button>
              <Button onClick={submitOpen} disabled={openSession.isPending}>
                Mở phòng
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Panel phiên */}
      {activeSession && (
        <SessionPanel
          sessionId={activeSession.id}
          room={activeSession.room}
          onClose={() => setActiveSession(null)}
        />
      )}
    </div>
  );
}
