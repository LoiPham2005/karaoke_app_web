// Gói Premium (mua/gia hạn). Backend bọc response { statusCode, message, data }
// → apiGet/apiPost tự unwrap `.data`.
import { apiGet, apiPost } from './api';

export type PlanCode = 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY';

// 1 gói trong bảng giá (GET /subscriptions/plans — PUBLIC).
export interface Plan {
  plan: PlanCode;
  label: string;
  priceVnd: number;
  durationDays: number;
}

// Trạng thái Premium của user hiện tại (GET /subscriptions/me — auth).
export interface PremiumStatus {
  isPremium: boolean;
  plan: string | null;
  status: string;
  currentPeriodEnd: string | null;
  autoRenew: boolean;
}

// Kết quả tạo phiên thanh toán (POST /subscriptions/checkout — auth).
export interface CheckoutResult {
  paymentId: string;
  subscriptionId: string;
  amount: number;
  plan: string;
  provider: string;
  payUrl: string;
}

// Kết quả thanh toán giả lập (POST /payments/:id/confirm-mock — DEV).
export interface MockPaymentResult {
  success: boolean;
  plan: string;
  premiumUntil: string;
}

export const getPlans = () => apiGet<Plan[]>('/subscriptions/plans');

export const getMySubscription = () => apiGet<PremiumStatus>('/subscriptions/me');

export const checkout = (plan: PlanCode, provider?: string) =>
  apiPost<CheckoutResult>('/subscriptions/checkout', { plan, provider });

export const confirmMockPayment = (paymentId: string) =>
  apiPost<MockPaymentResult>(`/payments/${paymentId}/confirm-mock`);
