'use client';

import { Crown, Check, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useShopPlans,
  useShopSubscription,
  useSubscribeShop,
  type ShopPlan,
  type ShopPlanCode,
} from '@/lib/shop';
import { formatVnd } from '@/lib/utils';

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

// Lợi ích theo gói (tĩnh — backend chỉ trả giá/thời hạn).
const PLAN_BENEFITS: Record<ShopPlanCode, string[]> = {
  SHOP_BASIC: [
    'Quản lý phòng & trạng thái phòng',
    'Hàng chờ bài hát theo phòng',
    'Gọi món cơ bản tại quầy',
    'Quản lý nhân viên',
  ],
  SHOP_PRO: [
    'Tất cả tính năng gói Cơ bản',
    'Báo cáo doanh thu nâng cao',
    'Không giới hạn số phòng',
    'Hỗ trợ ưu tiên',
  ],
};

const PLAN_ORDER: Record<ShopPlanCode, number> = { SHOP_BASIC: 0, SHOP_PRO: 1 };

function planMeta(p: ShopPlan) {
  const highlight = p.plan === 'SHOP_PRO';
  return {
    benefits: PLAN_BENEFITS[p.plan] ?? [],
    highlight,
  };
}

export default function ShopSubscriptionPage() {
  const {
    data: sub,
    isLoading: subLoading,
    isError: subError,
    refetch: refetchSub,
  } = useShopSubscription();
  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useShopPlans();
  const subscribe = useSubscribeShop();

  const active = sub?.active ?? false;
  const status = sub?.shopStatus ?? null;

  const sortedPlans = plans
    ? [...plans].sort((a, b) => (PLAN_ORDER[a.plan] ?? 99) - (PLAN_ORDER[b.plan] ?? 99))
    : [];

  const handleSubscribe = (plan: ShopPlanCode) => {
    // Toast + invalidate đã xử lý trong useSubscribeShop.
    subscribe.mutate(plan);
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Gói phần mềm</h1>
        <p className="text-muted-foreground">
          Đăng ký thuê bao để mở khoá toàn bộ tính năng quản lý tiệm.
        </p>
      </div>

      {/* Trạng thái thuê bao hiện tại */}
      {subLoading ? (
        <div className="h-20 rounded-2xl bg-card animate-pulse" />
      ) : subError ? (
        <Card className="p-5 flex items-center justify-between gap-4">
          <p className="text-sm text-destructive">Không tải được trạng thái thuê bao.</p>
          <Button variant="outline" size="sm" onClick={() => void refetchSub()}>
            Thử lại
          </Button>
        </Card>
      ) : sub ? (
        <Card className="p-5">
          {active ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" className="text-sm px-3 py-1">
                <Crown className="h-4 w-4 mr-1.5" />
                {sub.plan
                  ? `Đang dùng ${sub.plan}${
                      sub.currentPeriodEnd ? ` đến ${formatDate(sub.currentPeriodEnd)}` : ''
                    }`
                  : 'Thuê bao đang hoạt động'}
              </Badge>
              {sub.shopName && (
                <span className="text-sm text-muted-foreground">{sub.shopName}</span>
              )}
            </div>
          ) : status === 'TRIAL' ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="warning" className="text-sm px-3 py-1">
                <Clock className="h-4 w-4 mr-1.5" />
                Đang dùng thử
              </Badge>
              <span className="text-sm text-muted-foreground">
                {sub.trialEndsAt
                  ? `Bản dùng thử kết thúc ${formatDate(sub.trialEndsAt)}. Đăng ký gói để tiếp tục sử dụng.`
                  : 'Đăng ký gói để tiếp tục sử dụng sau khi hết hạn dùng thử.'}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                <AlertTriangle className="h-4 w-4 mr-1.5" />
                {status === 'SUSPENDED' ? 'Tạm khoá' : 'Hết hạn'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Tiệm của bạn cần gia hạn để tiếp tục sử dụng phần mềm.
              </span>
            </div>
          )}
        </Card>
      ) : null}

      {/* Bảng giá */}
      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      ) : plansError ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">Không tải được bảng giá.</p>
          <Button variant="outline" onClick={() => void refetchPlans()}>
            Thử lại
          </Button>
        </Card>
      ) : sortedPlans.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Hiện chưa có gói phần mềm nào.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedPlans.map((p) => {
            const meta = planMeta(p);
            const isThisPending = subscribe.isPending && subscribe.variables === p.plan;
            return (
              <Card
                key={p.plan}
                className={
                  meta.highlight
                    ? 'relative border-primary/60 shadow-lg shadow-primary/10'
                    : 'relative'
                }
              >
                {meta.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-3 py-1 shadow-lg shadow-primary/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{p.label}</CardTitle>
                  <CardDescription>Thanh toán theo chu kỳ {p.durationDays} ngày</CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold">{formatVnd(p.priceVnd)}</span>
                    <span className="text-muted-foreground">/tháng</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-2.5">
                    {meta.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-1.5">
                    <Button
                      variant={meta.highlight ? 'gradient' : 'default'}
                      size="lg"
                      className="w-full"
                      disabled={subscribe.isPending}
                      onClick={() => handleSubscribe(p.plan)}
                    >
                      {isThisPending ? (
                        'Đang xử lý...'
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          {active ? 'Gia hạn' : 'Đăng ký'}
                        </>
                      )}
                    </Button>
                    <p className="text-[11px] text-center text-muted-foreground">
                      (DEV) thanh toán giả lập
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
