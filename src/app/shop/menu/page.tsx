'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
  type ProductCategory,
} from '@/lib/shop';
import { formatVnd } from '@/lib/utils';

const CATEGORIES: ProductCategory[] = ['DRINK', 'BEER', 'FOOD', 'SNACK', 'OTHER'];
const CATEGORY_LABEL: Record<ProductCategory, string> = {
  DRINK: 'Nước',
  BEER: 'Bia',
  FOOD: 'Đồ ăn',
  SNACK: 'Ăn vặt',
  OTHER: 'Khác',
};

interface FormState {
  name: string;
  price: string;
  category: ProductCategory;
  imageUrl: string;
}
const EMPTY: FormState = { name: '', price: '', category: 'DRINK', imageUrl: '' };

export default function ShopMenuPage() {
  const { data: products, isLoading, isError } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const startCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  };
  const startEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      imageUrl: p.imageUrl ?? '',
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      toast.error('Nhập tên sản phẩm');
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }
    const body = {
      name: form.name.trim(),
      price,
      category: form.category,
      imageUrl: form.imageUrl.trim() || undefined,
    };
    if (editing) {
      updateProduct.mutate(
        { id: editing.id, body },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật sản phẩm');
            setOpen(false);
          },
          onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi cập nhật'),
        },
      );
    } else {
      createProduct.mutate(body, {
        onSuccess: () => {
          toast.success('Đã thêm sản phẩm');
          setOpen(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi thêm'),
      });
    }
  };

  const remove = (p: Product) => {
    if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
    deleteProduct.mutate(p.id, {
      onSuccess: () => toast.success('Đã xoá sản phẩm'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi xoá'),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu sản phẩm</h1>
          <p className="text-muted-foreground mt-1">{products?.length ?? 0} sản phẩm</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm sản phẩm
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Đang tải...</Card>
      ) : isError ? (
        <Card className="p-8 text-center text-sm text-destructive">Không tải được danh sách.</Card>
      ) : !products || products.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">Chưa có sản phẩm nào.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="p-4 flex gap-3">
              <div className="h-16 w-16 rounded-lg bg-accent overflow-hidden shrink-0 flex items-center justify-center">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium truncate">{p.name}</p>
                  {!p.isActive && <Badge variant="outline">Ẩn</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[p.category]}</p>
                <p className="text-sm font-semibold text-primary mt-1">{formatVnd(p.price)}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deleteProduct.isPending}
                    onClick={() => remove(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
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
          <Card className="w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              </h2>
              <Button size="icon-sm" variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="Tên sản phẩm *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Giá (VND) *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ProductCategory })
                }
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
              <Input
                placeholder="URL ảnh (tuỳ chọn)"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Huỷ
              </Button>
              <Button
                onClick={submit}
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {editing ? 'Lưu' : 'Thêm'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
