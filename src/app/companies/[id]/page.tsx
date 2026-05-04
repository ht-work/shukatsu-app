"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Edit, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { HydrationGate } from "@/components/hydration-gate";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatDateTime, getNextTask } from "@/lib/date";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";
import {
  APPLICATION_KIND_LABELS,
  APPLICATION_SOURCE_LABELS,
  STATUS_LABELS,
  TASK_KIND_LABELS,
} from "@/types";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    getCompany,
    getCompanyApplications,
    getApplicationTasks,
    deleteCompany,
  } = useShukatsuStore();
  const company = getCompany(params.id);

  if (!company) {
    return (
      <HydrationGate>
        <EmptyState title="企業が見つかりません" description="削除済み、またはURLが正しくない可能性があります。" />
      </HydrationGate>
    );
  }

  const applications = getCompanyApplications(company.id);

  return (
    <HydrationGate>
      <PageHeader
        title={company.name}
        description={company.industry ?? "業界未設定"}
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href={`/companies/${company.id}/edit`}>
                <Edit className="h-4 w-4" aria-hidden />
                編集
              </Link>
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm("この企業と紐づくエントリー・タスクを削除します。よろしいですか？")) {
                  deleteCompany(company.id);
                  router.push("/companies");
                }
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              削除
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="企業情報" />
          <CardContent className="grid gap-4 text-sm">
            <InfoRow label="URL">
              {company.url ? (
                <a
                  className="inline-flex items-center gap-1 text-zinc-100 underline-offset-4 hover:underline"
                  href={company.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {company.url}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : (
                <span className="text-muted-foreground">未設定</span>
              )}
            </InfoRow>
            <InfoRow label="登録日">{formatDate(company.createdAt)}</InfoRow>
            <InfoRow label="更新日">{formatDate(company.updatedAt)}</InfoRow>
            <div>
              <p className="mb-2 text-muted-foreground">メモ</p>
              <p className="whitespace-pre-wrap rounded-md border border-zinc-800 bg-zinc-950 p-3 leading-6">
                {company.notes || "メモはまだありません。"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="エントリー"
            description="本選考とインターンを企業ごとに複数管理できます。"
            action={
              <Button asChild size="sm">
                <Link href={`/companies/${company.id}/applications/new`}>
                  <Plus className="h-4 w-4" aria-hidden />
                  追加
                </Link>
              </Button>
            }
          />
          <CardContent>
            {applications.length === 0 ? (
              <EmptyState title="エントリーはまだありません" description="本選考またはインターンの選考を追加してください。" />
            ) : (
              <div className="grid gap-2">
                {applications.map((application) => {
                  const appTasks = getApplicationTasks(application.id);
                  const nextTask = getNextTask(appTasks);

                  return (
                    <Link
                      key={application.id}
                      href={`/companies/${company.id}/applications/${application.id}`}
                      className="focus-ring rounded-md border border-zinc-800 bg-background px-3 py-3 transition-colors hover:bg-zinc-900"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{APPLICATION_KIND_LABELS[application.kind]}</p>
                            <StatusBadge status={application.status} />
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {application.source ? APPLICATION_SOURCE_LABELS[application.source] : "応募経路未設定"} /{" "}
                            {STATUS_LABELS[application.status]}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          次の締切: {nextTask ? `${TASK_KIND_LABELS[nextTask.kind]} ${formatDateTime(nextTask.dueAt)}` : "未設定"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HydrationGate>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <p className="text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  );
}
