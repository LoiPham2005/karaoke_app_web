'use client';

import { useState } from 'react';
import { Flag, Settings, Save, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  useFeatureFlags,
  useUpdateFeatureFlag,
  useSystemSettings,
  useUpsertSetting,
  type FeatureFlag,
  type SystemSetting,
} from '@/lib/super-admin';

function FeatureFlagRow({ flag }: { flag: FeatureFlag }) {
  const update = useUpdateFeatureFlag();
  const [editing, setEditing] = useState(false);
  const [desc, setDesc] = useState(flag.description ?? '');

  const toggle = (enabled: boolean) => {
    update.mutate(
      { key: flag.key, enabled, description: flag.description ?? undefined },
      {
        onSuccess: () => toast.success(enabled ? 'Đã bật' : 'Đã tắt'),
        onError: () => toast.error('Không cập nhật được'),
      },
    );
  };

  const saveDesc = () => {
    update.mutate(
      { key: flag.key, enabled: flag.enabled, description: desc.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Đã lưu mô tả');
          setEditing(false);
        },
        onError: () => toast.error('Không lưu được'),
      },
    );
  };

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium font-mono">{flag.key}</p>
        {editing ? (
          <div className="flex gap-2 mt-2">
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả..."
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={saveDesc} disabled={update.isPending}>
              <Save className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1 hover:text-foreground"
            onClick={() => {
              setDesc(flag.description ?? '');
              setEditing(true);
            }}
          >
            {flag.description || 'Chưa có mô tả'}
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
      <Switch
        checked={flag.enabled}
        disabled={update.isPending}
        onCheckedChange={toggle}
        className="shrink-0 mt-1"
      />
    </div>
  );
}

function pretty(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function SettingRow({ setting }: { setting: SystemSetting }) {
  const upsert = useUpsertSetting();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(() => pretty(setting.value));

  const save = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error('JSON không hợp lệ');
      return;
    }
    upsert.mutate(
      { key: setting.key, value: parsed },
      {
        onSuccess: () => {
          toast.success('Đã lưu cài đặt');
          setEditing(false);
        },
        onError: () => toast.error('Không lưu được'),
      },
    );
  };

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium font-mono">{setting.key}</p>
        {editing ? (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setText(pretty(setting.value));
                setEditing(false);
              }}
            >
              Huỷ
            </Button>
            <Button size="sm" onClick={save} disabled={upsert.isPending}>
              <Save className="h-3.5 w-3.5 mr-1" />
              Lưu
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Sửa
          </Button>
        )}
      </div>
      {editing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={Math.min(12, Math.max(3, text.split('\n').length))}
          spellCheck={false}
          className="w-full rounded-lg border border-border bg-background p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        />
      ) : (
        <pre className="rounded-lg bg-background border border-border p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground">
          {pretty(setting.value)}
        </pre>
      )}
    </div>
  );
}

export default function AdminSystemPage() {
  const flags = useFeatureFlags();
  const settings = useSystemSettings();

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hệ thống</h1>
        <p className="text-muted-foreground mt-1">Feature flags & cấu hình hệ thống</p>
      </div>

      {/* Feature flags */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Flag className="h-5 w-5 text-primary" />
          Feature Flags
        </h2>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {flags.isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
          ) : flags.isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Không tải được feature flags
            </div>
          ) : (flags.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Chưa có feature flag
            </div>
          ) : (
            flags.data!.map((f) => <FeatureFlagRow key={f.key} flag={f} />)
          )}
        </div>
      </section>

      {/* System settings */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5 text-primary" />
          Cài đặt hệ thống
        </h2>
        <div className="bg-card rounded-2xl divide-y divide-border">
          {settings.isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Đang tải...</div>
          ) : settings.isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Không tải được cài đặt
            </div>
          ) : (settings.data ?? []).length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Chưa có cài đặt
            </div>
          ) : (
            settings.data!.map((s) => <SettingRow key={s.key} setting={s} />)
          )}
        </div>
      </section>
    </div>
  );
}
