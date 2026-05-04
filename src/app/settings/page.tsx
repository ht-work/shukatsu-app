import { Database, FileJson, Bell } from "lucide-react";
import type { ComponentType } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="設定"
        description="データのエクスポート/インポートや通知設定は今後追加予定です。"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <PlanCard icon={FileJson} title="JSONエクスポート" description="localStorage のバックアップ用に追加予定。" />
        <PlanCard icon={Database} title="JSONインポート" description="別ブラウザへの移行用に追加予定。" />
        <PlanCard icon={Bell} title="通知設定" description="Phase 4 でブラウザ通知として検討。" />
      </div>
    </>
  );
}

function PlanCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Icon className="mb-4 h-7 w-7 text-zinc-200" aria-hidden />
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
