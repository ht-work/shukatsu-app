"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { HydrationGate } from "@/components/hydration-gate";
import { PageHeader } from "@/components/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { TaskForm } from "@/components/task-form";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime } from "@/lib/date";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";
import {
  APPLICATION_KIND_LABELS,
  APPLICATION_SOURCE_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS_BY_KIND,
  TASK_KIND_LABELS,
} from "@/types";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string; appId: string }>();
  const router = useRouter();
  const {
    getCompany,
    getApplication,
    getApplicationTasks,
    updateApplication,
    deleteApplication,
    addTask,
    updateTask,
    deleteTask,
  } = useShukatsuStore();
  const company = getCompany(params.id);
  const application = getApplication(params.appId);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setNotes(application?.notes ?? "");
  }, [application?.notes]);

  if (!company || !application || application.companyId !== company.id) {
    return (
      <HydrationGate>
        <EmptyState title="エントリーが見つかりません" description="削除済み、またはURLが正しくない可能性があります。" />
      </HydrationGate>
    );
  }

  const tasks = getApplicationTasks(application.id).sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
  );
  const allowedStatuses = STATUS_OPTIONS_BY_KIND[application.kind];

  return (
    <HydrationGate>
      <PageHeader
        title={`${company.name} / ${APPLICATION_KIND_LABELS[application.kind]}`}
        description="選考ステータス、締切タスク、エントリーメモを管理します。"
        action={
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm("このエントリーと紐づくタスクを削除します。よろしいですか？")) {
                deleteApplication(application.id);
                router.push(`/companies/${company.id}`);
              }
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            削除
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="grid gap-4">
          <Card>
            <CardHeader title="選考情報" />
            <CardContent className="grid gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={application.status} />
                <span className="text-sm text-muted-foreground">
                  更新日: {formatDate(application.updatedAt)}
                </span>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                <span>ステータス</span>
                <Select
                  value={application.status}
                  onChange={(event) =>
                    updateApplication(application.id, {
                      status: event.target.value as typeof application.status,
                    })
                  }
                >
                  {allowedStatuses.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </label>
              <InfoRow label="応募経路">
                {application.source ? APPLICATION_SOURCE_LABELS[application.source] : "未設定"}
              </InfoRow>
              {application.sourceNote ? <InfoRow label="応募経路メモ">{application.sourceNote}</InfoRow> : null}
              <InfoRow label="応募日">{application.appliedAt ? formatDate(application.appliedAt) : "未設定"}</InfoRow>
              <InfoRow label="マイページURL">
                {application.myPageUrl ? (
                  <a
                    className="inline-flex items-center gap-1 text-zinc-100 underline-offset-4 hover:underline"
                    href={application.myPageUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    開く
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : (
                  "未設定"
                )}
              </InfoRow>
              <Button asChild variant="secondary">
                <Link href={`/companies/${company.id}`}>企業詳細へ戻る</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="エントリーメモ" />
            <CardContent className="grid gap-3">
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    updateApplication(application.id, {
                      notes: notes.trim() || undefined,
                    })
                  }
                >
                  <Save className="h-4 w-4" aria-hidden />
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader title="タスク・締切" description="締切や面接日時を追加し、完了したらチェックします。" />
          <CardContent className="grid gap-5">
            <TaskForm applicationId={application.id} onSubmit={addTask} />
            {tasks.length === 0 ? (
              <EmptyState title="タスクはまだありません" description="ES締切、Webテスト、面接日などを追加してください。" />
            ) : (
              <div className="divide-y divide-zinc-800 rounded-md border border-zinc-800">
                {tasks.map((task) => (
                  <div key={task.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex min-w-0 items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-border bg-background accent-zinc-100"
                        checked={task.done}
                        onChange={(event) => updateTask(task.id, { done: event.target.checked })}
                      />
                      <span className="min-w-0">
                        <span className={task.done ? "font-medium text-muted-foreground line-through" : "font-medium"}>
                          {task.title}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {TASK_KIND_LABELS[task.kind]} / {formatDateTime(task.dueAt)}
                        </span>
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      {task.done ? (
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-300">
                          <CheckCircle2 className="h-4 w-4" aria-hidden />
                          完了
                        </span>
                      ) : null}
                      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" aria-hidden />
                        削除
                      </Button>
                    </div>
                  </div>
                ))}
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
    <div className="grid gap-1 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  );
}
