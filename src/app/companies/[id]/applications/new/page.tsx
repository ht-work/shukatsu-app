"use client";

import { useParams, useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { HydrationGate } from "@/components/hydration-gate";
import { PageHeader } from "@/components/page-header";
import { useShukatsuStore } from "@/hooks/use-shukatsu-store";

export default function NewApplicationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getCompany, addApplication } = useShukatsuStore();
  const company = getCompany(params.id);

  if (!company) {
    return (
      <HydrationGate>
        <EmptyState title="企業が見つかりません" description="エントリー追加先の企業が存在しません。" />
      </HydrationGate>
    );
  }

  return (
    <HydrationGate>
      <PageHeader title="エントリー新規登録" description={company.name} />
      <Card>
        <CardHeader title="エントリー情報" />
        <CardContent>
          <ApplicationForm
            companyId={company.id}
            onSubmit={(input) => {
              const application = addApplication(input);
              router.push(`/companies/${company.id}/applications/${application.id}`);
            }}
          />
        </CardContent>
      </Card>
    </HydrationGate>
  );
}
