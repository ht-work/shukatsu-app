"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { HydrationGate } from "@/components/hydration-gate";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, getCompanyNextTask } from "@/lib/date";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";
import { APPLICATION_KIND_LABELS, STATUS_LABELS, STATUS_OPTIONS_BY_KIND } from "@/types";

type SortKey = "updated" | "name" | "deadline";

export default function CompaniesPage() {
  const { companies, applications, tasks } = useShukatsuStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortKey>("deadline");

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        const keyword = query.trim().toLowerCase();
        const companyApplications = applications.filter((application) => application.companyId === company.id);
        const matchesQuery =
          !keyword ||
          [company.name, company.industry, company.notes]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(keyword));
        const matchesStatus =
          !status || companyApplications.some((application) => application.status === status);

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name, "ja");
        if (sort === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

        const aTask = getCompanyNextTask(a, applications, tasks);
        const bTask = getCompanyNextTask(b, applications, tasks);
        const aTime = aTask ? new Date(aTask.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = bTask ? new Date(bTask.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [applications, companies, query, sort, status, tasks]);

  const allStatuses = Array.from(
    new Set([...STATUS_OPTIONS_BY_KIND.fulltime, ...STATUS_OPTIONS_BY_KIND.internship]),
  );

  return (
    <HydrationGate>
      <PageHeader
        title="企業一覧"
        description="登録企業を検索し、選考ステータスや直近締切で整理します。"
        action={
          <Button asChild>
            <Link href="/companies/new">
              <Plus className="h-4 w-4" aria-hidden />
              企業を追加
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-2 md:grid-cols-[1fr_220px_180px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="企業名・業界・メモで検索"
            />
          </label>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">すべてのステータス</option>
            {allStatuses.map((item) => (
              <option key={item} value={item}>
                {STATUS_LABELS[item]}
              </option>
            ))}
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="deadline">締切が近い順</option>
            <option value="updated">更新が新しい順</option>
            <option value="name">企業名順</option>
          </Select>
        </CardContent>
      </Card>

      {filteredCompanies.length === 0 ? (
        <EmptyState
          title={companies.length === 0 ? "企業はまだ登録されていません" : "条件に合う企業がありません"}
          description="企業を追加すると、選考状況と締切をここで管理できます。"
          action={
            <Button asChild>
              <Link href="/companies/new">企業を追加</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-2">
          {filteredCompanies.map((company) => {
            const companyApplications = applications.filter((application) => application.companyId === company.id);
            const latestApplication = companyApplications[0];
            const nextTask = getCompanyNextTask(company, applications, tasks);

            return (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="focus-ring rounded-md border border-zinc-800 bg-zinc-950/65 px-4 py-3 transition-colors hover:bg-zinc-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">{company.name}</h2>
                      {company.industry ? <span className="text-sm text-muted-foreground">{company.industry}</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {companyApplications.length > 0
                        ? `${companyApplications.length}件のエントリー`
                        : "エントリー未登録"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {latestApplication ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {APPLICATION_KIND_LABELS[latestApplication.kind]}
                        </span>
                        <StatusBadge status={latestApplication.status} />
                      </div>
                    ) : null}
                    <div className="text-sm text-muted-foreground">
                      次の締切: {nextTask ? formatDateTime(nextTask.dueAt) : "未設定"}
                    </div>
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </HydrationGate>
  );
}
