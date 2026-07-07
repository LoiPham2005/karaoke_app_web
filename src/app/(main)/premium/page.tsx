'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Check, Sparkles, ShieldOff, Music4, Download, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import {
  getPlans,
  getMySubscription,
  checkout,
  confirmMockPayment,
  type Plan,
  type PlanCode,
  type PremiumStatus,
} from '@/lib/billing';

// Lợi ích chung của Premium (tĩnh — không phụ thuộc gói).
const BENEFITS = [
  { icon: ShieldOff, text: 'Bỏ hoàn toàn quảng cáo' },
  { icon: Music4, text: 'Phát nhạc chất lượng cao' },
  { icon: Download, text: 'Tải bài hát nghe offline' },
  { icon: Zap, text: 'Hỗ trợ ưu tiên, vào trước tính năng mới' },
];

const formatVnd = (v: number) => `${v.toLocaleString('vi-VN')}₫`;

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

// Mô tả chu kỳ + giá / tháng quy đổi (cho gói năm).
function planMeta(p: Plan) {
  if (p.plan === 'PREMIUM_YEARLY') {
    const perMonth = Math.round(p.priceVnd / 12);
    return { period: 'năm', sub: `≈ ${formatVnd(perMonth)}/tháng`, highlight: true };
  }
  return { period: 'tháng', sub: 'Thanh toán hàng tháng', highlight: false };
}

export default function PremiumPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState<PlanCode | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Bảng giá là PUBLIC; trạng thái chỉ lấy khi đã đăng nhập.
      const [plansData, statusData] = await Promise.all([
        getPlans(),
        user ? getMySubscription().catch(() => null) : Promise.resolve(null),
      ]);
      setPlans(plansData);
      setStatus(statusData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được thông tin gói Premium');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBuy = async (plan: PlanCode) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để nâng cấp Premium');
      router.push('/login');
      return;
    }
    setBuying(plan);
    try {
      const result = await checkout(plan);
      // DEV: hoàn tất thanh toán giả lập ngay (thật sẽ redirect result.payUrl tới cổng).
      const confirmed = await confirmMockPayment(result.paymentId);
      if (!confirmed.success) {
        toast.error('Thanh toán chưa hoàn tất, vui lòng thử lại');
        return;
      }
      toast.success('Đã nâng cấp Premium!');
      // Cập nhật user.isPremium + làm mới trạng thái trang.
      await useAuthStore.getState().bootstrap();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Thanh toán thất bại');
    } finally {
      setBuying(null);
    }
  };

  const isPremium = status?.isPremium ?? false;

  return (
    <div className="container py-8 space-y-10">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-lg shadow-primary/30">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Nâng cấp Premium</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Mở khoá trải nghiệm hát karaoke trọn vẹn: bỏ quảng cáo, chất lượng cao và nhiều hơn nữa.
        </p>

        {isPremium && (
          <div className="flex justify-center pt-1">
            <Badge variant="success" className="text-sm px-3 py-1">
              <Crown className="h-4 w-4 mr-1.5" />
              {status?.currentPeriodEnd
                ? `Đang Premium đến ${formatDate(status.currentPeriodEnd)}`
                : 'Đang Premium'}
            </Badge>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {BENEFITS.map((b) => (
          <div key={b.text} className="bg-card rounded-2xl p-4 text-center space-y-2">
            <b.icon className="h-6 w-6 mx-auto text-primary" />
            <p className="text-xs text-muted-foreground">{b.text}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-card animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-card rounded-2xl p-10 text-center max-w-xl mx-auto">
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={load}>
            Thử lại
          </Button>
        </div>
      )}

      {/* Plans */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => {
            const meta = planMeta(p);
            const isThisBuying = buying === p.plan;
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
                      Tiết kiệm nhất
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{p.label}</CardTitle>
                  <CardDescription>{meta.sub}</CardDescription>
                  <div className="pt-3">
                    <span className="text-4xl font-bold">{formatVnd(p.priceVnd)}</span>
                    <span className="text-muted-foreground">/{meta.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-2.5">
                    {BENEFITS.map((b) => (
                      <li key={b.text} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{b.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-1.5">
                    <Button
                      variant={meta.highlight ? 'gradient' : 'default'}
                      size="lg"
                      className="w-full"
                      disabled={buying !== null}
                      onClick={() => handleBuy(p.plan)}
                    >
                      {isThisBuying ? (
                        'Đang xử lý...'
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          {isPremium ? 'Gia hạn' : 'Mua'}
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
