// Data layer + React Query hooks cho khu vực B2B /shop (OWNER + STAFF).
// Backend prefix /shop, Bearer + unwrap .data đã xử lý trong api.ts.
// LƯU Ý: file độc lập, KHÔNG đụng vào queries.ts. Query keys (qkShop) local trong file.
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiDelete, apiGet, apiPatch, apiPost } from './api';
import { searchSongs } from './songs';
import type { Song } from '@/types';

// ─────────────────── Enums ───────────────────
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type SessionStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type ProductCategory = 'DRINK' | 'BEER' | 'FOOD' | 'SNACK' | 'OTHER';
export type RoomQueueStatus = 'QUEUED' | 'PLAYING' | 'PLAYED' | 'SKIPPED';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'SERVED' | 'PAID' | 'CANCELLED';

// ─────────────────── Interfaces ───────────────────
export interface Shop {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
  status: string;
  roomsCount: number;
  staffCount: number;
}

export interface ShopStats {
  roomsTotal: number;
  roomsOccupied: number;
  activeSessions: number;
  ordersToday: number;
  revenueToday: number;
  revenueMonth: number;
}

export interface Room {
  id: string;
  name: string;
  code: string | null;
  status: RoomStatus;
  capacity: number | null;
  roomType: string | null;
  hourlyPrice: number;
  isActive: boolean;
}

export interface ShopStaff {
  id: string;
  email: string;
  displayName: string;
  status: string;
  role: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  imageUrl: string | null;
  isActive: boolean;
}

export interface PlaySession {
  id: string;
  roomId: string;
  status: SessionStatus;
  guestCount: number | null;
  startedAt: string;
  totalAmount: number;
  roomCharge?: number;
  // Thuê theo giờ (prepaid): plannedMinutes = số phút đã đặt, expiresAt = thời điểm hết giờ (ISO).
  // Cả hai null khi mở phòng "tính giờ sau".
  plannedMinutes: number | null;
  expiresAt: string | null;
  room?: Room;
}

export interface RoomQueueItem {
  id: string;
  songYoutubeId: string;
  songTitle: string;
  songThumbnail: string | null;
  position: number;
  status: RoomQueueStatus;
}

export interface ShopOrderItem {
  id?: string;
  productId: string;
  qty: number;
  name?: string;
  price?: number;
  product?: Product;
}

export interface ShopOrder {
  id: string;
  sessionId: string;
  status: OrderStatus;
  totalAmount?: number;
  createdAt?: string;
  items: ShopOrderItem[];
}

export interface SessionDetail extends PlaySession {
  queueItems?: RoomQueueItem[];
  orders?: ShopOrder[];
}

export interface CloseSessionResult {
  roomCharge: number;
  totalAmount: number;
  [key: string]: unknown;
}

// ─────────────────── Subscription (B2B — OWNER thuê bao phần mềm) ───────────────────
export type ShopPlanCode = 'SHOP_BASIC' | 'SHOP_PRO';
export type ShopSubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

// 1 gói trong bảng giá (GET /shops/plans — PUBLIC).
export interface ShopPlan {
  plan: ShopPlanCode;
  label: string;
  priceVnd: number;
  durationDays: number;
}

// Trạng thái thuê bao của tiệm hiện tại (GET /shops/subscription — OWNER).
export interface ShopSubscription {
  active: boolean;
  plan: string | null;
  currentPeriodEnd: string | null;
  shopName: string | null;
  shopStatus: string | null;
  trialEndsAt: string | null;
}

// Kết quả tạo phiên thanh toán (POST /shops/subscription/checkout — OWNER).
export interface ShopCheckoutResult {
  paymentId: string;
  subscriptionId: string;
  amount: number;
  plan: string;
  payUrl: string;
}

// Kết quả thanh toán giả lập (POST /shops/payments/:id/confirm-mock — DEV).
export interface ShopMockPaymentResult {
  success: boolean;
  plan: string;
  currentPeriodEnd: string;
}

// ─────────────────── Fetchers ───────────────────
export const getShopMe = () => apiGet<Shop>('/shop/me');
export const updateShopMe = (body: {
  name?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
}) => apiPatch<Shop>('/shop/me', body);

export const getShopStats = () => apiGet<ShopStats>('/shop/stats');

export const getRooms = () => apiGet<Room[]>('/shop/rooms');
export const createRoom = (body: {
  name: string;
  code?: string;
  capacity?: number;
  roomType?: string;
  hourlyPrice: number;
}) => apiPost<Room>('/shop/rooms', body);
export const updateRoom = (id: string, body: Partial<Omit<Room, 'id'>>) =>
  apiPatch<Room>(`/shop/rooms/${id}`, body);
export const deleteRoom = (id: string) => apiDelete<void>(`/shop/rooms/${id}`);

export const getStaff = () => apiGet<ShopStaff[]>('/shop/staff');
export const createStaff = (body: {
  email: string;
  displayName: string;
  password: string;
}) => apiPost<ShopStaff>('/shop/staff', body);
export const updateStaff = (id: string, body: { status: string }) =>
  apiPatch<ShopStaff>(`/shop/staff/${id}`, body);
export const deleteStaff = (id: string) => apiDelete<void>(`/shop/staff/${id}`);

export const getProducts = () => apiGet<Product[]>('/shop/products');
export const createProduct = (body: {
  name: string;
  price: number;
  category: ProductCategory;
  imageUrl?: string;
}) => apiPost<Product>('/shop/products', body);
export const updateProduct = (id: string, body: Partial<Omit<Product, 'id'>>) =>
  apiPatch<Product>(`/shop/products/${id}`, body);
export const deleteProduct = (id: string) => apiDelete<void>(`/shop/products/${id}`);

export const getSessions = (status?: SessionStatus) => {
  const q = status ? `?status=${status}` : '';
  return apiGet<PlaySession[]>(`/shop/sessions${q}`);
};
export const openSession = (
  roomId: string,
  body: { guestCount?: number; plannedMinutes?: number },
) => apiPost<PlaySession>(`/shop/rooms/${roomId}/open`, body);
export const getSession = (id: string) => apiGet<SessionDetail>(`/shop/sessions/${id}`);
export const closeSession = (id: string) =>
  apiPost<CloseSessionResult>(`/shop/sessions/${id}/close`, {});
// Gia hạn phòng đã hết/sắp hết giờ → backend cập nhật expiresAt + roomCharge.
export const extendSession = (id: string, minutes: number) =>
  apiPost<PlaySession>(`/shop/sessions/${id}/extend`, { minutes });

export const getRoomQueue = (sessionId: string) =>
  apiGet<RoomQueueItem[]>(`/shop/sessions/${sessionId}/queue`);
export const addQueueItem = (
  sessionId: string,
  body: { songYoutubeId: string; songTitle: string; songThumbnail?: string },
) => apiPost<RoomQueueItem>(`/shop/sessions/${sessionId}/queue`, body);
export const removeQueueItem = (itemId: string) =>
  apiDelete<void>(`/shop/queue/${itemId}`);
export const updateQueueItem = (itemId: string, body: { status: RoomQueueStatus }) =>
  apiPatch<RoomQueueItem>(`/shop/queue/${itemId}`, body);

export const createOrder = (
  sessionId: string,
  items: { productId: string; qty: number }[],
) => apiPost<ShopOrder>(`/shop/sessions/${sessionId}/orders`, { items });
export const getOrders = (sessionId: string) =>
  apiGet<ShopOrder[]>(`/shop/orders?sessionId=${sessionId}`);
export const updateOrder = (id: string, body: { status: OrderStatus }) =>
  apiPatch<ShopOrder>(`/shop/orders/${id}`, body);

export const searchShopSongs = (q: string, signal?: AbortSignal): Promise<Song[]> =>
  searchSongs(q, 12, signal);

// Subscription (B2B): bảng giá PUBLIC, các action còn lại cần OWNER.
export const getShopPlans = () => apiGet<ShopPlan[]>('/shops/plans');
export const getShopSubscription = () =>
  apiGet<ShopSubscription>('/shops/subscription');
export const shopCheckout = (plan: ShopPlanCode) =>
  apiPost<ShopCheckoutResult>('/shops/subscription/checkout', { plan });
export const shopConfirmPayment = (paymentId: string) =>
  apiPost<ShopMockPaymentResult>(`/shops/payments/${paymentId}/confirm-mock`);

// ─────────────────── Query keys (local) ───────────────────
export const qkShop = {
  me: ['shop', 'me'] as const,
  stats: ['shop', 'stats'] as const,
  rooms: ['shop', 'rooms'] as const,
  staff: ['shop', 'staff'] as const,
  products: ['shop', 'products'] as const,
  sessions: (status?: string) => ['shop', 'sessions', status ?? 'all'] as const,
  session: (id: string) => ['shop', 'session', id] as const,
  queue: (sessionId: string) => ['shop', 'queue', sessionId] as const,
  orders: (sessionId: string) => ['shop', 'orders', sessionId] as const,
  plans: ['shop', 'plans'] as const,
  subscription: ['shop', 'subscription'] as const,
};

// ─────────────────── Queries ───────────────────
export const useShopMe = () =>
  useQuery({ queryKey: qkShop.me, queryFn: () => getShopMe() });

export const useShopStats = () =>
  useQuery({ queryKey: qkShop.stats, queryFn: () => getShopStats() });

export const useRooms = () =>
  useQuery({ queryKey: qkShop.rooms, queryFn: () => getRooms() });

export const useStaff = () =>
  useQuery({ queryKey: qkShop.staff, queryFn: () => getStaff() });

export const useProducts = () =>
  useQuery({ queryKey: qkShop.products, queryFn: () => getProducts() });

export const useSessions = (status?: SessionStatus) =>
  useQuery({ queryKey: qkShop.sessions(status), queryFn: () => getSessions(status) });

export const useSession = (id: string) =>
  useQuery({
    queryKey: qkShop.session(id),
    queryFn: () => getSession(id),
    enabled: !!id,
  });

export const useRoomQueue = (sessionId: string) =>
  useQuery({
    queryKey: qkShop.queue(sessionId),
    queryFn: () => getRoomQueue(sessionId),
    enabled: !!sessionId,
  });

export const useOrders = (sessionId: string) =>
  useQuery({
    queryKey: qkShop.orders(sessionId),
    queryFn: () => getOrders(sessionId),
    enabled: !!sessionId,
  });

// ─────────────────── Queries: subscription ───────────────────
export const useShopPlans = () =>
  useQuery({ queryKey: qkShop.plans, queryFn: () => getShopPlans() });

export const useShopSubscription = () =>
  useQuery({ queryKey: qkShop.subscription, queryFn: () => getShopSubscription() });

// ─────────────────── Mutations: shop profile ───────────────────
export const useUpdateShopMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof updateShopMe>[0]) => updateShopMe(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.me }),
  });
};

// ─────────────────── Mutations: rooms ───────────────────
export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createRoom>[0]) => createRoom(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qkShop.rooms });
      void qc.invalidateQueries({ queryKey: qkShop.stats });
    },
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; body: Partial<Omit<Room, 'id'>> }) =>
      updateRoom(p.id, p.body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qkShop.rooms });
      void qc.invalidateQueries({ queryKey: qkShop.stats });
    },
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qkShop.rooms });
      void qc.invalidateQueries({ queryKey: qkShop.stats });
    },
  });
};

// ─────────────────── Mutations: staff ───────────────────
export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createStaff>[0]) => createStaff(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.staff }),
  });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; status: string }) => updateStaff(p.id, { status: p.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.staff }),
  });
};

export const useDeleteStaff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.staff }),
  });
};

// ─────────────────── Mutations: products ───────────────────
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createProduct>[0]) => createProduct(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.products }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; body: Partial<Omit<Product, 'id'>> }) =>
      updateProduct(p.id, p.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.products }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qkShop.products }),
  });
};

// ─────────────────── Mutations: sessions ───────────────────
export const useOpenSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { roomId: string; guestCount?: number; plannedMinutes?: number }) =>
      openSession(p.roomId, { guestCount: p.guestCount, plannedMinutes: p.plannedMinutes }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['shop', 'sessions'] });
      void qc.invalidateQueries({ queryKey: qkShop.rooms });
      void qc.invalidateQueries({ queryKey: qkShop.stats });
    },
  });
};

export const useExtendSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; minutes: number }) => extendSession(p.id, p.minutes),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qkShop.session(p.id) });
      void qc.invalidateQueries({ queryKey: ['shop', 'sessions'] });
      void qc.invalidateQueries({ queryKey: qkShop.queue(p.id) });
      toast.success('Đã gia hạn');
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Lỗi gia hạn');
    },
  });
};

export const useCloseSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeSession(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ['shop', 'sessions'] });
      void qc.invalidateQueries({ queryKey: qkShop.session(id) });
      void qc.invalidateQueries({ queryKey: qkShop.rooms });
      void qc.invalidateQueries({ queryKey: qkShop.stats });
    },
  });
};

// ─────────────────── Mutations: queue ───────────────────
export const useAddQueueItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      sessionId: string;
      songYoutubeId: string;
      songTitle: string;
      songThumbnail?: string;
    }) =>
      addQueueItem(p.sessionId, {
        songYoutubeId: p.songYoutubeId,
        songTitle: p.songTitle,
        songThumbnail: p.songThumbnail,
      }),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qkShop.queue(p.sessionId) });
      void qc.invalidateQueries({ queryKey: qkShop.session(p.sessionId) });
    },
  });
};

export const useRemoveQueueItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { itemId: string; sessionId: string }) => removeQueueItem(p.itemId),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qkShop.queue(p.sessionId) });
      void qc.invalidateQueries({ queryKey: qkShop.session(p.sessionId) });
    },
  });
};

export const useUpdateQueueItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { itemId: string; sessionId: string; status: RoomQueueStatus }) =>
      updateQueueItem(p.itemId, { status: p.status }),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qkShop.queue(p.sessionId) });
      void qc.invalidateQueries({ queryKey: qkShop.session(p.sessionId) });
    },
  });
};

// ─────────────────── Mutations: orders ───────────────────
export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { sessionId: string; items: { productId: string; qty: number }[] }) =>
      createOrder(p.sessionId, p.items),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qkShop.orders(p.sessionId) });
      void qc.invalidateQueries({ queryKey: qkShop.session(p.sessionId) });
    },
  });
};

export const useUpdateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; sessionId: string; status: OrderStatus }) =>
      updateOrder(p.id, { status: p.status }),
    onSuccess: (_data, p) => {
      void qc.invalidateQueries({ queryKey: qkShop.orders(p.sessionId) });
      void qc.invalidateQueries({ queryKey: qkShop.session(p.sessionId) });
    },
  });
};

// ─────────────────── Mutations: subscription ───────────────────
// checkout(plan) → (DEV) confirm(paymentId) → invalidate subscription.
// Thật sẽ redirect tới result.payUrl (cổng thanh toán) thay vì confirm giả lập.
export const useSubscribeShop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: ShopPlanCode) => {
      const checkout = await shopCheckout(plan);
      const confirmed = await shopConfirmPayment(checkout.paymentId);
      if (!confirmed.success) throw new Error('Thanh toán chưa hoàn tất, vui lòng thử lại');
      return confirmed;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qkShop.subscription });
      void qc.invalidateQueries({ queryKey: qkShop.me });
      toast.success('Đã kích hoạt gói!');
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Thanh toán thất bại');
    },
  });
};
