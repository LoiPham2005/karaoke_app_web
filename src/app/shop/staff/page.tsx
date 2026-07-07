'use client';

import { useState } from 'react';
import { Plus, Ban, RotateCcw, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useStaff,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  type ShopStaff,
} from '@/lib/shop';

interface FormState {
  email: string;
  displayName: string;
  password: string;
}
const EMPTY: FormState = { email: '', displayName: '', password: '' };

export default function ShopStaffPage() {
  const { data: staff, isLoading, isError } = useStaff();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);

  const submit = () => {
    if (!form.email.trim() || !form.displayName.trim() || !form.password) {
      toast.error('Nhập đủ email, tên và mật khẩu');
      return;
    }
    createStaff.mutate(
      {
        email: form.email.trim(),
        displayName: form.displayName.trim(),
        password: form.password,
      },
      {
        onSuccess: () => {
          toast.success('Đã tạo nhân viên');
          setForm(EMPTY);
          setOpen(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi tạo nhân viên'),
      },
    );
  };

  const toggleStatus = (s: ShopStaff) => {
    const locked = s.status !== 'ACTIVE';
    const next = locked ? 'ACTIVE' : 'SUSPENDED';
    updateStaff.mutate(
      { id: s.id, status: next },
      {
        onSuccess: () => toast.success(next === 'ACTIVE' ? 'Đã mở khoá' : 'Đã khoá'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi cập nhật'),
      },
    );
  };

  const remove = (s: ShopStaff) => {
    if (!confirm(`Gỡ nhân viên "${s.displayName}"?`)) return;
    deleteStaff.mutate(s.id, {
      onSuccess: () => toast.success('Đã gỡ nhân viên'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi gỡ'),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nhân viên</h1>
          <p className="text-muted-foreground mt-1">{staff?.length ?? 0} nhân viên</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Tạo nhân viên
        </Button>
      </div>

      <Card className="divide-y divide-border">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">
            Không tải được danh sách nhân viên.
          </div>
        ) : !staff || staff.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Chưa có nhân viên nào.
          </div>
        ) : (
          staff.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{s.displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{s.email}</p>
              </div>
              {s.status !== 'ACTIVE' ? (
                <Badge variant="destructive" className="shrink-0">
                  Đã khoá
                </Badge>
              ) : (
                <Badge variant="success" className="shrink-0">
                  Hoạt động
                </Badge>
              )}
              <Button
                size="icon-sm"
                variant="ghost"
                title={s.status !== 'ACTIVE' ? 'Mở khoá' : 'Khoá'}
                disabled={updateStaff.isPending}
                onClick={() => toggleStatus(s)}
              >
                {s.status !== 'ACTIVE' ? (
                  <RotateCcw className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Ban className="h-4 w-4 text-red-400" />
                )}
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                title="Gỡ"
                disabled={deleteStaff.isPending}
                onClick={() => remove(s)}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))
        )}
      </Card>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <Card className="w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tạo nhân viên</h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Tên hiển thị *"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Mật khẩu *"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button onClick={submit} disabled={createStaff.isPending}>
                Tạo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
