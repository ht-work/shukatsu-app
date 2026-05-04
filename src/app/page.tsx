"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, Building2, CalendarClock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { HydrationGate } from "@/components/hydration-gate";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, formatRelativeDue, getNextTask } from "@/lib/date";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";
import { ACTIVE_STATUSES, APPLICATION_KIND_LABELS, STATUS_LABELS } from "@/types";

export default function DashboardPage() {
  const { companies, applications, tasks, getCompany } = useShukatsuStore();
  const activeApplications = applications.filter((application) =>
    ACTIVE_STATUSES.includes(application.status),
  );
  const upcomingTasks = tasks
    .filter((task) => !task.done)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);
  const nextTask = getNextTask(tasks);

  return (
    <HydrationGate>
      <PageHeader
        title="ダッシュボード"
        description="企業、選考、締切の現在地をまとめて確認できます。"
        action={
          <Button asChild>
            <Link href="/companies/new">
              <Plus className="h-4 w-4" aria-hidden />
              企業を追加
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Building2} label="登録企業" value={`${companies.length}社`} />
        <MetricCard icon={CheckCircle2} label="選考中" value={`${activeApplications.length}件`} />
        <MetricCard
          icon={CalendarClock}
          label="次の締切"
          value={nextTask ? formatRelativeDue(nextTask.dueAt) : "未設定"}
        />
      </div>

      <Card>
        <CardHeader
          title="直近の締切"
          description="未完了タスクを日時が近い順に表示します。"
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href="/companies">企業一覧へ</Link>
            </Button>
          }
        />
        <CardContent>
          {upcomingTasks.length === 0 ? (
            <EmptyState title="締切はまだありません" description="エントリー詳細からタスクを追加できます。" />
          ) : (
            <div className="divide-y">
              {upcomingTasks.map((task) => {
                const application = applications.find((item) => item.id === task.applicationId);
                const company = application ? getCompany(application.companyId) : undefined;

                return (
                  <Link
                    key={task.id}
                    href={
                      application && company
                        ? `/companies/${company.id}/applications/${application.id}`
                        : "/companies"
                    }
                    className="focus-ring flex flex-col gap-2 rounded-md px-2 py-4 transition hover:bg-muted sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {company?.name ?? "企業未設定"} /{" "}
                        {application ? APPLICATION_KIND_LABELS[application.kind] : "エントリー未設定"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{formatDateTime(task.dueAt)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="選考中のエントリー" />
        <CardContent>
          {activeApplications.length === 0 ? (
            <EmptyState
              title="選考中のエントリーはありません"
              description="企業詳細から本選考またはインターンのエントリーを追加できます。"
            />
          ) : (
            <div className="grid gap-3">
              {activeApplications.slice(0, 6).map((application) => {
                const company = getCompany(application.companyId);
                return (
                  <Link
                    key={application.id}
                    href={`/companies/${application.companyId}/applications/${application.id}`}
                    className="focus-ring flex flex-col gap-3 rounded-lg border bg-background p-4 transition hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{company?.name ?? "企業未設定"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {APPLICATION_KIND_LABELS[application.kind]} / {STATUS_LABELS[application.status]}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </HydrationGate>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-400/10 text-sky-200">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
