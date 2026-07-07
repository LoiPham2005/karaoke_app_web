'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
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

interface FormState {
  name: string;
  code: string;
  capacity: string;
  roomType: string;
  hourlyPrice: string;
}

const EMPTY: FormState = { name: '', code: '', capacity: '', roomType: '', hourlyPrice: '' };

export default function ShopRoomsPage() {
  const { data: rooms, isLoading, isError } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const startCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const startEdit = (r: Room) => {
    setEditing(r);
    setForm({
      name: r.name,
      code: r.code ?? '',
      capacity: r.capacity != null ? String(r.capacity) : '',
      roomType: r.roomType ?? '',
      hourlyPrice: String(r.hourlyPrice),
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('Nhập tên phòng');
      return;
    }
    const price = Number(form.hourlyPrice);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Giá theo giờ không hợp lệ');
      return;
    }
    const body = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      capacity: form.capacity ? Number(form.capacity) : undefined,
      roomType: form.roomType.trim() || undefined,
      hourlyPrice: price,
    };
    if (editing) {
      updateRoom.mutate(
        { id: editing.id, body },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật phòng');
            setOpen(false);
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi cập nhật'),
        },
      );
    } else {
      createRoom.mutate(body, {
        onSuccess: () => {
          toast.success('Đã thêm phòng');
          setOpen(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi thêm phòng'),
      });
    }
  };

  const remove = (r: Room) => {
    if (!confirm(`Xoá phòng "${r.name}"?`)) return;
    deleteRoom.mutate(r.id, {
      onSuccess: () => toast.success('Đã xoá phòng'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi xoá'),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý phòng</h1>
          <p className="text-muted-foreground mt-1">{rooms?.length ?? 0} phòng</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm phòng
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Đang tải...</Card>
      ) : isError ? (
        <Card className="p-8 text-center text-sm text-destructive">Không tải được danh sách phòng.</Card>
      ) : !rooms || rooms.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có phòng nào.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <Card key={r.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{r.name}</p>
                  {r.code && <p className="text-xs text-muted-foreground">Mã: {r.code}</p>}
                </div>
                <Badge variant={STATUS_BADGE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                {r.roomType && <p>Loại: {r.roomType}</p>}
                {r.capacity != null && <p>Sức chứa: {r.capacity} người</p>}
                <p className="text-foreground font-medium">{formatVnd(r.hourlyPrice)}/giờ</p>
                {!r.isActive && <Badge variant="outline">Ngừng dùng</Badge>}
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(r)}
                  disabled={deleteRoom.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <Card
            className="w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing ? 'Sửa phòng' : 'Thêm phòng'}</h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Tên phòng *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Mã phòng (tuỳ chọn)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <Input
                placeholder="Loại phòng (vd: VIP)"
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Sức chứa (người)"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Giá theo giờ (VND) *"
                value={form.hourlyPrice}
                onChange={(e) => setForm({ ...form, hourlyPrice: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button onClick={submit} disabled={createRoom.isPending || updateRoom.isPending}>
                {editing ? 'Lưu' : 'Thêm'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
