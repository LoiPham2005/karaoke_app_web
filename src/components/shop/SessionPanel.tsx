'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X,
  Search,
  Plus,
  Trash2,
  Check,
  Music,
  ShoppingBag,
  DoorClosed,
  Loader2,
  Clock,
  TimerReset,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { searchShopSongs } from '@/lib/shop';
import {
  useSession,
  useRoomQueue,
  useOrders,
  useProducts,
  useAddQueueItem,
  useRemoveQueueItem,
  useUpdateQueueItem,
  useCreateOrder,
  useCloseSession,
  useExtendSession,
  type Room,
  type CloseSessionResult,
  type RoomQueueStatus,
} from '@/lib/shop';
import type { Song } from '@/types';
import { formatVnd } from '@/lib/utils';

const QUEUE_BADGE: Record<RoomQueueStatus, 'default' | 'success' | 'secondary' | 'warning'> = {
  QUEUED: 'secondary',
  PLAYING: 'warning',
  PLAYED: 'success',
  SKIPPED: 'default',
};

// Định dạng mili-giây còn lại → "H:MM:SS" hoặc "MM:SS". Âm → "0:00".
function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function SessionPanel({
  sessionId,
  room,
  onClose,
}: {
  sessionId: string;
  room: Room;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'queue' | 'order'>('queue');

  // session detail → plannedMinutes / expiresAt / roomCharge
  const { data: session } = useSession(sessionId);
  const expiresAt = session?.expiresAt ?? null;
  const isTimed = expiresAt != null;
  const roomCharge = session?.roomCharge;

  // Đồng hồ đếm ngược: số giây còn lại tới expiresAt. Cập nhật mỗi giây.
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(null);
      return;
    }
    const end = new Date(expiresAt).getTime();
    const tick = () => setRemainingMs(end - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const isExpired = isTimed && remainingMs != null && remainingMs <= 0;

  // extend
  const extendSession = useExtendSession();
  const doExtend = (minutes: number) => extendSession.mutate({ id: sessionId, minutes });

  // queue
  const { data: queue, isLoading: queueLoading } = useRoomQueue(sessionId);
  const addQueueItem = useAddQueueItem();
  const removeQueueItem = useRemoveQueueItem();
  const updateQueueItem = useUpdateQueueItem();

  // song search
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setSearching(true);
      searchShopSongs(term, ac.signal)
        .then((r) => setResults(r))
        .catch(() => {
          /* aborted hoặc lỗi → bỏ qua */
        })
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const addSong = (s: Song) => {
    addQueueItem.mutate(
      {
        sessionId,
        songYoutubeId: s.youtubeId,
        songTitle: s.title,
        songThumbnail: s.thumbnailUrl,
      },
      {
        onSuccess: () => toast.success(`Đã thêm "${s.title}"`),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi thêm bài'),
      },
    );
  };

  const markPlayed = (itemId: string) =>
    updateQueueItem.mutate(
      { itemId, sessionId, status: 'PLAYED' },
      {
        onSuccess: () => toast.success('Đã đánh dấu đã hát'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi cập nhật'),
      },
    );

  const removeSong = (itemId: string) =>
    removeQueueItem.mutate(
      { itemId, sessionId },
      {
        onSuccess: () => toast.success('Đã xoá khỏi hàng chờ'),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi xoá'),
      },
    );

  // orders
  const { data: products } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders(sessionId);
  const createOrder = useCreateOrder();
  const [cart, setCart] = useState<Record<string, number>>({});

  const setQty = (productId: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });

  const cartItems = Object.entries(cart);
  const submitOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Chọn ít nhất 1 sản phẩm');
      return;
    }
    createOrder.mutate(
      {
        sessionId,
        items: cartItems.map(([productId, qty]) => ({ productId, qty })),
      },
      {
        onSuccess: () => {
          toast.success('Đã tạo đơn gọi món');
          setCart({});
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi gọi món'),
      },
    );
  };

  // close
  const closeSession = useCloseSession();
  const [bill, setBill] = useState<CloseSessionResult | null>(null);

  const doClose = () => {
    if (!confirm(`Đóng phòng "${room.name}"?`)) return;
    closeSession.mutate(sessionId, {
      onSuccess: (res) => {
        setBill(res);
        toast.success('Đã đóng phòng');
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Lỗi đóng phòng'),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{room.name}</h2>
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {!isTimed ? (
                <span className="text-muted-foreground">Tính giờ sau</span>
              ) : isExpired ? (
                <span className="font-semibold text-red-400">Hết giờ</span>
              ) : (
                <span className="font-mono font-medium tabular-nums">
                  {remainingMs != null ? fmtCountdown(remainingMs) : '--:--'}
                  <span className="ml-1 font-sans font-normal text-muted-foreground">
                    còn lại
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpired && (
              <Badge variant="destructive" className="hidden sm:inline-flex">
                HẾT GIỜ
              </Badge>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={doClose}
              disabled={closeSession.isPending || !!bill}
            >
              <DoorClosed className="h-4 w-4 mr-1.5" />
              Đóng phòng
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {bill ? (
          <div className="p-6 space-y-3">
            <h3 className="text-lg font-semibold">Hoá đơn</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiền phòng</span>
              <span className="font-medium">{formatVnd(bill.roomCharge)}</span>
            </div>
            <div className="flex justify-between text-base border-t border-border pt-3">
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-primary">{formatVnd(bill.totalAmount)}</span>
            </div>
            <Button className="w-full mt-2" onClick={onClose}>
              Xong
            </Button>
          </div>
        ) : (
          <>
            <div className="flex border-b border-border">
              <button
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  tab === 'queue'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setTab('queue')}
              >
                <Music className="h-4 w-4" />
                Hàng chờ
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                  tab === 'order'
                    ? 'text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setTab('order')}
              >
                <ShoppingBag className="h-4 w-4" />
                Gọi món
              </button>
            </div>

            {/* Thanh trạng thái giờ + tiền phòng + gia hạn */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-accent/30">
              <div className="text-sm">
                <span className="text-muted-foreground">Tiền phòng: </span>
                <span className="font-medium">{formatVnd(roomCharge ?? 0)}</span>
                {isTimed && session?.plannedMinutes != null && (
                  <span className="text-xs text-muted-foreground ml-1.5">
                    (đặt {Math.round(session.plannedMinutes / 60)} giờ)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <TimerReset className="h-4 w-4 text-muted-foreground" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => doExtend(30)}
                  disabled={extendSession.isPending}
                >
                  +30 phút
                </Button>
                <Button
                  size="sm"
                  variant={isExpired ? 'default' : 'outline'}
                  onClick={() => doExtend(60)}
                  disabled={extendSession.isPending}
                >
                  +60 phút
                </Button>
              </div>
            </div>

            {isExpired && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-500/10 border-b border-border">
                <Badge variant="destructive">HẾT GIỜ</Badge>
                <span>Cần gia hạn để hát tiếp.</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tab === 'queue' ? (
                <>
                  {isExpired ? (
                    <p className="text-sm text-red-400 py-2 px-3 rounded-lg bg-red-500/10">
                      Hết giờ — gia hạn để thêm bài.
                    </p>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {searching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Tìm bài hát để thêm..."
                        className="pl-10"
                      />
                    </div>
                  )}

                  {!isExpired && results.length > 0 && (
                    <div className="space-y-1 max-h-48 overflow-y-auto rounded-xl border border-border p-1">
                      {results.map((s) => (
                        <button
                          key={s.youtubeId}
                          onClick={() => addSong(s)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.thumbnailUrl}
                            alt={s.title}
                            className="h-9 w-9 rounded object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm truncate">{s.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.artist}</p>
                          </div>
                          <Plus className="h-4 w-4 text-primary shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Hàng chờ ({queue?.length ?? 0})
                    </p>
                    {queueLoading ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Đang tải...</p>
                    ) : !queue || queue.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Chưa có bài nào trong hàng chờ.
                      </p>
                    ) : (
                      queue.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-accent/40"
                        >
                          {item.songThumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.songThumbnail}
                              alt={item.songTitle}
                              className="h-9 w-9 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded bg-accent flex items-center justify-center shrink-0">
                              <Music className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-sm truncate flex-1">{item.songTitle}</p>
                          <Badge variant={QUEUE_BADGE[item.status]} className="shrink-0">
                            {item.status}
                          </Badge>
                          {item.status !== 'PLAYED' && (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="Đánh dấu đã hát"
                              onClick={() => markPlayed(item.id)}
                            >
                              <Check className="h-4 w-4 text-emerald-400" />
                            </Button>
                          )}
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Xoá"
                            onClick={() => removeSong(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Chọn sản phẩm</p>
                    {!products || products.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Chưa có sản phẩm. Thêm ở mục Menu.
                      </p>
                    ) : (
                      products
                        .filter((p) => p.isActive)
                        .map((p) => {
                          const qty = cart[p.id] ?? 0;
                          return (
                            <div
                              key={p.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-accent/40"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm truncate">{p.name}</p>
                                <p className="text-xs text-primary">{formatVnd(p.price)}</p>
                              </div>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => setQty(p.id, qty - 1)}
                                disabled={qty <= 0}
                              >
                                −
                              </Button>
                              <span className="w-6 text-center text-sm">{qty}</span>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => setQty(p.id, qty + 1)}
                              >
                                +
                              </Button>
                            </div>
                          );
                        })
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={submitOrder}
                    disabled={createOrder.isPending || cartItems.length === 0}
                  >
                    <ShoppingBag className="h-4 w-4 mr-1.5" />
                    Gọi món ({cartItems.length})
                  </Button>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Đơn đã gọi ({orders?.length ?? 0})
                    </p>
                    {ordersLoading ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">Đang tải...</p>
                    ) : !orders || orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Chưa có đơn nào.
                      </p>
                    ) : (
                      orders.map((o) => (
                        <div key={o.id} className="p-2 rounded-lg bg-accent/40 space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{o.status}</Badge>
                            {o.totalAmount != null && (
                              <span className="text-sm font-medium">
                                {formatVnd(o.totalAmount)}
                              </span>
                            )}
                          </div>
                          <ul className="text-xs text-muted-foreground">
                            {o.items?.map((it, i) => (
                              <li key={it.id ?? i}>
                                {it.name ?? it.product?.name ?? it.productId} × {it.qty}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
